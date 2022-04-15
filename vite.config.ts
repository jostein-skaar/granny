import { VitePWA } from 'vite-plugin-pwa';

export default {
  plugins: [
    VitePWA({
      includeAssets: ['**'],
      registerType: 'autoUpdate',
    }),
  ],
};
