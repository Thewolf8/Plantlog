import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.plantlog.journal',
  appName: 'PlantLog',
  webDir: 'dist',
  server: { androidScheme: 'https' },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#0a1a0e',
      androidScaleType: 'CENTER_CROP',
    },
  },
  android: {
    buildOptions: {
      releaseType: 'APK',
    },
  },
};

export default config;
