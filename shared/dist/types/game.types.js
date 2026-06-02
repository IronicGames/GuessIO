// Mirrors Prisma enums — must be kept in sync manually
export var GameResult;
(function (GameResult) {
    GameResult["WIN"] = "WIN";
    GameResult["DRAW"] = "DRAW";
    GameResult["ABANDONED"] = "ABANDONED";
})(GameResult || (GameResult = {}));
export var GameResultReason;
(function (GameResultReason) {
    GameResultReason["CORRECT_GUESS"] = "CORRECT_GUESS";
    GameResultReason["LIVES_EXHAUSTED"] = "LIVES_EXHAUSTED";
    GameResultReason["TIMEOUT"] = "TIMEOUT";
    GameResultReason["DISCONNECT"] = "DISCONNECT";
    GameResultReason["MUTUAL_SKIP"] = "MUTUAL_SKIP";
})(GameResultReason || (GameResultReason = {}));
export var LogActionType;
(function (LogActionType) {
    LogActionType["ASK"] = "ASK";
    LogActionType["GUESS"] = "GUESS";
    LogActionType["SKIP"] = "SKIP";
})(LogActionType || (LogActionType = {}));
