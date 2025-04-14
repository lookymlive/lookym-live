import { useAuthStore } from "@/store/auth-store"; // Assuming store path
// Remove expo-av imports
// import { AVPlaybackStatus, ResizeMode, Video } from "expo-av";
import * as ImagePicker from "expo-image-picker";
// Import from expo-video
import { uploadVideoToCloudinary } from "@/utils/cloudinary"; // Import the upload function
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect, useState } from "react"; // Import useEffect
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateScreen() {
  const { currentUser, isAuthenticated, isLoading, isInitialized } =
    useAuthStore();
  const [selectedVideoUri, setSelectedVideoUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false); // Add uploading state
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState(""); // Store hashtags as a single string for now
  // Use the player hook for expo-video
  const player = useVideoPlayer(selectedVideoUri, (player) => {
    // Optional: Callback when player is created/updated
    // player.play(); // Example: Autoplay if needed
  });

  // Handle player source changes
  useEffect(() => {
    if (selectedVideoUri) {
      player.replace(selectedVideoUri);
    } else {
      player.replace(null); // Clear player if URI is null
    }
  }, [selectedVideoUri, player]);

  // Request permissions on component mount (or before picking)
  // TODO: Add permission requests if needed (ImagePicker usually handles it)

  const pickVideo = async () => {
    if (isUploading) return; // Prevent picking during upload
    // Reset previous selection
    setSelectedVideoUri(null);

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["videos"],
      allowsEditing: true,
      quality: 0.8,
      videoMaxDuration: 60,
    });

    if (!result.canceled) {
      // Check duration again as allowsEditing might bypass videoMaxDuration sometimes
      if (result.assets[0].duration && result.assets[0].duration > 60000) {
        // duration is in ms
        Alert.alert(
          "Video Demasiado Largo",
          "Por favor, selecciona un video de 60 segundos o menos."
        );
        return;
      }
      setSelectedVideoUri(result.assets[0].uri);
      console.log("Video seleccionado:", result.assets[0].uri);
    } else {
      console.log("Selección de video cancelada");
    }
  };

  const recordVideo = async () => {
    if (isUploading) return; // Prevent recording during upload
    // TODO: Implement video recording using expo-camera
    Alert.alert(
      "Grabar Video",
      "Funcionalidad de grabación no implementada aún."
    );
  };

  const handleUpload = async () => {
    if (!selectedVideoUri) {
      Alert.alert("Error", "No hay ningún video seleccionado.");
      return;
    }
    // Add caption validation
    if (!caption.trim()) {
      Alert.alert("Error", "Por favor, añade una descripción (caption).");
      return;
    }
    if (isUploading) return;

    setIsUploading(true);
    try {
      console.log("Iniciando carga a Cloudinary...");
      const { secure_url, public_id } = await uploadVideoToCloudinary(
        selectedVideoUri
      );
      console.log("Carga completada:", { secure_url, public_id });

      // --- TODO: Save to Supabase --- //
      // Prepare hashtags array
      const hashtagsArray = hashtags
        .split(/\s+|,/)
        .filter((tag) => tag.length > 0)
        .map((tag) => (tag.startsWith("#") ? tag.substring(1) : tag)); // Remove leading # if present

      console.log("Datos para Supabase:", {
        userId: currentUser?.id,
        videoUrl: secure_url,
        caption: caption,
        hashtags: hashtagsArray,
      });
      // Placeholder for Supabase insert
      // await supabase.from('videos').insert({ ... });
      // ------------------------------ //

      Alert.alert("Éxito", `Video subido correctamente!\nURL: ${secure_url}`);
      // Reset state after successful upload
      setSelectedVideoUri(null);
      setCaption("");
      setHashtags("");
    } catch (error: any) {
      console.error("Error durante la carga:", error);
      Alert.alert(
        "Error de Carga",
        error.message || "No se pudo subir el video."
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Wait until the auth state is initialized
  if (!isInitialized || isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  // Check if user is authenticated and has the 'business' role
  if (!isAuthenticated || currentUser?.role !== "business") {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.messageText}>
          La carga de videos está disponible solo para cuentas de negocio.
        </Text>
        <Text style={styles.subMessageText}>
          Inicia sesión con una cuenta de negocio o actualiza tu cuenta.
        </Text>
        {/* Optionally add a button to navigate to login or profile/settings */}
      </SafeAreaView>
    );
  }

  // User is authenticated and is a business - Render Upload UI
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titleText}>Cargar Video</Text>

      {isUploading ? (
        // Loading Overlay
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Subiendo video...</Text>
        </View>
      ) : (
        // Use ScrollView instead of View for contentWrapper if content might overflow
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContentContainer}
        >
          {/* Block 1: Show Preview OR Selection Buttons */}
          {selectedVideoUri ? (
            // Show Preview + Change Button
            <View style={styles.previewContainer}>
              <Text style={styles.previewText}>Vista Previa:</Text>
              <VideoView
                style={styles.videoPreview}
                player={player}
                allowsFullscreen
                allowsPictureInPicture
                contentFit="cover"
              />
              <TouchableOpacity
                onPress={() => setSelectedVideoUri(null)}
                style={styles.changeButton}
              >
                <Text style={styles.buttonText}>Cambiar Video</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Show Selection Buttons
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={pickVideo} style={styles.button}>
                <Text style={styles.buttonText}>Seleccionar Video</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={recordVideo}
                style={[styles.button, styles.recordButton]}
              >
                <Text style={styles.buttonText}>Grabar Video</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Block 2: Show Details Fields and Upload Button ONLY when video selected */}
          {selectedVideoUri && (
            <View style={[styles.detailsContainer]}>
              <TextInput
                style={styles.input}
                placeholder="Escribe una descripción..."
                value={caption}
                onChangeText={setCaption}
                multiline
                maxLength={150} // Optional: Set max length
              />
              <TextInput
                style={styles.input}
                placeholder="Hashtags (separados por espacio, ej: moda estilo)"
                value={hashtags}
                onChangeText={setHashtags}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.uploadButton,
                  // Disable button if caption is empty
                  (!caption.trim() || isUploading) && styles.disabledButton,
                ]}
                onPress={handleUpload}
                disabled={!caption.trim() || isUploading}
              >
                <Text style={styles.buttonText}>
                  {isUploading ? "Subiendo..." : "Subir Video"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  scrollContainer: {
    flex: 1,
    width: "100%",
  },
  scrollContentContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
  },
  messageText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subMessageText: {
    fontSize: 14,
    textAlign: "center",
    color: "gray",
  },
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginHorizontal: 10,
    alignItems: "center",
  },
  recordButton: {
    backgroundColor: "#FF3B30",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  previewContainer: {
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
  },
  previewText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  videoPreview: {
    width: "80%",
    aspectRatio: 9 / 16,
    backgroundColor: "black",
    marginBottom: 15,
  },
  changeButton: {
    backgroundColor: "#555",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  detailsContainer: {
    width: "100%",
    alignItems: "stretch", // Stretch inputs to container width
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    paddingTop: 20,
  },
  input: {
    backgroundColor: "#f0f0f0", // Light grey background
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    minHeight: 44, // Minimum height for single line input
  },
  uploadButton: {
    backgroundColor: "#34C759",
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: "#aaa",
  },
});
