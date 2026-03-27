'use client';
import HomePageButton from '@components/Home/HomePageButton';
import { Stack, TextInput, Container, Flex } from '@mantine/core';
import { useAuth } from '@providers/auth-provider';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  return (
    <Container size="md" h="70vh">
      <Flex
        direction="column"
        justify="center"
        align="center"
        gap={{ base: 'lg', sm: 'xl' }}
        px={{ base: 'md', sm: 'lg' }}
      >
        {/* Menu Buttons */}
        <Stack w="100%" maw={600} align="center">
          <HomePageButton href="/boards" text="Public Match" />
          <HomePageButton href="/boards" text="Create Lobby" />
          {isLoggedIn ? <HomePageButton href="/boards" text="Manage Boards" /> : null}

          {/* Enter Code Input */}
          <TextInput
            w="100%"
            placeholder="Enter Code"
            radius="lg"
            maw={600}
            styles={{
              input: {
                height: 'auto',
                fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
                padding: '1rem 1.5rem',
                textAlign: 'center',
                backgroundColor: 'var(--mantine-color-dark-6)',
                border: '2px solid var(--mantine-color-dark-4)',
                '&::placeholder': {
                  color: 'var(--mantine-color-cyan-3)',
                  opacity: 0.6,
                },
              },
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const code = (e.target as HTMLInputElement).value;
                if (code) {
                  router.push(`/lobby/${code}`);
                }
              }
            }}
          />

          {/* Donate */}
          <HomePageButton href="/boards" text="Donate" alternate />
        </Stack>
      </Flex>
    </Container>
  );
}
