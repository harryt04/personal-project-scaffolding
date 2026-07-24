# AGENTS.md

Guidance for agentic coding assistants working in this repository.

## Project Overview

Next.js 16 (App Router) + React 18 + TypeScript scaffold. Authentication via
better-auth, UI via shadcn/ui + Tailwind CSS, database via MongoDB native
driver, analytics via PostHog.

## Commands

```bash
npm run dev          # start dev server (Turbopack)
npm run build        # production build
npm run lint         # ESLint (next/core-web-vitals)
npm run prettify     # Prettier format entire project
npx tsc --noEmit     # type-check without emitting
npm run create-indexes  # create MongoDB indexes via Gulp
```

There is no test runner configured. Do not fabricate test commands.

## Repository Structure

```
app/
  (dashboard)/       # authenticated route group — layout owns SidebarProvider
    layout.tsx       # session guard + AppSidebar shell; redirects to /login
    page.tsx         # home route (/)
  api/auth/[...all]/ # better-auth catch-all handler
  login/             # public auth page
  layout.tsx         # root layout: fonts, ThemeProvider, PostHog
  globals.css        # Tailwind base + CSS custom properties
components/
  custom/            # app-specific components
  ui/                # shadcn/ui primitives (do not hand-edit; use CLI)
hooks/               # shared React hooks (e.g. use-mobile)
lib/
  auth.ts            # better-auth server instance (MongoDB adapter)
  auth-client.ts     # better-auth React client
  mongo-client.ts    # MongoDB singleton
  utils.ts           # cn() helper
models/              # MongoDB collection types (currently empty)
providers/           # React context providers
proxy.ts             # Next.js proxy (replaces middleware.ts in Next 16)
```

## Routing Conventions

- **Authenticated pages** go under `app/(dashboard)/`. The group layout
  validates the session server-side and redirects unauthenticated users to
  `/login`. No per-page session check needed.
- **Public pages** (e.g. `/login`) live directly under `app/` outside any
  route group.
- Next.js 16 uses `proxy.ts` (not `middleware.ts`). Export a function named
  `proxy`, not `middleware`.

## Authentication (better-auth)

- Server-side session: `auth.api.getSession({ headers: await headers() })`
- Client-side hook: `authClient.useSession()` from `@/lib/auth-client`
- Named client exports: `signIn`, `signUp`, `signOut`, `useSession`,
  `getSession` — import directly from `@/lib/auth-client`
- The `nextCookies()` plugin **must** remain the last entry in `auth.plugins`
- Do **not** pass `client` to `mongodbAdapter()` — it enables transactions
  which require a replica set; standalone/Atlas M0 instances will error

## Proxy (proxy.ts)

- Uses `getSessionCookie()` for a fast, edge-compatible optimistic redirect
- This is **not** a cryptographic session validation; always call
  `auth.api.getSession()` server-side before serving sensitive data
- Add new protected path prefixes to the `protectedPrefixes` array

## shadcn/ui

- Add components via CLI: `npx shadcn@latest add <component>`
- Do **not** manually edit files in `components/ui/` — regenerate via CLI
- After adding a component, verify import paths reference `@/hooks/` and
  `@/lib/utils` (the CLI occasionally emits `@/components/hooks/` or
  `@/components/lib/utils` incorrectly — fix those by hand if they appear)
- `components.json` config: style `default`, base color `neutral`, CSS
  variables enabled, no prefix
- Legacy default: Tailwind v3 + shadcn `default` style
- For new apps prefer Tailwind v4 + new-york style (see pantry-iq, mail-flow)
- NO full Tailwind v4 migration on existing scaffolds

## Code Style

### Formatting (Prettier)

- No semicolons (`semi: false`)
- Single quotes (`singleQuote: true`)
- Trailing commas everywhere (`trailingComma: 'all'`)
- Tailwind class sorting via `prettier-plugin-tailwindcss`
- Run `npm run prettify` before committing

### TypeScript

- `strict: true` with `noImplicitAny: false` (implicit `any` is tolerated but
  explicit types are preferred)
- `strictNullChecks: true` — handle null/undefined explicitly
- Path alias `@/*` maps to the project root (e.g. `@/lib/auth`)
- Prefer `interface` for object shapes passed as props; `type` for unions and
  utility types

### Naming

- **Files/directories**: `kebab-case` (e.g. `login-card.tsx`, `app-sidebar.tsx`)
- **React components**: `PascalCase` function declarations, named exports
  preferred (`export function Foo` or `export { Foo }` at the bottom)
- **Non-component exports**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE` for env vars; `camelCase` for in-code
  constants

### Imports

- Group order (Prettier/ESLint enforces automatically):
  1. React / Next.js framework imports
  2. Third-party packages
  3. Internal aliases (`@/lib/...`, `@/components/...`, `@/hooks/...`)
- No barrel `index.ts` files — import directly from the source file

### React & Next.js

- Default to React Server Components; add `'use client'` only when needed
  (event handlers, hooks, browser APIs)
- Async Server Components may `await` directly at the top level
- Use `cn()` from `@/lib/utils` for all conditional className composition
- `suppressHydrationWarning={true}` is set on `<body>` — do not remove it

### Error Handling

- Validate required env vars at module load time with an explicit `throw new
Error(...)` (see `lib/auth.ts` and `lib/mongo-client.ts` for the pattern)
- In client components, surface auth errors via local state
  (`setError(err.message ?? 'Fallback message.')`)
- Do not swallow errors silently

## Environment Variables

Required in `.env.local` (see `.env.sample` for the template):

```
BETTER_AUTH_SECRET=        # min 32 chars; generate: openssl rand -base64 32
BETTER_AUTH_URL=http://localhost:3000
MONGO_CONNECTION_STRING=   # standalone or Atlas URI
NEXT_PUBLIC_POSTHOG_KEY=   # optional; PostHog is no-op if unset in dev
NEXT_PUBLIC_POSTHOG_HOST=
```

## MongoDB

- Singleton client in `lib/mongo-client.ts`; import `getMongoClient()` for
  ad-hoc queries
- `lib/auth.ts` creates its own `MongoClient` instance for better-auth — this
  is intentional (separate connection lifecycle)
- Database name is `scaffolding-${NODE_ENV}` (e.g. `scaffolding-development`)
- Define collection types in `models/`; register collection names in
  `mongoDBConfig.collections` inside `lib/mongo-client.ts`
- Run `npm run create-indexes` after adding new indexes in `lib/mongo-utils.ts`
