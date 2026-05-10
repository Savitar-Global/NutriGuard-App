import Constants from 'expo-constants';

export interface FirebaseWebConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

interface Env {
  openaiApiKey: string;
  revenueCatIosKey: string;
  firebase: FirebaseWebConfig;
  appEnv: 'development' | 'preview' | 'production';
}

const extra = Constants.expoConfig?.extra as
  | (Partial<Env> & { firebase?: Partial<FirebaseWebConfig> })
  | undefined;

export const env: Env = {
  openaiApiKey: extra?.openaiApiKey ?? '',
  revenueCatIosKey: extra?.revenueCatIosKey ?? '',
  firebase: {
    apiKey: extra?.firebase?.apiKey ?? '',
    authDomain: extra?.firebase?.authDomain ?? '',
    projectId: extra?.firebase?.projectId ?? '',
    storageBucket: extra?.firebase?.storageBucket ?? '',
    messagingSenderId: extra?.firebase?.messagingSenderId ?? '',
    appId: extra?.firebase?.appId ?? '',
  },
  appEnv: (process.env['APP_ENV'] as Env['appEnv']) ?? 'development',
};

export const isFirebaseConfigured = (): boolean =>
  Boolean(env.firebase.apiKey && env.firebase.projectId && env.firebase.appId);
