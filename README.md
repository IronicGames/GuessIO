# Guess.io

A browser-based multiplayer guessing game inspired by Guess Who. Build a board of custom characters and play with a friend — one player picks a secret character, the other has to figure out who it is by asking questions.

Two game modes:

- **Casual Mode** — ask whatever you want, over chat or voice. Fully honour-based.
- **Tag Mode** — pick a tag from a list; the system automatically answers yes or no based on the character's attributes.

Play privately with friends using a lobby code, or get matched against strangers in public games.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), React, Mantine UI v7, TypeScript, TanStack Query |
| Backend | Express.js, Prisma ORM, PostgreSQL |
| Auth | Google OAuth + guest mode; JWT in httpOnly cookies |
| Real-time | Socket.io *(in progress)* |
| Image storage | AWS S3 *(base64 through Express as a temporary stopgap)* |
| Frontend hosting | AWS Amplify |
| Backend hosting | AWS EC2 t3.micro |

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

Runs on `http://localhost:3000`. The frontend expects `NEXT_PUBLIC_API_URL=http://localhost:8080/api` — create a `.env.local` file if it doesn't exist.

### Run everything at once

```bash
npm run dev   # from repo root — starts DB + backend + frontend
```

---

## Useful commands

### Root

| Command | What it does |
|---|---|
| `npm run dev` | Start DB + backend + frontend |
| `npm run docker:up` | Start PostgreSQL |
| `npm run docker:down` | Stop PostgreSQL |
| `npm run docker:clean` | Reset database (destructive) |
| `npm run beautify` | Format and fix linting across the repo |
| `npm run checkbeauty` | Check formatting and linting |

### Backend

| Command | What it does |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npx vitest run` | Run all tests (72 tests, real DB, no mocks) |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:migrate` | Create and run a migration |
| `npm run db:reset` | Reset the database (destructive) |

### Frontend

| Command | What it does |
|---|---|
| `npm run dev` | Start Next.js dev server |

---

## What's built

- Google OAuth login + guest mode
- Board management (create, edit, delete, image upload)
- Character management (name, image, tags)
- Full board management UI
- Auth flow with session persistence and upgrade prompts
- Backend test suite (72 tests)

## What's being built for v1

In this order:

1. **Socket.io integration** — unblocks everything real-time
2. **Private lobby** — real-time synced room, board/character selection, lobby settings, chat
3. **Gameplay** — Casual Mode and Tag Mode, phase-based turns, timers, cross-offs
4. **Public matchmaking** — always Tag Mode with fixed settings
5. **S3 image upload** — swap out the base64 temp solution
6. **Profile, settings, donation, ToS pages** — launch blockers

See [CLAUDE.md](CLAUDE.md) for full project context, conventions, and build decisions.
