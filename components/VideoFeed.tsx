/**
 * VideoFeed.tsx - Componente principal del feed de videos de LOOKYM
 *
 * Notas de integración y buenas prácticas para IA y desarrolladores:
 *
 * - Gradientes: El prop `colors` de `LinearGradient` debe ser un array tipado como `[string, string]`.
 *   Ejemplo: `colors={gradients.primary as [string, string]}`
 *   Si necesitas un gradiente custom, asegúrate de que tenga al menos dos colores y tipa explícitamente.
 *
 * - Opacidad de color: Para obtener un color con opacidad, usa el helper `getColorWithOpacity` del hook `useColorScheme`.
 *   Ejemplo: `getColorWithOpacity("error", 0.7)`
 *   IMPORTANTE: Asegúrate de desestructurar correctamente la función del hook: `const { getColorWithOpacity } = useColorScheme();`
 *
 * - No uses `colors.getColorWithOpacity`, solo el helper global del hook.
 *
 * - Si agregas nuevos gradientes en `constants/colors.ts`, documenta el formato y asegúrate de que sean arrays de al menos dos strings.
 *
 * - Si cambias la lógica de temas o colores, actualiza también la documentación en `docs/styling-guide.md`.
 *
 * - Si la IA encuentra errores de tipo con gradientes, revisa el tipado y la cantidad de colores.
 *
 * Última actualización: 2025-05-10
 */
import { useColorScheme } from "@/hooks/useColorScheme.ts";
import { useVideoStore } from "@/store/video-store.ts";
import { Video as VideoType } from "@/types/video.ts";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Platform,
  ViewToken as RNViewToken,
  StyleSheet,
  Text,
  View,
} from "react-native";
import VideoPost from "./VideoPost.tsx";

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
  onRefresh?: () => void;
}

