import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as AppleAuthentication from 'expo-apple-authentication';
import { OAuthProvider, type AuthCredential } from 'firebase/auth';
import { Platform } from 'react-native';

import { AppError } from '@/types/global';

export interface AppleSignInResult {
  credential: AuthCredential;
  fullName: string | null;
  email: string | null;
}

export const isExpoGo = (): boolean =>
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export const isAppleSignInAvailable = async (): Promise<boolean> => {
  if (Platform.OS !== 'ios') return false;
  // Show the button in Expo Go for visual QA, even though the press will fail
  // (entitlement is only present in native dev/release builds).
  if (isExpoGo()) return true;
  return AppleAuthentication.isAvailableAsync();
};

export const requestAppleCredential = async (): Promise<AppleSignInResult> => {
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });

  if (!credential.identityToken) {
    throw new AppError('AUTH_INVALID', 'Apple did not return an identity token');
  }

  const provider = new OAuthProvider('apple.com');
  const firebaseCredential = provider.credential({
    idToken: credential.identityToken,
  });

  const fullName = credential.fullName
    ? [credential.fullName.givenName, credential.fullName.familyName]
        .filter(Boolean)
        .join(' ') || null
    : null;

  return {
    credential: firebaseCredential,
    fullName,
    email: credential.email ?? null,
  };
};
