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
 *   videoId?: string;
 *   description?: string;
 *   sizes?: string[];
 *   colors?: string[];
 * }
 *
 * Documenta cualquier cambio en /docs/ui-components.md y enlaza desde aquí.
 *
 * Última actualización: 2025-05-09
 */

import { Dimensions, StyleSheet, Text, View } from "react-native";

export interface ShowcaseViewProps {
  store: {
    id: string;
    name: string;
    avatar: string;
    bio?: string;
    location?: string;
    category?: string;
    videos: Array<{
      id: string;
      videoUrl: string;
      thumbnailUrl?: string;
      tags: Array<{
        id: string;
        label: string;
        x: number;
        y: number;
        productId: string;
      }>;
    }>;
    products: Array<{
      id: string;
      name: string;
      price: number;
      imageUrl: string;
      videoId?: string;
      description?: string;
      sizes?: string[];
      colors?: string[];
    }>;
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

  // TODO: Integrar componentes reales (Avatar, VideoPlayer, etc.)
  const mainVideo = store.videos[0];

  return (
    <View style={styles.outerContainer}>
      <View style={styles.phoneFrame}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>{/* TODO: Botón volver */}</View>
          <View style={styles.headerCenter}>
            {/* Avatar y nombre */}
            <View style={styles.avatarCircle}>
              {/* TODO: Usar componente Avatar si existe */}
              <Text style={styles.avatarInitial}>{store.name[0]}</Text>
            </View>
            <Text style={styles.storeName}>{store.name}</Text>
          </View>
          <View style={styles.headerRight}>
            {/* TODO: Botón chat, seguir */}
          </View>
        </View>

        {/* Hero video */}
        <View style={styles.heroVideo}>
          {/* TODO: Usar VideoPlayer real */}
          <View style={styles.heroVideoPlaceholder}>
            <Text style={styles.heroVideoText}>Video principal aquí</Text>
            {mainVideo && (
              <Text style={styles.heroVideoTextSmall}>
                {mainVideo.tags.length > 0
                  ? `Etiquetas: ${mainVideo.tags.map((t) => t.label).join(", ")}`
                  : "Sin etiquetas"}
              </Text>
            )}
          </View>
        </View>

        {/* Grid de productos */}
        <View style={styles.productsGrid}>
          <Text style={styles.productsGridTitle}>Productos en vidriera</Text>
          <View style={styles.productsRow}>
            {store.products.length === 0 ? (
              <Text style={styles.productsEmpty}>Sin productos aún</Text>
            ) : (
              store.products.slice(0, 6).map((product) => (
                <View key={product.id} style={styles.productCard}>
                  {/* TODO: Imagen real */}
                  <View style={styles.productImagePlaceholder} />
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productPrice}>${product.price}</Text>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Carrusel de otras vidrieras (futuro) */}
        {/* <View style={styles.otherStoresCarousel}></View> */}
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
});
