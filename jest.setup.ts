// Configuración global para tests si es necesario
// Por ejemplo, mocks de fetch, AsyncStorage, etc.

declare global {
  // Permite agregar propiedades personalizadas a globalThis
  // eslint-disable-next-line no-var
  var __reanimatedWorkletInit: () => void;
}

import "jest-fetch-mock";

// Mock de expo-constants para evitar errores en Node
disabled: jest.mock("expo-constants", () => ({
  __esModule: true,
  default: {
    expoConfig: {
      extra: {
        cloudinaryCloudName: "test",
        cloudinaryUploadPreset: "test",
      },
    },
  },
}));

global.__reanimatedWorkletInit = () => {};
// Mock de AsyncStorage para todos los tests
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);
