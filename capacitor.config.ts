import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.colosseumfightclub.manager',
  appName: 'Colosseum FC',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  backgroundColor: '#0a0a0a'
};

export default config;
