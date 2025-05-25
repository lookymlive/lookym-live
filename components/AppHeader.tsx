import React from "react";
import { StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";

export interface AppHeaderProps {
  title: string;
  level?: 1 | 2 | 3;
  style?: TextStyle;
  containerStyle?: ViewStyle;
  leftAccessory?: React.ReactNode;
  rightAccessory?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  level = 1,
  style,
  containerStyle,
  leftAccessory,
  rightAccessory,
}) => {
  const getTitleStyle = () => {
    switch (level) {
      case 1:
        return styles.h1;
      case 2:
        return styles.h2;
      case 3:
        return styles.h3;
      default:
        return styles.h1;
    }
  };
  return (
    <View style={[styles.container, containerStyle]}>
      {leftAccessory && <View style={styles.accessory}>{leftAccessory}</View>}
      <Text style={[getTitleStyle(), style]} numberOfLines={1}>
        {title}
      </Text>
      {rightAccessory && <View style={styles.accessory}>{rightAccessory}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  accessory: {
    minWidth: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  h1: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#18181B",
    flex: 1,
    textAlign: "center",
  },
  h2: {
    fontSize: 20,
    fontWeight: "600",
    color: "#18181B",
    flex: 1,
    textAlign: "center",
  },
  h3: {
    fontSize: 17,
    fontWeight: "500",
    color: "#18181B",
    flex: 1,
    textAlign: "center",
  },
});

/**
 * Example usage:
 * <AppHeader title="Actividad" leftAccessory={<BackButton />} rightAccessory={<SettingsIcon />} />
 */
