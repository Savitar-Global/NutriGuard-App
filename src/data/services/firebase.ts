import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
// @ts-expect-error — getReactNativePersistence is exported by firebase/auth at runtime but
// the type definitions don't include it (intentional decision by the Firebase team).
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import type { Auth } from 'firebase/auth';
import { initializeFirestore, type Firestore } from 'firebase/firestore';

import { env, isFirebaseConfigured } from '@/config/env';

if (!isFirebaseConfigured()) {
  console.warn(
    '[Firebase] Missing config in .env — auth and Firestore will not work. ' +
      'Set EXPO_PUBLIC_FIREBASE_API_KEY, EXPO_PUBLIC_FIREBASE_PROJECT_ID, EXPO_PUBLIC_FIREBASE_APP_ID, etc.',
  );
}

export const firebaseApp = getApps().length ? getApp() : initializeApp(env.firebase);

export const firebaseAuth: Auth = initializeAuth(firebaseApp, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Long polling is required for Firestore in React Native / Expo Go — the default
// gRPC streaming transport silently fails to write under RN's networking stack.
export const firebaseFirestore: Firestore = initializeFirestore(firebaseApp, {
  experimentalForceLongPolling: true,
});
