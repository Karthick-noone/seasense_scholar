import { useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadProfileImage, deleteProfileImage } from "../services/profileService";

export const useUploadProfileImage = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  return useMutation({
    mutationFn: uploadProfileImage,

    onSuccess: (res) => {
      const updatedImage = res.data.data?.scholar_profile;

      queryClient.setQueryData(["scholar"], (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          scholar_profile: updatedImage,
        };
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
  });
};

export const useDeleteProfileImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProfileImage,

    onSuccess: () => {
      // ✅ Update cache after delete
      queryClient.setQueryData(["scholar"], (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          scholar_profile: null,
        };
      });
    },
  });
};