import { useColorScheme } from "@/hooks/useColorScheme";
import { useVideoStore } from "@/store/video-store";
import { Video as VideoType } from "@/types/video";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ViewToken as RNViewToken,
  StyleSheet,
  Text,
  View,
} from "react-native";
import VideoPost from "./VideoPost";

const { height } = Dimensions.get("window");

// Extender el tipo ViewToken para incluir percentVisible
interface ViewToken extends RNViewToken {
  percentVisible?: number;
  item: any;
  index: number | null;
}

interface VideoFeedProps {
  initialVideos?: VideoType[];
  userId?: string;
  isExplore?: boolean;
}

export default function VideoFeed({
  initialVideos,
  userId,
  isExplore = false,
}: VideoFeedProps) {
  const { videos, fetchVideos, fetchVideosByUser, isLoading, error } =
    useVideoStore();
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [visibleVideos, setVisibleVideos] = useState<Record<string, boolean>>(
    {}
  );
  const flatListRef = useRef<FlatList>(null);
  const { isDark, colors } = useColorScheme();

  // Determinar qué videos mostrar
  const videosToShow = initialVideos || videos;

  // Cargar videos al inicio
  useEffect(() => {
    if (!initialVideos) {
      if (userId) {
        fetchVideosByUser(userId);
      } else {
        fetchVideos();
      }
    }
  }, [userId, fetchVideos, fetchVideosByUser, initialVideos]);

  // Configurar el callback para seguimiento de videos visibles
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: any[] }) => {
      // Actualizar el objeto con los videos actualmente visibles
      const newVisibleVideos: Record<string, boolean> = {};

      // Encontrar el elemento con la mayor visibilidad
      let maxVisibilityItem: any = null;

      viewableItems.forEach((viewableItem) => {
        const videoId = viewableItem.item.id;
        newVisibleVideos[videoId] = true;

        // Actualizar maxVisibilityItem si este elemento tiene mayor visibilidad
        if (
          !maxVisibilityItem ||
          (viewableItem.percentVisible &&
            maxVisibilityItem.percentVisible &&
            viewableItem.percentVisible > maxVisibilityItem.percentVisible)
        ) {
          maxVisibilityItem = viewableItem;
        }
      });

      // Actualizar el índice del video activo si se encontró uno
      if (maxVisibilityItem && maxVisibilityItem.index !== null) {
        setActiveVideoIndex(maxVisibilityItem.index);
      }

      setVisibleVideos(newVisibleVideos);
    }
  ).current;

  // Configuración de visualización
  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  if (isLoading && videosToShow.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error && videosToShow.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.error }}>
          Error cargando videos: {error}
        </Text>
      </View>
    );
  }

  if (videosToShow.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>
          {isExplore
            ? "No hay videos disponibles para explorar ahora."
            : userId
            ? "Este usuario aún no ha publicado videos."
            : "No hay videos disponibles. ¡Regresa pronto!"}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      ref={flatListRef}
      data={videosToShow}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => (
        <View style={styles.videoContainer}>
          <VideoPost
            video={item}
            isActive={index === activeVideoIndex}
            isVisible={!!visibleVideos[item.id]}
          />
        </View>
      )}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      snapToInterval={height}
      snapToAlignment="start"
      decelerationRate="fast"
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      initialNumToRender={2}
      maxToRenderPerBatch={3}
      windowSize={5}
      removeClippedSubviews={true}
      style={{ backgroundColor: colors.background }}
    />
  );
}

const styles = StyleSheet.create({
  videoContainer: {
    height,
    width: "100%",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
