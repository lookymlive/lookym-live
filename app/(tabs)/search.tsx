import VideoThumbnail from "@/components/VideoThumbnail.tsx";
import { useColorScheme } from "@/hooks/useColorScheme.ts";
import { useVideoStore } from "@/store/video-store.ts";
import type { Video } from "@/types/video.ts";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Hash, Search, User, Video as VideoIcon, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const numColumns = 2;
const THUMBNAIL_WIDTH = (width - 48) / numColumns;

type SearchCategory = "all" | "videos" | "users" | "hashtags";

type PopularHashtag = {
  tag: string;
  count: number;
};

// Definición del tipo de usuario para la búsqueda
interface UserItem {
  id: string;
  username: string;
  avatar: string;
  role: string;
}

// Extender el componente VideoThumbnail para permitir propiedad height
interface VideoThumbnailProps {
  video: Video;
  height?: number;
}

export default function SearchScreen() {
  const { colors, isDark } = useColorScheme();
  const { videos, fetchVideos } = useVideoStore();
  // Usar usuarios simulados hasta tener disponible la API de usuarios
  const [mockUsers] = useState<UserItem[]>([
    {
      id: "1",
      username: "business_account",
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80",
      role: "business",
    },
    {
      id: "2",
      username: "user_account",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80",
      role: "user",
    },
  ]);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SearchCategory>("all");
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserItem[]>([]);
  const [filteredHashtags, setFilteredHashtags] = useState<string[]>([]);
  const [popularHashtags, setPopularHashtags] = useState<PopularHashtag[]>([]);
  const [loading, setLoading] = useState(true);
  const [focusedInput, setFocusedInput] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchVideos();
      setLoading(false);
    };
    load();
  }, []);

  // Generar hashtags populares basados en los videos
  useEffect(() => {
    if (videos.length === 0) return;

    const tagCounts: Record<string, number> = {};

    videos.forEach((video) => {
      if (!video.hashtags) return;

      video.hashtags.forEach((tag: string) => {
        if (tagCounts[tag]) {
          tagCounts[tag]++;
        } else {
          tagCounts[tag] = 1;
        }
      });
    });

    const sortedTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    setPopularHashtags(sortedTags);
  }, [videos]);

  // Filtrar resultados según la búsqueda
  useEffect(() => {
    if (!query) {
      setFilteredVideos([]);
      setFilteredUsers([]);
      setFilteredHashtags([]);
      return;
    }

    const lower = query.toLowerCase();

    // Filtrar videos
    const matchedVideos = videos.filter(
      (v) =>
        v.caption.toLowerCase().includes(lower) ||
        (v.hashtags &&
          v.hashtags.some((tag: string) => tag.toLowerCase().includes(lower)))
    );
    setFilteredVideos(matchedVideos);

    // Filtrar usuarios
    const matchedUsers = mockUsers.filter((u: UserItem) =>
      u.username.toLowerCase().includes(lower)
    );
    setFilteredUsers(matchedUsers);

    // Extraer hashtags coincidentes
    const allTags = new Set<string>();
    videos.forEach((video) => {
      if (!video.hashtags) return;
      video.hashtags.forEach((tag: string) => {
        if (tag.toLowerCase().includes(lower)) {
          allTags.add(tag);
        }
      });
    });
    setFilteredHashtags(Array.from(allTags));
  }, [query, videos, mockUsers]);

  const resetSearch = () => {
    setQuery("");
    setCategory("all");
    setFocusedInput(false);
  };

  const selectHashtag = (tag: string) => {
    setQuery(tag);
    setCategory("hashtags");
  };

  const renderSearchResults = () => {
    if (loading) {
      return (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (!query) {
      return (
        <ScrollView style={styles.scrollContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Hashtags Populares
          </Text>
          <View style={styles.tagsContainer}>
            {popularHashtags.map((item) => (
              <TouchableOpacity
                key={item.tag}
                style={[
                  styles.tagButton,
                  { backgroundColor: colors.primaryLight },
                ]}
                onPress={() => selectHashtag(item.tag)}
              >
                <Hash size={14} color={colors.primary} />
                <Text style={[styles.tagText, { color: colors.primary }]}>
                  {item.tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Videos Destacados
          </Text>
          <FlatList
            data={videos.slice(0, 6)}
            numColumns={numColumns}
            scrollEnabled={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.gridItem}
                onPress={() =>
                  router.push({
                    pathname: "/video/[id]",
                    params: { id: item.id },
                  })
                }
              >
                <VideoThumbnail video={item} height={180} />
                <Text
                  style={[styles.thumbnailCaption, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {item.caption}
                </Text>
              </TouchableOpacity>
            )}
          />
        </ScrollView>
      );
    }

    if (
      filteredVideos.length === 0 &&
      filteredUsers.length === 0 &&
      filteredHashtags.length === 0
    ) {
      return (
        <View style={styles.centerContent}>
          <Text style={{ color: colors.textSecondary }}>
            No se encontraron resultados para "{query}"
          </Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.scrollContainer}>
        {/* Filtros de categoría */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryFilters}
        >
          <TouchableOpacity
            style={[
              styles.categoryButton,
              category === "all" && { backgroundColor: colors.primaryLight },
            ]}
            onPress={() => setCategory("all")}
          >
            <Text
              style={[
                styles.categoryText,
                { color: category === "all" ? colors.primary : colors.text },
              ]}
            >
              Todos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.categoryButton,
              category === "videos" && { backgroundColor: colors.primaryLight },
            ]}
            onPress={() => setCategory("videos")}
          >
            <VideoIcon
              size={14}
              color={category === "videos" ? colors.primary : colors.text}
            />
            <Text
              style={[
                styles.categoryText,
                { color: category === "videos" ? colors.primary : colors.text },
              ]}
            >
              Videos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.categoryButton,
              category === "users" && { backgroundColor: colors.primaryLight },
            ]}
            onPress={() => setCategory("users")}
          >
            <User
              size={14}
              color={category === "users" ? colors.primary : colors.text}
            />
            <Text
              style={[
                styles.categoryText,
                { color: category === "users" ? colors.primary : colors.text },
              ]}
            >
              Usuarios
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.categoryButton,
              category === "hashtags" && {
                backgroundColor: colors.primaryLight,
              },
            ]}
            onPress={() => setCategory("hashtags")}
          >
            <Hash
              size={14}
              color={category === "hashtags" ? colors.primary : colors.text}
            />
            <Text
              style={[
                styles.categoryText,
                {
                  color: category === "hashtags" ? colors.primary : colors.text,
                },
              ]}
            >
              Hashtags
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Resultados de hashtags */}
        {(category === "all" || category === "hashtags") &&
          filteredHashtags.length > 0 && (
            <>
              <Text style={[styles.resultTitle, { color: colors.text }]}>
                Hashtags
              </Text>
              <View style={styles.tagsContainer}>
                {filteredHashtags.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={[
                      styles.tagButton,
                      { backgroundColor: colors.primaryLight },
                    ]}
                    onPress={() => selectHashtag(tag)}
                  >
                    <Hash size={14} color={colors.primary} />
                    <Text style={[styles.tagText, { color: colors.primary }]}>
                      {tag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

        {/* Resultados de usuarios */}
        {(category === "all" || category === "users") &&
          filteredUsers.length > 0 && (
            <>
              <Text style={[styles.resultTitle, { color: colors.text }]}>
                Usuarios
              </Text>
              {filteredUsers.map((user) => (
                <TouchableOpacity
                  key={user.id}
                  style={[styles.userItem, { backgroundColor: colors.card }]}
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/profile",
                      params: { userId: user.id },
                    })
                  }
                >
                  <Image
                    source={{ uri: user.avatar }}
                    style={styles.userAvatar}
                    contentFit="cover"
                  />
                  <View style={styles.userInfo}>
                    <Text style={[styles.userName, { color: colors.text }]}>
                      {user.username}
                    </Text>
                    <Text
                      style={[styles.userMeta, { color: colors.textSecondary }]}
                    >
                      {user.role === "business" ? "Negocio" : "Usuario"}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}

        {/* Resultados de videos */}
        {(category === "all" || category === "videos") &&
          filteredVideos.length > 0 && (
            <>
              <Text style={[styles.resultTitle, { color: colors.text }]}>
                Videos
              </Text>
              <FlatList
                data={filteredVideos}
                numColumns={numColumns}
                scrollEnabled={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.gridItem}
                    onPress={() =>
                      router.push({
                        pathname: "/video/[id]",
                        params: { id: item.id },
                      })
                    }
                  >
                    <VideoThumbnail video={item} height={180} />
                    <Text
                      style={[styles.thumbnailCaption, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {item.caption}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </>
          )}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {Platform.OS === "ios" && (
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      )}

      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Discover</Text>
      </View>

      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: focusedInput ? colors.background : colors.card,
            borderColor: focusedInput ? colors.primary : colors.border,
          },
        ]}
      >
        <Search
          size={20}
          color={colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Busca videos, hashtags o personas..."
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={setQuery}
          onFocus={() => setFocusedInput(true)}
          onBlur={() => setFocusedInput(false)}
        />
        {query !== "" && (
          <TouchableOpacity onPress={resetSearch} style={styles.clearButton}>
            <X size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {renderSearchResults()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 20 : 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    height: 48,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: "100%",
  },
  clearButton: {
    padding: 4,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  tagButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontWeight: "500",
    marginLeft: 4,
  },
  categoryFilters: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryText: {
    fontWeight: "500",
    marginLeft: 4,
  },
  gridItem: {
    width: THUMBNAIL_WIDTH,
    marginHorizontal: 8,
    marginBottom: 16,
  },
  thumbnailCaption: {
    fontSize: 14,
    marginTop: 4,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: "#ccc",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 2,
  },
  userMeta: {
    fontSize: 14,
  },
});
