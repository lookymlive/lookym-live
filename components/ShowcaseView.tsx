/**
 * ShowcaseView - Vidriera virtual para perfiles de comercios en LOOKYM
 *
 * Inspiración: Simula la experiencia de "ver la vidriera desde la calle".
 *
 * - Layout tipo celular centrado (max-width: 430px, sombra, fondo difuminado)
 * - Header con avatar, nombre, chat, seguir y volver
 * - Hero: video destacado con etiquetas interactivas de productos
 * - Grid de productos/videos debajo del hero
 * - Carrusel de otras vidrieras/comercios sugeridos
 *
 * Estructura de datos esperada:
 * interface StoreProfile {
 *   id: string;
 *   name: string;
 *   avatar: string;
 *   bio?: string;
 *   location?: string;
 *   category?: string;
 *   videos: StoreVideo[];
 *   products: StoreProduct[];
 * }
 *
 * interface StoreVideo {
 *   id: string;
 *   videoUrl: string;
 *   thumbnailUrl?: string;
 *   tags: ProductTag[];
 * }
 *
 * interface ProductTag {
 *   id: string;
 *   label: string;
 *   x: number; // posición relativa (0-1)
 *   y: number;
 *   productId: string;
 * }
 *
 * interface StoreProduct {
 *   id: string;
 *   name: string;
 *   price: number;
 *   imageUrl: string;
 *   videoId?: string; // Optional link back to video
 *   description?: string;
 *   sizes?: string[];
 *   colors?: string[];
 * }
 *
 * Documenta cualquier cambio en /docs/ui-components.md y enlaza desde aquí.
 *
 * Última actualización: 2025-05-09
 */

import { Ionicons } from "@expo/vector-icons";
import { Video as ExpoVideo, ResizeMode } from "expo-av";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuthStore } from "../store/auth-store.ts";
import { useChatStore } from "../store/chat-store.ts";
import { useFollowsStore } from "../store/follows-store.ts";
import { supabase } from "../utils/supabase.ts";
import ChatButton from "./ChatButton.tsx";
import FollowButton from "./FollowButton.tsx";
import SuggestedStoreCard from "./SuggestedStoreCard.tsx";

interface ProductTag {
  id: string;
  label: string;
  x: number; // posición relativa (0-1)
  y: number;
  productId: string;
}

interface StoreVideo {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string;
  tags: ProductTag[];
}

interface StoreProduct {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  videoId?: string; // Optional link back to video
  description?: string;
  sizes?: string[];
  colors?: string[];
}

export interface ShowcaseViewProps {
  store: {
    id: string;
    name: string;
    avatar: string;
    bio?: string;
    location?: string;
    category?: string;
    videos: StoreVideo[];
    products: StoreProduct[];
  };
}

/**
 * Para usar ShowcaseView:
 *
 * <ShowcaseView store={storeProfile} />
 *
 * Donde storeProfile sigue la estructura documentada.
 *
 * Si agregas lógica de interacción, documenta aquí y en /docs/ui-components.md
 */

