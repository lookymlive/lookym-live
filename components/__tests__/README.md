# Testing Documentation for Lookym Components

## Overview

This document provides information about the component tests in the Lookym project, focusing on best practices and solutions to common issues.

## Best Practices for Testing React Native Components

1. **Use correct import paths**
   - Use the correct file extension in imports (e.g., `import FollowButton from "../FollowButton.tsx"`)
   - This should match your TypeScript configuration and module resolution settings

2. **Finding and interacting with components**
   - Use `UNSAFE_getAllByType()` instead of `getByRole()` for more reliable component selection
   - Example: `const pressables = UNSAFE_getAllByType(require('react-native').Pressable);`

3. **Verifying text content**
   - Use `UNSAFE_getAllByType()` to find Text components and check their content
   - Example:

     ```typescript
     const textComponents = UNSAFE_getAllByType(require('react-native').Text);
     const hasText = textComponents.some(component => 
       component.props.children === "Expected Text"
     );
     expect(hasText).toBe(true);
     ```

4. **Testing component behavior**
   - Test user interactions using `fireEvent`
   - Verify callbacks are called with the expected arguments
   - For async operations, use `waitFor()` to wait for completion

5. **Component rendering verification**
   - Use `toJSON()` to verify components render without errors

## Common Issues and Solutions

1. **Button accessibility issues**
   - Problem: `getByRole("button")` fails to find buttons in React Native
   - Solution: Use `UNSAFE_getAllByType(require('react-native').Pressable)` instead

2. **Text content verification issues**
   - Problem: `getByText()` may not reliably find text in React Native components
   - Solution: Use the approach described in the "Verifying text content" section above

3. **Asynchronous testing issues**
   - Problem: Tests fail because async operations don't complete
   - Solution: Use `waitFor()` to wait for async operations to complete

## Running Tests

To run all tests:

```psh
npm test
```

To run a specific test file:

```psh
npx jest path/to/test.tsx
```

To run tests with verbose output:

```psh
npx jest path/to/test.tsx --verbose
```
