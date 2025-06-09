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

// Mock zustand/middleware's persist to use a simple in-memory storage for tests
jest.mock("zustand/middleware", () => ({
  ...jest.requireActual("zustand/middleware"),
  // Directly mock the persist function
  persist:
    (config: (set: any, get: any, api: any) => any) =>
    (set: any, get: any, api: any) => {
      // console.log('Mocking persist middleware'); // For debugging
      return config(set, get, api);
    },
  createJSONStorage: () => ({
    getItem: jest.fn((name) => {
      // console.log(`Mock getItem for ${name}`);
      return Promise.resolve(null);
    }),
    setItem: jest.fn((name, value) => {
      // console.log(`Mock setItem for ${name}: ${value}`);
      return Promise.resolve();
    }),
    removeItem: jest.fn((name) => {
      // console.log(`Mock removeItem for ${name}`);
      return Promise.resolve();
    }),
  }),
}));
