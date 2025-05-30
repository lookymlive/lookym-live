import VideoFeed from "@/components/VideoFeed.tsx";
import { useColorScheme } from "@/hooks/useColorScheme.ts";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function HomeScreen() {
  const { colors } = useColorScheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {Platform.OS === "ios" && <StatusBar barStyle="light-content" />}
      <View style={styles.feedContainer}>
        <VideoFeed />
      </View>
      <View style={{ alignItems: "center", marginVertical: 24 }}>
        <Text style={{ fontWeight: "bold", marginBottom: 8 }}>
          Test Navegación Producto:
        </Text>
        <Text
          style={{ color: "#007AFF", textDecorationLine: "underline" }}
          onPress={() => router.push("/product/demo-product")}
        >
          Ir a producto demo
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  feedContainer: {
    flex: 1,
  },
});
