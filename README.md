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
1. Run `npm run create-indexes` at the repo root to create indexes for the collections in your mongodb instance.
   - If you get an error about gulp not being found, run `npm install -g gulp` to install gulp globally, then try again.

## shadcn/ui + Tailwind

- Legacy default: Tailwind v3 + shadcn `default` style
- For new apps prefer Tailwind v4 + new-york style (see pantry-iq, mail-flow)
- NO full Tailwind v4 migration on existing scaffolds
