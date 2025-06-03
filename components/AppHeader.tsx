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
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#6366F1", // Color principal
    borderRadius: 18,
    marginBottom: 10,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 4,
  },
  accessory: {
    minWidth: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  h1: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  h2: {
    fontSize: 22,
    fontWeight: "700",
    color: "#F1F5F9",
    flex: 1,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  h3: {
    fontSize: 18,
    fontWeight: "600",
    color: "#E0E7FF",
    flex: 1,
    textAlign: "center",
    letterSpacing: 0.2,
  },
});

/**
 * Example usage:
 * <AppHeader title="Actividad" leftAccessory={<BackButton />} rightAccessory={<SettingsIcon />} />
 */
