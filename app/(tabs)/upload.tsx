import { useColorScheme } from "@/hooks/useColorScheme.ts";
import { useAuthStore } from "@/store/auth-store.ts";
import { useVideoStore } from "@/store/video-store.ts";
import { Video as ExpoVideo, ResizeMode } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Camera, Info, Plus, Tag, Upload, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UploadScreen() {
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { uploadVideo } = useVideoStore();
  const { currentUser } = useAuthStore();
  const { isDark, colors } = useColorScheme();

  // Check if user is a business
  const isBusiness = currentUser?.role === "business";

  const pickVideo = async () => {
    try {
      // Request permissions first
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission Required",
          "You need to grant access to your media library to upload videos."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
        videoMaxDuration: 60, // Limit to 60 seconds
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setVideoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking video:", error);
      Alert.alert("Error", "Failed to select video. Please try again.");
    }
  };

  const recordVideo = async () => {
    try {
      // Request camera permissions first
      const cameraPermission =
        await ImagePicker.requestCameraPermissionsAsync();

      if (cameraPermission.granted === false) {
        Alert.alert(
          "Permission Required",
          "You need to grant access to your camera to record videos."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
        videoMaxDuration: 60, // Limit to 60 seconds
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setVideoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error recording video:", error);
      Alert.alert("Error", "Failed to record video. Please try again.");
    }
  };

  const handleUpload = async () => {
    if (!videoUri || !caption || !isBusiness) {
      Alert.alert(
        "Missing Information",
        "Please add a video and caption before uploading."
      );
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Reset progress
      setUploadProgress(0);

      const hashtagArray = hashtags
        .split(" ")
        .filter((tag) => tag.trim() !== "")
        .map((tag) =>
          tag.startsWith("#") ? tag.substring(1).trim() : tag.trim()
        );

      // Add the video to our store, con progreso
      const newVideo = await uploadVideo(videoUri, caption, hashtagArray);

      // Actualizar el progreso manualmente
      setUploadProgress(100);

      // Reset form
      setVideoUri(null);
      setCaption("");
      setHashtags("");
      setUploadProgress(100);

      // Navega automáticamente al feed tras subir
      Alert.alert(
        "¡Video subido!",
        "Tu video fue subido exitosamente y ya aparece en el feed.",
        [{ text: "Ver Feed", onPress: () => router.push("/") }]
      );
    } catch (error) {
      console.error("Error uploading video:", error);
      Alert.alert(
        "Upload Failed",
        "There was an error uploading your video. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  if (!isBusiness) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.notBusinessContainer}>
          <Info size={60} color={colors.primary} style={styles.infoIcon} />
          <Text style={[styles.notBusinessTitle, { color: colors.text }]}>
            Business Account Required
          </Text>
          <Text
            style={[styles.notBusinessText, { color: colors.textSecondary }]}
          >
            Only business accounts can upload videos to LOOKYM. Upgrade your
            account to showcase your products and services.
          </Text>
          <TouchableOpacity
            style={[styles.upgradeButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/profile")}
          >
            <Text style={styles.buttonText}>Upgrade to Business</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.border }]}
            onPress={() => router.push("/profile")}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
              Go to Profile
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.text }]}>
          Upload New Video
        </Text>

        <View style={styles.videoSection}>
          {videoUri ? (
            <View
              style={[
                styles.videoPreviewContainer,
                { backgroundColor: colors.card },
              ]}
            >
              {Platform.OS !== "web" ? (
                <ExpoVideo
                  source={{ uri: videoUri }}
                  style={{
                    width: "100%",
                    aspectRatio: 9 / 16,
                    borderRadius: 16,
                    backgroundColor: "#000",
                  }}
                  useNativeControls
                  resizeMode={ResizeMode.COVER}
                  shouldPlay={false}
                />
              ) : (
                <video
                  src={videoUri}
                  style={styles.videoPreview}
                  controls
                  poster={undefined}
                />
              )}
              <TouchableOpacity
                style={[
                  styles.removeVideo,
                  {
                    backgroundColor: isDark
                      ? "rgba(0,0,0,0.6)"
                      : "rgba(255,255,255,0.8)",
                  },
                ]}
                onPress={() => setVideoUri(null)}
              >
                <X size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.uploadOptions}>
              <TouchableOpacity
                style={[
                  styles.uploadButton,
                  { borderColor: colors.border, backgroundColor: colors.card },
                ]}
                onPress={pickVideo}
              >
                <Plus size={32} color={colors.primary} />
                <Text style={[styles.uploadText, { color: colors.text }]}>
                  Select Video
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.uploadButton,
                  { borderColor: colors.border, backgroundColor: colors.card },
                ]}
                onPress={recordVideo}
              >
                <Camera size={32} color={colors.primary} />
                <Text style={[styles.uploadText, { color: colors.text }]}>
                  Record Video
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.formSection}>
          <Text style={[styles.label, { color: colors.text }]}>Caption</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="Write a caption for your video..."
            placeholderTextColor={colors.textSecondary}
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={2200}
          />

          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: colors.text }]}>Hashtags</Text>
            <Tag size={16} color={colors.primary} />
          </View>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="Add hashtags separated by spaces (e.g. fashion style trending)"
            placeholderTextColor={colors.textSecondary}
            value={hashtags}
            onChangeText={setHashtags}
          />

          {isUploading ? (
            <View style={styles.uploadingContainer}>
              <View
                style={[styles.progressBar, { backgroundColor: colors.border }]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: colors.primary,
                      width: `${uploadProgress}%`,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.uploadingText, { color: colors.text }]}>
                Uploading... {uploadProgress}%
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.submitButton,
                {
                  opacity: videoUri && caption ? 1 : 0.6,
                  backgroundColor: colors.primary,
                },
              ]}
              onPress={handleUpload}
              disabled={!videoUri || !caption || isUploading}
            >
              <Upload size={20} color="#fff" style={styles.submitIcon} />
              <Text style={styles.submitText}>Upload Video</Text>
            </TouchableOpacity>
          )}
        </View>

        <View
          style={[
            styles.tipsContainer,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.tipsTitle, { color: colors.text }]}>
            Tips for Great Videos
          </Text>
          <View style={styles.tipItem}>
            <View
              style={[styles.tipBullet, { backgroundColor: colors.primary }]}
            />
            <Text style={[styles.tipText, { color: colors.textSecondary }]}>
              Keep videos under 60 seconds for better engagement
            </Text>
          </View>
          <View style={styles.tipItem}>
            <View
              style={[styles.tipBullet, { backgroundColor: colors.primary }]}
            />
            <Text style={[styles.tipText, { color: colors.textSecondary }]}>
              Use good lighting to showcase your products
            </Text>
          </View>
          <View style={styles.tipItem}>
            <View
              style={[styles.tipBullet, { backgroundColor: colors.primary }]}
            />
            <Text style={[styles.tipText, { color: colors.textSecondary }]}>
              Add relevant hashtags to reach your target audience
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  videoSection: {
    marginBottom: 24,
  },
  uploadOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  uploadButton: {
    flex: 1,
    height: 160,
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "500",
  },
  videoPreviewContainer: {
    height: 200,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  videoPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  videoPreview: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  videoSelected: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 12,
  },
  removeVideo: {
    position: "absolute",
    top: 10,
    right: 10,
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  formSection: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    fontSize: 16,
    minHeight: 50,
  },
  uploadingContainer: {
    marginVertical: 16,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  uploadingText: {
    textAlign: "center",
    fontSize: 14,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  submitIcon: {
    marginRight: 8,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  notBusinessContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  infoIcon: {
    marginBottom: 20,
  },
  notBusinessTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  notBusinessText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  upgradeButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  secondaryButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  tipsContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  tipText: {
    fontSize: 14,
    flex: 1,
  },
});
