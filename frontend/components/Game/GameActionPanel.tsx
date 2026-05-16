import { Button, Stack, Text } from '@mantine/core';
import { type CharacterDto } from '@shared/types/character.types';
import { type GamePlayerState, GamePhase, TurnAction } from '@shared/types/game-state.types';
import { GameMode } from '@shared/types/lobby.types';

interface GameActionPanelProps {
  phase: GamePhase;
  isMyTurn: boolean;
  mode: GameMode;
  currentAction: TurnAction | null;
  selectedId: string | null; // currently highlighted card on the board
  selectedCharacter: CharacterDto | null; // looked up from drawnCharacters for display
  myPlayer: GamePlayerState | undefined;
  onChooseAction: (action: TurnAction) => void;
  onConfirmCharacter: () => void;
  onPickRandom: () => void;
  onSubmitAsk: () => void;
  onSubmitGuess: () => void; // uses selectedId — caller validates it's set
  onEndTurn: () => void;
}

export function GameActionPanel({
  phase,
  isMyTurn,
  mode,
  currentAction,
  selectedId,
  selectedCharacter,
  myPlayer,
  onChooseAction,
  onConfirmCharacter,
  onPickRandom,
  onSubmitAsk,
  onSubmitGuess,
  onEndTurn,
}: GameActionPanelProps) {
  return (
    <Stack gap="sm" p="xs">
      {/* ── CHARACTER_SELECTION ─────────────────────────────────────── */}
      {phase === GamePhase.CHARACTER_SELECTION && (
        <>
          {!myPlayer?.hasChosen ? (
            <>
              <Text fz="sm" c="#e6edf3">
                Select your secret character from the board
              </Text>
              <Button
                variant="outline"
                color="#8ecae6"
                size="sm"
                onClick={onPickRandom}
              >
                Pick random
              </Button>
              <Button
                variant="filled"
                color="#8ecae6"
                size="sm"
                disabled={!selectedId}
                onClick={onConfirmCharacter}
              >
                Confirm
              </Button>
            </>
          ) : (
            <Text fz="sm" c="#4caf7d">
              Ready! Waiting for opponent…
            </Text>
          )}
        </>
      )}

      {/* ── DECIDE ─────────────────────────────────────────────────── */}
      {phase === GamePhase.DECIDE && (
        <>
          {isMyTurn ? (
            <>
              <Text fz="sm" c="#6b7f96">
                Your turn — what will you do?
              </Text>
              <Button
                variant="filled"
                color="#8ecae6"
                size="sm"
                onClick={() => onChooseAction(TurnAction.ASK)}
              >
                Ask a question
              </Button>
              <Button
                variant="outline"
                color="#8ecae6"
                size="sm"
                onClick={() => onChooseAction(TurnAction.GUESS)}
              >
                Make a guess
              </Button>
            </>
          ) : (
            <Text fz="sm" c="#6b7f96" fs="italic">
              Waiting for opponent…
            </Text>
          )}
        </>
      )}

      {/* ── SUBMIT ─────────────────────────────────────────────────── */}
      {phase === GamePhase.SUBMIT && (
        <>
          {/* Ask — Casual Mode */}
          {currentAction === TurnAction.ASK && mode === GameMode.CASUAL && isMyTurn && (
            <>
              <Text fz="sm" c="#e6edf3">
                Ask your question — out loud, in voice chat, or use the chat
              </Text>
              <Button variant="filled" color="#8ecae6" size="sm" onClick={onSubmitAsk}>
                Done asking
              </Button>
            </>
          )}

          {/* Ask — Tag Mode (placeholder) */}
          {currentAction === TurnAction.ASK && mode === GameMode.TAG && isMyTurn && (
            <>
              {/* TODO: Tag Mode — show searchable tag selection list here */}
              <Text fz="sm" c="#6b7f96" fs="italic">
                Tag Mode coming soon
              </Text>
            </>
          )}

          {/* Guess */}
          {currentAction === TurnAction.GUESS && isMyTurn && (
            <>
              {selectedId ? (
                <>
                  <Text fz="sm" c="#e6edf3">
                    Guessing:{' '}
                    <Text component="span" fw={600}>
                      {selectedCharacter?.name ?? '…'}
                    </Text>
                  </Text>
                  <Button variant="filled" color="#8ecae6" size="sm" onClick={onSubmitGuess}>
                    Confirm guess
                  </Button>
                </>
              ) : (
                <>
                  <Text fz="sm" c="#e6edf3">
                    Select a character on the board to guess
                  </Text>
                  <Button variant="filled" color="#8ecae6" size="sm" disabled>
                    Confirm guess
                  </Button>
                </>
              )}
            </>
          )}

          {/* Opponent is submitting — nothing for this player to do */}
          {!isMyTurn && (
            <Text fz="sm" c="#6b7f96" fs="italic">
              Waiting for opponent…
            </Text>
          )}
        </>
      )}

      {/* ── RESOLVE ────────────────────────────────────────────────── */}
      {phase === GamePhase.RESOLVE && (
        <>
          {/* NOTE: RESOLVE is never reached in Casual Mode — it's skipped after SUBMIT+ASK.
              This phase is for Tag Mode (system auto-answers) and future Managed Mode
              (opponent clicks Yes/No in the UI). */}
          {/* TODO: Managed Mode — show opponent's question and Yes/No buttons for the answerer */}
          <Text fz="sm" c="#6b7f96" fs="italic">
            Resolving…
          </Text>
        </>
      )}

      {/* ── END_TURN ───────────────────────────────────────────────── */}
      {phase === GamePhase.END_TURN && (
        <>
          {isMyTurn ? (
            <>
              <Text fz="sm" c="#6b7f96">
                Cross off any characters on the board, then end your turn
              </Text>
              <Button variant="filled" color="#8ecae6" size="sm" onClick={onEndTurn}>
                End Turn
              </Button>
            </>
          ) : (
            <Text fz="sm" c="#6b7f96" fs="italic">
              Opponent is crossing off characters…
            </Text>
          )}
        </>
      )}

      {/* ── GAME_OVER ──────────────────────────────────────────────── */}
      {/* Handled by GameOverBanner rendered above the action panel in the page */}
      {phase === GamePhase.GAME_OVER && null}
    </Stack>
  );
}
