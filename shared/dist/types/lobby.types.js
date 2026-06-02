export var LobbyPhase;
(function (LobbyPhase) {
    LobbyPhase["BOARD_SELECTION"] = "BOARD_SELECTION";
    LobbyPhase["CHARACTER_CONFIG"] = "CHARACTER_CONFIG";
    LobbyPhase["WAITING_FOR_READY"] = "WAITING_FOR_READY";
})(LobbyPhase || (LobbyPhase = {}));
export var GameMode;
(function (GameMode) {
    GameMode["CASUAL"] = "CASUAL";
    GameMode["TAG"] = "TAG";
})(GameMode || (GameMode = {}));
export var TurnTimer;
(function (TurnTimer) {
    TurnTimer["OFF"] = "OFF";
    TurnTimer["THIRTY_SECONDS"] = "30s";
    TurnTimer["ONE_MINUTE"] = "1m";
    TurnTimer["THREE_MINUTES"] = "3m";
})(TurnTimer || (TurnTimer = {}));
export var Lives;
(function (Lives) {
    Lives["ONE"] = "1";
    Lives["THREE"] = "3";
    Lives["INFINITE"] = "INF";
})(Lives || (Lives = {}));
export function parseTurnTimer(t) {
    if (t === TurnTimer.THIRTY_SECONDS)
        return 30 * 1000;
    if (t === TurnTimer.ONE_MINUTE)
        return 60 * 1000;
    if (t === TurnTimer.THREE_MINUTES)
        return 180 * 1000;
    return null; // TurnTimer.OFF
}
export function parseLives(l) {
    if (l === Lives.ONE)
        return 1;
    if (l === Lives.THREE)
        return 3;
    return 0; // Lives.INFINITE — stored as 0 in DB convention
}
