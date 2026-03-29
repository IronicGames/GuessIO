# Guess.io — Claude Code Context

This file is read automatically by Claude Code at the start of every session.
Keep it up to date as the project evolves. When finishing a session, ask Claude Code
to suggest updates based on what was built, review them, and commit the changes.

---

## Project Overview

Browser-based multiplayer game inspired by Guess Who. Players create custom character
boards and play privately with friends or in public matchmade games. Standard board is
6×4, customisable up to 10×10. Two game modes: Chat Mode (free-form questions) and
Tag Mode (pick from predefined tags).

**Domain:** playguess.io
**Target:** v1.0 launch

---

## Repo Structure

```
/
├── frontend/        Next.js + React + Mantine + TypeScript
├── backend/         Express + Prisma + TypeScript
├── shared/          Shared types and game constants only
└── CLAUDE.md        This file
```

---

## Stack (treat as fixed unless explicitly told otherwise)

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), React, Mantine UI v7, TypeScript, TanStack Query |
| Backend | Express.js, Prisma ORM, PostgreSQL (AWS RDS) |
| Auth | Google OAuth + httpOnly cookies, JWT |
| Real-time | Socket.io (designed, not yet integrated) |
| Image storage | AWS S3 signed URLs (not yet implemented — currently base64 through Express as temp solution) |
| Frontend hosting | AWS Amplify |
| Backend hosting | AWS EC2 t3.micro |

---

## Design Document

Full design document lives on Notion (section 11 has live development status).
All key decisions from it are captured in this file.

---

## User Roles & Identity

Three identity types:

| Type | DB row | Cookie | Role in JWT |
|---|---|---|---|
| Guest | No | httpOnly, 90-day maxAge | `GUEST` |
| Player | Yes | httpOnly, session (no maxAge) | `PLAYER` |
| Admin | Yes (manually promoted) | httpOnly, session | `ADMIN` |

- JWT payload shape: `{ id, name, role, isGuest, profilePicture? }` — matches `UserProfile` type
- Guests have no DB row — their identity lives entirely in the JWT
- Guest names are optional — backend generates one via `uniqueNamesGenerator` if omitted
- Names are not unique identifiers — do not use name as an identity key
- All JWT tokens currently use 90-day expiry (`expiresIn: '90d'`) regardless of role
- Guest banning is explicitly deferred to post-v1 (inherently weak without fingerprinting)

---

## Auth Middleware Pattern

```typescript
// Always compose in this order — never skip requireAuth
router.use(requireAuth);                          // attaches req.user, handles unauthenticated
router.use(requireRole('PLAYER', 'ADMIN'));        // handles wrong role

// Guest short-circuit pattern in controllers — req.user is the full JWT payload
if (req.user.isGuest) {
  res.json({ id: req.user.id, name: req.user.name, role: req.user.role, isGuest: true });
  return;
}
```

Board and character routes are protected at router level in `app.ts` —
do not add per-route guards inside board/character route files.

---

## What Is Built

### Backend
- `schema.prisma` — `Role` enum (`GUEST`, `PLAYER`, `ADMIN`), `User`, `Board`, `Character`, `Image` models; `role` on `User` defaults to `PLAYER`
- `auth.service.ts` — `generateToken` (signs `UserProfile` as JWT, 90-day expiry), `verifyToken`, `createGuestToken`, `handleGoogleCallback`, `getGoogleAuthUrl`
- `auth.middleware.ts` — `requireAuth` (reads cookie, attaches `req.user: UserProfile`), `requireRole(...roles)`
- `auth.controller.ts` — `loginAsGuest`, `getUserProfile` (guest-compatible — returns JWT payload directly for guests), `getCurrentUser` (PLAYER/ADMIN only — fetches full user from DB), `initiateGoogleLogin`, `handleGoogleCallback`
- `auth.route.ts` — `POST /auth/loginAsGuest` (no auth), `GET /auth/profile` (requireAuth, guest-compatible), `GET /auth/me` (requireAuth + requireRole PLAYER/ADMIN — DB users only), `POST /auth/logout`
- `validation.schemas.ts` — Zod schemas for boards, characters, auth; `guestLoginSchema` (name optional, 2–20 chars if provided)
- `board.service.ts` / `character.service.ts` — business logic + DTO mapping (`ToBoardDto`, `ToCharacterDto`)
- `board.repository.ts` / `character.repository.ts` — Prisma queries
- `app.ts` — `express.json({ limit: '10mb' })`, board routes protected at router level; characters nested under boards (`/api/boards/:boardId/characters`)
- `error-handler.middleware.ts` — handles `entity.too.large` → 413, Prisma errors, JWT errors, `AppError`

