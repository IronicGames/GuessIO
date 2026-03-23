'use client';

import { GoogleIcon } from '@components/Home/GoogleIcon';
import { Group, Text, Avatar, Button, Container, Menu } from '@mantine/core';
import { useAuth } from '@providers/auth-provider';
import { IconLogout, IconSettings, IconUser } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

export function AppHeader() {
  const router = useRouter();
  const { isLoggedIn, user, logout } = useAuth();

  return (
    <header>
      <Container size="xl" py="md">
        <Group justify="space-between" align="center">
          {/* Logo */}
          <Text
            size="xl"
            fw={700}
            style={{ cursor: 'pointer' }}
            onClick={() => router.push('/')}
          >
            GUESS.IO
          </Text>

          {/* Profile / Login */}
          {isLoggedIn ? (
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <Group gap="sm" style={{ cursor: 'pointer' }}>
                  <Avatar radius="xl" src={user?.profilePicture} />
                  <Text>{user?.name}</Text>
                </Group>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconUser size={16} />}
                  onClick={() => router.push('/profile')}
                >
                  Profile
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconSettings size={16} />}
                  onClick={() => router.push('/settings')}
                >
                  Settings
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<IconLogout size={16} />}
                  color="red"
                  onClick={logout}
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          ) : (
            <Button
              leftSection={<GoogleIcon />}
              color="#8ecae6"
              c="black"
              size="md"
              onClick={() =>
                (window.location.href = 'http://localhost:8080/api/auth/google')
              }
            >
              Login with Google
            </Button>
          )}
        </Group>
      </Container>
    </header>
  );
}
