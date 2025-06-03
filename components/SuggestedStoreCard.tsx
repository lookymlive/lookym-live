import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface SuggestedStoreCardProps {
  store: {
    id: string;
    name: string;
    avatar: string;
  };
}

export default function SuggestedStoreCard({ store }: SuggestedStoreCardProps) {
  return (
    <Pressable
      style={styles.cardContainer}
      onPress={() => {
        console.log("TODO: Navigate to store showcase for ID:", store.id);
        // Implement navigation to store showcase screen here
        // router.push(`/showcase/${store.id}`);
      }}
    >
      <View style={styles.avatarCircle}>
        {store.avatar ? (
          <Image
            source={{ uri: store.avatar }}
            style={{ width: 50, height: 50, borderRadius: 25 }}
            contentFit="cover"
          />
        ) : (
          <Text style={styles.avatarInitial}>{store.name[0]}</Text>
        )}
      </View>
      <Text style={styles.storeName} numberOfLines={1}>
        {store.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    alignItems: "center",
    marginRight: 14,
    width: 90,
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingVertical: 12,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 10,
    elevation: 3,
    // Gradiente visual: se puede reemplazar por LinearGradient si se usa expo-linear-gradient
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#C7D2FE",
    borderWidth: 2,
    borderColor: "#6366F1",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  avatarInitial: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#6366F1",
  },
  storeName: {
    fontSize: 14,
    color: "#18181B",
    fontWeight: "600",
    textAlign: "center",
    width: "100%",
    letterSpacing: 0.2,
  },
});
