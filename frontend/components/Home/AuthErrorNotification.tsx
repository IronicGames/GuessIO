'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useNotify } from '@/hooks/useNotify';

const ERROR_MESSAGES: Record<string, string> = {
  login_cancelled: 'Login was cancelled.',
  auth_failed: 'Authentication failed. Please try again.',
  session_expired: 'Your session has expired. Please log in again.',
};

export function AuthErrorNotification() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const notify = useNotify();
  const shown = useRef(false);

  useEffect(() => {
    const error = searchParams.get('error');
    if (!error || shown.current) return;

    shown.current = true;
    notify.error(ERROR_MESSAGES[error] ?? 'Something went wrong.', 'Authentication Error');
    router.replace('/');
  }, []);

  return null;
}
