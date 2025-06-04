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
const primaryColor = "#8A2BE2"; // Azul Púrpura (Purple-Blue) - Vibrante y moderno
const secondaryColor = "#00CED1"; // Turquesa Oscuro (Dark Cyan) - Complementario y refrescante
const accentColor = "#FF69B4"; // Rosa Fuerte (Hot Pink) - Brillante y enérgico
const successColor = "#3CB371"; // Verde Medio Mar (Medium Sea Green) - Éxito suave
const warningColor = "#FFD700"; // Oro (Gold) - Advertencia clara
const errorColor = "#DC143C"; // Carmesí (Crimson) - Error impactante

// Gradientes predefinidos
export const gradients = {
  primary: ["#8A2BE2", "#9370DB"], // Combinación de púrpura y lila
  secondary: ["#00CED1", "#40E0D0"], // Combinación de turquesa
  accent: ["#FF69B4", "#FFB6C1"], // Combinación de rosas
  dark: ["#1A1A2E", "#0F0F1B"], // Tonos muy oscuros para fondo
};

// Sistema de temas
export default {
  light: {
    text: "#1A1A2E", // Texto oscuro para fondo claro
    textSecondary: "#6A6A7C", // Texto secundario un poco más claro
    background: "#FFFFFF", // Fondo blanco puro
    backgroundSecondary: "#F0F2F5", // Gris muy claro para secciones secundarias
    card: "#FFFFFF", // Tarjetas blancas
    border: "#E0E0E0", // Borde gris claro
    tint: primaryColor,
    tabIconDefault: "#A0A0A0", // Iconos de tab discretos
    tabIconSelected: primaryColor,
    primary: primaryColor,
    secondary: secondaryColor,
    accent: accentColor,
    success: successColor,
    warning: warningColor,
    error: errorColor,
    shadow: "rgba(0, 0, 0, 0.1)", // Sombra más pronunciada
  },
  dark: {
    text: "#E0E0E0", // Texto claro para fondo oscuro
    textSecondary: "#A0A0A0", // Texto secundario en gris claro
    background: "#1A1A2E", // Fondo azul muy oscuro
    backgroundSecondary: "#0F0F1B", // Fondo secundario aún más oscuro
    card: "#2A2A3E", // Tarjetas en un tono azul oscuro
    border: "#4A4A5A", // Borde en un gris azulado
    tint: secondaryColor,
    tabIconDefault: "#6A6A7C",
    tabIconSelected: secondaryColor,
    primary: primaryColor,
    secondary: secondaryColor,
    accent: accentColor,
    success: successColor,
    warning: warningColor,
    error: errorColor,
    shadow: "rgba(0, 0, 0, 0.4)", // Sombra más suave en oscuro
  },
};
