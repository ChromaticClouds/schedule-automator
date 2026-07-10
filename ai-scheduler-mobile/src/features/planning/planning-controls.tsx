import {
  type PressableProps,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';

type PlanningTextInputProps = TextInputProps;

export function PlanningTextInput({
  style,
  ...props
}: PlanningTextInputProps) {
  return (
    <Input
      className="h-12 px-4 text-base"
      style={style}
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
  return (
    <Button
      accessibilityRole="button"
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={onPress}
      size="lg"
      style={style}
      variant={selected ? 'secondary' : 'default'}
      {...props}
    >
      <Text variant="small">{label}</Text>
    </Button>
  );
}
