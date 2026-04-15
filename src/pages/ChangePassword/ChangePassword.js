import React, { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle, XCircle, Shield, Key, AlertTriangle } from 'lucide-react';
import './ChangePassword.css';
import { useChangePassword } from "../../hooks/useChangePassword";
// import { changePassword } from './../../services/authService';
import { secureStorage } from '../../utils/secureStorage';
import { useLogout } from "../../hooks/useLogout";

const ChangePassword = () => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [message, setMessage] = useState(null);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        hasMinLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecialChar: false
    });

    const getStrengthColor = () => {
        switch (passwordStrength.score) {
            case 0: return '#e2e8f0';
            case 1: return '#ef4444';
            case 2: return '#f59e0b';
            case 3: return '#eab308';
            case 4: return '#10b981';
            case 5: return '#059669';
            default: return '#e2e8f0';
        }
    };

    const getStrengthText = () => {
        switch (passwordStrength.score) {
            case 0: return 'Enter a password';
            case 1: return 'Very Weak';
            case 2: return 'Weak';
            case 3: return 'Fair';
            case 4: return 'Good';
            case 5: return 'Strong';
            default: return '';
        }
    };

    const getStrengthWidth = () => {
        return `${(passwordStrength.score / 5) * 100}%`;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Clear error for this field
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }

        if (name === 'newPassword') {
            checkPasswordStrength(value);
        }

        // Check password match when confirm password changes
        if (name === 'confirmPassword' || (name === 'newPassword' && formData.confirmPassword)) {
            const confirmValue = name === 'confirmPassword' ? value : formData.confirmPassword;
            const newPassValue = name === 'newPassword' ? value : formData.newPassword;
            if (confirmValue && newPassValue !== confirmValue) {
                setErrors({
                    ...errors,
                    confirmPassword: 'Passwords do not match'
                });
            } else if (confirmValue && newPassValue === confirmValue) {
                setErrors({
                    ...errors,
                    confirmPassword: ''
                });
            }
        }
    };

    const checkPasswordStrength = (password) => {
        const strength = {
            score: 0,
            hasMinLength: password.length >= 8,
            hasUpperCase: /[A-Z]/.test(password),
            hasLowerCase: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
        };

        let score = 0;
        if (strength.hasMinLength) score += 1;
        if (strength.hasUpperCase) score += 1;
        if (strength.hasLowerCase) score += 1;
        if (strength.hasNumber) score += 1;
        if (strength.hasSpecialChar) score += 1;

        strength.score = score;
        setPasswordStrength(strength);
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords({
            ...showPasswords,
            [field]: !showPasswords[field]
        });
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.currentPassword) {
            newErrors.currentPassword = 'Current password is required';
        }

        if (!formData.newPassword) {
            newErrors.newPassword = 'New password is required';
        } else if (formData.newPassword.length < 8) {
            newErrors.newPassword = 'Password must be at least 8 characters';
        } else if (passwordStrength.score < 3) {
            newErrors.newPassword = 'Please choose a stronger password';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        return newErrors;
    };

    const { mutate: updatePassword } = useChangePassword();
    const { mutate: logout } = useLogout();

    const handleSubmit = (e) => {

        console.log("Button clicked")
        e.preventDefault();
        setErrors({});

        const newErrors = validateForm();

        if (Object.keys(newErrors).length === 0) {
            setIsLoading(true);

            const user = secureStorage.getUser();

            console.log("User", user)

            updatePassword(
                {
                    id: user?.id,
                    data: {
                        old_pwd: formData.currentPassword,
                        new_pwd: formData.newPassword,
                        new_pwd_confirmation: formData.confirmPassword,
                    },
                },
                {
                    onSuccess: (res) => {
                        setMessage({
                            type: "success",
                            text: res.data?.message || "Password changed successfully!",
                        })
                        setFormData({
                            currentPassword: "",
                            newPassword: "",
                            confirmPassword: "",
                        });

                        setPasswordStrength({
                            score: 0,
                            hasMinLength: false,
                            hasUpperCase: false,
                            hasLowerCase: false,
                            hasNumber: false,
                            hasSpecialChar: false,
                        });
                        setTimeout(() => {
                            logout();
                        }, 1000);
                    },

                    onError: (err) => {
                        setMessage({
                            type: "error",
                            text:
                                err.response?.data?.message ||
                                "Failed to change password. Try again.",
                        });
                    },

                    onSettled: () => {
                        setIsLoading(false);
                    },
                }
            );
        } else {
            setErrors(newErrors);
        }
    };

    const isPasswordMatch = () => {
        return formData.newPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword;
    };

    const doPasswordsMatch = () => {
        return formData.confirmPassword && formData.newPassword === formData.confirmPassword;
    };


    // const handleLogout = () => {
    //     secureStorage.clear()
    //     // setIsAuthenticated(false);
    //     window.location.href = '/';
    // };

    return (
        <div className="changepass-premium">
            <div className="changepass-limit">

                {/* <div className="changepass-premium-header"> */}
                <div className="changepass-premium-title">
                    {/* <Shield size={28} /> */}
                    <div>
                        <h1>Change Password</h1>
                        <p>Keep your account secure with a strong password</p>
                    </div>
                </div>
                {/* </div> */}

                <div className="changepass-premium-container">
                    <div className="changepass-premium-card">
                        <form onSubmit={handleSubmit} className="changepass-premium-form">
                            {/* Current Password */}
                            <div className="form-premium-group">
                                <label className="form-premium-label">
                                    <Key size={16} />
                                    Current Password
                                </label>
                                <div className="input-premium-wrapper">
                                    <input
                                        type={showPasswords.current ? 'text' : 'password'}
                                        name="currentPassword"
                                        value={formData.currentPassword}
                                        onChange={handleChange}
                                        placeholder="Enter your current password"
                                        className={`form-premium-input ${errors.currentPassword ? 'error' : ''}`}
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        className="input-premium-toggle"
                                        onClick={() => togglePasswordVisibility('current')}
                                    >
                                        {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.currentPassword && (
                                    <span className="form-premium-error">
                                        <AlertTriangle size={12} />
                                        {errors.currentPassword}
                                    </span>
                                )}
                            </div>

                            {/* New Password */}
                            <div className="form-premium-group">
                                <label className="form-premium-label">
                                    <Lock size={16} />
                                    New Password
                                </label>
                                <div className="input-premium-wrapper">
                                    <input
                                        type={showPasswords.new ? 'text' : 'password'}
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        placeholder="Enter new password"
                                        className={`form-premium-input ${errors.newPassword ? 'error' : ''}`}
                                    />
                                    <button
                                        type="button"
                                        className="input-premium-toggle"
                                        onClick={() => togglePasswordVisibility('new')}
                                    >
                                        {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.newPassword && (
                                    <span className="form-premium-error">
                                        <AlertTriangle size={12} />
                                        {errors.newPassword}
                                    </span>
                                )}

                                {/* Password Strength Indicator */}
                                {formData.newPassword && (
                                    <div className="strength-premium-container">
                                        <div className="strength-premium-bar">
                                            <div
                                                className="strength-premium-fill"
                                                style={{
                                                    width: getStrengthWidth(),
                                                    backgroundColor: getStrengthColor()
                                                }}
                                            />
                                        </div>
                                        <div className="strength-premium-header">
                                            <span className="strength-premium-text" style={{ color: getStrengthColor() }}>
                                                Password Strength: {getStrengthText()}
                                            </span>
                                            {passwordStrength.score >= 4 && (
                                                <CheckCircle size={16} color="#10b981" />
                                            )}
                                        </div>

                                        {/* Requirements Checklist */}
                                        <div className="requirements-premium-grid">
                                            <div className={`requirement-premium ${passwordStrength.hasMinLength ? 'met' : ''}`}>
                                                <span>{passwordStrength.hasMinLength ? '✓' : '○'}</span>
                                                <span>At least 8 characters</span>
                                            </div>
                                            <div className={`requirement-premium ${passwordStrength.hasUpperCase ? 'met' : ''}`}>
                                                <span>{passwordStrength.hasUpperCase ? '✓' : '○'}</span>
                                                <span>Uppercase letter</span>
                                            </div>
                                            <div className={`requirement-premium ${passwordStrength.hasLowerCase ? 'met' : ''}`}>
                                                <span>{passwordStrength.hasLowerCase ? '✓' : '○'}</span>
                                                <span>Lowercase letter</span>
                                            </div>
                                            <div className={`requirement-premium ${passwordStrength.hasNumber ? 'met' : ''}`}>
                                                <span>{passwordStrength.hasNumber ? '✓' : '○'}</span>
                                                <span>Number</span>
                                            </div>
                                            <div className={`requirement-premium ${passwordStrength.hasSpecialChar ? 'met' : ''}`}>
                                                <span>{passwordStrength.hasSpecialChar ? '✓' : '○'}</span>
                                                <span>Special character</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div className="form-premium-group">
                                <label className="form-premium-label">
                                    <CheckCircle size={16} />
                                    Confirm New Password
                                </label>
                                <div className="input-premium-wrapper">
                                    <input
                                        type={showPasswords.confirm ? 'text' : 'password'}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Confirm new password"
                                        className={`form-premium-input ${errors.confirmPassword ? 'error' : ''} ${doPasswordsMatch() && formData.confirmPassword ? 'success' : ''}`}
                                    />
                                    <button
                                        type="button"
                                        className="input-premium-toggle"
                                        onClick={() => togglePasswordVisibility('confirm')}
                                    >
                                        {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <span className="form-premium-error">
                                        <AlertTriangle size={12} />
                                        {errors.confirmPassword}
                                    </span>
                                )}

                                {/* Password Match Indicator */}
                                {formData.confirmPassword && doPasswordsMatch() && (
                                    <div className="match-premium-success">
                                        <CheckCircle size={14} />
                                        <span>Passwords match!</span>
                                    </div>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="submit-premium-btn"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="submit-premium-spinner"></div>
                                        <span>Updating Password...</span>
                                    </>
                                ) : (
                                    <>
                                        <Lock size={18} />
                                        <span>Update Password</span>
                                    </>
                                )}
                            </button>

                            {/* Success/Error Message */}
                            {message && (
                                <div className={`message-premium ${message.type}`}>
                                    {message.type === 'success' ? (
                                        <CheckCircle size={18} />
                                    ) : (
                                        <AlertTriangle size={18} />
                                    )}
                                    <span>{message.text}</span>
                                </div>
                            )}
                        </form>

                        {/* Password Tips */}
                        <div className="tips-premium-card">
                            <div className="tips-premium-header">
                                <Shield size={18} />
                                <span>Password Tips</span>
                            </div>
                            <div className="tips-premium-grid">
                                <div className="tip-premium-item">
                                    <span>✓</span>
                                    <span>Use at least 8 characters</span>
                                </div>
                                <div className="tip-premium-item">
                                    <span>✓</span>
                                    <span>Mix uppercase & lowercase letters</span>
                                </div>
                                <div className="tip-premium-item">
                                    <span>✓</span>
                                    <span>Include numbers and special characters</span>
                                </div>
                                {/* <div className="tip-premium-item">
                                    <span>✓</span>
                                    <span>Avoid common passwords like "password123"</span>
                                </div> */}
                                <div className="tip-premium-item">
                                    <span>✓</span>
                                    <span>Don't reuse old passwords</span>
                                </div>
                                {/* <div className="tip-premium-item">
                                    <span>✓</span>
                                    <span>Use a password manager for security</span>
                                </div> */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;