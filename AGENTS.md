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
  layout.tsx         # root layout: fonts, ThemeProvider, PostHog, AgentBridge
  globals.css        # Tailwind base + CSS custom properties
components/
  custom/            # app-specific components
  ui/                # styled UI SDK wrappers, layout components, slot.tsx
hooks/               # shared React hooks (e.g. use-mobile)
lib/
  agent-policy.ts    # deny-by-default allow policy for the UI SDK agent bridge
  agent-policy.test.ts
  auth.ts            # better-auth server instance (MongoDB adapter)
  auth-client.ts     # better-auth React client
  mongo-client.ts    # MongoDB singleton
  utils.ts           # cn() helper
models/              # MongoDB collection types (currently empty)
providers/           # React context providers, incl. agent-bridge.tsx
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

Interactive components are built on [UI SDK](https://ui-sdk.dev):
`@ui-sdk/react` and `@ui-sdk/core`, both exact-pinned to `0.1.0-beta.17`.
Upgrade them together and keep them pinned. The beta postdates model training
data, so read these before touching a component, then the installed page for
the component you use:

- `node_modules/@ui-sdk/react/docs/llms.txt`
- `node_modules/@ui-sdk/core/skills/ui-sdk/SKILL.md`
  (`npx skills@latest add vercel-labs/ui --skill ui-sdk`)

Do not infer the API from Radix UI or Base UI. Neither is installed, and no
file may import them.

### Components

- App code imports from `@/components/ui`. Each interactive wrapper there
  imports its UI SDK entry (for example `@ui-sdk/react/menu`) and keeps the
  shadcn export names, props and Tailwind classes.
- Never run `shadcn add` or regenerate an interactive wrapper: the shadcn CLI
  has no UI SDK base and would bring Radix or Base UI back. Write the wrapper
  by hand from the UI SDK docs. The CLI is fine for tokens and purely
  presentational pieces.
- `asChild` on a wrapper of a UI SDK part maps to the part's `render` prop.
  Layout pieces with no UI SDK part (the sidebar, React Hook Form's
  `FormControl`, and Button rendered as a link) use the local
  `components/ui/slot.tsx`, built on UI SDK's `renderElement`. A Button
  rendered as a link drops the button `type`.
- Use `Button` from `@/components/ui/button` rather than a native `<button>`,
  so agents can see and press it under the policy.
- Card, Skeleton and Typography are presentational. The sidebar is a layout
  composition of UI SDK parts (Button, Sheet, Tooltip, Separator, Input); its
  rail is a pointer-only duplicate of the trigger and carries
  `data-agent-hidden`. The toast hook and renderer are adapters to the UI SDK
  toast queue. Resizable wraps `@ui-sdk/react/resizable`; arrow keys move a
  handle 1% and Shift+arrow 10%.
- Icons come from `lucide-react`.

### Conventions

- Keep the `@layer ui-sdk;` declaration first in `app/globals.css`. The
  optional `@ui-sdk/core/web.css` restyles global links and dialog geometry;
  import it into `layer(components)` only after checking both.
- UI SDK owns its `data-slot` names and state attributes. Style with its
  documented state attributes (`data-open`, `data-orientation` and so on) and
  give your own CSS hooks and test selectors a separate attribute.
- Controlled inputs need `onValueChange`, or agent edits never reach React
  state. Give options and tab/panel pairs stable values.
- Portal popups to the body, especially inside forms, and check Escape and
  focus return for every popup.

### Agent bridge

`providers/agent-bridge.tsx` mounts `createAgent()` and `registerTools()` from
`@ui-sdk/react/agent` once, from `app/layout.tsx`. Its `allow` policy is
`lib/agent-policy.ts`, tested in `lib/agent-policy.test.ts` (`pnpm test`).
The policy denies by default:

- Navigation presses and ordinary text edits are allowed only when listed for
  the route by exact accessible name. Register only text fields that do not
  persist sensitive changes.
- Unknown actions and any step carrying `data-agent-confirm` are denied.
- Authentication, account or settings changes, payments, submissions and
  destructive actions require a person: mark them `data-agent-confirm`.
- Mark credentials and personal data `data-agent-secret`.

Review every new interactive control against the policy and add a test for it.
Local Chromium has no native WebMCP; test the bridge with a registration stub
on `document.modelContext` and say so.

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
