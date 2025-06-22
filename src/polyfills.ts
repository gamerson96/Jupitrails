import { Buffer } from "buffer";

// Make Buffer available globally
if (typeof window !== "undefined") {
  window.Buffer = Buffer;
}

// Also make it available on globalThis
if (typeof globalThis !== "undefined") {
  globalThis.Buffer = Buffer;
}

export { Buffer };