### Frontend — Auth & Layout
- `auth-provider.tsx` — `loginWithGoogle` (redirect to `NEXT_PUBLIC_API_URL/auth/google`), `loginAsGuest` (POST + refresh), `logout`, `loading` flag; renders children immediately
- `AuthModal.tsx` — `reason: 'session' | 'needs-account'`; session is non-dismissible; needs-account is dismissible; Google login only
- `AppHeader.tsx` — three states: no session (guest name input + Play as Guest + Sign in), guest (upgrade menu), player/admin (profile menu with /profile and /settings links)
- `HomePageButton.tsx` — `locked` prop renders muted button with lock icon, fires `onLockedClick` instead of navigating
- `page.tsx` (home) — controls `authModalOpen` state; Manage Boards locked for non-players/non-admins; links to /game/public, /game/lobby/create, /donate (pages not yet built)

### Frontend — Board Management UI
- `ContentPaper.tsx` — `overflow: hidden`; no Stack wrapper; children manage their own scroll
- `BackButton.tsx` — shared icon-only arrow (`#8ecae6`), used in FormShell and GridContainer
- `LoadingOverlay.tsx` — `mode="screen"` (full screen) or `mode="overlay"` (absolutely positioned, needs `position: relative` on parent)
- `FormShell.tsx` — flex layout: scrollable content area (`overflowY: auto`) + pinned footer buttons (`flexShrink: 0`)
- `BoardForm.tsx` — name, description, image, isPublic (SegmentedControl, admin-only)
- `CharacterForm.tsx` — name, image, tags (admin-only via TagsInput); no description field (removed by design)
- `ImageUploadSection.tsx` — square 1:1 preview, clickable to upload, URL input mutually exclusive, 5MB client-side check before FileReader
- `GridCard.tsx` — discriminated union: `variant: 'item'` or `variant: 'action'`
- `ItemGrid.tsx` — `actionCards?: ActionCardConfig[]` array instead of boolean flags
- `GridContainer.tsx` — `actionCards`, `onBack` (renders BackButton), search
- `useCharacterPanel.ts` — view state: `'grid' | 'add' | 'edit' | 'import'`
- `useBoardMutations.ts` — all 6 board/character mutations, async onSuccess, exposes `isPending` + `pendingLabel`
- `boards/[boardId]/page.tsx` — guard order: loading → error → board existence → ownership → render; LoadingOverlay on right panel; responsive stacked (mobile) / side-by-side (md+)
- `boards/page.tsx` — boards list with create action card
- `boards/create/page.tsx` — uses BoardForm directly with inline useMutation

---

## Conventions — Always Follow These

**Guard order in pages:**
```typescript
if (isLoading) return <LoadingOverlay mode="screen" status="loading" />;
if (error) return <LoadingOverlay mode="screen" status="error" text={...} />;
const item = data?.find(...);
if (!item) return <LoadingOverlay mode="screen" status="error" text="Not found" />;
if (user?.id !== item.userId) return <LoadingOverlay mode="screen" status="error" text="..." />;
// render
```

**Mutation hooks:**
```typescript
// Always await invalidation before firing the callback — prevents stale flash
onSuccess: async () => { await invalidateQueries(...); options.onDone(); }
```

**LoadingOverlay overlay mode:**
```typescript
// Parent must have position: relative
<Box style={{ position: 'relative', height: '100%' }}>
  <LoadingOverlay mode="overlay" visible={mutations.isPending} message={mutations.pendingLabel} />
  {/* content */}
</Box>
```

**Action cards — never add new boolean flag props to GridContainer/ItemGrid:**
```typescript
// Always pass as actionCards array
actionCards={[
  { id: 'add', icon: <IconPlus />, label: 'Add', onClick: handler },
  { id: 'import', icon: <IconUpload />, label: 'Import', disabled: condition, onClick: handler },
]}
```

