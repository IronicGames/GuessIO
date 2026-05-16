import { Button, Stack, Text, Title } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { type GameResult, type GameResultReason, GameResult as Result } from '@shared/types/game.types';

interface GameOverBannerProps {
  result: GameResult;
  resultReason: GameResultReason;
  winnerIsPlayer1: boolean | null;
  isPlayer1: boolean;
}

const REASON_LABELS: Record<GameResultReason, string> = {
  CORRECT_GUESS:    'Correct guess',
  LIVES_EXHAUSTED:  'Lives exhausted',
  TIMEOUT:          'Time ran out',
  DISCONNECT:       'Opponent disconnected',
  MUTUAL_SKIP:      'Both players skipped too many times',
};

export function GameOverBanner({
  result,
  resultReason,
  winnerIsPlayer1,
  isPlayer1,
}: GameOverBannerProps) {
  const router = useRouter();

  const iWon  = result === Result.WIN && winnerIsPlayer1 === isPlayer1;
  const iLost = result === Result.WIN && winnerIsPlayer1 !== isPlayer1;

  const title =
    iWon               ? 'You win!'
    : iLost            ? 'You lose'
    : result === Result.DRAW      ? 'Draw'
    : 'Game abandoned';

  const titleColor = iWon ? '#4caf7d' : iLost ? '#fa5252' : '#6b7f96';

  return (
    <Stack gap="sm" p="xs" align="center">
      <Title order={3} c={titleColor}>
        {title}
      </Title>
      <Text fz="sm" c="#6b7f96">
        {REASON_LABELS[resultReason]}
      </Text>
      <Button
        variant="outline"
        color="#8ecae6"
        size="sm"
        onClick={() => router.push('/')}
      >
        Back to home
      </Button>
      {/* TODO: rematch flow — create a new lobby with the same players and settings */}
    </Stack>
  );
}
