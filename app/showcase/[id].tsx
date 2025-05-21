import { useAuthStore } from "@/store/auth-store.ts"; // Import auth store
import { useChatStore } from "@/store/chat-store.ts"; // Import chat store
import { useVideoStore } from "@/store/video-store.ts";
import { ProductTag, StoreProduct } from "@/types/product.ts"; // Import product types
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video"; // Import VideoView and useVideoPlayer from expo-video
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function ShowcaseDetailScreen() {
  const { id } = useLocalSearchParams() as { id: string }; // The video ID is passed as 'id'
  const { mainVideo, mainVideoLoading, error, fetchVideoById, setMainVideo } =
    useVideoStore();
  const { createChat } = useChatStore(); // Use createChat action
  const { currentUser } = useAuthStore(); // Use auth store to get current user

  const player = useVideoPlayer(
    { uri: mainVideo?.videoUrl || "" },
    (player) => {
      player.loop = true; // Set the loop property on the player instance
      player.play(); // Start playback when the player is ready
    }
  ); // Create a video player instance

  const [videoDimensions, setVideoDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(
    null
  );

  useEffect(() => {
    if (id) {
      fetchVideoById(id);
    }
    // Clean up mainVideo state when component unmounts or id changes
    return () => setMainVideo(null);
    // Clean up player when component unmounts
    // The useVideoPlayer hook automatically handles player cleanup,
    // so explicit player.pause() here might not be strictly necessary
    // depending on hook implementation, but good practice.
    // player.pause(); // Or player.release() if hook doesn't auto-release
  }, [id, fetchVideoById, setMainVideo, player]); // Add player to dependencies

  const onVideoLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setVideoDimensions({ width, height });
  };

  const handleTagPress = (product: StoreProduct) => {
    setSelectedProduct(product);
  };

  const handleCloseOverlay = () => {
    setSelectedProduct(null);
  };

  const handleChatAboutProduct = async () => {
    if (!currentUser || !selectedProduct?.store_id) {
      // TODO: Handle case where user is not logged in or store_id is missing
      console.log("User not authenticated or store ID missing");
      return;
    }

    // Assuming the store_id of the product is the user_id of the business
    const businessUserId = selectedProduct.store_id;

    // Call the createChat action with the business user's ID
    const chatId = await createChat([businessUserId]);

    if (chatId) {
      // Navigate to the chat screen
      // TODO: Uncomment once chat route is confirmed/implemented
      router.push(`/chat/${chatId}`);
      // console.log(`Navigating to chat ${chatId}`); // Placeholder
    } else {
      // TODO: Handle chat creation error
      console.error("Failed to create or find chat");
    }

    handleCloseOverlay(); // Close the overlay after attempting to create/navigate to chat
  };

  if (mainVideoLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading video...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text>Error loading video: {error}</Text>
      </View>
    );
  }

  if (!mainVideo) {
    return (
      <View style={styles.emptyContainer}>
        <Text>Video not found.</Text>
      </View>
    );
  }

  // Assuming products and tags are available on the mainVideo object
  // mainVideo is now of type Video from @/types/video.ts
  const videoProducts: StoreProduct[] = mainVideo.products || [];
  const videoTags: ProductTag[] = mainVideo.tags || [];

  return (
    <ScrollView style={styles.container}>
      {/* Back Button */}
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </Pressable>

      {/* Video Player with Tags */}
      <View style={styles.videoContainer} onLayout={onVideoLayout}>
        <VideoView
          style={styles.videoPlayer}
          player={player}
          nativeControls
          contentFit={"contain"}
        />
        {videoDimensions.width > 0 &&
          videoDimensions.height > 0 &&
          videoTags.map((tag: ProductTag) => {
            const product = videoProducts.find(
              (p: StoreProduct) => p.id === tag.product_id
            );
            if (!product) return null;
            // Position tags based on percentage
            const tagStyle: any = {
              position: "absolute" as "absolute",
              left: `${tag.position_x}%`,
              top: `${tag.position_y}%`,
              transform: [{ translateX: -10 }, { translateY: -10 }], // Center the tag icon
            };
            return (
              <Pressable
                key={tag.id}
                style={[styles.tag, tagStyle]}
                onPress={() => handleTagPress(product)}
              >
                <Ionicons name="pricetag" size={20} color="white" />
                {/* Optional: display a small tag indicator */}
                <View style={styles.tagIndicator} />
              </Pressable>
            );
          })}
      </View>

      {/* Video Info (Caption, Hashtags, User) */}
      <View style={styles.videoInfoContainer}>
        <Text style={styles.username}>@{mainVideo.user.username}</Text>
        <Text style={styles.caption}>{mainVideo.caption}</Text>
        {/* TODO: Render hashtags */}
      </View>

      {/* Product Grid (Display products associated with the video) */}
      <View style={styles.productGridContainer}>
        <Text style={styles.gridTitle}>Products in this Video</Text>
        <View style={styles.productGrid}>
          {videoProducts.map((product: StoreProduct) => (
            <Pressable
              key={product.id}
              style={styles.productGridItem}
              onPress={() => {
                // TODO: Uncomment once product route is confirmed/implemented
                // router.push(`/product/${product.id}`);
                console.log(`Navigating to product ${product.id}`); // Placeholder
              }}
            >
              <Image
                source={{
                  uri: product.image_url || "https://via.placeholder.com/100",
                }}
                style={styles.productImage}
              />
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productPrice}>
                ${product.price.toFixed(2)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Product Details Overlay Modal */}
      <Modal
        visible={selectedProduct !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseOverlay}
      >
        <Pressable
          style={styles.overlayBackground}
          onPress={handleCloseOverlay}
        >
          <View style={styles.overlayContent}>
            {selectedProduct && (
              <View style={styles.productDetailsContainer}>
                <Image
                  source={{
                    uri:
                      selectedProduct.image_url ||
                      "https://via.placeholder.com/150",
                  }}
                  style={styles.overlayProductImage}
                />
                <View style={styles.productInfo}>
                  <Text style={styles.overlayProductName}>
                    {selectedProduct.name}
                  </Text>
                  <Text style={styles.overlayProductPrice}>
                    ${selectedProduct.price.toFixed(2)}
                  </Text>
                  <Text style={styles.overlayProductDescription}>
                    {selectedProduct.description}
                  </Text>

                  {/* Action Buttons */}
                  <View style={styles.actionButtonsContainer}>
                    <Pressable
                      style={styles.actionButton}
                      onPress={handleChatAboutProduct}
                    >
                      {/* TODO: Uncomment once chat route is confirmed/implemented */}
                      <Ionicons
                        name="chatbubble-outline"
                        size={20}
                        color="#fff"
                      />
                      <Text style={styles.actionButtonText}>
                        Chat about Product
                      </Text>
                    </Pressable>
                    {/* TODO: Add Add to Cart or other relevant buttons */}
                  </View>
                </View>
                {/* Close button */}
                <Pressable
                  style={styles.overlayCloseButton}
                  onPress={handleCloseOverlay}
                >
                  <Ionicons name="close" size={24} color="#000" />
                </Pressable>
              </View>
            )}
          </View>
        </Pressable>
      </Modal>

      {/* TODO: Add Comments Section */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 40, // Adjust as needed for status bar
    left: 10,
    zIndex: 10, // Ensure it's above the video
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 20,
    padding: 5,
  },
  videoContainer: {
    width: "100%",
    aspectRatio: 9 / 16, // Typical portrait video aspect ratio
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  videoPlayer: {
    width: "100%",
    height: "100%",
  },
  tag: {
    padding: 5,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  tagIndicator: {
    width: 10,
    height: 10,
    backgroundColor: "white",
    borderRadius: 5,
    marginLeft: 5,
  },
  videoInfoContainer: {
    padding: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  username: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  caption: {
    fontSize: 14,
    color: "#333",
  },
  productGridContainer: {
    padding: 10,
    backgroundColor: "#fff",
  },
  gridTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  productGridItem: {
    width: "48%", // Adjust based on desired columns and spacing
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
  },
  productImage: {
    width: 100,
    height: 100,
    resizeMode: "cover",
    borderRadius: 4,
    marginBottom: 5,
  },
  productName: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 5,
  },
  productPrice: {
    fontSize: 11,
    color: "green",
    marginTop: 2,
  },
  overlayBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  productDetailsContainer: {
    flexDirection: "row",
    position: "relative",
  },
  overlayProductImage: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    borderRadius: 8,
    marginRight: 15,
  },
  productInfo: {
    flex: 1,
  },
  overlayProductName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  overlayProductPrice: {
    fontSize: 16,
    color: "green",
    marginBottom: 10,
  },
  overlayProductDescription: {
    fontSize: 14,
    color: "#555",
    marginBottom: 15,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  actionButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginRight: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 5,
  },
  overlayCloseButton: {
    position: "absolute",
    top: 5,
    right: 5,
    padding: 5,
  },
});