**Navigation vs form actions:**
- `BackButton` = navigation (top of panel, icon only)
- Cancel button in FormShell footer = form action (discard changes)
- Never conflate the two

**Auth composability:**
- `requireAuth` always before `requireRole` — never skip requireAuth
- Protect at router level in `app.ts` where possible, not per-route

**Mantine v7 quirks:**
- `styles` pseudo-selectors (`&:hover`) don't work reliably — use React state + `onMouseEnter`/`onMouseLeave`
- `gap` on `Stack` does not accept responsive objects — use a fixed `MantineSpacing` value
- `Stack align="center"` shrinks children to content width — use intentionally

**Next.js 15+:**
- `params` is a Promise — unwrap with `use(params)`
- `useEffect` cannot take async functions directly

**General:**
- No `any` in TypeScript — use proper types or casts with explanation
- Shared package is for types and game constants only — no secrets, no env vars, no Zod schemas (validation lives in `backend/src/middleware/validation/`)
- Frontend reads env via `NEXT_PUBLIC_API_URL` directly — no shared config object with backend

---

## Environment Variables

**Backend `.env`:**
```
POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DB
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI
JWT_SECRET        ← note: was JWS_SECRET in original (typo, now fixed)
FRONTEND_URL, BACKEND_URL, PORT
NODE_ENV          ← drives config.deployment, not hardcoded
```

**Frontend `.env.local`:**
```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

`NEXT_PUBLIC_API_URL` includes the `/api` base path. Endpoints in `shared/endpoints.ts`
do NOT include `/api` (e.g. `/boards`, `/auth/profile`) — the base URL provides it.
Production values are injected via AWS Amplify (frontend) and EC2 environment (backend) —
never change URLs in code between environments.

---

## Still To Do / Known Issues

| Item | Priority | Notes |
|---|---|---|
| Socket.io integration | High | Zero lines wired. Auth pattern designed (reads token from `socket.handshake.auth.token`). Blocks lobby, gameplay, and chat. |
| Lobby system | High | Private lobby creation, join codes, host controls, turn timer, board selection, lobby chat |
| Gameplay — Chat Mode | High | Turn system (Ask/Guess), question highlighting, Yes/No/Ask Again, cross-offs (frontend only), guess mechanic, win condition |
| Gameplay — Tag Mode | High | Tag search box UI, pick-a-tag flow (premade boards only in v1) |
| Public matchmaking | High | Finding match screen, board voting, random board pick |
| S3 signed URL image upload | High (pre-launch) | Current base64-through-Express is temporary. Backend generates signed URL, frontend uploads directly to S3. `express.json({ limit: '10mb' })` is a stopgap. |
| One premade board + pipeline | High | Needed for v1. Tag Mode only works on premade boards. |
| Donation button | Must-have v1 | Not yet built |
| ToS / Privacy Policy pages | Must-have v1 | Not yet built |
| Profile page | Must-have v1 | `/profile` linked from header but page doesn't exist |
| Settings page | Must-have v1 | `/settings` linked from header but page doesn't exist |
| Admin panel UI | Medium | `requireRole('ADMIN')` guards exist on backend, no admin UI built |
| Match history | Medium | `GameParticipant` model not yet added to schema. Needs `userId?`, `displayName`, `isGuest`, `outcome` |
| Guest banning | Deferred post-v1 | Inherently weak without device fingerprinting |
| Tag Mode for custom boards | Deferred post-v1 | Explicitly out of v1 scope |
| Mobile compatibility | Could-have | Responsive layouts started but not fully tested |

## Known Technical Debt

- `boards/[boardId]/page.tsx` fetches all boards and finds the target by ID client-side instead of calling `GET /api/boards/:boardId` directly. Inefficient at scale.
- All JWT tokens use 90-day expiry regardless of role. Player/admin cookies are session-scoped (browser-close clears cookie) but the JWT itself remains valid 90 days.
- Character `description` field removed by design (March 2026). Databases created before this date need `npx prisma migrate dev`.
- `isPublic` on boards is admin-only in the UI. Regular players always create private boards and cannot change this themselves.

---

## How to Update This File

At the end of a working session, run:
```
Based on what we built today, suggest updates to CLAUDE.md to reflect current project state.
```

Review the suggestions, apply them, and commit. Both devs should `git pull` before
starting a new session to ensure they have the latest context.
