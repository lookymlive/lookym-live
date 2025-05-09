/**
 * hooks/useColorScheme.ts - Hook para gestión de temas y utilidades de color en LOOKYM
 *
 * - Provee acceso a los colores del tema actual (light/dark), gradientes y helpers como `getColorWithOpacity`.
 *
 * - Para obtener un color con opacidad, usa: `getColorWithOpacity("primary", 0.5)`
 *
 * - Para gradientes, usa siempre el tipado `[string, string]` al pasarlos a `LinearGradient`.
 *   Ejemplo: `colors={gradients.primary as [string, string]}`
 *
 * - Si cambias la estructura de colores o gradientes, actualiza la documentación en este archivo y en `docs/styling-guide.md`.
 *
 * Última actualización: 2025-05-08
 */
import Colors, { gradients } from "@/constants/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { useColorScheme as useNativeColorScheme } from "react-native";

// Importamos los colores definidos en constants/colors.ts
const lightColors = Colors.light;
const darkColors = Colors.dark;

// Definimos estilos adicionales para componentes específicos
const lightStyles = {
  card: {
    backgroundColor: lightColors.card,
    borderRadius: 16,
    shadowColor: lightColors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  button: {
    primary: {
      backgroundColor: lightColors.primary,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    secondary: {
      backgroundColor: lightColors.secondary,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    accent: {
      backgroundColor: lightColors.accent,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
  },
};

const darkStyles = {
  card: {
    backgroundColor: darkColors.card,
    borderRadius: 16,
    shadowColor: darkColors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  button: {
    primary: {
      backgroundColor: darkColors.primary,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    secondary: {
      backgroundColor: darkColors.secondary,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    accent: {
      backgroundColor: darkColors.accent,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
  },
};

// Definimos una interfaz para el tipo de retorno del hook
interface ColorSchemeType {
  isDark: boolean;
  colorScheme: "dark" | "light";
  colors: typeof lightColors;
  styles: typeof lightStyles | typeof darkStyles;
  toggleColorScheme: () => Promise<void>;
  gradients: typeof gradients;
  getColorWithOpacity: (
    colorName: keyof typeof lightColors,
    opacity: number
  ) => string;
}

export function useColorScheme(): ColorSchemeType {
  const nativeColorScheme = useNativeColorScheme();
  const [isDark, setIsDark] = useState(nativeColorScheme === "dark");

  useEffect(() => {
    // Load user preference from storage
    const loadColorScheme = async () => {
      try {
        const storedScheme = await AsyncStorage.getItem("colorScheme");
        if (storedScheme !== null) {
          setIsDark(storedScheme === "dark");
        } else {
          setIsDark(nativeColorScheme === "dark");
        }
      } catch (error) {
        console.error("Failed to load color scheme preference:", error);
      }
    };

    loadColorScheme();
  }, [nativeColorScheme]);

  const toggleColorScheme = async () => {
    const newMode = !isDark;
    setIsDark(newMode);

    try {
      await AsyncStorage.setItem("colorScheme", newMode ? "dark" : "light");
    } catch (error) {
      console.error("Failed to save color scheme preference:", error);
    }
  };

  // Return the color scheme and a function to toggle it
  return {
    isDark,
    colorScheme: isDark ? "dark" : "light",
    colors: isDark ? darkColors : lightColors,
    styles: isDark ? darkStyles : lightStyles,
    toggleColorScheme,
    gradients, // Exportamos los gradientes importados desde constants/colors
    // Función de utilidad para obtener un color con opacidad
    getColorWithOpacity: (
      colorName: keyof typeof lightColors,
      opacity: number
    ) => {
      const color = isDark ? darkColors[colorName] : lightColors[colorName];
      // Asumimos que el color está en formato hexadecimal
      if (color.startsWith("#")) {
        // Convertir a rgba
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      } else if (color.startsWith("rgb")) {
        // Convertir rgba existente a nuevo valor de opacidad
        const rgbaValues = color.match(/\d+/g);
        if (rgbaValues && rgbaValues.length >= 3) {
          return `rgba(${rgbaValues[0]}, ${rgbaValues[1]}, ${rgbaValues[2]}, ${opacity})`;
        }
      }
      return color;
    },
  };
}
