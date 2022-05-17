export default {
  base: "./",
  build: {
    assetsDir: ".",
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
};
