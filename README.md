# Guess.io

A browser-based multiplayer guessing game inspired by Guess Who. Build a board
of custom characters and play with a friend — one player picks a secret
character, the other has to figure out who it is by asking questions.

Two game modes:

- **Casual Mode** — ask whatever you want, over chat or voice. Fully
  honour-based.
- **Tag Mode** — pick a tag from a list; the system automatically answers yes or
  no based on the character's attributes.

Play privately with friends using a lobby link, or get matched against strangers
in public games.

---

## Stack

| Layer            | Technology                                                             |
| ---------------- | ---------------------------------------------------------------------- |
| Frontend         | Next.js (App Router), React, Mantine UI v7, TypeScript, TanStack Query |
| Backend          | Express.js, Prisma ORM, PostgreSQL                                     |
| Auth             | Google OAuth + guest mode; JWT in httpOnly cookies                     |
| Real-time        | Socket.io — lobby + game, fully integrated                             |
| Image storage    | AWS S3 _(base64 through Express as a temporary stopgap)_               |
| Frontend hosting | AWS Amplify                                                            |
| Backend hosting  | AWS EC2 t3.micro                                                       |

---

## Repo structure

```
/
├── frontend/          Next.js app
├── backend/           Express API + Prisma
├── shared/            Shared TypeScript types and constants
├── docker-compose.yml Local PostgreSQL
└── CLAUDE.md          Project context for Claude Code
```

---

## Running locally

### Prerequisites

- Node.js 20+
- Docker Desktop (for local PostgreSQL)

### 1. Start the database

```bash
npm run docker:up
```

### 2. Backend

```bash
cd backend
cp .env.example .env   # fill in DB credentials and secrets
npm install
npx prisma migrate dev --name init
npm run dev
```

> **Migration note (dev only):** While the schema is actively changing pre-launch,
> nuke and re-run rather than adding incremental migrations:
> `rm -rf prisma/migrations && npx prisma migrate dev --name init`

Runs on `http://localhost:8080`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:3000`.

Create a `.env.local` file in `frontend/` if it doesn't exist:

```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:8080
```

Note: `NEXT_PUBLIC_API_URL` includes `/api`. `NEXT_PUBLIC_SOCKET_URL` is the
server root — Socket.io connects there, not to the REST base.

### Run everything at once

```bash
npm run dev   # from repo root — starts DB + backend + frontend
```

---

## Useful commands

### Root

| Command                | What it does                           |
| ---------------------- | -------------------------------------- |
| `npm run dev`          | Start DB + backend + frontend          |
| `npm run docker:up`    | Start PostgreSQL                       |
| `npm run docker:down`  | Stop PostgreSQL                        |
| `npm run docker:clean` | Reset database (destructive)           |
| `npm run beautify`     | Format and fix linting across the repo |
| `npm run checkbeauty`  | Check formatting and linting           |

### Backend

| Command              | What it does                                |
| -------------------- | ------------------------------------------- |
| `npm run dev`        | Start dev server with hot reload            |
| `npx vitest run`     | Run all tests (72 tests, real DB, no mocks) |
| `npm run db:studio`  | Open Prisma Studio                          |
| `npm run db:migrate` | Create and run a migration                  |
| `npm run db:reset`   | Reset the database (destructive)            |

### Frontend

| Command       | What it does             |
| ------------- | ------------------------ |
| `npm run dev` | Start Next.js dev server |

---

## What's built

- Google OAuth login + guest mode (auto-guest-login on Create Lobby)
- Inline name editing from the header for both guests and full accounts (same UX as the guest name input — no modal)
- Board management — create, edit, delete, image upload (base64 stopgap)
- Character management — name, image, tags; many-to-many boards; import flow
- Board export / import (`.guessio` ZIP format with manifest + integrity check)
- Auth flow with session persistence and upgrade prompts
- **Private lobby — fully working end to end:**
  - Create lobby → navigate → join (10s grace period handles navigation reconnect)
  - Join via lobby link or code input on home page
  - Three phases: board selection → character config → waiting for ready
  - Settings (mode / turn timer / lives) sync in real time
  - Ready / Unready; 3-second countdown overlay navigates both clients to game
  - Auto host transfer on disconnect; kick / transfer host; in-lobby chat
- **Casual Mode gameplay — fully working end to end:**
  - Both players secretly pick a character from the 24 drawn for the game
  - Turn-based: DECIDE (ask or guess?) → SUBMIT → END_TURN → repeat
  - Cross-offs are frontend-only (intentional — not persisted)
  - Wrong guess deducts a life; correct guess or lives exhausted ends the game
  - Game over screen shows win/lose/draw with reason label
  - Disconnect handling: 10s grace → auto-skip turn; 5 consecutive skips → opponent wins
  - Reconnect resets the skip counter and cancels the skip timer
  - "Pick random" picks a secret character for you
  - Turn timer (30s / 1m / 3m / off) — counts down in GameInfo; auto-advances turn on expiry for connected players
  - Game timer (30 min) — global clock visible to both players; ends in draw on expiry; turns red in final 60s
  - Game log tab — real-time running history of all actions; seeds correctly on reconnect
- Backend test suite (72 tests)

- Public Match button visible on home page with "Coming soon" indicator (non-interactive)

## What's in progress

- **Gameplay — Tag Mode** — phase structure built; only the ASK resolver is missing
  (pick a tag → server answers yes/no based on opponent's character)
- **Image upload via S3** — base64 through Express works but is a stopgap

## What's to be built for v1

1. **S3 image upload** — swap out base64 stopgap; biggest technical liability before real users
2. **Donation button** — not built
3. **ToS / Privacy Policy pages** — not built
4. **Admin panel UI** — backend guards exist; no frontend
5. **Tag Mode ASK resolver** — `game:submit-ask` server handler + tag-pick UI (post-v1 candidate)
6. **Public matchmaking** — depends on Tag Mode (post-v1 candidate)
7. **Game log REST API** — `GET /api/game/:id/log` for when the profile page gets built

See [CLAUDE.md](CLAUDE.md) for full project context, conventions, and build
decisions.
