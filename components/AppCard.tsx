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
  padding = 18,
  margin,
  marginBottom = 16,
  useThemeColor = "#fff",
  elevation = 4,
}) => {
  const cardStyle: ViewStyle = {
    backgroundColor: useThemeColor,
    borderRadius: 18,
    padding,
    margin,
    marginBottom,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation,
    // Gradiente visual: se puede reemplazar por LinearGradient si se usa expo-linear-gradient
    // background: 'linear-gradient(90deg, #6366F1 0%, #22D3EE 100%)',
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
