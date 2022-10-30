/** @type {import('vite').UserConfig} */

export default {
  base: "./",
  build: {
    assetsDir: ".",
  },
  server: {
    port: 3000,
    host: "0.0.0.0",
    strictPort: true,
  },
};
