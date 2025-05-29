import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";

export interface ActionBarAction {
  iconName: string;
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
        const ionicIconName =
          action.isActive && action.iconName.endsWith("-outline")
            ? action.iconName.replace("-outline", "")
            : action.isActive &&
              !action.iconName.endsWith("-outline") &&
              !action.iconName.endsWith("-sharp")
            ? action.iconName
            : action.iconName.endsWith("-outline")
            ? action.iconName
            : action.iconName + "-outline";

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
              <Ionicons
                name={ionicIconName as any}
                size={iconSize}
                color={action.color || "#18181B"}
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
