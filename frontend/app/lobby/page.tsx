'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingOverlay from '@components/LoadingOverlay';

export default function CreateLobbyPage() {
  const router = useRouter();

  useEffect(() => {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // SOCKET.IO PLACEHOLDER
    // Real flow:
    //   1. socket.connect({ auth: { token } })  ← token from httpOnly cookie (see auth pattern)
    //   2. socket.emit('lobby:create')
    //   3. socket.on('lobby:state', ({ code }) => router.push(`/lobby/${code}`))
    //
    // TODO: Also consider whether guests should be blocked from creating lobbies
    //       (guests have no boards, so they can't be host — handle this check here)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const t = setTimeout(() => {
      router.replace('/lobby/MOCK-ABC123');
    }, 400);
    return () => clearTimeout(t);
  }, [router]);

  return <LoadingOverlay mode="screen" status="loading" text="Creating lobby…" />;
}
