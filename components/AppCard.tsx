import React from "react";
import { Pressable, View, ViewStyle } from "react-native";

export interface AppCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  padding?: number;
  margin?: number;
  marginBottom?: number;
  useThemeColor?: string;
  elevation?: number;
}

export const AppCard: React.FC<AppCardProps> = ({
  children,
  style,
  onPress,
  padding = 16,
  margin,
  marginBottom = 12,
  useThemeColor = "#fff",
  elevation = 2,
}) => {
  const cardStyle: ViewStyle = {
    backgroundColor: useThemeColor,
    borderRadius: 12,
    padding,
    margin,
    marginBottom,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation,
  };
  const content = <View style={[cardStyle, style]}>{children}</View>;
  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }
  return content;
};

/**
 * Example usage:
 * <AppCard>
 *   <Text>Contenido de la tarjeta</Text>
 * </AppCard>
 */
