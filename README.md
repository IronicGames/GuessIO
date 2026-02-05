# Guess.io

playguess.io is a browser-based online multiplayer game inspired by Guess Who. The goal is to allow players to quickly make their own custom character sets to play privately with their friends or to use our premade character sets to play privately with their friends or in matchmade games against the public.

## Project Structure

```
guess-io/
├── frontend/          # Next.js frontend
├── backend/           # Express backend
```

## Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **Backend**: Node.js, Express, TypeScript
- **Testing**: Vitest
- **Code Quality**: ESLint, Prettier

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

1. Clone the repository:

```bash
   git clone
   cd guessio
```

2. Install dependencies for both frontend and backend:

```bash
   cd backend && npm install
   cd ../frontend && npm install
```

3. Set up environment variables:

```bash
   # Backend
   cd backend
   cp .env.example .env

   # Frontend (if needed)
   cd ../frontend
   cp .env.local.example .env.local
```

### Running Locally

**Backend** (Terminal 1):

```bash
cd backend
npm run dev
```

Backend runs on `http://localhost:8080`

**Frontend** (Terminal 2):

```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:3000`

### Important Scripts

From the **root**:

- `npm run checkbeauty` - Check formatting on all code with lint and prettier
- `npm run beautify` - Fix formatting on all code with lint and prettier
- `npm run checkbeauty:frontend` - Check formatting on all code with lint and prettier for frontend
- `npm run checkbeauty:backend` - Check formatting on all code with lint and prettier for backend
- `npm run beautify:frontend` - Fix formatting on all code with lint and prettier for frontend
- `npm run beautify:backend` - Fix formatting on all code with lint and prettier for backend

From **backend/**:

- `npm run dev` - Start dev server with hot reload
- `npm run build` - Build for production
- `npm run test:run` - Runs tests.

From **frontend/**:

- `npm run dev` - Start Next.js dev server
- `npm run build` - Build for production


## Branches
- `master` - used for live deployments (never change this directly)
- `develop`- active development branch
- `feature/{branch_name}` - create these when you want to add a feature to the develop branch. After merge requests are approved, merge them into develop branch.
