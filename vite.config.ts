import { VitePWA } from 'vite-plugin-pwa';

export default {
  plugins: [
    VitePWA({
      //   includeAssets: ['**'],
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,json,svg,webmanifest}'],
      },
    }),
  ],
};
