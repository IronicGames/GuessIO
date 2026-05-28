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
  Text,
  TextInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useAuth } from '@providers/auth-provider';
import { useHeaderSlot } from '@providers/header-slot-provider';
import { IconLogout, IconPencil, IconUserPlus } from '@tabler/icons-react';
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

  const guestTrimmed = guestName.trim();
  const guestNameError = guestTrimmed.length > 0 && (guestTrimmed.length < 2 || guestTrimmed.length > 20);
  const canSubmitGuest = !guestNameError && !isSubmitting;

  const handleGuestLogin = async () => {
    if (!canSubmitGuest) return;
    setIsSubmitting(true);
    try {
      await loginAsGuest(guestTrimmed || undefined);
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

  // ── Inline name edit state ─────────────────────────────────────
  const [isEditingName, setIsEditingName] = useState(false);
  const [editInput, setEditInput] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);

  const openNameEdit = () => {
    setEditInput(user?.name ?? '');
    setIsEditingName(true);
  };

  const cancelNameEdit = () => {
    setIsEditingName(false);
    setEditInput('');
  };

  const editTrimmed = editInput.trim();
  const editNameError = editTrimmed.length > 0 && (editTrimmed.length < 2 || editTrimmed.length > 20);
  const canSaveName =
    !editNameError && editTrimmed.length >= 2 && editTrimmed !== user?.name && !isSavingName;

  const handleSaveName = async () => {
    if (!canSaveName) return;
    setIsSavingName(true);
    try {
      await updateName(editTrimmed);
      setIsEditingName(false);
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

          {/* Center slot — injected by pages that need it (e.g. lobby, game) */}
          {centerSlot && (
            <Box style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>{centerSlot}</Box>
          )}

          {/* Right side — three states: not logged in / editing name / logged in */}
          {!isLoggedIn ? (
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
                error={guestNameError ? ' ' : undefined}
                title={guestNameError ? 'Name must be 2–20 characters' : undefined}
                styles={{
                  input: {
                    backgroundColor: '#1f2a3a',
                    borderColor: guestNameError ? '#fa5252' : '#33465f',
                    color: 'white',
                    width: 160,
                  },
                }}
              />
              <Button
                size="sm"
                onClick={handleGuestLogin}
                disabled={!canSubmitGuest}
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
          ) : isEditingName ? (
            // Inline name edit — same pattern as guest login input
            <Group gap="sm" align="center">
              <TextInput
                autoFocus
                size="sm"
                value={editInput}
                onChange={(e) => setEditInput(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') cancelNameEdit();
                }}
                maxLength={20}
                error={editNameError ? ' ' : undefined}
                title={editNameError ? 'Name must be 2–20 characters' : undefined}
                styles={{
                  input: {
                    backgroundColor: '#1f2a3a',
                    borderColor: editNameError ? '#fa5252' : '#33465f',
                    color: 'white',
                    width: 160,
                  },
                }}
              />
              <Button
                size="sm"
                onClick={handleSaveName}
                disabled={!canSaveName}
                loading={isSavingName}
                color={buttonThemes.primary.color}
                c={buttonThemes.primary.textColor}
                styles={{ root: { borderColor: buttonThemes.primary.borderColor } }}
              >
                Save
              </Button>
              <Button size="sm" variant="subtle" c="#6b7f96" onClick={cancelNameEdit}>
                Cancel
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
                <Menu.Item leftSection={<IconPencil size={16} />} onClick={openNameEdit}>
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
            // Logged-in player / admin
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
                <Menu.Item leftSection={<IconPencil size={16} />} onClick={openNameEdit}>
                  Edit Name
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
  );
}
