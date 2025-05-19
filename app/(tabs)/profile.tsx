// Integración de ShowcaseView para negocios
import ShowcaseView, { ShowcaseViewProps } from "@/components/ShowcaseView.tsx";
/**
 * ProfileScreen - Pantalla de perfil de usuario/negocio para LOOKYM
 *
 * Documentación relevante:
 * - /docs/ui-components.md (componentes reutilizables)
 * - /docs/state-management.md (gestión de estado con Zustand)
 * - /docs/styling-guide.md (estilos y gradientes)
 * - /memory-bank/activeContext.md (prioridades actuales)
 *
 * Si agregas nuevas funcionalidades, actualiza la documentación y enlaza desde aquí.
 *
 * Última actualización: 2025-05-09
 *
 * -----------------------------
 *
 * Diseño de UI propuesto:
 *
 * - Header: botón volver (si no es propio), nombre usuario, settings (si es propio)
 * - Sección perfil: avatar, nombre, verificación, rol, bio, info negocio
 * - Estadísticas: posts, followers, following
 * - Botones acción: seguir/dejar de seguir, editar perfil, mensaje
 * - Tabs: posts (grid), saved, products (negocio)
 * - Contenido tab: grid de videos, mensaje vacío, botón subir video
 *
 * Estructura de datos esperada:
 *
 * interface ProfileUser {
 *   id: string;
 *   username: string;
 *   displayName: string;
 *   avatar: string;
 *   bio?: string;
 *   role: "user" | "business";
 *   verified?: boolean;
 *   category?: string;
 *   location?: string;
 *   email: string;
 * }
 *
 * interface FollowsStats {
 *   followersCount: number;
 *   followingCount: number;
 * }
 *
 * interface Video {
 *   id: string;
 *   userId: string;
 *   videoUrl: string;
 *   thumbnailUrl?: string;
 *   caption?: string;
 *   hashtags?: string[];
 *   createdAt: string;
 * }
 *
 * Si agregas campos nuevos, actualiza este bloque y la documentación relevante.
 *
 * -----------------------------
 *
 * TODOs sugeridos para siguientes mejoras:
 * - [ ] Extraer componentes UI reutilizables (Avatar, Stats, Tabs, Grid)
 * - [ ] Documentar cada componente en /docs/ui-components.md
 * - [ ] Añadir tests para lógica de perfil y helpers
 * - [ ] Mejorar accesibilidad y responsividad
 * - [ ] Sincronizar cambios con /memory-bank/activeContext.md y /docs/README.md
 */
