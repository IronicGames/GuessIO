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
| Real-time        | Socket.io — integrated, lobby system complete                          |
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
npx prisma migrate dev
npm run dev
```

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
- Guest and player name editing from the header (JWT re-issued, DB updated for
  players)
- Board management — create, edit, delete, image upload (base64 stopgap)
- Character management — name, image, tags; many-to-many boards; import flow
- Full board management UI
- Auth flow with session persistence and upgrade prompts
- **Private lobby — fully working end to end:**
  - Create lobby → navigate → join (10s grace period handles navigation
    reconnect)
  - Join via lobby link (single-click copy) or code input on home page
  - Three phases: board selection → character config → waiting for ready
  - Board confirm broadcasts full board data to both players over socket
  - Character toggle grid with tag filter; min 24 enabled required to proceed
  - Settings (mode / turn timer / lives) sync in real time; locked for joiner
  - Ready / Unready; game starting overlay fires on both clients simultaneously
  - Auto host transfer on disconnect; kick / transfer host
  - Chat with 200-char server-side cap; auto-scroll
  - Player chips + connection dots + invite pill in header
- Backend test suite (72 tests)

## What's being built / in progress

- **Game starting navigation** — countdown overlay works; navigates nowhere
  until game page exists
- **Image upload via S3** — base64 through Express works but is a stopgap

## What's to be built for v1

In this order:

1. **DB schema: GameInstance + GameLogEntry** — must exist before any gameplay
   code
2. **Gameplay — Casual Mode** — phase-based turns, cross-offs, timers,
   disconnect handling
3. **Gameplay — Tag Mode** — collapsible tags list, tag selection, auto-answer
4. **Public matchmaking** — always Tag Mode with fixed settings
5. **S3 image upload** — swap out base64 stopgap
6. **One premade board + pipeline** — needed for public matchmaking
7. **Profile, settings, donation, ToS pages** — launch blockers

See [CLAUDE.md](CLAUDE.md) for full project context, conventions, and build
decisions.
