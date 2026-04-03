'use client';

import { GoogleIcon } from '@components/Home/GoogleIcon';
import {
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Group,
  Menu,
  Modal,
  Text,
  TextInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useAuth } from '@providers/auth-provider';
import { useHeaderSlot } from '@providers/header-slot-provider';
import { IconLogout, IconPencil, IconSettings, IconUser, IconUserPlus } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { buttonThemes } from '@styles/buttonThemes';

export function AppHeader() {
  const router = useRouter();
  const { isLoggedIn, user, logout, loginWithGoogle, loginAsGuest, updateName } = useAuth();
  const { centerSlot } = useHeaderSlot();

  // ── Guest login state ──────────────────────────────────────────
  const [guestName, setGuestName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmed = guestName.trim();
  const nameError = trimmed.length > 0 && (trimmed.length < 2 || trimmed.length > 20);
  const canSubmit = !nameError && !isSubmitting;

  const handleGuestLogin = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      await loginAsGuest(trimmed || undefined);
    } catch {
      notifications.show({
        title: 'Something went wrong',
        message: 'Could not start a guest session. Please try again.',
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Edit name modal state ──────────────────────────────────────
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [pendingName, setPendingName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);

  const openNameModal = () => {
    setPendingName(user?.name ?? '');
    setNameModalOpen(true);
  };

  const pendingTrimmed = pendingName.trim();
  const pendingNameError =
    pendingTrimmed.length > 0 && (pendingTrimmed.length < 2 || pendingTrimmed.length > 20);
  const canSaveName =
    !pendingNameError &&
    pendingTrimmed.length >= 2 &&
    pendingTrimmed !== user?.name &&
    !isSavingName;

  const handleSaveName = async () => {
    if (!canSaveName) return;
    setIsSavingName(true);
    try {
      await updateName(pendingTrimmed);
      setNameModalOpen(false);
    } catch {
      notifications.show({
        title: 'Could not update name',
        message: 'Please try again.',
        color: 'red',
      });
    } finally {
      setIsSavingName(false);
    }
  };

  return (
    <>
      {/* Edit Name Modal */}
      <Modal
        opened={nameModalOpen}
        onClose={() => setNameModalOpen(false)}
        title="Edit Name"
        centered
        styles={{
          content: { backgroundColor: '#1b2430' },
          header: { backgroundColor: '#1b2430', color: '#e6edf3' },
        }}
      >
        <TextInput
          label="Display name"
          value={pendingName}
          onChange={(e) => setPendingName(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSaveName();
          }}
          maxLength={20}
          error={pendingNameError ? 'Name must be 2–20 characters' : undefined}
          styles={{ input: { backgroundColor: '#243040', borderColor: '#33465f', color: 'white' } }}
          mb="md"
        />
        <Group justify="flex-end" gap="sm">
          <Button variant="subtle" c="#6b7f96" onClick={() => setNameModalOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveName}
            disabled={!canSaveName}
            loading={isSavingName}
            color={buttonThemes.primary.color}
            c={buttonThemes.primary.textColor}
            styles={{ root: { borderColor: buttonThemes.primary.borderColor } }}
          >
            Save
          </Button>
        </Group>
      </Modal>

      <header>
        <Container size="xl" py="md">
          <Group justify="space-between" align="center">
            {/* Logo */}
            <Text
              size="xl"
              fw={700}
              style={{ cursor: 'pointer', color: '#8ecae6', flexShrink: 0 }}
              onClick={() => router.push('/')}
            >
              GUESS.IO
            </Text>

            {/* Center slot — injected by pages that need it (e.g. lobby) */}
            {centerSlot && (
              <Box style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>{centerSlot}</Box>
            )}

            {/* Right side — three states */}
            {!isLoggedIn ? (
              // No session — show guest name input + play button + Google sign in
              <Group gap="sm" align="center">
                <TextInput
                  placeholder="Name (optional)"
                  size="sm"
                  value={guestName}
                  onChange={(e) => setGuestName(e.currentTarget.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleGuestLogin();
                  }}
                  maxLength={20}
                  error={nameError ? ' ' : undefined}
                  title={nameError ? 'Name must be 2–20 characters' : undefined}
                  styles={{
                    input: {
                      backgroundColor: '#1f2a3a',
                      borderColor: nameError ? '#fa5252' : '#33465f',
                      color: 'white',
                      width: 160,
                    },
                  }}
                />
                <Button
                  size="sm"
                  onClick={handleGuestLogin}
                  disabled={!canSubmit}
                  loading={isSubmitting}
                  color={buttonThemes.primary.color}
                  c={buttonThemes.primary.textColor}
                  styles={{ root: { borderColor: buttonThemes.primary.borderColor } }}
                >
                  Play as Guest
                </Button>

                <Divider orientation="vertical" color="#33465f" />

                <Button
                  size="sm"
                  variant="outline"
                  leftSection={<GoogleIcon />}
                  onClick={loginWithGoogle}
                  styles={{ root: { borderColor: '#33465f', color: '#e6edf3' } }}
                >
                  Sign in
                </Button>
              </Group>
            ) : user?.isGuest ? (
              // Guest session
              <Menu shadow="md" width={220}>
                <Menu.Target>
                  <Group gap="sm" style={{ cursor: 'pointer' }}>
                    <Avatar radius="xl" color="cyan">
                      {user.name?.[0]?.toUpperCase() ?? 'G'}
                    </Avatar>
                    <Text>{user.name}</Text>
                  </Group>
                </Menu.Target>

                <Menu.Dropdown
                  styles={{ dropdown: { backgroundColor: '#243040', borderColor: '#33465f' } }}
                >
                  <Menu.Label c="dimmed">Playing as guest</Menu.Label>
                  <Menu.Item leftSection={<IconPencil size={16} />} onClick={openNameModal}>
                    Edit Name
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconUserPlus size={16} />}
                    onClick={loginWithGoogle}
                    style={{ color: '#8ecae6' }}
                  >
                    Create permanent account
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item leftSection={<IconLogout size={16} />} color="red" onClick={logout}>
                    Leave
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            ) : (
              // Logged in player/admin
              <Menu shadow="md" width={200}>
                <Menu.Target>
                  <Group gap="sm" style={{ cursor: 'pointer' }}>
                    <Avatar radius="xl" src={user?.profilePicture} />
                    <Text>{user?.name}</Text>
                  </Group>
                </Menu.Target>

                <Menu.Dropdown
                  styles={{ dropdown: { backgroundColor: '#243040', borderColor: '#33465f' } }}
                >
                  <Menu.Item leftSection={<IconPencil size={16} />} onClick={openNameModal}>
                    Edit Name
                  </Menu.Item>
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
                  <Menu.Item leftSection={<IconLogout size={16} />} color="red" onClick={logout}>
                    Logout
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            )}
          </Group>
        </Container>
      </header>
    </>
  );
}
