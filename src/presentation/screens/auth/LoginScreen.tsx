import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { isAppleSignInAvailable, isExpoGo } from '@/data/services/appleAuth';
import { AppleAuthButton } from '@/presentation/components/AppleAuthButton';
import { BackButton } from '@/presentation/components/BackButton';
import { Divider } from '@/presentation/components/Divider';
import { SecondaryButton } from '@/presentation/components/SecondaryButton';
import { TextField } from '@/presentation/components/TextField';
import { friendlyAuthMessage } from '@/presentation/hooks/useAuthError';
import { colors, spacing, typography } from '@/presentation/theme';
import { useAuthStore } from '@/stores/authStore';
import { isValidEmail, isValidPassword } from '@/utils/validation';
import { Logo } from '@/presentation/components/Logo';
import { PrimaryButton } from '@/presentation/components/PrimaryButton';

interface LoginScreenProps {
  onBack: () => void;
}

export function LoginScreen({ onBack }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [appleAvailable, setAppleAvailable] = useState(false);

  const isSubmitting = useAuthStore((s) => s.isSubmitting);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);
  const signInWithEmail = useAuthStore((s) => s.signInWithEmail);
  const signInWithApple = useAuthStore((s) => s.signInWithApple);
  const sendPasswordReset = useAuthStore((s) => s.sendPasswordReset);

  useEffect(() => {
    isAppleSignInAvailable().then(setAppleAvailable);
  }, []);

  const errorMessage = useMemo(() => friendlyAuthMessage(error), [error]);
  const canSubmit =
    isValidEmail(email) && isValidPassword(password) && !isSubmitting;

  const onLogin = async () => {
    if (!canSubmit) return;
    try {
      await signInWithEmail(email, password);
    } catch {
      // mapped error already in store
    }
  };

  const onForgotPassword = () => {
    if (!isValidEmail(email)) {
      Alert.alert(
        'Reset password',
        'Enter the email tied to your account, then tap Forgot password again.',
      );
      return;
    }
    Alert.alert('Reset password', `Send a reset link to ${email.trim()}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Send link',
        onPress: async () => {
          try {
            await sendPasswordReset(email);
            Alert.alert(
              'Check your inbox',
              'If an account exists, you’ll get a reset link in a few minutes.',
            );
          } catch {
            Alert.alert(
              'Could not send reset',
              'Please check your email and try again.',
            );
          }
        },
      },
    ]);
  };

  const onApple = async () => {
    if (isExpoGo()) {
      Alert.alert(
        'Not available in Expo Go',
        'Apple Sign In needs a native dev client or TestFlight build to run. The button is shown here for layout only.',
      );
      return;
    }
    try {
      await signInWithApple();
    } catch {
      // handled by store
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <BackButton onPress={onBack} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          <View style={styles.logoWrap}>
            <Logo variant="stacked" />
          </View>
          <View style={styles.headerBlock}>
            <Text style={styles.h1}>Welcome back</Text>
            <Text style={styles.lead}>
              Log in to sync your conditions, scans, and streak.
            </Text>
          </View>

          <TextField
            label="Email"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              if (error) clearError();
            }}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            textContentType="emailAddress"
            returnKeyType="next"
          />

          <TextField
            label="Password"
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              if (error) clearError();
            }}
            placeholder="••••••••"
            secure
            autoCapitalize="none"
            autoComplete="password"
            textContentType="password"
            returnKeyType="done"
            onSubmitEditing={onLogin}
          />

          <Pressable
            onPress={onForgotPassword}
            hitSlop={spacing.sm}
            style={styles.forgotWrap}
          >
            <Text style={styles.forgot}>Forgot password?</Text>
          </Pressable>

          {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}

          <View style={styles.actions}>
            <PrimaryButton
              label="Log in"
              onPress={onLogin}
              loading={isSubmitting}
              disabled={!canSubmit}
            />

            {appleAvailable && (
              <>
                <Divider label="or" />
                <AppleAuthButton
                  label="Continue with Apple"
                  onPress={onApple}
                  disabled={isSubmitting}
                  variant="dark"
                />
              </>
            )}

            <Text style={styles.footer}>
              Don't have an account?{' '}
              <Text style={styles.footerLink} onPress={onBack}>
                Create account
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  topBar: {
    paddingHorizontal: spacing.screenPaddingX,
    paddingTop: spacing.screenPaddingY,
  },
  logoWrap: { alignItems: 'center', marginBottom: spacing.xl },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.screenPaddingX,
    paddingVertical: spacing['3xl'],
  },
  headerBlock: { marginBottom: spacing['2xl'] },
  h1: { ...typography.displayLg, textAlign: 'center' },
  lead: { ...typography.bodyMd, marginTop: spacing.sm, textAlign: 'center' },
  forgotWrap: { alignSelf: 'flex-end', marginTop: spacing.sm },
  forgot: typography.link,
  error: { ...typography.errorText, marginTop: spacing.md, textAlign: 'center' },
  actions: { marginTop: spacing.xl, gap: spacing.xs },
  footer: {
    ...typography.footerText,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  footerLink: typography.linkInline,
});
