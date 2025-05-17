// __mocks__/react-native.js
const React = require("react");

function createMockComponent(name) {
  const Comp = React.forwardRef((props, ref) => {
    return React.createElement(
      "mock-" + name,
      { ...props, ref },
      props.children
    );
  });
  Comp.displayName = name;
  return Comp;
}

module.exports = {
  StyleSheet: {
    create: (styles) => styles,
    flatten: (style) => style,
  },
  Text: createMockComponent("Text"),
  View: createMockComponent("View"),
  TouchableOpacity: createMockComponent("TouchableOpacity"),
  Pressable: createMockComponent("Pressable"),
  ActivityIndicator: createMockComponent("ActivityIndicator"),
  Alert: { alert: jest.fn() },
  // Puedes agregar otros mocks si los necesitas
};
