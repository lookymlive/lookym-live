import { useColorScheme } from "@/hooks/useColorScheme.ts";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import React, { useMemo, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import NotificationIndicator from "./NotificationIndicator.tsx";

interface HeaderProps {
  title?: string;
  hasNotifications?: boolean;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

export default function Header({
  title = "LOOKYM",
  hasNotifications = false,
  showBackButton = false,
  onBackPress = () => router.back(),
}: HeaderProps) {
  const { colors, isDark, getColorWithOpacity } = useColorScheme();
  const [messagePressed, setMessagePressed] = useState(false);
  const [notificationPressed, setNotificationPressed] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Memoizamos los colores con opacidad para mejorar el rendimiento
  const primaryWithOpacity40 = useMemo(
    () => getColorWithOpacity("primary", 0.4),
    [getColorWithOpacity]
  );

  const primaryWithOpacity1A = useMemo(
    () => getColorWithOpacity("primary", 0.1),
    [getColorWithOpacity]
  );

  // Función para animar el título cuando cambia
  const animateTitle = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);
  };

  // Efecto visual cuando cambia el título
  React.useEffect(() => {
    animateTitle();
  }, [title]);

  return (
    <LinearGradient
      colors={
        isDark
          ? [colors.background + "D9", colors.backgroundSecondary + "F2"]
          : [colors.card, colors.backgroundSecondary]
      }
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0.5 }}
      style={[
        styles.container,
        {
          borderBottomColor: isDark
            ? colors.border + "33"
            : colors.border + "1A",
        },
      ]}
    >
      <View style={styles.leftContainer}>
        {showBackButton && (
          <MotiView
            from={{ opacity: 0, translateX: -10 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ type: "timing", duration: 250 }}
          >
            <TouchableOpacity
              style={[
                styles.backButton,
                { backgroundColor: colors.primary + "1A" },
              ]}
              onPress={onBackPress}
              activeOpacity={0.7}
            >
              <Text style={[styles.backButtonText, { color: colors.primary }]}>
                ←
              </Text>
            </TouchableOpacity>
          </MotiView>
        )}
        <MotiView
          animate={{
            scale: isAnimating ? [1, 1.05, 1] : 1,
            opacity: isAnimating ? [1, 0.8, 1] : 1,
          }}
          transition={{ type: "timing", duration: 300 }}
        >
          <Text
            style={[
              styles.title,
              { color: colors.primary },
              showBackButton && styles.titleWithBack,
            ]}
          >
            {title}
          </Text>
        </MotiView>
      </View>

      <View style={styles.iconContainer}>
        <MotiView
          from={{ opacity: 0.8, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 150 }}
        >
          <TouchableOpacity
            style={[
              styles.iconButton,
              {
                backgroundColor: messagePressed
                  ? primaryWithOpacity40
                  : primaryWithOpacity1A,
                transform: [{ scale: messagePressed ? 0.92 : 1 }],
              },
            ]}
            onPress={() => router.push("/chat/[id]")}
            onPressIn={() => setMessagePressed(true)}
            onPressOut={() => setMessagePressed(false)}
            activeOpacity={0.7}
          >
            <Ionicons
              name="chatbubbles-outline"
              size={22}
              color={colors.primary}
              style={messagePressed ? { opacity: 0.9 } : { opacity: 1 }}
            />
          </TouchableOpacity>
        </MotiView>

        <MotiView
          from={{ opacity: 0.8, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 150, delay: 50 }}
        >
          <TouchableOpacity
            style={[
              styles.iconButton,
              {
                backgroundColor: notificationPressed
                  ? primaryWithOpacity40
                  : primaryWithOpacity1A,
                transform: [{ scale: notificationPressed ? 0.92 : 1 }],
              },
            ]}
            onPressIn={() => setNotificationPressed(true)}
            onPressOut={() => setNotificationPressed(false)}
            activeOpacity={0.7}
          >
            <Ionicons
              name="notifications-outline"
              size={22}
              color={colors.primary}
              style={notificationPressed ? { opacity: 0.9 } : { opacity: 1 }}
            />
            {hasNotifications && (
              <MotiView
                from={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 250 }}
              >
                <NotificationIndicator />
              </MotiView>
            )}
          </TouchableOpacity>
        </MotiView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 16 : 18,
    paddingBottom: 16,
    borderBottomWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 10,
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 0.6,
    textShadowColor: "rgba(0, 0, 0, 0.15)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  titleWithBack: {
    marginLeft: 12,
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
