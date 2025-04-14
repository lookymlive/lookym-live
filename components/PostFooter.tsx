import { Comment } from "@/types/post";
import { formatTimeAgo } from "@/utils/time-format";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface PostFooterProps {
  username: string;
  caption: string;
  comments: Comment[];
  timestamp: string;
}

export default function PostFooter({
  username,
  caption,
  comments,
  timestamp,
}: PostFooterProps) {
  const commentCount = comments.length;

  return (
    <View style={styles.container}>
      <Text style={styles.likes}>{commentCount} comments</Text>
      <View style={styles.captionContainer}>
        <Text style={styles.caption}>
          <Text style={styles.username}>{username}</Text> {caption}
        </Text>
      </View>
      {commentCount > 0 && (
        <TouchableOpacity>
          <Text style={styles.viewComments}>
            View all {commentCount} comments
          </Text>
        </TouchableOpacity>
      )}
      <Text style={styles.timestamp}>{formatTimeAgo(Number(timestamp))}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  likes: {
    fontWeight: "bold",
    marginBottom: 6,
  },
  captionContainer: {
    flexDirection: "row",
    marginBottom: 6,
  },
  username: {
    fontWeight: "bold",
    marginRight: 4,
  },
  caption: {
    lineHeight: 18,
  },
  viewComments: {
    color: "#666",
    marginBottom: 6,
  },
  timestamp: {
    fontSize: 12,
    color: "#666",
  },
});
