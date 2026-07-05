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
  const isDark = theme.background === '#000000';

  return {
    activeButton: isDark ? '#2F6FED' : '#DCEBFF',
    activeButtonText: isDark ? '#FFFFFF' : '#0B1F3A',
    disabledButton: isDark ? '#263447' : '#E8F1FF',
    disabledButtonText: isDark ? '#C5D2E8' : '#5F6E85',
    inputBackground: isDark ? '#17181B' : '#FFFFFF',
    inputBorder: isDark ? '#8E95A3' : '#6B7280',
    inputText: theme.text,
    placeholderText: theme.textSecondary,
    selectedButton: isDark ? '#3D7EF7' : '#B8D8FF',
    selection: '#3C87F7',
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
  const color = disabled ? colors.disabledButtonText : colors.activeButtonText;

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, { backgroundColor }, style]}
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
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    padding: Spacing.two,
  },
});
