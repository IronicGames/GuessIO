'use client';

import { AuthErrorNotification } from '@components/Home/AuthErrorNotification';
import { AuthModal } from '@components/Home/AuthModal';
import HomePageButton from '@components/Home/HomePageButton';
import { Stack, TextInput, Container, Flex } from '@mantine/core';
import { useAuth } from '@providers/auth-provider';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Only players and admins can manage boards — guests cannot
  const canManageBoards = user?.role === 'PLAYER' || user?.role === 'ADMIN';

  const handleManageBoardsLocked = () => {
    setAuthModalOpen(true);
  };

  return (
    <>
      {/* Shown when guest clicks Manage Boards — dismissible, explains why */}
      <AuthModal
        opened={authModalOpen}
        reason="needs-account"
        onClose={() => setAuthModalOpen(false)}
      />

      <AuthErrorNotification />

      <Container size="sm" h="100%" py="xl">
        <Flex
          direction="column"
          justify="center"
          align="center"
          h="70vh"
          gap={{ base: 'sm', sm: 'md' }}
          px={{ base: 'md', sm: 'lg' }}
        >
          <Stack w="100%" maw={500} gap="md">
            <HomePageButton href="/game/public" text="Public Match" />
            <HomePageButton href="/lobby" text="Create Lobby" />
            {/* Locked for guests — visible but explains access requirement on click */}
            <HomePageButton
              href="/boards"
              text="Manage Boards"
              locked={!canManageBoards}
              onLockedClick={handleManageBoardsLocked}
            />
            {/* Enter lobby code */}
            <TextInput
              w="100%"
              placeholder="Enter Code"
              radius="lg"
              styles={{
                input: {
                  height: 'auto',
                  fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
                  padding: '1rem 1.5rem',
                  textAlign: 'center',
                  backgroundColor: 'var(--mantine-color-dark-6)',
                  border: '2px solid var(--mantine-color-dark-4)',
                },
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const code = (e.target as HTMLInputElement).value;
                  if (code) router.push(`/lobby/${code}`);
                }
              }}
            />
            <HomePageButton href="/donate" text="Donate" alternate />
          </Stack>
        </Flex>
      </Container>
    </>
  );
}
