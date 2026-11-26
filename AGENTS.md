# AGENTS.md


Guidance for agentic coding assistants working in this repository.

## Project Overview

Next.js 16 (App Router) + React 19 + TypeScript scaffold. Authentication via
better-auth, UI via UI SDK + Tailwind CSS 4, database via MongoDB native
driver, analytics via PostHog.

## Commands

```bash
pnpm run dev          # start dev server (Turbopack)
pnpm run build        # production build
pnpm run lint         # ESLint (next/core-web-vitals)
pnpm run prettify     # Prettier format entire project
pnpm run typecheck    # generate route types and type-check without emitting
pnpm run create-indexes  # create indexes for an explicitly selected NODE_ENV
```

Run `pnpm test` for the agent policy tests (Node test runner with tsx).

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
  ui/                # styled UI SDK wrappers and layout components
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

## UI SDK

UI SDK supplies unstyled controls with keyboard, focus and accessibility behavior and agent-readable state. The beta postdates model training data. Read `node_modules/@ui-sdk/react/docs/llms.txt` and `node_modules/@ui-sdk/core/skills/ui-sdk/SKILL.md` before touching components, then consult the installed component page. Both packages are exact-pinned together.

App code imports from `@/components/ui`. Add a wrapper there using the component entry, for example `@ui-sdk/react/menu`. Never run `shadcn add` or regenerate these wrappers, which would reintroduce Radix or Base UI. Use the existing Tailwind 4 theme, keep the UI SDK layer declaration first, and opt into global SDK styles only after checking links and overlay geometry. The SDK owns its slot names. Use separate app attributes for selectors and tests. Controlled inputs need `onValueChange`; use stable values for options and tab/panel pairs. Portal popups outside forms and check Escape and focus return.

The sidebar is a layout composition. It and React Hook Form retain Radix Slot for child composition, as does Button when rendering a link. Resizable retains react-resizable-panels for split-pane sizing. Theme icons remain on Radix Icons. Card, Skeleton and Typography are presentational. The starter keeps the toast hook and renderer as adapters to the SDK queue.

The root mounts `providers/agent-bridge.tsx` once. Review every new interactive control in `lib/agent-policy.ts` and add tests in `lib/agent-policy.test.ts`. Scope navigation and ordinary text edits by route and exact accessible name. Only register text fields that do not persist sensitive changes. Reads use the SDK snapshot and query tools. Unknown actions and confirmation-marked operations are denied. Mark sensitive values with `data-agent-secret` and sensitive actions with `data-agent-confirm`. Authentication, account or settings changes, payments and destructive actions require human interaction.

## Code Style

### Formatting (Prettier)

- No semicolons (`semi: false`)
- Single quotes (`singleQuote: true`)
- Trailing commas everywhere (`trailingComma: 'all'`)
- Tailwind class sorting via `prettier-plugin-tailwindcss`
- Run `pnpm run prettify` before committing

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
NEXT_PUBLIC_POSTHOG_KEY=   # optional; browser PostHog is disabled if unset
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
- Run `pnpm run create-indexes` after adding new indexes in `lib/mongo-utils.ts`

## PR gate

`pnpm run ci` (lint + tests + typecheck + build). GitHub Actions runs this on PRs to master.

Index creation requires `NODE_ENV=development`, `test`, or `production` and
loads `.env.local`; see README before running this database mutation.
