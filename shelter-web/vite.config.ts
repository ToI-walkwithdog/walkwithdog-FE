import { fileURLToPath } from "node:url";

import { defineConfig } from "vite";

export default defineConfig({
  // BE의 CORS는 http://localhost:3000, http://127.0.0.1:3000만 허용한다(BE에 하드코딩).
  server: {
    host: "localhost",
    port: 3000,
    strictPort: true,
    fs: {
      allow: [
        fileURLToPath(new URL(".", import.meta.url)),
        fileURLToPath(new URL("../src/assets/fonts", import.meta.url)),
      ],
    },
  },
  preview: { host: "localhost", port: 3000, strictPort: true },
});
