// src/utils/otpDecryption.js

const SECRET_KEY = "8f3c9b1a7d5e4c2f9a6b8d1e3c4f7a9b0d2e6c8f1a3b5d7c9e2f4a6b8d0c1e3";

const base64ToUint8Array = (base64) => {
  try {
    const normalized = base64
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .replace(/\s/g, "");

    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);

    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    return bytes;
  } catch (error) {
    console.error("Base64 conversion failed:", error);
    throw new Error("Invalid encrypted OTP format");
  }
};

export const decryptOtp = async (encryptedBase64, secret = SECRET_KEY) => {
  try {
    console.log("========== OTP DECRYPT START ==========");
    
    // 1. Check crypto availability
    console.log("Crypto available:", !!window.crypto);
    console.log("Subtle available:", !!window.crypto?.subtle);
    console.log("Protocol:", window.location.protocol);

    if (!window.crypto || !window.crypto.subtle) {
      throw new Error("Web Crypto API not available (need HTTPS)");
    }

    const enc = new TextEncoder();

    // 2. Log incoming encrypted OTP
    console.log("Encrypted OTP (raw):", encryptedBase64);
    console.log("Encrypted OTP length:", encryptedBase64?.length);

    // 3. Normalize Base64
    const normalized = encryptedBase64
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .replace(/\s/g, "");

    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);

    console.log("Base64 normalized:", normalized);
    console.log("Base64 padded:", padded);

    // 4. Convert to Uint8Array
    let rawData;
    try {
      const binary = atob(padded);
      rawData = new Uint8Array(binary.length);

      for (let i = 0; i < binary.length; i++) {
        rawData[i] = binary.charCodeAt(i);
      }
    } catch (err) {
      console.error("Base64 decode failed:", err);
      throw err;
    }

    console.log("Raw data length:", rawData.length);
    console.log("Raw data (first 20 bytes):", rawData.slice(0, 20));

    // 5. Validate data length
    if (rawData.length <= 16) {
      throw new Error("Invalid data: too short");
    }

    // 6. Extract IV + encrypted
    const iv = rawData.slice(0, 16);
    const encryptedData = rawData.slice(16);

    console.log("IV length:", iv.length);
    console.log("IV:", iv);
    console.log("Encrypted data length:", encryptedData.length);

    // 7. Hash secret
    const secretKeyHash = await crypto.subtle.digest(
      "SHA-256",
      enc.encode(secret)
    );

    console.log("Secret key length:", enc.encode(secret).length);
    console.log("SHA-256 key length:", secretKeyHash.byteLength);

    // 8. Import key
    const key = await crypto.subtle.importKey(
      "raw",
      secretKeyHash,
      { name: "AES-CBC" },
      false,
      ["decrypt"]
    );

    console.log("Key imported successfully");

    // 9. Decrypt
    let decryptedBuffer;
    try {
      decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: "AES-CBC",
          iv: iv,
        },
        key,
        encryptedData
      );
    } catch (err) {
      console.error("Decrypt error:", err);
      throw err;
    }

    console.log("Decryption successful");

    // 10. Convert to string
    const decryptedOtp = new TextDecoder().decode(decryptedBuffer);

    console.log("Decrypted OTP (raw):", decryptedOtp);
    console.log("Decrypted OTP (trimmed):", decryptedOtp.trim());

    console.log("========== OTP DECRYPT END ==========");

    return decryptedOtp.trim();
  } catch (error) {
    console.error("❌ FINAL ERROR:", error);
    throw error;
  }
};

export const verifyOtpCode = async (
  encryptedOtp,
  enteredOtp,
  secret = SECRET_KEY
) => {
  try {
    const decryptedOtp = await decryptOtp(encryptedOtp, secret);
    return decryptedOtp === String(enteredOtp).trim();
  } catch (error) {
    console.error("Verification failed:", error);
    return false;
  }
};