import { fireEvent, render } from "@testing-library/react-native";
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
  it("muestra 'Seguir' cuando no sigue", () => {
    const { getByTestId, queryByTestId } = render(
      <FollowButton
        isFollowing={false}
        onFollow={jest.fn().mockResolvedValue(undefined)}
        onUnfollow={jest.fn().mockResolvedValue(undefined)}
      />
    );
    expect(queryByTestId("FollowButtonText")).toBeTruthy();
    expect(getByTestId("FollowButtonText").props.children).toBe("Seguir");
  });

  it("muestra 'Siguiendo' cuando ya sigue", () => {
    const { getByTestId, queryByTestId } = render(
      <FollowButton
        isFollowing={true}
        onFollow={jest.fn().mockResolvedValue(undefined)}
        onUnfollow={jest.fn().mockResolvedValue(undefined)}
      />
    );
    expect(queryByTestId("FollowButtonText")).toBeTruthy();
    expect(getByTestId("FollowButtonText").props.children).toBe("Siguiendo");
  });

  it("muestra el ActivityIndicator cuando loading es true", async () => {
    const onFollow = () =>
      new Promise<void>((resolve) => setTimeout(resolve, 100));
    const { getByLabelText, findByTestId } = render(
      <FollowButton
        isFollowing={false}
        onFollow={onFollow}
        onUnfollow={async () => {}}
      />
    );
    fireEvent.press(getByLabelText("Seguir"));
    expect(await findByTestId("ActivityIndicator")).toBeTruthy();
  });

  it("muestra el mensaje de error si ocurre un error", async () => {
    // Simular error en onFollow
    const errorFn = jest.fn().mockRejectedValue(new Error("fail"));
    const { getByLabelText, findByTestId } = render(
      <FollowButton
        isFollowing={false}
        onFollow={errorFn}
        onUnfollow={jest.fn()}
      />
    );
    fireEvent.press(getByLabelText("Seguir"));
    expect(await findByTestId("FollowButtonError")).toBeTruthy();
  });
});
