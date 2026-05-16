'use client';

import { Box, Button, Group, Tabs, Text, TextInput } from '@mantine/core';
import { IconSend } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import { buttonThemes } from '@styles/buttonThemes';
import { type ChatMessage } from '@shared/types/lobby.types';
import { type GameLogEntryDto, LogActionType } from '@shared/types/game.types';

interface GameChatLogProps {
  messages: ChatMessage[];
  log: GameLogEntryDto[];     // empty until game logic writes log entries
  currentUserName: string;
  onSend: (text: string) => void;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Formats a single game log entry as a human-readable string
function formatLogEntry(entry: GameLogEntryDto, currentUserName: string): string {
  const actor = entry.playerIsPlayer1 ? 'Player 1' : 'Player 2'; // TODO: use actual name when available
  const turnPrefix = `Turn ${entry.turnNumber}: ${actor}`;

  if (entry.actionType === LogActionType.ASK) {
    if (entry.subject) {
      // Tag Mode — subject is the tag name, result is Yes/No
      return `${turnPrefix} asked "${entry.subject}" → ${entry.result ?? '?'}`;
    }
    return `${turnPrefix} asked a question`;
  }

  if (entry.actionType === LogActionType.GUESS) {
    return `${turnPrefix} guessed ${entry.subject ?? '?'} — ${entry.result ?? '?'}`;
  }

  if (entry.actionType === LogActionType.SKIP) {
    return `${turnPrefix} skipped`;
  }

  return `${turnPrefix} took an action`;
}

function GameLogRow({ entry, currentUserName }: { entry: GameLogEntryDto; currentUserName: string }) {
  return (
    <Box mb={4}>
      <Text fz="xs" c="#6b7f96">
        {formatLogEntry(entry, currentUserName)}
      </Text>
    </Box>
  );
}

export function GameChatLog({ messages, log, currentUserName, onSend }: GameChatLogProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Auto-scroll log to bottom on new entries
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log.length]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setInput('');
  };

  return (
    <Tabs
      defaultValue="chat"
      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      <Tabs.List style={{ flexShrink: 0, borderBottom: '1px solid #33465f' }}>
        <Tabs.Tab value="chat" styles={{ tab: { color: '#e6edf3', fontSize: 13 } }}>
          Chat
        </Tabs.Tab>
        <Tabs.Tab value="log" styles={{ tab: { color: '#e6edf3', fontSize: 13 } }}>
          Game Log
        </Tabs.Tab>
      </Tabs.List>

      {/* Chat panel */}
      <Tabs.Panel
        value="chat"
        style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        {/* Message list */}
        <Box style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
          {messages.length === 0 && (
            <Text fz="xs" c="#6b7f96" ta="center" style={{ marginTop: 16 }}>
              No messages yet
            </Text>
          )}
          {messages.map((msg) => (
            <Box key={msg.id} mb={6}>
              <Group gap={6} align="baseline" wrap="nowrap">
                <Text
                  fz="xs"
                  fw={700}
                  c={msg.senderName === currentUserName ? '#8ecae6' : '#e6edf3'}
                  style={{ flexShrink: 0 }}
                >
                  {msg.senderName}
                </Text>
                <Text fz="xs" c="#6b7f96" style={{ flexShrink: 0 }}>
                  {formatTime(msg.timestamp)}
                </Text>
              </Group>
              <Text fz="sm" c="#e6edf3" style={{ wordBreak: 'break-word' }}>
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
              styles={{
                root: { borderColor: buttonThemes.primary.borderColor, padding: '0 10px' },
              }}
            >
              <IconSend size={16} />
            </Button>
          </Group>
        </Box>
      </Tabs.Panel>

      {/* Game log panel */}
      <Tabs.Panel
        value="log"
        style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}
      >
        {log.length === 0 ? (
          <Text fz="xs" c="#6b7f96" ta="center" fs="italic" style={{ marginTop: 16 }}>
            No actions yet
          </Text>
        ) : (
          log.map((entry) => (
            <GameLogRow key={entry.id} entry={entry} currentUserName={currentUserName} />
          ))
        )}
        <div ref={logEndRef} />
      </Tabs.Panel>
    </Tabs>
  );
}
