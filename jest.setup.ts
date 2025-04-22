// Configuración global para tests si es necesario
// Por ejemplo, mocks de fetch, AsyncStorage, etc.

declare global {
  // Permite agregar propiedades personalizadas a globalThis
  // eslint-disable-next-line no-var
  var __reanimatedWorkletInit: () => void;
}

import 'jest-fetch-mock';

// Mock de expo-constants para evitar errores en Node
disabled:jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: {
      extra: {
        cloudinaryCloudName: 'test',
        cloudinaryUploadPreset: 'test',
      },
    },
  },
}));

// Mock de react-native para evitar errores en Node
global.__reanimatedWorkletInit = () => {};
jest.mock('react-native', () => ({}));
// Mock de AsyncStorage para todos los tests
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
// Mock de AnimatedHelper (soluciona errores comunes en tests)
// (Usar manualmente en __mocks__ si es necesario)
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');