import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface SuggestedStoreCardProps {
  store: {
    id: string;
    name: string;
    avatar: string;
  };
}

export default function SuggestedStoreCard({ store }: SuggestedStoreCardProps) {
  const router = useRouter();

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
    marginRight: 12,
    width: 80, // Fixed width for carousel items
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  avatarInitial: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#888",
  },
  storeName: {
    fontSize: 12,
    color: "#333",
    textAlign: "center",
    width: "100%",
  },
});
