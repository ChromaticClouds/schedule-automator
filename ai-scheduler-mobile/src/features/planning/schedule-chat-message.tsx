import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

type Props = {
  children: ReactNode;
  label?: string;
  role: 'assistant' | 'user';
};

export function ScheduleChatMessage({ children, label, role }: Props) {
  const user = role === 'user';

  return (
    <View
      accessibilityLabel={label}
      className={cn(
        'gap-2 rounded-2xl px-4 py-3',
        user ? 'self-end bg-primary' : 'self-start border border-border bg-card',
      )}
      style={user ? styles.user : styles.assistant}
    >
      {label && (
        <Text
          className={cn(
            'text-xs font-semibold',
            user ? 'text-primary-foreground/80' : 'text-muted-foreground',
          )}
        >
          {label}
        </Text>
      )}
      {typeof children === 'string' ? (
        <Text className={user ? 'text-primary-foreground' : 'text-card-foreground'}>
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  assistant: { maxWidth: '94%' },
  user: { maxWidth: '84%' },
});
