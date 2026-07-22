/// <reference types="vitest/globals" />
import "@testing-library/jest-dom";
import { vi, beforeEach, afterEach } from "vitest";

// Mock crypto.getRandomValues for nanoid in tests
if (!globalThis.crypto) {
  Object.defineProperty(globalThis, "crypto", {
    value: {
      getRandomValues: (arr: Uint8Array) => {
        for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
        return arr;
      },
    },
  });
}

// Mock IndexedDB
vi.mock("dexie", () => {
  const Dexie = class {
    constructor(_name: string) {}
    version(_n: number) { return { stores: () => {} }; }
  };
  return { default: Dexie, type: undefined };
});

vi.mock("dexie-react-hooks", () => ({
  useLiveQuery: (fn: () => unknown) => {
    try { return fn(); } catch { return undefined; }
  },
}));

// Mock timer
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});