import { useColorScheme } from "@/hooks/useColorScheme.ts";
import { useAuthStore } from "@/store/auth-store.ts";
import { useFollowsStore } from "@/store/follows-store.ts";
import { useVideoStore } from "@/store/video-store.ts";
import { supabase } from "@/utils/supabase.ts";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import {
  Bookmark,
  Camera,
  ChevronLeft,
  Edit,
  Grid3X3,
  LogOut,
  Settings,
  ShoppingBag,
  User,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfileScreen() {
  const { userId } = useLocalSearchParams();
  const { currentUser, logout, updateProfile } = useAuthStore();
  const { colors, isDark } = useColorScheme();
  const [activeTab, setActiveTab] = useState("posts");
  const {
    videos,
    fetchVideosByUser,
    isLoading: videosLoading,
  } = useVideoStore();
  const {
    followUser,
    unfollowUser,
    isFollowing,
    getUserFollowsSummary,
    refreshFollowsData,
    isInitialized: followsInitialized,
    isLoading: followsLoading,
  } = useFollowsStore();

  const [profileUser, setProfileUser] = useState(currentUser);
  const [isOwner, setIsOwner] = useState(true);
  const [followsStats, setFollowsStats] = useState({
    followersCount: 0,
    followingCount: 0,
  });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [followActionLoading, setFollowActionLoading] = useState(false);

  // Determinar si se está viendo el perfil propio o de otro usuario
  useEffect(() => {
    const setupProfile = async () => {
      setLoadingProfile(true);
      try {
        // Si hay userId en los parámetros y es diferente al usuario actual
        if (userId && userId !== currentUser?.id) {
          setIsOwner(false);
          await fetchUserProfile(userId as string);
        } else {
          // Viendo perfil propio
          setIsOwner(true);
          setProfileUser(currentUser);
          if (currentUser) {
            await fetchVideosByUser(currentUser.id);

            // Inicializa datos de seguidores si no lo están
            if (!followsInitialized) {
              await refreshFollowsData();
            }

            // Obtener estadísticas de seguidores
            const stats = await getUserFollowsSummary(currentUser.id);
            setFollowsStats(stats);
          }
        }
      } catch (error) {
        console.error("Error setting up profile:", error);
      } finally {
        setLoadingProfile(false);
      }
    };

    setupProfile();
  }, [userId, currentUser, followsInitialized]);

  const fetchUserProfile = async (userId: string) => {
    try {
      // Obtener datos del usuario
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      // Formatear datos para la interfaz
      const userProfile = {
        id: data.id,
        username: data.username,
        displayName: data.display_name,
        avatar: data.avatar_url,
        bio: data.bio,
        role: data.role,
        verified: data.verified,
        category: data.category,
        location: data.location,
        email: data.email || "email@ejemplo.com", // Proporcionar email (requerido por el tipo User)
      };

      setProfileUser(userProfile);

      // Cargar videos del usuario
      await fetchVideosByUser(userId);

      // Obtener estadísticas de seguidores
      const stats = await getUserFollowsSummary(userId);
      setFollowsStats(stats);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      Alert.alert("Error", "No se pudo cargar el perfil del usuario");
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      router.push("/auth/login");
      return;
    }

    if (!profileUser) return;

    try {
      setFollowActionLoading(true);

      if (isFollowing(profileUser.id)) {
        await unfollowUser(profileUser.id);
      } else {
        await followUser(profileUser.id);
      }

      // Actualizar contador de seguidores
      const stats = await getUserFollowsSummary(profileUser.id);
      setFollowsStats(stats);
    } catch (error) {
      console.error("Error following/unfollowing user:", error);
      Alert.alert("Error", "No se pudo completar la acción");
    } finally {
      setFollowActionLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleEditProfile = () => {
    router.push("/edit-profile");
  };

  const handleChangePhoto = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission Required",
          "You need to grant access to your photos to change your profile picture."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await updateProfile({ avatar: result.assets[0].uri });
      }
    } catch (error) {
      console.error("Error changing photo:", error);
      Alert.alert("Error", "Failed to change profile photo");
    }
  };

  const navigateBack = () => {
    router.back();
  };

  if (!currentUser) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.notLoggedIn}>
          <Text style={[styles.notLoggedInText, { color: colors.text }]}>
            Please log in to view profiles
          </Text>
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/auth/login")}
          >
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loadingProfile) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Cargando perfil...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profileUser) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.notLoggedIn}>
          <Text style={[styles.notLoggedInText, { color: colors.text }]}>
            Usuario no encontrado
          </Text>
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.primary }]}
            onPress={navigateBack}
          >
            <Text style={styles.loginButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Business-specific data y estructura para ShowcaseView
  const businessInfo =
    profileUser.role === "business"
      ? {
          category: profileUser.category || "Sin categoría",
          location: profileUser.location || "Sin ubicación",
        }
      : null;

  // Estructura de datos para ShowcaseView
  const showcaseStoreProfile: ShowcaseViewProps["store"] | null =
    profileUser.role === "business"
      ? {
          id: profileUser.id,
          name: profileUser.displayName || profileUser.username,
          avatar: profileUser.avatar,
          bio: profileUser.bio,
          location: profileUser.location,
          category: profileUser.category,
          videos: videos.map((v) => ({
            id: v.id,
            videoUrl: v.videoUrl,
            thumbnailUrl: v.thumbnailUrl,
            tags: [], // TODO: mapear etiquetas de productos si existen
          })),
          products: [], // TODO: mapear productos si existen
        }
      : null;

  // Render different content based on user role
  const renderRoleSpecificContent = () => {
    if (profileUser.role === "business" && showcaseStoreProfile) {
      // Renderizar ShowcaseView para negocios
      return <ShowcaseView store={showcaseStoreProfile} />;
    }
    // ... (mantener la lógica anterior para usuarios normales si se desea)
    return null;
  };

  // Render different tabs based on user role
  const renderTabs = () => {
    const tabs = [
      {
        id: "posts",
        icon: (
          <Grid3X3
            size={24}
            color={
              activeTab === "posts" ? colors.primary : colors.textSecondary
            }
          />
        ),
      },
      {
        id: "saved",
        icon: (
          <Bookmark
            size={24}
            color={
              activeTab === "saved" ? colors.primary : colors.textSecondary
            }
          />
        ),
      },
    ];

    // Add business-specific tabs
    if (profileUser.role === "business") {
      tabs.push({
        id: "products",
        icon: (
          <ShoppingBag
            size={24}
            color={
              activeTab === "products" ? colors.primary : colors.textSecondary
            }
          />
        ),
      });
    }

    return (
      <View style={[styles.tabs, { borderColor: colors.border }]}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && [
                styles.activeTab,
                { borderColor: colors.primary },
              ],
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            {tab.icon}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "posts":
        // Video Grid Tab Content
        if (videosLoading) {
          return (
            <ActivityIndicator
              size="large"
              color={colors.primary}
              style={styles.loadingIndicator}
            />
          );
        }

        if (!videos || videos.length === 0) {
          return (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>
                No hay videos publicados aún.
              </Text>
              {isOwner && (
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={() => router.push("/upload")}
                >
                  <Text style={styles.uploadButtonText}>Subir Video</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }

        return (
          <FlatList
            data={videos}
            keyExtractor={(item) => item.id}
            numColumns={3} // 3 columns for a grid layout
            renderItem={({ item }) => (
              <Pressable
                style={styles.videoGridItem}
                onPress={() => {
                  console.log(
                    "TODO: Navigate to video detail screen for video ID:",
                    item.id
                  );
                  // Implement navigation to video detail screen here, e.g.:
                  // router.push(`/videos/${item.id}`);
                  router.push(`/videos/${item.id}`); // Assuming a dynamic route like app/videos/[id].tsx
                }}
              >
                {/* Using Image for thumbnail for simplicity. Could use a small video preview */}
                <Image
                  source={{ uri: item.thumbnailUrl || item.videoUrl }} // Use thumbnail if available
                  style={styles.videoThumbnail}
                  contentFit="cover"
                />
                {/* Optionally add a play icon overlay */}
              </Pressable>
            )}
            contentContainerStyle={styles.videoGrid}
          />
        );
      case "saved":
        return (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {isOwner
                ? "Aún no has guardado ningún video"
                : "Esta información no está disponible"}
            </Text>
          </View>
        );
      case "products":
        return (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>
              {isOwner
                ? "No has añadido ningún producto todavía."
                : `${profileUser.username} no ha añadido ningún producto todavía.`}
            </Text>
            {isOwner && profileUser.role === 'business' && (
              <TouchableOpacity
                style={[styles.uploadButton, { backgroundColor: colors.primary }]}
                onPress={() => {
                  console.log('TODO: Navigate to add product screen');
                  // router.push('/add-product');
                }}
              >
                <Text style={styles.uploadButtonText}>Añadir Producto</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        {!isOwner && (
          <TouchableOpacity onPress={navigateBack} style={styles.backButton}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
        )}
        <Text style={[styles.username, { color: colors.text }]}>
          {profileUser.username}
        </Text>
        {isOwner && (
          <TouchableOpacity onPress={() => router.push("./settings")}>
            <Settings size={24} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: profileUser.avatar }}
                style={styles.avatar}
              />
              {isOwner && (
                <TouchableOpacity
                  style={[
                    styles.changePhotoButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={handleChangePhoto}
                >
                  <Camera size={16} color="#ffffff" />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.text }]}>
                  {videos.length}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  Posts
                </Text>
              </View>

              <TouchableOpacity
                style={styles.statItem}
                onPress={() => {
                  // @ts-ignore - Dynamic routes in Expo Router
                  profileUser && router.push(`/followers/${profileUser.id}`);
                }}
              >
                <Text style={[styles.statNumber, { color: colors.text }]}>
                  {followsStats.followersCount}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  Followers
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.statItem}
                onPress={() => {
                  // @ts-ignore - Dynamic routes in Expo Router
                  profileUser && router.push(`/following/${profileUser.id}`);
                }}
              >
                <Text style={[styles.statNumber, { color: colors.text }]}>
                  {followsStats.followingCount}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  Following
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.profileInfo}>
            <Text style={[styles.displayName, { color: colors.text }]}>
              {profileUser.displayName}
              {profileUser.verified && " ✓"}
            </Text>

            <Text style={[styles.userRole, { color: colors.primary }]}>
              {profileUser.role === "business"
                ? "Business Account"
                : "Personal Account"}
            </Text>

            <Text style={[styles.bio, { color: colors.textSecondary }]}>
              {profileUser.bio || "No bio yet"}
            </Text>

            {/* Removed renderRoleSpecificContent() call */}
          </View>

          <View style={styles.actionButtons}>
            {isOwner ? (
              <>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={handleEditProfile}
                >
                  <Edit
                    size={16}
                    color={colors.text}
                    style={styles.actionButtonIcon}
                  />
                  <Text
                    style={[styles.actionButtonText, { color: colors.text }]}
                  >
                    Edit Profile
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={handleLogout}
                >
                  <LogOut
                    size={16}
                    color={colors.text}
                    style={styles.actionButtonIcon}
                  />
                  <Text
                    style={[styles.actionButtonText, { color: colors.text }]}
                  >
                    Log Out
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: isFollowing(profileUser.id)
                        ? colors.card
                        : colors.primary,
                      borderColor: isFollowing(profileUser.id)
                        ? colors.border
                        : colors.primary,
                    },
                  ]}
                  onPress={handleFollow}
                  disabled={followActionLoading}
                >
                  {followActionLoading ? (
                    <ActivityIndicator
                      size="small"
                      color={isFollowing(profileUser.id) ? colors.text : "#fff"}
                    />
                  ) : (
                    <>
                      <User
                        size={16}
                        color={
                          isFollowing(profileUser.id) ? colors.text : "#fff"
                        }
                        style={styles.actionButtonIcon}
                      />
                      <Text
                        style={[
                          styles.actionButtonText,
                          {
                            color: isFollowing(profileUser.id)
                              ? colors.text
                              : "#fff",
                          },
                        ]}
                      >
                        {isFollowing(profileUser.id) ? "Following" : "Follow"}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => {
                    // @ts-ignore - Dynamic routes in Expo Router
                    profileUser && router.push(`/chat/${profileUser.id}`);
                  }}
                >
                  <Text
                    style={[styles.actionButtonText, { color: colors.text }]}
                  >
                    Message
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {renderTabs()}
        <View style={styles.tabContent}>{renderTabContent()}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  username: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  profileSection: {
    padding: 16,
  },
  profileHeader: {
    flexDirection: "row",
    marginBottom: 16,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  changePhotoButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  statsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginLeft: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
  },
  profileInfo: {
    marginBottom: 16,
  },
  displayName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    marginBottom: 8,
  },
  businessInfo: {
    marginTop: 8,
  },
  businessInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  businessInfoText: {
    fontSize: 14,
    marginLeft: 6,
  },
  businessButton: {
    height: 36,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  businessButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 0.48,
    flexDirection: "row",
    height: 36,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonIcon: {
    marginRight: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  tabs: {
    flexDirection: "row",
    borderTopWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  postsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  postItem: {
    width: "33.33%",
    aspectRatio: 1,
    padding: 1,
  },
  postImage: {
    width: "100%",
    height: "100%",
  },
  productsContainer: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    height: 200,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  emptyActionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  emptyActionButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    minHeight: 200,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
  },
  emptyStateContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  uploadButton: {
    backgroundColor: "#5E60CE",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingIndicator: {
    marginTop: 20,
  },
  videoGrid: {
    // Add padding if needed
  },
  videoGridItem: {
    flex: 1,
    aspectRatio: 1, // Square items
    margin: 2,
    backgroundColor: "#e0e0e0", // Placeholder background
    borderRadius: 4,
    overflow: "hidden",
  },
  videoThumbnail: {
    width: "100%",
    height: "100%",
  },
  notLoggedIn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  notLoggedInText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  loginButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
  statsText: {
    fontSize: 16,
    color: "#333",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginTop: 12,
    marginBottom: 8,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  activeTabButtonText: {
    fontWeight: "bold",
  },
  tabContent: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 16,
    marginTop: 8,
  },
});
