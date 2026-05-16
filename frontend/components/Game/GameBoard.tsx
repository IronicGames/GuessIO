import { SimpleGrid } from '@mantine/core';
import { type CharacterDto } from '@shared/types/character.types';
import { GameCharacterCard } from './GameCharacterCard';

interface GameBoardProps {
  characters: CharacterDto[];        // the 24 drawn characters for this game
  crossedOffIds: Set<string>;        // local frontend state — never sent to server
  selectedId: string | null;         // highlighted card (guess target or character selection)
  yourCharacterId: string | null;    // shows YOU badge
  // crossoff → click toggles cross-off (default during your turn outside SUBMIT)
  // select   → click selects the card (GUESS phase or CHARACTER_SELECTION)
  // locked   → no interactions (opponent's turn, GAME_OVER, etc.)
  mode: 'crossoff' | 'select' | 'locked';
  onCrossOff: (id: string) => void;
  onSelect: (id: string) => void;
}

export function GameBoard({
  characters,
  crossedOffIds,
  selectedId,
  yourCharacterId,
  mode,
  onCrossOff,
  onSelect,
}: GameBoardProps) {
  return (
    <SimpleGrid
      cols={{ base: 3, sm: 4, md: 6 }}
      spacing="xs"
      style={{ height: '100%', alignContent: 'start', overflowY: 'auto', padding: 4 }}
    >
      {characters.map((character) => (
        <GameCharacterCard
          key={character.id}
          characterId={character.id}
          name={character.name}
          imageUrl={character.image?.imageUrl}
          isCrossedOff={crossedOffIds.has(character.id)}
          isSelected={selectedId === character.id}
          isYourCharacter={yourCharacterId === character.id}
          mode={mode}
          onClick={() => {
            if (mode === 'crossoff') onCrossOff(character.id);
            else if (mode === 'select') onSelect(character.id);
          }}
        />
      ))}
    </SimpleGrid>
  );
}
