import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { Snackbar } from 'react-native-paper';

import { useTheme } from '@/hooks/use-theme';

type ToastKind = 'error' | 'info' | 'success';
type ToastRequest = { kind?: ToastKind; message: string };
type ToastState = ToastRequest & { id: number; kind: ToastKind };

const ToastContext = createContext<{
  showToast: (toast: ToastRequest) => void;
} | null>(null);

export function ToastProvider({ children }: PropsWithChildren) {
  const theme = useTheme();
  const [toast, setToast] = useState<ToastState | null>(null);
  const hide = useCallback(() => setToast(null), []);
  const showToast = useCallback((next: ToastRequest) => {
    setToast({
      id: Date.now(),
      kind: next.kind ?? 'info',
      message: next.message,
    });
  }, []);
  const value = useMemo(() => ({ showToast }), [showToast]);
  const backgroundColor =
    toast?.kind === 'error'
      ? theme.danger
      : toast?.kind === 'success'
        ? theme.success
        : theme.backgroundSelected;
  const textColor =
    toast?.kind === 'error' || toast?.kind === 'success'
      ? theme.background
      : theme.text;

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Snackbar
        accessibilityLiveRegion="polite"
        duration={3500}
        onDismiss={hide}
        style={{ backgroundColor }}
        theme={{ colors: { inverseOnSurface: textColor } }}
        visible={Boolean(toast)}
      >
        {toast?.message ?? ''}
      </Snackbar>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside ToastProvider');
  }
  return context;
}
