import Constants from "expo-constants";
import { Alert } from "react-native";

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME =
  Constants.expoConfig?.extra?.cloudinaryCloudName || "your-cloud-name";
const CLOUDINARY_UPLOAD_PRESET =
  Constants.expoConfig?.extra?.cloudinaryUploadPreset || "lookym_videos";

// Helper function to upload a video to Cloudinary
export const uploadVideo = async (
  videoUri: string,
  options: {
    resource_type?: string;
    folder?: string;
    public_id?: string;
    tags?: string[];
  } = {}
) => {
  try {
    // Create form data for the upload
    const formData = new FormData();

    // Convert local URI to blob for web or use uri directly for native
    if (videoUri.startsWith("file://") || videoUri.startsWith("content://")) {
      // For native platforms
      const fileType = videoUri.split(".").pop() || "mp4";
      const fileName =
        videoUri.split("/").pop() || `video-${Date.now()}.${fileType}`;

      // @ts-ignore - React Native's FormData implementation accepts objects with uri
      formData.append("file", {
        uri: videoUri,
        type: `video/${fileType}`,
        name: fileName,
      });
    } else {
      // For web
      const response = await fetch(videoUri);
      const blob = await response.blob();
      formData.append("file", blob);
    }

    // Add upload preset (for unsigned uploads)
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    // Add additional options
    if (options.resource_type) {
      formData.append("resource_type", options.resource_type);
    }

    if (options.folder) {
      formData.append("folder", options.folder);
    }

    if (options.public_id) {
      formData.append("public_id", options.public_id);
    }

    if (options.tags && options.tags.length > 0) {
      formData.append("tags", options.tags.join(","));
    }

    // Upload to Cloudinary
    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Cloudinary upload failed: ${errorText}`);
    }

    const uploadResult = await uploadResponse.json();
    return uploadResult;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};

// Helper function to get a video URL from Cloudinary
export const getVideoUrl = (
  publicId: string,
  options: {
    format?: string;
    quality?: string;
    height?: number;
    width?: number;
  } = {}
) => {
  let transformations = "";

  if (options.height || options.width) {
    transformations += `c_scale,${options.height ? `h_${options.height}` : ""}${
      options.width ? `${options.height ? "," : ""}w_${options.width}` : ""
    }/`;
  }

  if (options.quality) {
    transformations += `q_${options.quality}/`;
  }

  const format = options.format || "mp4";

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/${transformations}${publicId}.${format}`;
};

// Helper function to get a video thumbnail URL from Cloudinary
export const getVideoThumbnailUrl = (
  publicId: string,
  options: {
    format?: string;
    quality?: string;
    height?: number;
    width?: number;
    time?: string;
  } = {}
) => {
  let transformations = "c_thumb,";

  if (options.time) {
    transformations += `so_${options.time},`;
  }

  if (options.height || options.width) {
    transformations += `${options.height ? `h_${options.height}` : ""}${
      options.width ? `${options.height ? "," : ""}w_${options.width}` : ""
    },`;
  }

  if (options.quality) {
    transformations += `q_${options.quality},`;
  }

  // Remove trailing comma
  transformations = transformations.slice(0, -1);

  const format = options.format || "jpg";

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/${transformations}/${publicId}.${format}`;
};

// Function to upload a video file to Cloudinary using fetch and FormData
// Returns the secure_url and public_id on success
export const uploadVideoToCloudinary = async (
  fileUri: string
): Promise<{ secure_url: string; public_id: string }> => {
  const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    const message =
      "Cloudinary configuration missing (Cloud Name or Upload Preset).";
    console.error(message);
    Alert.alert("Error de Configuración", message);
    throw new Error(message);
  }

  const apiUrl = `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`;
  const formData = new FormData();

  // Determine file type (simple approach)
  const uriParts = fileUri.split(".");
  const fileType = uriParts[uriParts.length - 1];

  formData.append("file", {
    uri: fileUri,
    name: `video.${fileType}`, // Cloudinary needs a name
    type: `video/${fileType}`, // And a MIME type
  } as any); // Cast needed because React Native FormData typing can be tricky

  formData.append("upload_preset", uploadPreset);
  // Optional: Add tags, context, folder, etc.
  // formData.append('folder', 'lookym_uploads');

  console.log(
    `[Cloudinary] Uploading ${fileUri} to ${apiUrl} with preset ${uploadPreset}`
  );

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
        // 'Content-Type': 'multipart/form-data' is usually set automatically by fetch with FormData
      },
    });

    const responseData = await response.json();

    if (!response.ok) {
      // Cloudinary often returns error details in the JSON body
      const errorMessage =
        responseData?.error?.message ||
        `HTTP error! status: ${response.status}`;
      console.error("[Cloudinary] Upload failed:", errorMessage, responseData);
      throw new Error(`Error al subir a Cloudinary: ${errorMessage}`);
    }

    if (!responseData.secure_url || !responseData.public_id) {
      console.error(
        "[Cloudinary] Upload succeeded but response missing secure_url or public_id:",
        responseData
      );
      throw new Error("Respuesta inválida de Cloudinary después de la carga.");
    }

    console.log("[Cloudinary] Upload successful:", responseData);
    return {
      secure_url: responseData.secure_url,
      public_id: responseData.public_id,
    };
  } catch (error: any) {
    console.error("[Cloudinary] Network or other error during upload:", error);
    // Re-throw a more specific error
    throw new Error(`Fallo en la subida del video: ${error.message}`);
  }
};

// TODO: Add progress tracking if needed (might require XMLHttpRequest or a library)