export default function ShowcaseView({ store }: ShowcaseViewProps) {
  // Header: avatar, nombre, chat, seguir, volver
  // Hero: video destacado (primero de la lista)
  // Grid: productos/videos
  // Carrusel: otras vidrieras (futuro)

  const mainVideo = store.videos[0];
  const { currentUser } = useAuthStore();
  const { isFollowing, followUser, unfollowUser } = useFollowsStore();
  const { createChat } = useChatStore();
  const [chatLoading, setChatLoading] = useState(false);
  const router = useRouter();
  const [videoContainerDimensions, setVideoContainerDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(
    null
  );

  const [suggestedStoresData, setSuggestedStoresData] = useState<
    ShowcaseViewProps["store"][]
  >([]);
  const [loadingSuggestedStores, setLoadingSuggestedStores] = useState(true);

  // TODO: Implement actual data fetching for suggested stores
  const fetchSuggestedStores = async () => {
    try {
      setLoadingSuggestedStores(true);
      // Replace with actual Supabase call or API fetch
      // console.log("TODO: Fetch real suggested stores data");

      const { data, error } = await supabase
        .from("users")
        .select("id, name, avatar")
        .eq("role", "business")
        .limit(10); // Limit the number of suggestions

      if (error) {
        console.error("Error fetching suggested stores:", error);
        // Optionally set an error state here
      } else if (data) {
        // Supabase data might not exactly match StoreProfile interface, map if necessary
        // For now, assuming it's close enough for SuggestedStoreCard
        setSuggestedStoresData(data as any[]); // Cast as any[] for now, refine types later if needed
      }
    } catch (error) {
      console.error("Error fetching suggested stores:", error);
    } finally {
      setLoadingSuggestedStores(false);
    }
  };

  useEffect(() => {
    fetchSuggestedStores();
  }, []); // Empty dependency array means this runs once on mount

  // Acciones de follow/unfollow
  const handleFollow = async () => {
    if (!currentUser) return;
    await followUser(store.id);
  };
  const handleUnfollow = async () => {
    if (!currentUser) return;
    await unfollowUser(store.id);
  };

  // Acción de iniciar chat
  const handleStartChat = async () => {
    if (!currentUser) return;
    setChatLoading(true);
    try {
      await createChat([store.id]);
      // Aquí podrías navegar al chat si lo deseas
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.phoneFrame}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* TODO: Botón volver */}
            <Pressable onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </Pressable>
          </View>
          <View style={styles.headerCenter}>
            {/* Avatar y nombre */}
            <View style={styles.avatarCircle}>
              {store.avatar ? (
                <Image
                  source={{ uri: store.avatar }}
                  style={{ width: 40, height: 40, borderRadius: 20 }}
                  contentFit="cover"
                />
              ) : (
                <Text style={styles.avatarInitial}>{store.name[0]}</Text>
              )}
            </View>
            <Text style={styles.storeName}>{store.name}</Text>
          </View>
          <View style={styles.headerRight}>
            {/* Botón seguir y chat solo si no es el propio perfil */}
            {currentUser && currentUser.id !== store.id && (
              <>
                <FollowButton
                  isFollowing={isFollowing(store.id)}
                  onFollow={handleFollow}
                  onUnfollow={handleUnfollow}
                />
                <ChatButton
                  onStartChat={handleStartChat}
                  label={chatLoading ? "Cargando..." : "Chat"}
                />
              </>
            )}
          </View>
        </View>

        {/* Hero video */}
        <View style={styles.heroVideo}>
          {mainVideo ? (
            <>
              {/* Container for video and tags */}
              <View
                style={styles.videoTagContainer}
                onLayout={(event) => {
                  const { width, height } = event.nativeEvent.layout;
                  setVideoContainerDimensions({ width, height });
                }}
              >
                <ExpoVideo
                  source={{ uri: mainVideo.videoUrl }}
                  style={styles.mainVideoPlayer}
                  useNativeControls
                  resizeMode={ResizeMode.COVER}
                  posterSource={
                    mainVideo.thumbnailUrl
                      ? { uri: mainVideo.thumbnailUrl }
                      : undefined
                  }
                  posterStyle={{ resizeMode: "cover", borderRadius: 16 }}
                  shouldPlay={false}
                  isLooping
                />
                {/* Render tags */}
                {videoContainerDimensions.width > 0 && // Only render tags if dimensions are known
                  mainVideo.tags.map((tag) => {
                    const product = store.products.find(
                      (p) => p.id === tag.productId
                    );
                    if (!product) return null; // Don't render tag if product not found

                    return (
                      <Pressable
                        key={tag.id}
                        style={[
                          styles.productTag,
                          {
                            left: tag.x * videoContainerDimensions.width,
                            top: tag.y * videoContainerDimensions.height,
                          },
                        ]}
                        onPress={() => {
                          console.log(
                            "Tag pressed:",
                            tag.label,
                            "Product ID:",
                            tag.productId
                          );
                          const product = store.products.find(
                            (p) => p.id === tag.productId
                          );
                          if (product) {
                            setSelectedProduct(product);
                          }
                        }}
                      >
                        <Text style={styles.productTagText}>{tag.label}</Text>
                        <View style={styles.tagIndicator} />
                      </Pressable>
                    );
                  })}
              </View>
              <Text style={styles.heroVideoTextSmall}>
                {mainVideo.tags.length > 0
                  ? `Etiquetas: ${mainVideo.tags.map((t) => t.label).join(", ")}`
                  : "Sin etiquetas"}
              </Text>
            </>
          ) : (
            <View style={styles.heroVideoPlaceholder}>
              <Text style={styles.heroVideoText}>Sin video principal</Text>
            </View>
          )}
        </View>

        {/* Selected product details overlay */}
        {selectedProduct && (
          <View style={styles.selectedProductOverlayContainer}>
            <Pressable
              style={styles.closeOverlayButton}
              onPress={() => setSelectedProduct(null)}
            >
              <Ionicons name="close-circle" size={24} color="#fff" />
            </Pressable>
            <Pressable
              style={styles.selectedProductOverlay}
              onPress={() => {
                console.log("Dismissing product overlay");
                setSelectedProduct(null);
              }}
            >
              <Image
                source={{ uri: selectedProduct.imageUrl }}
                style={styles.selectedProductImage}
                contentFit="cover"
              />
              <View style={styles.selectedProductInfo}>
                <Text style={styles.selectedProductName} numberOfLines={1}>
                  {selectedProduct.name}
                </Text>
                {selectedProduct.description && (
                  <Text
                    style={styles.selectedProductDescription}
                    numberOfLines={2}
                  >
                    {selectedProduct.description}
                  </Text>
                )}
                <Pressable
                  style={styles.viewProductButton}
                  onPress={() => {
                    console.log(
                      "Navigate to product detail screen for ID:",
                      selectedProduct.id
                    );
                    // Implement navigation to product detail screen here
                    router.push(`/product/${selectedProduct.id}`); // Assuming dynamic route
                  }}
                >
                  <Text style={styles.viewProductButtonText}>
                    ${selectedProduct.price}
                  </Text>
                </Pressable>
              </View>
              {/* Communication Buttons */}
              <View style={styles.productOverlayActions}>
                <Pressable
                  style={styles.actionButtonOverlay}
                  onPress={() => {
                    // Initiate chat about the selected product
                    if (currentUser && store.id && selectedProduct) {
                      createChat([store.id]);
                      // Optionally navigate to the chat screen after initiating
                      console.log(
                        "Navigating to chat with store ID:",
                        store.id
                      );
                      router.push(`/chat/${store.id}`); // Assuming a route like app/chat/[id].tsx
                    } else if (!currentUser) {
                      console.log("User not logged in, cannot initiate chat.");
                      // TODO: Prompt user to log in
                    }
                  }}
                >
                  <Ionicons name="chatbubble-outline" size={20} color="#555" />
                  <Text style={styles.actionButtonOverlayText}>Chat</Text>
                </Pressable>
                <Pressable
                  style={styles.actionButtonOverlay}
                  onPress={() => {
                    // Navigate to the comments section for the main video
                    if (mainVideo?.id) {
                      console.log(
                        "Navigating to comments for video ID:",
                        mainVideo.id
                      );
                      router.push(`/video/${mainVideo.id}`); // Navigate to video detail screen, TODO: clarify comments location
                    } else {
                      console.log(
                        "Cannot navigate to comments: mainVideo or mainVideo.id is undefined."
                      );
                    }
                  }}
                >
                  <Ionicons name="chatbox-outline" size={20} color="#555" />
                  <Text style={styles.actionButtonOverlayText}>
                    Comentarios
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          </View>
        )}

        {/* Grid de productos */}
        <View style={styles.productsGrid}>
          <Text style={styles.productsGridTitle}>Productos en vidriera</Text>
          <View style={styles.productsRow}>
            {store.products.length === 0 ? (
              <Text style={styles.productsEmpty}>Sin productos aún</Text>
            ) : (
              store.products.slice(0, 6).map((product) => (
                <Pressable
                  key={product.id}
                  onPress={() => {
                    // Navigate to product detail screen
                    router.push(`/product/${product.id}`); // Assuming a dynamic route like app/product/[id].tsx
                  }}
                >
                  <View style={styles.productCard}>
                    {product.imageUrl ? (
                      <Image
                        source={{ uri: product.imageUrl }}
                        style={styles.productImage}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={styles.productImagePlaceholder} />
                    )}
                    <Text style={styles.productName} numberOfLines={1}>
                      {product.name}
                    </Text>
                    <Text style={styles.productPrice}>${product.price}</Text>
                  </View>
                </Pressable>
              ))
            )}
          </View>
        </View>

        {/* Carrusel de otras vidrieras (futuro) */}
        <View style={styles.otherStoresSection}>
          <Text style={styles.otherStoresTitle}>
            Otras vidrieras que te pueden interesar
          </Text>
          {/* TODO: Implement suggested stores carousel here */}
          {loadingSuggestedStores ? (
            <Text>Cargando sugerencias...</Text>
          ) : (
            <FlatList
              data={suggestedStoresData}
              renderItem={({ item }) => <SuggestedStoreCard store={item} />}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselContentContainer}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f2f2f2", // Simula la "calle"
    minHeight: Dimensions.get("window").height,
  },
  phoneFrame: {
    width: 430,
    maxWidth: "100%",
    minHeight: 700,
    backgroundColor: "#fff",
    borderRadius: 32,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
    alignItems: "center",
    justifyContent: "flex-start",
    marginVertical: 32,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerLeft: {
    width: 40,
    alignItems: "flex-start",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  headerRight: {
    width: 40,
    alignItems: "flex-end",
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#888",
  },
  storeName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
  },
  heroVideo: {
    width: "100%",
    aspectRatio: 9 / 16,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  videoTagContainer: {
    width: "100%",
    aspectRatio: 9 / 16,
    position: "relative", // Crucial for absolute positioning of tags
  },
  mainVideoPlayer: {
    width: "100%",
    height: "100%", // Fill the container
    borderRadius: 16,
    backgroundColor: "#000", // Match container background
  },
  heroVideoPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  heroVideoText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  heroVideoTextSmall: {
    color: "#ccc",
    fontSize: 13,
    marginTop: 8,
    textAlign: "center",
  },
  productsGrid: {
    width: "100%",
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  productsGridTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#222",
  },
  productsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "flex-start",
  },
  productCard: {
    width: 120,
    backgroundColor: "#fafafa",
    borderRadius: 12,
    padding: 8,
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 6,
  },
  productImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#e0e0e0",
    marginBottom: 6,
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
    marginTop: 4,
  },
  productPrice: {
    fontSize: 13,
    color: "#5E60CE",
    fontWeight: "bold",
    marginTop: 2,
  },
  productsEmpty: {
    color: "#888",
    fontSize: 14,
    marginTop: 12,
  },
  productTag: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  productTagText: {
    color: "#fff",
    fontSize: 12,
    marginRight: 4,
  },
  tagIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#5E60CE",
  },
  selectedProductOverlayContainer: {
    position: "absolute",
    bottom: 20, // Position slightly above the bottom edge
    left: 16,
    right: 16,
    zIndex: 1, // Ensure it's above other content
    alignItems: "center", // Center the overlay content horizontally
  },
  selectedProductOverlay: {
    backgroundColor: "rgba(255,255,255,0.95)", // Semi-transparent white background
    borderRadius: 12,
    padding: 12,
    flexDirection: "row", // Arrange image and info side by side
    alignItems: "center",
    maxWidth: 300, // Max width for the overlay card
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  closeOverlayButton: {
    position: "absolute",
    top: -10, // Position above the overlay card
    right: -10,
    zIndex: 2, // Ensure close button is tappable
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 12,
  },
  selectedProductImage: {
    width: 60, // Smaller image
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  selectedProductInfo: {
    flex: 1, // Take remaining space
  },
  selectedProductName: {
    color: "#333", // Darker text color
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 2,
  },
  selectedProductDescription: {
    color: "#555", // Grayish text color
    fontSize: 12,
    marginBottom: 4,
  },
  selectedProductPrice: {
    color: "#5E60CE", // Accent color for price
    fontSize: 14,
    fontWeight: "bold",
  },
  viewProductButton: {
    backgroundColor: "#5E60CE", // Accent color background
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: "flex-start", // Align button to the start
  },
  viewProductButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
  },
  otherStoresSection: {
    width: "100%",
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 16,
  },
  otherStoresTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#222",
  },
  carouselPlaceholder: {
    width: "100%",
    height: 100, // Placeholder height
    backgroundColor: "#eee",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  carouselPlaceholderText: {
    color: "#888",
    fontSize: 14,
  },
  carouselContentContainer: {
    paddingRight: 16, // Add some padding at the end of the carousel
  },
  productOverlayActions: {
    flexDirection: "row",
    marginTop: 8,
    gap: 12, // Space between buttons
    justifyContent: "center", // Center buttons horizontally
    width: "100%", // Take full width of the overlay content
  },
  actionButtonOverlay: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: "#eee", // Light background for buttons
  },
  actionButtonOverlayText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#333",
  },
});
