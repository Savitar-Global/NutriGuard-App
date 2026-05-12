import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { isAppleSignInAvailable, isExpoGo } from '@/data/services/appleAuth';
import { AppleAuthButton } from '@/presentation/components/AppleAuthButton';
import { Checkbox } from '@/presentation/components/Checkbox';
import { Divider } from '@/presentation/components/Divider';
import { Logo } from '@/presentation/components/Logo';
import { PrimaryButton } from '@/presentation/components/PrimaryButton';
import { TextField } from '@/presentation/components/TextField';
import { friendlyAuthMessage } from '@/presentation/hooks/useAuthError';
import { colors, spacing, typography } from '@/presentation/theme';
import { useAuthStore } from '@/stores/authStore';
import { isValidEmail, isValidPassword } from '@/utils/validation';

interface SignUpScreenProps {
  onNavigateToLogin: () => void;
}

export function SignUpScreen({ onNavigateToLogin }: SignUpScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);

  const isSubmitting = useAuthStore((s) => s.isSubmitting);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);
  const signUpWithEmail = useAuthStore((s) => s.signUpWithEmail);
  const signInWithApple = useAuthStore((s) => s.signInWithApple);

  useEffect(() => {
    isAppleSignInAvailable().then(setAppleAvailable);
  }, []);

  const errorMessage = useMemo(() => friendlyAuthMessage(error), [error]);

  const canSubmit =
    isValidEmail(email) &&
    isValidPassword(password) &&
    acknowledged &&
    !isSubmitting;

  const onCreate = async () => {
    if (!canSubmit) return;
    try {
      await signUpWithEmail(email, password);
    } catch {
      // store already captured the mapped error for the UI
    }
  };

  const onApple = async () => {
    if (!acknowledged) return;
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
            <Text style={styles.h1}>
              Your food. Your{'\n'}conditions.{'\n'}
              <Text style={styles.h1Italic}>Your answer.</Text>
            </Text>
            <Text style={styles.lead}>
              Scan any meal. Get an honest verdict tuned to the conditions you
              actually live with.
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
            placeholder="At least 6 characters"
            secure
            autoCapitalize="none"
            autoComplete="password-new"
            textContentType="newPassword"
            returnKeyType="done"
            onSubmitEditing={onCreate}
          />

          <View style={styles.checkboxWrap}>
            <Checkbox checked={acknowledged} onChange={setAcknowledged}>
              <Text style={styles.checkboxText}>
                I understand Nutricare Ai is{' '}
                <Text style={styles.checkboxBold}>not medical advice</Text>.
              </Text>
            </Checkbox>
          </View>

          {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}

          <View style={styles.actions}>
            <PrimaryButton
              label="Create account"
              onPress={onCreate}
              loading={isSubmitting}
              disabled={!canSubmit}
            />

            {appleAvailable && (
              <>
                <Divider label="or" />
                <AppleAuthButton
                  label="Continue with Apple"
                  onPress={onApple}
                  disabled={!acknowledged || isSubmitting}
                  variant="dark"
                />
              </>
            )}

            <Text style={styles.footer}>
              Already a member?{' '}
              <Text style={styles.footerLink} onPress={onNavigateToLogin}>
                Log in
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
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.screenPaddingX,
    paddingVertical: spacing['3xl'],
  },
  logoWrap: { alignItems: 'center', marginBottom: spacing.xl },
  headerBlock: { marginBottom: spacing.lg },
  h1: { ...typography.displayLg, textAlign: 'center' },
  h1Italic: { ...typography.italic, color: colors.inkSoft },
  lead: { ...typography.bodyMd, marginTop: spacing.md, textAlign: 'center' },
  checkboxWrap: { marginTop: spacing.md, marginBottom: spacing.xs, },
  checkboxText: typography.checkboxLabel,
  checkboxBold: { ...typography.linkInline },
  error: { ...typography.errorText, marginTop: spacing.md, textAlign: 'center' },
  actions: { marginTop: spacing.lg, gap: spacing.xs },
  footer: {
    ...typography.footerText,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  footerLink: typography.linkInline,
});
