This represents my blank slate for a new personal project, complete with my following default choices:

- [shadcn/ui](https://ui.shadcn.com)
- Next.js
- TypeScript
- Tailwind CSS
- PostHog
- BetterAuth
- MongoDB

## First setup and verification

Use Node.js 26.13.0 (`nvm use`) and the pnpm version pinned in `package.json`.

1. Run `pnpm install --frozen-lockfile`.
2. Copy `.env.sample` to `.env.local` and configure MongoDB, an auth secret,
   and the local auth URL. Keep credentials in environment files, never source.
3. Run `pnpm run dev`. Browser PostHog is optional and disabled without a public key.
4. Run `pnpm run ci` before opening a PR: lint, generated route types and
   TypeScript checks, then a production build. No test runner is configured.

The unused `lib/posthog-server.ts` helper still requires a key in production;
configure it before adding server analytics callers.

The CI build uses placeholder auth settings and a localhost MongoDB URI.
It verifies compilation, not database connectivity or working authentication.
For deployment, provide real environment settings and use the same Node/pnpm
versions and frozen-lockfile install. Verify sign-up, sign-in, and sign-out
against an isolated development database before using this seed for a product.

## Creating MongoDB indexes

Set `MONGO_CONNECTION_STRING` in `.env.local`, then run
`NODE_ENV=development pnpm run create-indexes`. The command targets only
`scaffolding-development`; `NODE_ENV=test` and `NODE_ENV=production` explicitly
select the corresponding database. It never loops over multiple environments.
Replace the scaffold collection/index definitions before adopting them in a new
project. Rename the database prefix consistently in `lib/auth.ts` and
`lib/mongo-client.ts`. Index creation changes the selected database; it is not a
validation command and is not run in CI.

## shadcn/ui + Tailwind

- Legacy default: Tailwind v3 + shadcn `default` style
- For new apps prefer Tailwind v4 + new-york style (see pantry-iq, mail-flow)
- NO full Tailwind v4 migration on existing scaffolds

## Package manager

Use pnpm 11.24.0, pinned in `package.json`. Corepack is not bundled with Node 26. Bootstrap pnpm explicitly with
`npm install --global pnpm@11.24.0` if pnpm is not available.
Run `pnpm install --frozen-lockfile` after cloning. Commit `pnpm-lock.yaml`
when dependencies change; do not generate npm or Yarn lockfiles.

## Node.js runtime

Use Node.js 26.13.0 for local development, validation, and deployment.
The runtime is declared in `package.json` and `.nvmrc`.

Dependency build scripts are reviewed in `pnpm-workspace.yaml`. Preserve explicit
allow/deny decisions; review new requests rather than enabling every script.
