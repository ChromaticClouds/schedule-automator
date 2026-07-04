import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren, useEffect, useState } from 'react';
import { registerAuthCacheReset } from '@/features/auth/session';

export function QueryProvider({ children }: PropsWithChildren) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 15_000,
          },
        },
      }),
  );

  useEffect(
    () =>
      registerAuthCacheReset(() => {
        void client.cancelQueries({ queryKey: ['planning'] });
        void client.resetQueries({ queryKey: ['planning'] });
      }),
    [client],
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
