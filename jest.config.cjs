module.exports = {
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  roots: ["<rootDir>"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^react-native$": "<rootDir>/__mocks__/react-native.js",
  },
  transform: {
    "^.+\\.(ts|tsx)$": "babel-jest",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(@expo|expo-constants|expo-modules-core|react-native|@react-native|expo-av)/)",
  ],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};
