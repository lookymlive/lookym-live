import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import FollowButton from "../FollowButton.tsx";

describe("FollowButton", () => {
  it("muestra 'Seguir' cuando no sigue", () => {
    const { getByText } = render(
      <FollowButton
        isFollowing={false}
        onFollow={jest.fn()}
        onUnfollow={jest.fn()}
      />
    );
    expect(getByText("Seguir")).toBeTruthy();
  });

  it("muestra 'Siguiendo' cuando ya sigue", () => {
    const { getByText } = render(
      <FollowButton
        isFollowing={true}
        onFollow={jest.fn()}
        onUnfollow={jest.fn()}
      />
    );
    expect(getByText("Siguiendo")).toBeTruthy();
  });

  it("llama a onFollow cuando se presiona y no sigue", async () => {
    const onFollow = jest.fn().mockResolvedValue(undefined);
    const { getByText } = render(
      <FollowButton
        isFollowing={false}
        onFollow={onFollow}
        onUnfollow={jest.fn()}
      />
    );
    const label = getByText("Seguir");
    fireEvent.press(label.parent || label);
    await waitFor(() => expect(onFollow).toHaveBeenCalled());
  });

  it("llama a onUnfollow cuando se presiona y ya sigue", async () => {
    const onUnfollow = jest.fn().mockResolvedValue(undefined);
    const { getByText } = render(
      <FollowButton
        isFollowing={true}
        onFollow={jest.fn()}
        onUnfollow={onUnfollow}
      />
    );
    const label = getByText("Siguiendo");
    fireEvent.press(label.parent || label);
    await waitFor(() => expect(onUnfollow).toHaveBeenCalled());
  });
});
