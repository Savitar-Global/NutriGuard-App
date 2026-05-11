import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Nutricare Ai',
  owner: 'savitar-global',
  slug: 'nutricare-ai',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  icon: './assets/icon.png',
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.nutricareai.app',
    usesAppleSignIn: true,
    infoPlist: {
      NSCameraUsageDescription:
        'Nutricare Ai uses your camera to scan meals and food labels.',
      NSPhotoLibraryUsageDescription:
        'Choose a meal photo from your library to scan.',
      NSPhotoLibraryAddUsageDescription:
        'Save your shared result card to Photos.',
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: 'com.nutricareai.app',
  },
  plugins: [
    ['expo-camera', { cameraPermission: 'Nutricare Ai uses your camera to scan meals and food labels.' }],
    ['expo-image-picker', { photosPermission: 'Choose a meal photo from your library to scan.' }],
    'expo-notifications',
    'expo-apple-authentication',
    'expo-asset',
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
      projectId: '125883f6-ffb6-4c11-9d07-9629d8d7935a',
    },
  },
});
