'use client';

import { useState, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export function useSignOut() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [hasInitiatedSignOut, setHasInitiatedSignOut] = useState(false);

  const handleSignOut = useCallback(() => {
    if (session) {
      signOut({ callbackUrl: pathname });
      setHasInitiatedSignOut(true);
    }
  }, [session, pathname]);

  return { handleSignOut, hasInitiatedSignOut, setHasInitiatedSignOut };
}
