module.exports = {
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  roots: ["<rootDir>"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^react-native$": "<rootDir>/__mocks__/react-native.js",
  },
  transform: {
    "^.+\\.(ts|tsx|js|jsx)$": "babel-jest",
  },
  transformIgnorePatterns: [
    // Restaurar patrón más permisivo para Expo/React Native ESM (estado funcional anterior)
    "node_modules/(?!(expo|@expo|expo-constants|expo-modules-core|expo-secure-store|react-native|@react-native|@react-native-async-storage|@react-navigation|@unimodules|@supabase|@react-native-community|react-native-svg|react-native-reanimated|react-native-gesture-handler|react-native-safe-area-context|react-native-screens|expo-av)/)",
  ],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};
