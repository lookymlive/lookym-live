import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import FollowButton from "../FollowButton.tsx";

/**
 * Test suite for the FollowButton component
 * 
 * These tests verify that:
 * 1. The button displays the correct text based on following status
 * 2. The appropriate callbacks are triggered when the button is pressed
 */
describe("FollowButton", () => {
  // Test 1: Button shows "Seguir" when not following
  it("muestra 'Seguir' cuando no sigue", () => {
    const { toJSON, UNSAFE_getAllByType } = render(
      <FollowButton
        isFollowing={false}
        onFollow={jest.fn().mockResolvedValue(undefined)}
        onUnfollow={jest.fn().mockResolvedValue(undefined)}
      />
    );
    // Verify component renders
    expect(toJSON()).toBeTruthy();
    
    // Find all Text components
    const textComponents = UNSAFE_getAllByType(require('react-native').Text);
    
    // Check if any Text component contains "Seguir"
    const hasFollowText = textComponents.some(textComponent => {
      return textComponent.props.children === "Seguir";
    });
    
    expect(hasFollowText).toBe(true);
  });

  // Test 2: Button shows "Siguiendo" when following
  it("muestra 'Siguiendo' cuando ya sigue", () => {
    const { toJSON, UNSAFE_getAllByType } = render(
      <FollowButton
        isFollowing={true}
        onFollow={jest.fn().mockResolvedValue(undefined)}
        onUnfollow={jest.fn().mockResolvedValue(undefined)}
      />
    );
    // Verify component renders
    expect(toJSON()).toBeTruthy();
    
    // Find all Text components
    const textComponents = UNSAFE_getAllByType(require('react-native').Text);
    
    // Check if any Text component contains "Siguiendo"
    const hasFollowingText = textComponents.some(textComponent => {
      return textComponent.props.children === "Siguiendo";
    });
    
    expect(hasFollowingText).toBe(true);
  });

  // Test 3: onFollow is called when button is pressed and not following
  it("llama a onFollow cuando se presiona y no sigue", async () => {
    const onFollow = jest.fn().mockResolvedValue(undefined);
    const { UNSAFE_getAllByType } = render(
      <FollowButton
        isFollowing={false}
        onFollow={onFollow}
        onUnfollow={jest.fn().mockResolvedValue(undefined)}
      />
    );
    
    // Find the Pressable component directly
    const pressables = UNSAFE_getAllByType(require('react-native').Pressable);
    expect(pressables.length).toBeGreaterThan(0);
    
    // Press the first pressable (our button)
    fireEvent.press(pressables[0]);
    
    // Wait for the async operation to complete
    await waitFor(() => {
      expect(onFollow).toHaveBeenCalledTimes(1);
    });
  });

  // Test 4: onUnfollow is called when button is pressed and following
  it("llama a onUnfollow cuando se presiona y ya sigue", async () => {
    const onUnfollow = jest.fn().mockResolvedValue(undefined);
    const { UNSAFE_getAllByType } = render(
      <FollowButton
        isFollowing={true}
        onFollow={jest.fn().mockResolvedValue(undefined)}
        onUnfollow={onUnfollow}
      />
    );
    
    // Find the Pressable component directly
    const pressables = UNSAFE_getAllByType(require('react-native').Pressable);
    expect(pressables.length).toBeGreaterThan(0);
    
    // Press the first pressable (our button)
    fireEvent.press(pressables[0]);
    
    // Wait for the async operation to complete
    await waitFor(() => {
      expect(onUnfollow).toHaveBeenCalledTimes(1);
    });
  });
});
