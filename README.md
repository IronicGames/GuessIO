# Guess.io

playguess.io is a browser-based online multiplayer game inspired by Guess Who. The goal is to allow players to quickly make their own custom character sets to play privately with their friends or to use our premade character sets to play privately with their friends or in matchmade games against the public.

## Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **Backend**: Node.js, Express, TypeScript, Prisma
- **Database**: PostgreSQL (Docker)
- **Testing**: Vitest

## Quick Start

### Prerequisites

- Node.js
- Docker Desktop

### Setup

```bash
git clone https://github.com/Peze01/GuessIO.git
cd guess-io
npm run setup
```

This will:

- Start PostgreSQL in Docker
- Install all dependencies
- Run database migrations

### Development

**Start everything(do this from the root directory):**

```bash
npm run dev
```

**Or start individually:**

Terminal 1 - Database:

```bash
npm run docker:up
```

Terminal 2 - Backend:

```bash
cd backend
npm run dev
```

Terminal 3 - Frontend:

```bash
cd frontend
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- Database: localhost:5432

## Useful Commands

### From Root

**Development:**

- `npm run dev` - Start database + backend + frontend
- `npm run docker:up` - Start database
- `npm run docker:down` - Stop database
- `npm run docker:clean` - Reset database (deletes all data)
- `npm run docker:logs` - View database logs

**Code Quality:**

- `npm run beautify` - Format and fix linting
- `npm run checkbeauty` - Check formatting and linting

### From Backend

**Development:**

- `npm run dev` - Start dev server with hot reload
- `npm test` - Run tests in watch mode

**Database:**

- `npm run db:studio` - Open Prisma Studio (visual DB editor)
- `npm run db:migrate` - Create and run migration
- `npm run db:seed` - Seed database with test data
- `npm run db:reset` - Reset database (destructive!)

### From Frontend

**Development:**

- `npm run dev` - Start Next.js dev server
- `npm test` - Run tests in watch mode

## Project Structure

```
guess-io/
├── frontend/          # Next.js app
├── backend/           # Express API + Prisma
├── docker-compose.yml # PostgreSQL setup
└── README.md
```
