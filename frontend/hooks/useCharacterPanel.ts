import { useState } from 'react';
import { type GridItemData } from '@components/Board/GridCard';

export type CharacterPanelView = 'grid' | 'add' | 'edit' | 'import';

interface PanelState {
  view: CharacterPanelView;
  currentCharacter: GridItemData | null;
}

export function useCharacterPanel() {
  const [state, setState] = useState<PanelState>({
    view: 'grid',
    currentCharacter: null,
  });

  return {
    view: state.view,
    currentCharacter: state.currentCharacter,
    openAdd: () => setState({ view: 'add', currentCharacter: null }),
    openEdit: (character: GridItemData) => setState({ view: 'edit', currentCharacter: character }),
    openImport: () => setState({ view: 'import', currentCharacter: null }),
    // Returns to the character grid from any sub-view
    close: () => setState({ view: 'grid', currentCharacter: null }),
  };
}
