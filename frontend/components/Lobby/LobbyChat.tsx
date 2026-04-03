'use client';

import { Box, Button, Group, Text, TextInput } from '@mantine/core';
import { IconSend } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import { buttonThemes } from '@styles/buttonThemes';
import { type ChatMessage } from '@shared/types/lobby.types';

interface LobbyChatProps {
  messages: ChatMessage[];
  currentUserName: string;
  onSend: (text: string) => void;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function LobbyChat({ messages, currentUserName, onSend }: LobbyChatProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setInput('');
  };

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box
        style={{
          flexShrink: 0,
          padding: '10px 12px 8px',
          borderBottom: '1px solid #33465f',
        }}
      >
        <Text size="sm" fw={600} c="#e6edf3">
          Chat
        </Text>
      </Box>

      {/* Message list */}
      <Box style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
        {messages.length === 0 && (
          <Text size="xs" c="#6b7f96" ta="center" style={{ marginTop: 16 }}>
            No messages yet
          </Text>
        )}
        {messages.map((msg) => (
          <Box key={msg.id} mb={6}>
            <Group gap={6} align="baseline" wrap="nowrap">
              <Text
                size="xs"
                fw={700}
                c={msg.senderName === currentUserName ? '#8ecae6' : '#e6edf3'}
                style={{ flexShrink: 0 }}
              >
                {msg.senderName}
              </Text>
              <Text size="xs" c="#6b7f96" style={{ flexShrink: 0 }}>
                {formatTime(msg.timestamp)}
              </Text>
            </Group>
            <Text size="sm" c="#e6edf3" style={{ wordBreak: 'break-word' }}>
              {msg.text}
            </Text>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input row */}
      <Box
        style={{
          flexShrink: 0,
          padding: '8px 12px',
          borderTop: '1px solid #33465f',
        }}
      >
        <Group gap="xs">
          <TextInput
            style={{ flex: 1 }}
            placeholder="Say something…"
            size="sm"
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            maxLength={200}
            styles={{
              input: { backgroundColor: '#1f2a3a', borderColor: '#33465f', color: 'white' },
            }}
          />
          <Button
            size="sm"
            onClick={handleSend}
            disabled={!input.trim()}
            color={buttonThemes.primary.color}
            c={buttonThemes.primary.textColor}
            styles={{ root: { borderColor: buttonThemes.primary.borderColor, padding: '0 10px' } }}
          >
            <IconSend size={16} />
          </Button>
        </Group>
      </Box>
    </Box>
  );
}
