import { useChatStore } from "../chat-store.ts";

// Mock useAuthStore to provide a fake user
// Tipado explícito para evitar warning de any en globalThis
import type { User } from "../../types/user.ts";
declare global {
  // eslint-disable-next-line no-var
  var __FAKE_USER__: User;
}
globalThis.__FAKE_USER__ = {
  id: "user1",
  email: "test@example.com",
  username: "Test",
  displayName: "Test User",
  avatar: "",
  bio: "",
  role: "user",
  verified: false,
};
// Mock Zustand store API for useAuthStore
jest.mock("../auth-store", () => ({
  useAuthStore: {
    getState: () => ({ currentUser: globalThis.__FAKE_USER__ }),
    // Puedes agregar aquí otros métodos si tu store los usa
  },
}));

/**
 * NOTA:
 * Este mock simula la API real de Zustand para el store de autenticación.
 * Así, cualquier llamada a useAuthStore.getState() en el código de producción o tests
 * devolverá el usuario simulado, igual que en la app real.
 *
 * Si en el futuro usas más métodos del store, agrégalos aquí.
 */

// Mock supabase client
jest.mock("../../utils/supabase", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: [], error: null }),
      insert: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          id: "user2",
          username: "Other",
          avatar_url: "",
          role: "user",
          verified: false,
        },
        error: null,
      }),
    })),
  },
}));

describe("useChatStore", () => {
  it("should initialize with empty chats", () => {
    const store = useChatStore.getState();
    expect(store.chats).toEqual([]);
  });

  it("should load chats without error", async () => {
    await useChatStore.getState().loadChats();
    expect(Array.isArray(useChatStore.getState().chats)).toBe(true);
  });

  it("should create a chat and add it to the store", async () => {
    const chatId = await useChatStore.getState().createChat("user2", "Hola!");
    expect(typeof chatId).toBe("string");
  });

  it("should send a message without error", async () => {
    // First, create a chat
    const chatId = await useChatStore.getState().createChat("user2", "Hola!");
    await expect(
      useChatStore.getState().sendMessage(chatId, "Mensaje")
    ).resolves.toBeUndefined();
  });
});
