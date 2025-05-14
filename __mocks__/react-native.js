// __mocks__/react-native.js
module.exports = {
  StyleSheet: {
    create: (styles) => styles,
    flatten: (style) => style,
  },
  Text: "Text",
  View: "View",
  TouchableOpacity: "TouchableOpacity",
  Pressable: "Pressable",
  Alert: { alert: jest.fn() },
  // Puedes agregar otros mocks si los necesitas
};
