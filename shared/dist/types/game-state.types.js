// ─── Phase & action enums ─────────────────────────────────────────────────────
export var GamePhase;
(function (GamePhase) {
    GamePhase["CHARACTER_SELECTION"] = "CHARACTER_SELECTION";
    GamePhase["DECIDE"] = "DECIDE";
    GamePhase["SUBMIT"] = "SUBMIT";
    GamePhase["RESOLVE"] = "RESOLVE";
    GamePhase["END_TURN"] = "END_TURN";
    GamePhase["GAME_OVER"] = "GAME_OVER";
})(GamePhase || (GamePhase = {}));
export var TurnAction;
(function (TurnAction) {
    TurnAction["ASK"] = "ASK";
    TurnAction["GUESS"] = "GUESS";
})(TurnAction || (TurnAction = {}));