export default function VideoFeed({
  initialVideos,
  userId,
  isExplore = false,
  onRefresh,
}: VideoFeedProps) {
  const { videos, fetchVideos, fetchVideosByUser, isLoading, error } =
    useVideoStore();
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [visibleVideos, setVisibleVideos] = useState<Record<string, boolean>>(
    {}
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<"up" | "down" | null>(
    null
  );
  const [lastScrollY, setLastScrollY] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { colors, gradients, getColorWithOpacity } = useColorScheme();
  // Ref for scroll indicator timeout
  const scrollIndicatorTimeoutRef = useRef<number | null>(null);

  // Referencia para la animación de desplazamiento
  const scrollIndicatorOpacity = useRef(new Animated.Value(0)).current;

  // Memoizamos los colores con opacidad para evitar recálculos innecesarios
  const errorWithOpacity = useMemo(
    () => getColorWithOpacity("error", 0.7),
    [getColorWithOpacity]
  );

  const primaryWithOpacity = useMemo(
    () => getColorWithOpacity("primary", 0.7),
    [getColorWithOpacity]
  );

  // Determinar qué videos mostrar
  const videosToShow = initialVideos || videos;

  // Cargar videos al inicio
  useEffect(() => {
    if (!initialVideos) {
      loadVideos();
    }
  }, [userId, initialVideos]);

  // Función para cargar videos
  const loadVideos = useCallback(async () => {
    try {
      if (userId) {
        await fetchVideosByUser(userId);
      } else {
        await fetchVideos();
      }
    } catch (error) {
      console.error("Error cargando videos:", error);
    }
  }, [userId, fetchVideos, fetchVideosByUser]);

  // Función para refrescar videos
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);

    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        await loadVideos();
      }
    } catch (error) {
      console.error("Error refrescando videos:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, loadVideos]);

  // Mostrar/ocultar indicador de desplazamiento
  const fadeScrollIndicator = (show: boolean) => {
    Animated.timing(scrollIndicatorOpacity, {
      toValue: show ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Manejar eventos de desplazamiento
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: new Animated.Value(0) } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const currentScrollY = event.nativeEvent.contentOffset.y;

        // Determinar dirección de desplazamiento
        if (currentScrollY > lastScrollY) {
          setScrollDirection("down");
        } else if (currentScrollY < lastScrollY) {
          setScrollDirection("up");
        }

        setLastScrollY(currentScrollY);

        // Mostrar indicador brevemente
        fadeScrollIndicator(true);
        if (scrollIndicatorTimeoutRef.current) {
          clearTimeout(scrollIndicatorTimeoutRef.current);
        }
        scrollIndicatorTimeoutRef.current = setTimeout(
          () => fadeScrollIndicator(false),
          1500
        );
      },
    }
  );

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
        // Solo actualizar si cambió el índice para evitar re-renders innecesarios
        if (maxVisibilityItem.index !== activeVideoIndex) {
          setActiveVideoIndex(maxVisibilityItem.index);
        }
      }

      setVisibleVideos(newVisibleVideos);
    }
  ).current;

  // Configuración de visualización
  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  // DEBUG: Log de videos y errores de Supabase
  useEffect(() => {
    console.log("[VideoFeed] videos:", videos);
    if (error) {
      console.error("[VideoFeed] error:", error);
    }
  }, [videos, error]);

  if (isLoading && videosToShow.length === 0) {
    return (
      <View
        style={[
          styles.centered,
          { backgroundColor: colors.backgroundSecondary },
        ]}
      >
        <MotiView
          from={{ opacity: 0.6, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 500 }}
          style={styles.loadingContainer}
        >
          <LinearGradient
            colors={gradients.primary as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.loadingGradient}
          >
            <MotiView
              from={{ rotate: "0deg" }}
              animate={{ rotate: "360deg" }}
              transition={{ type: "timing", duration: 2000, loop: true }}
            >
              <Ionicons
                name="refresh-circle-outline"
                size={32}
                color="white"
                style={{ opacity: 0.9 }}
              />
            </MotiView>
            <Text style={styles.loadingText}>Cargando videos...</Text>
          </LinearGradient>
        </MotiView>
      </View>
    );
  }

  if (error && videosToShow.length === 0) {
    return (
      <View
        style={[
          styles.centered,
          { backgroundColor: colors.backgroundSecondary },
        ]}
      >
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", damping: 15 }}
          style={styles.errorContainer}
        >
          <LinearGradient
            colors={[colors.error, errorWithOpacity] as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.errorBanner}
          >
            <Text style={styles.errorTitle}>¡Ups! Algo salió mal</Text>
            <Text style={styles.errorText}>{error}</Text>
          </LinearGradient>
        </MotiView>
      </View>
    );
  }

  if (videosToShow.length === 0) {
    return (
      <View
        style={[
          styles.centered,
          { backgroundColor: colors.backgroundSecondary },
        ]}
      >
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 15 }}
          style={styles.emptyContainer}
        >
          <LinearGradient
            colors={gradients.primary as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0.8 }}
            style={styles.emptyBanner}
          >
            <Ionicons
              name="refresh-circle-outline"
              size={48}
              color="white"
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyTitle}>
              {isExplore
                ? "Exploración vacía"
                : userId
                ? "Sin videos"
                : "Sin contenido"}
            </Text>
            <Text style={styles.emptyText}>
              {isExplore
                ? "No hay videos disponibles para explorar ahora."
                : userId
                ? "Este usuario aún no ha publicado videos."
                : "No hay videos disponibles. ¡Regresa pronto!"}
            </Text>
          </LinearGradient>
        </MotiView>
      </View>
    );
  }

  // Renderizar el indicador de desplazamiento
  const renderScrollIndicator = () => {
    return (
      <Animated.View
        style={[
          styles.scrollIndicator,
          {
            opacity: scrollIndicatorOpacity,
            backgroundColor: primaryWithOpacity,
          },
        ]}
      >
        <Text style={styles.scrollIndicatorText}>
          {scrollDirection === "down" ? "↓" : "↑"}
        </Text>
      </Animated.View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Animated.FlatList
        ref={flatListRef}
        data={videosToShow}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => {
          // Calcular la distancia desde el elemento activo para animaciones
          const distance = Math.abs(index - activeVideoIndex);
          const isActive = index === activeVideoIndex;

          return (
            <MotiView
              from={{ opacity: 0.7 }}
              animate={{
                opacity: isActive ? 1 : 0.95,
                scale: isActive ? 1 : 0.98,
              }}
              transition={{
                type: "timing",
                duration: 300,
                delay: distance * 50, // Retrasar animaciones basadas en la distancia
              }}
              style={styles.videoContainer}
            >
              <VideoPost
                video={item}
                isActive={isActive}
                isVisible={!!visibleVideos[item.id]}
              />
            </MotiView>
          );
        }}
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
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onRefresh={handleRefresh}
        refreshing={isRefreshing}
      />
      {renderScrollIndicator()}
    </View>
  );
}

const styles = StyleSheet.create({
  videoContainer: {
    height,
    width: "100%",
    marginBottom: 8,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    width: "80%",
    maxWidth: 300,
  },
  loadingGradient: {
    padding: 28,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  loadingText: {
    color: "white",
    marginTop: 20,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  errorContainer: {
    width: "85%",
    maxWidth: 340,
  },
  errorBanner: {
    padding: 28,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  errorTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  errorText: {
    color: "white",
    textAlign: "center",
    fontSize: 15,
    opacity: 0.9,
    lineHeight: 22,
  },
  emptyContainer: {
    width: "85%",
    maxWidth: 340,
  },
  emptyBanner: {
    padding: 32,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.9,
  },
  emptyTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    opacity: 0.9,
    lineHeight: 24,
  },
  scrollIndicator: {
    position: "absolute",
    right: 24,
    bottom: Platform.OS === "ios" ? 60 : 40,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  scrollIndicatorText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
