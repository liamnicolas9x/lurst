import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
import { resolve } from "node:path";

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const isDev = command === "serve";

  return {
    build: {
      sourcemap: "hidden",
    },
    plugins: [
      react({
        babel: {
          plugins: isDev ? ["react-dev-locator"] : [],
        },
      }),
      tsconfigPaths(),
    ],
    resolve: {
      alias: {
        "@shared": resolve(__dirname, "../shared"),
      },
    },
  };
});
