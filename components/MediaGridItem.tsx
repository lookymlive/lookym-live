import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  ImageStyle,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

export interface MediaGridItemProps {
  mediaUri: string;
  mediaType?: "image" | "video";
  title?: string;
  subtitle?: string;
  onPress: () => void;
  aspectRatio?: number;
  imageStyle?: ImageStyle;
  textContainerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  cardStyle?: ViewStyle;
}

export const MediaGridItem: React.FC<MediaGridItemProps> = ({
  mediaUri,
  mediaType = "image",
  title,
  subtitle,
  onPress,
  aspectRatio = 1,
  imageStyle,
  textContainerStyle,
  titleStyle,
  cardStyle,
}) => {
  return (
    <Pressable style={[styles.card, cardStyle]} onPress={onPress}>
      <View style={{ position: "relative" }}>
        <Image
          source={{ uri: mediaUri }}
          style={[styles.image, { aspectRatio }, imageStyle]}
          resizeMode="cover"
        />
        {mediaType === "video" && (
          <View style={styles.videoIconOverlay}>
            <Ionicons name="play-circle" size={32} color="#fff" />
          </View>
        )}
      </View>
      <View style={[styles.textContainer, textContainerStyle]}>
        {title && (
          <Text style={[styles.title, titleStyle]} numberOfLines={1}>
            {title}
          </Text>
        )}
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    backgroundColor: "#fff",
    overflow: "hidden",
    margin: 6,
    width: 140,
  },
  image: {
    width: "100%",
    height: undefined,
    minHeight: 120,
    backgroundColor: "#E5E7EB",
  },
  videoIconOverlay: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 16,
    padding: 2,
  },
  textContainer: {
    padding: 8,
  },
  title: {
    fontWeight: "600",
    fontSize: 15,
    color: "#18181B",
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
});

/**
 * Example usage:
 * <MediaGridItem
 *   mediaUri={video.thumbnail}
 *   mediaType="video"
 *   title={video.caption}
 *   subtitle={video.username}
 *   onPress={() => navigateToVideo(video.id)}
 * />
 */
