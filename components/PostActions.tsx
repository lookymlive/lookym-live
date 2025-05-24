import { Bookmark, Heart, MessageCircle, Send } from "lucide-react-native";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface PostActionsProps {
  saved: boolean;
}

export default function PostActions({ saved: initialSaved }: PostActionsProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(initialSaved);

  return (
    <View style={styles.container}>
      <View style={styles.leftActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setLiked(!liked)}
        >
          <Heart
            size={24}
            color={liked ? "#E1306C" : "#000"}
            fill={liked ? "#E1306C" : "transparent"}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <MessageCircle size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Send size={24} color="#000" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => setSaved(!saved)}>
        <Bookmark
          size={24}
          color="#000"
          fill={saved ? "#000" : "transparent"}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  leftActions: {
    flexDirection: "row",
  },
  actionButton: {
    marginRight: 16,
  },
});
