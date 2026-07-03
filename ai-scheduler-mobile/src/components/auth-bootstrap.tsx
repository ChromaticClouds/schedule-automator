import { PropsWithChildren, useEffect } from 'react';
import { hydrateAuthSession } from '@/features/auth/session';

export function AuthBootstrap({ children }: PropsWithChildren) {
  useEffect(() => {
    void hydrateAuthSession();
  }, []);

  return children;
}
