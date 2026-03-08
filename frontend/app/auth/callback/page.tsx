'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/auth-provider';

export default function AuthCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const userId = searchParams.get('userId');
    const userName = searchParams.get('userName');
    const userPicture = searchParams.get('userPicture');

    if (token && userId && userName) {
      login(token, userId, userName, userPicture || '');
      router.replace('/');
    } else {
      router.push('/');
    }
  }, [searchParams, router, login]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Logging you in...</p>
    </div>
  );
}
