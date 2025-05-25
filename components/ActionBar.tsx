import * as LucideIcons from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";

export interface ActionBarAction {
  iconName: keyof typeof LucideIcons;
  onPress: () => void;
  text?: string;
  color?: string;
  fillColor?: string;
  count?: number | string;
  isActive?: boolean;
}

export interface ActionBarProps {
  actions: ActionBarAction[];
  iconSize?: number;
  spacing?: number;
  layout?: "iconOnly" | "iconWithText" | "textOnly";
  containerStyle?: ViewStyle;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  actions,
  iconSize = 26,
  spacing = 20,
  layout = "iconWithText",
  containerStyle,
}) => {
  return (
    <View style={[styles.row, containerStyle]}>
      {actions.map((action, idx) => {
        const Icon = LucideIcons[action.iconName] || LucideIcons["Circle"];
        return (
          <Pressable
            key={action.iconName + idx}
            onPress={action.onPress}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginRight: idx < actions.length - 1 ? spacing : 0,
            }}
          >
            {layout !== "textOnly" && (
              <Icon
                size={iconSize}
                color={
                  action.isActive
                    ? action.fillColor || "#6366F1"
                    : action.color || "#18181B"
                }
                fill={action.isActive ? action.fillColor || "#6366F1" : "none"}
              />
            )}
            {layout !== "iconOnly" &&
              (action.text || action.count !== undefined) && (
                <Text
                  style={[
                    styles.text,
                    action.isActive && { color: "#6366F1", fontWeight: "bold" },
                  ]}
                >
                  {" "}
                  {action.text}
                  {action.count !== undefined ? ` ${action.count}` : ""}
                </Text>
              )}
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    fontSize: 15,
    color: "#18181B",
    marginLeft: 6,
  },
});

/**
 * Example usage:
 * <ActionBar
 *   actions={[
 *     { iconName: 'Heart', onPress: like, count: 12, isActive: liked },
 *     { iconName: 'MessageCircle', onPress: comment, text: 'Comentar' },
 *   ]}
 * />
 */
