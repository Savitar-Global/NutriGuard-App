import { InputAccessoryView, Platform, StyleSheet, View } from 'react-native';

/**
 * iOS shows a "Done" (or "Previous · Next · Done") toolbar above number-pad
 * keyboards by default — there's no return key on a number keyboard, so iOS
 * adds the toolbar so the user can dismiss the keyboard.
 *
 * In our onboarding we want a single source of truth for "submit" — the
 * Continue button — so we replace the system toolbar with an empty 0-height
 * view. Pair this with `inputAccessoryViewID={EMPTY_INPUT_ACCESSORY_ID}` on
 * each TextInput that uses a numeric keyboard.
 */
export const EMPTY_INPUT_ACCESSORY_ID = 'nutricareai-empty-keyboard-accessory';

export function EmptyInputAccessory() {
  if (Platform.OS !== 'ios') return null;
  return (
    <InputAccessoryView nativeID={EMPTY_INPUT_ACCESSORY_ID}>
      <View style={styles.empty} />
    </InputAccessoryView>
  );
}

const styles = StyleSheet.create({
  empty: { height: 0 },
});
