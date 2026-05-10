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

const isExpoGo = (): boolean =>
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export const isAppleSignInAvailable = async (): Promise<boolean> => {
  if (Platform.OS !== 'ios') return false;
  // Apple Sign-In needs the entitlement bundled at build time — Expo Go can't carry it.
  if (isExpoGo()) return false;
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
