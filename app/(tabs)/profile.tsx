// Integración de ShowcaseView para negocios
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
import { AppHeader } from "@/components/AppHeader.tsx";
import { FullScreenStatusView } from "@/components/FullScreenStatusView.tsx";
import { MediaGridItem } from "@/components/MediaGridItem.tsx";
import { useColorScheme } from "@/hooks/useColorScheme.ts";
import { useAuthStore } from "@/store/auth-store.ts";
import { useFollowsStore } from "@/store/follows-store.ts";
import { useVideoStore } from "@/store/video-store.ts";
import { supabase } from "@/utils/supabase.ts";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
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
  const { colors } = useColorScheme();
  const [activeTab, setActiveTab] = useState("posts");
  const {
    videos,
    fetchVideosByUser,
    isLoading: videosLoading,
    savedVideos,
  } = useVideoStore();
  const {
    followUser,
    unfollowUser,
    isFollowing,
    getUserFollowsSummary,
    refreshFollowsData,
    isInitialized: followsInitialized,
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

  // Modern header
  const renderHeader = () => (
    <AppHeader
      title={profileUser?.username || "Perfil"}
      leftAccessory={
        !isOwner && (
          <TouchableOpacity
            onPress={navigateBack}
            style={{ paddingHorizontal: 8 }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        )
      }
      rightAccessory={
        isOwner && (
          <TouchableOpacity
            onPress={handleLogout}
            style={{ paddingHorizontal: 8 }}
          >
            <Ionicons name="log-out-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        )
      }
    />
  );

  // Modern loading, error, login required
  if (!currentUser) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        {renderHeader()}
        <FullScreenStatusView
          status="loginRequired"
          message="Inicia sesión para ver tu perfil"
          onLogin={() => router.push("/auth/login")}
        />
      </SafeAreaView>
    );
  }
  if (loadingProfile) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        {renderHeader()}
        <FullScreenStatusView status="loading" message="Cargando perfil..." />
      </SafeAreaView>
    );
  }
  if (!profileUser) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        {renderHeader()}
        <FullScreenStatusView
          status="error"
          message="No se pudo cargar el perfil"
          onRetry={navigateBack}
        />
      </SafeAreaView>
    );
  }

  // Modern video grid
  const renderVideoGrid = () => (
    <FlatList
      data={videos}
      keyExtractor={(item) => item.id}
      numColumns={3}
      renderItem={({ item }) => (
        <MediaGridItem
          mediaUri={item.thumbnailUrl || item.videoUrl}
          mediaType="video"
          title={item.caption}
          onPress={() =>
            router.push({ pathname: "/video/[id]", params: { id: item.id } })
          }
          cardStyle={{ margin: 2, width: 110 }}
        />
      )}
      contentContainerStyle={{ padding: 8 }}
      ListEmptyComponent={
        <FullScreenStatusView
          status="empty"
          message="No hay videos aún"
          emptyIconName="Video"
        />
      }
    />
  );

  // Render different tabs based on user role
  const renderTabs = () => {
    const tabs = [
      {
        id: "posts",
        icon: (
          <Ionicons
            name="grid-outline"
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
          <Ionicons
            name="bookmark-outline"
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
          <Ionicons
            name="cart-outline"
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
      case "posts": {
        return renderVideoGrid();
      }
      case "saved": {
        // Saved Videos Tab Content
        if (!isOwner) {
          return (
            <FullScreenStatusView
              status="empty"
              message="Esta información no está disponible para otros usuarios."
              emptyIconName="Info"
            />
          );
        }
        // savedVideos es un objeto { [videoId]: true }, así que filtramos videos
        const savedVideosArray = videos.filter(
          (v) => savedVideos && savedVideos[v.id]
        );
        if (
          !savedVideos ||
          Object.keys(savedVideos).length === 0 ||
          savedVideosArray.length === 0
        ) {
          return (
            <FullScreenStatusView
              status="empty"
              message="No has guardado ningún video aún."
              emptyIconName="Bookmark"
            />
          );
        }
        return (
          <FlatList
            data={savedVideosArray}
            keyExtractor={(item) => item.id}
            numColumns={3}
            renderItem={({ item }) => (
              <MediaGridItem
                mediaUri={item.thumbnailUrl || item.videoUrl}
                mediaType="video"
                title={item.caption}
                onPress={() =>
                  router.push({
                    pathname: "/video/[id]",
                    params: { id: item.id },
                  })
                }
                cardStyle={{ margin: 2, width: 110 }}
              />
            )}
            contentContainerStyle={{ padding: 8 }}
          />
        );
      }
      case "products":
        return (
          <FullScreenStatusView
            status="empty"
            message={
              isOwner
                ? "No has añadido ningún producto todavía."
                : `${profileUser.username} no ha añadido ningún producto todavía.`
            }
            emptyIconName="ShoppingBag"
          />
        );
      default:
        return null;
    }
  };

  // Render principal
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {renderHeader()}
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
                  <Ionicons name="camera-outline" size={16} color="#ffffff" />
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
                  <Ionicons
                    name="create-outline"
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
                  <Ionicons
                    name="log-out-outline"
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
                      <Ionicons
                        name="person-outline"
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
