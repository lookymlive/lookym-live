import { useColorScheme } from "@/hooks/useColorScheme";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import ProfileScreen from "../(tabs)/profile";

export default function ProfileRedirect() {
  const { userId } = useLocalSearchParams();
  const { colors } = useColorScheme();

  useEffect(() => {
    // Este componente es un punto de entrada para las URLs de perfil como /profile/[userId].
    // No necesita hacer nada más que renderizar el ProfileScreen que ya tiene la lógica
    // para leer el userId de useLocalSearchParams.
  }, []);

  // Si por alguna razón no hay userId, redirigir al perfil del usuario actual
  if (!userId) {
    router.replace("/(tabs)/profile");
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.text, { color: colors.text }]}>
          Redirigiendo al perfil...
        </Text>
      </View>
    );
  }

  // Renderiza el componente ProfileScreen que detectará el userId
  return <ProfileScreen />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    marginTop: 12,
    fontSize: 16,
  },
});
