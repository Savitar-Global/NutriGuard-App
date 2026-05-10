import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'NutriGuard',
  slug: 'nutriguard',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  icon: './assets/icon.png',
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.nutriguard.app',
    infoPlist: {
      NSCameraUsageDescription:
        'NutriGuard uses your camera to scan meals and food labels.',
      NSPhotoLibraryUsageDescription:
        'Choose a meal photo from your library to scan.',
      NSPhotoLibraryAddUsageDescription:
        'Save your shared result card to Photos.',
    },
  },
  plugins: [
    ['expo-camera', { cameraPermission: 'NutriGuard uses your camera to scan meals and food labels.' }],
    ['expo-image-picker', { photosPermission: 'Choose a meal photo from your library to scan.' }],
    'expo-notifications',
  ],
  extra: {
    openaiApiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? '',
    revenueCatIosKey: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '',
    firebase: {
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
      storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
      messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
    },
    eas: {
      projectId: '', // fill after `eas init`
    },
  },
});
