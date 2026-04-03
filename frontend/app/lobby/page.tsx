'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';
import LoadingOverlay from '@components/LoadingOverlay';

export default function CreateLobbyPage() {
  const router = useRouter();

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      withCredentials: true,
      autoConnect: false,
    });

    socket.on('connect', () => {
      // Only emit once the connection is actually open
      socket.emit('lobby:create');
    });

    socket.on('lobby:state', ({ code }: { code: string }) => {
      // Server created the lobby and sent us the code — navigate to it
      socket.disconnect();
      router.replace(`/lobby/${code}`);
    });

    socket.on('connect_error', () => {
      router.replace('/');
    });

    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, [router]);
  return <LoadingOverlay mode="screen" status="loading" text="Creating lobby…" />;
}
