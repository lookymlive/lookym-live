/**
 * constants/colors.ts - Sistema de colores y gradientes para LOOKYM
 *
 * - Los gradientes exportados (por ejemplo, `gradients.primary`) deben ser arrays de al menos dos strings.
 *   Ejemplo: `primary: ["#5E60CE", "#6930C3"]`
 *
 * - Si agregas un nuevo gradiente, documenta el formato aquí y en `docs/styling-guide.md`.
 *
 * - Los colores base (light/dark) deben ser strings hexadecimales o rgba válidos para React Native.
 *
 * - Si cambias la estructura, actualiza la guía de estilos y los comentarios en los componentes que usen gradientes.
 *
 * Última actualización: 2025-05-08
 */
// Paleta de colores moderna para LOOKYM
const primaryColor = "#5E60CE"; // Púrpura vibrante
const secondaryColor = "#64DFDF"; // Turquesa brillante
const accentColor = "#FF5C8D"; // Rosa vibrante
const successColor = "#48BF84"; // Verde éxito
const warningColor = "#FFB830"; // Naranja advertencia
const errorColor = "#FF5C5C"; // Rojo error

// Gradientes predefinidos
export const gradients = {
  primary: ["#5E60CE", "#6930C3"],
  secondary: ["#64DFDF", "#80FFDB"],
  accent: ["#FF5C8D", "#FF8E9E"],
  dark: ["#252836", "#1F1D2B"],
};

// Sistema de temas
export default {
  light: {
    text: "#252836",
    textSecondary: "#666687",
    background: "#FFFFFF",
    backgroundSecondary: "#F5F5FA",
    card: "#FFFFFF",
    border: "#E2E2EA",
    tint: primaryColor,
    tabIconDefault: "#AEAEBF",
    tabIconSelected: primaryColor,
    primary: primaryColor,
    secondary: secondaryColor,
    accent: accentColor,
    success: successColor,
    warning: warningColor,
    error: errorColor,
    shadow: "rgba(0, 0, 0, 0.05)",
  },
  dark: {
    text: "#FFFFFF",
    textSecondary: "#A5A5BA",
    background: "#1F1D2B",
    backgroundSecondary: "#252836",
    card: "#252836",
    border: "#383854",
    tint: secondaryColor,
    tabIconDefault: "#666687",
    tabIconSelected: secondaryColor,
    primary: primaryColor,
    secondary: secondaryColor,
    accent: accentColor,
    success: successColor,
    warning: warningColor,
    error: errorColor,
    shadow: "rgba(0, 0, 0, 0.2)",
  },
};
