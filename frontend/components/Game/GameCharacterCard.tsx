import { AspectRatio, Badge, Box, Paper, Text } from '@mantine/core';

interface GameCharacterCardProps {
  characterId: string;
  name: string;
  imageUrl: string | undefined;
  isCrossedOff: boolean;
  isSelected: boolean;   // cyan highlight — active guess target or character selection
  isYourCharacter: boolean; // shows "YOU" badge
  // crossoff → click toggles cross-off (default during your turn)
  // select   → click selects as target (GUESS phase or CHARACTER_SELECTION)
  // locked   → not interactive (opponent's turn, RESOLVE phase, GAME_OVER)
  mode: 'crossoff' | 'select' | 'locked';
  onClick: () => void;
}

export function GameCharacterCard({
  name,
  imageUrl,
  isCrossedOff,
  isSelected,
  isYourCharacter,
  mode,
  onClick,
}: GameCharacterCardProps) {
  const isLocked = mode === 'locked';

  return (
    <Paper
      radius="md"
      withBorder
      onClick={isLocked ? undefined : onClick}
      style={{
        backgroundColor: '#243040',
        borderColor: isSelected ? '#8ecae6' : '#33465f',
        boxShadow: isSelected ? '0 0 0 2px rgba(142, 202, 230, 0.2)' : undefined,
        cursor: isLocked ? 'default' : 'pointer',
        opacity: isLocked ? 0.6 : 1,
        overflow: 'hidden',
        userSelect: 'none',
        transition: 'border-color 0.1s, box-shadow 0.1s',
      }}
    >
      {/* Image + overlays */}
      <Box style={{ position: 'relative' }}>
        <AspectRatio ratio={3 / 4}>
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={name}
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
          ) : (
            <Box
              style={{
                backgroundColor: '#1f2a3a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text c="#6b7f96" fz="xs">
                No image
              </Text>
            </Box>
          )}
        </AspectRatio>

        {/* Cross-off overlay */}
        {isCrossedOff && (
          <Box
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(18, 24, 32, 0.65)',
            }}
          >
            <svg
              style={{ width: '100%', height: '100%', display: 'block' }}
              preserveAspectRatio="none"
            >
              <line
                x1="0"
                y1="0"
                x2="100%"
                y2="100%"
                stroke="#fa5252"
                strokeWidth="2"
              />
            </svg>
          </Box>
        )}

        {/* "YOU" badge — your secret character */}
        {isYourCharacter && (
          <Badge
            size="xs"
            style={{
              position: 'absolute',
              bottom: 4,
              right: 4,
              backgroundColor: '#8ecae6',
              color: '#1b2430',
              fontWeight: 700,
            }}
          >
            YOU
          </Badge>
        )}
      </Box>

      {/* Name */}
      <Box p={6}>
        <Text
          fz="xs"
          fw={500}
          ta="center"
          lineClamp={1}
          c={isCrossedOff ? '#6b7f96' : '#e6edf3'}
        >
          {name}
        </Text>
      </Box>
    </Paper>
  );
}
