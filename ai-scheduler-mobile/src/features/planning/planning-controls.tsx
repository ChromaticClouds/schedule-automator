import {
  Pressable,
  StyleSheet,
  TextInput,
  type PressableProps,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const useControlColors = () => {
  const theme = useTheme();

  return {
    activeButton: theme.primary,
    activeButtonText: theme.primaryText,
    disabledButton: theme.backgroundSelected,
    disabledButtonText: theme.textSecondary,
    inputBackground: theme.inputBackground,
    inputBorder: theme.border,
    inputText: theme.text,
    placeholderText: theme.textSecondary,
    selectedButton: theme.backgroundSelected,
    selectedButtonText: theme.text,
    selection: theme.primary,
  };
};

type PlanningTextInputProps = TextInputProps;

export function PlanningTextInput({
  style,
  ...props
}: PlanningTextInputProps) {
  const colors = useControlColors();

  return (
    <TextInput
      placeholderTextColor={colors.placeholderText}
      selectionColor={colors.selection}
      style={[
        styles.input,
        {
          backgroundColor: colors.inputBackground,
          borderColor: colors.inputBorder,
          color: colors.inputText,
        },
        style,
      ]}
      {...props}
    />
  );
}

type PlanningButtonProps = Omit<PressableProps, 'disabled' | 'onPress'> & {
  disabled?: boolean;
  label: string;
  onPress: PressableProps['onPress'];
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function PlanningButton({
  disabled,
  label,
  onPress,
  selected,
  style,
  ...props
}: PlanningButtonProps) {
  const colors = useControlColors();
  const backgroundColor = disabled
    ? colors.disabledButton
    : selected
      ? colors.selectedButton
      : colors.activeButton;
  const color = disabled
    ? colors.disabledButtonText
    : selected
      ? colors.selectedButtonText
      : colors.activeButtonText;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor },
        pressed && !disabled && styles.pressed,
        style,
      ]}
      {...props}
    >
      <ThemedText style={{ color }} type="smallBold">
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 48,
    padding: Spacing.two,
  },
  pressed: { opacity: 0.78 },
});
