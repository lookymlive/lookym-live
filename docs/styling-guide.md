# LOOKYM - Styling Guide

This document outlines the styling approach and guidelines for the LOOKYM application.

## Styling Approach

LOOKYM uses React Native's StyleSheet for styling components. This approach provides:

- Performance optimizations
- Type safety with TypeScript
- Clear separation of styles and component logic
- Consistent styling patterns

## Color System

The application uses a theme-based color system that supports both light and dark modes:

### Light Theme Colors

```typescript
const lightColors = {
  primary: '#0066FF',
  secondary: '#FF6B00',
  background: '#FFFFFF',
  card: '#F8F8F8',
  text: '#000000',
  textSecondary: '#8E8E8E',
  border: '#DBDBDB',
  notification: '#FF3B30',
  error: '#FF3B30',
  errorLight: '#FFEEEE',
  success: '#34C759',
  successLight: '#EEFFF5',
};
```

### Dark Theme Colors

```typescript
const darkColors = {
  primary: '#0A84FF',
  secondary: '#FF9500',
  background: '#000000',
  card: '#1C1C1E',
  text: '#FFFFFF',
  textSecondary: '#8E8E8E',
  border: '#38383A',
  notification: '#FF453A',
  error: '#FF453A',
  errorLight: '#3A2A2A',
  success: '#30D158',
  successLight: '#2A3A2A',
};
```

## Typography

The application uses a consistent typography system:

```typescript
const typography = {
  heading1: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 34,
  },
  heading2: {
    fontSize: 22,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  heading3: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal',
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: 'normal',
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: 'normal',
    lineHeight: 16,
  },
};
```

## Spacing

A consistent spacing system is used throughout the application:

```typescript
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
```

## Layout Patterns

### Flex Layouts

```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

### Cards and Containers

```typescript
const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
});
```

## Using the Theme

The application provides a `useColorScheme` hook for accessing theme colors:

```typescript
import { useColorScheme } from '@/hooks/useColorScheme';

function MyComponent() {
  const { isDark, colors } = useColorScheme();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.text, { color: colors.text }]}>
        Themed content
      </Text>
    </View>
  );
}
```

## Style Organization

### Component-Specific Styles

For component-specific styles, define StyleSheet objects within the component file:

```typescript
const styles = StyleSheet.create({
  container: {
    // styles
  },
});
```

### Shared Styles

For shared styles, create separate style files:

```typescript
// styles/common.ts
export const commonStyles = StyleSheet.create({
  // shared styles
});
```

### Complex Components

For complex components, create a separate styles file:

```typescript
// components/ComplexComponent.tsx
import { styles } from './ComplexComponent.styles';

// components/ComplexComponent.styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // component styles
});
```

## Best Practices

1. **Consistency**: Use the defined color and spacing system consistently
2. **Responsiveness**: Use flex and percentage-based layouts for responsiveness
3. **Platform Specifics**: Use Platform.select for platform-specific styles
4. **Performance**: Avoid inline styles for better performance
5. **Naming**: Use clear and consistent naming for style properties
6. **Organization**: Group related styles together
7. **Comments**: Add comments for complex style calculations or decisions
