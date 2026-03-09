'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/auth-provider';

export default function AuthCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Verifying token...');

  useEffect(() => {
    const token = searchParams.get('token');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError(errorParam);
      setStatus('Login failed');
      setTimeout(() => router.push('/'), 3000);
      return;
    }

    if (token) {
      setStatus('Fetching your profile...');

      // Call login with just the token
      login(token)
        .then(() => {
          setStatus('Success! Redirecting...');
          router.replace('/?success=login');
        })
        .catch((err) => {
          console.error('Login failed:', err);
          setError('Login failed. Please try again.');
          setStatus('Login failed');
          setTimeout(() => router.push('/'), 3000);
          router.push('/?error=auth_failed');
        });
    } else {
      setError('No authentication token received');
      setStatus('Login failed');
      setTimeout(() => router.push('/'), 3000);
      router.push('/?error=missing_code');
    }
  }, [searchParams, router, login]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <p className="text-gray-600">Redirecting to home...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>{status}</p>
    </div>
  );
}
