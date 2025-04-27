import VideoFeed from "@/components/VideoFeed";
import { useColorScheme } from "@/hooks/useColorScheme";
import React from "react";
import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
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
