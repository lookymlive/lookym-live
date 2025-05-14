import { Comment } from "@/types/post.ts";
import { formatTimeAgo } from "@/utils/time-format.ts";
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 0,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  commentBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#5E60CE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 10,
  },
  commentCount: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 12,
    marginLeft: 4,
  },
  likes: {
    fontWeight: "bold",
    fontSize: 15,
  },
  captionContainer: {
    marginBottom: 10,
    paddingVertical: 6,
  },
  caption: {
    fontSize: 15,
    lineHeight: 20,
  },
  username: {
    fontWeight: "bold",
  },
  viewCommentsButton: {
    paddingVertical: 6,
    marginBottom: 4,
  },
  viewComments: {
    fontSize: 14,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
  },
});
