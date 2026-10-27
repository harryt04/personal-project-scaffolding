This represents my blank slate for a new personal project, complete with my following default choices:

- [shadcn/ui](https://ui.shadcn.com)
- Next.js
- TypeScript
- Tailwind CSS
- PostHog
- BetterAuth
- MongoDB

# Creating indexes for your own mongodb instance

1. Supply your `defaultConnectionString` in `lib/mongo-client.ts`
1. Run `pnpm run create-indexes` at the repo root to create indexes for the collections in your mongodb instance.
   - Gulp is a local development dependency; run `pnpm install --frozen-lockfile` if it is missing.

## shadcn/ui + Tailwind

- Legacy default: Tailwind v3 + shadcn `default` style
- For new apps prefer Tailwind v4 + new-york style (see pantry-iq, mail-flow)
- NO full Tailwind v4 migration on existing scaffolds

## Package manager

Use pnpm 11.24.0, pinned in `package.json`. Install it with
`npm install --global pnpm@11.24.0` if pnpm is not available.
Run `pnpm install --frozen-lockfile` after cloning. Commit `pnpm-lock.yaml`
when dependencies change; do not generate npm or Yarn lockfiles.

## Node.js runtime

Use Node.js 24 for local development, validation, and deployment.
The runtime is declared in `package.json` and `.nvmrc`.
