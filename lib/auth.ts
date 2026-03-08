import { betterAuth } from 'better-auth'
import { mongodbAdapter } from 'better-auth/adapters/mongodb'
import { nextCookies } from 'better-auth/next-js'
import { MongoClient } from 'mongodb'

const MONGO_CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING ?? ''

if (!MONGO_CONNECTION_STRING) {
  throw new Error('MONGO_CONNECTION_STRING environment variable is not set.')
}

const client = new MongoClient(MONGO_CONNECTION_STRING)
const db = client.db(`scaffolding-${process.env.NODE_ENV}`)

export const auth = betterAuth({
  // Omit `client` from the adapter options — passing it enables transaction
  // support, which requires a replica set. A standalone MongoDB instance
  // (local dev, Atlas free tier M0, etc.) will throw:
  // "Transaction numbers are only allowed on a replica set member or mongos"
  database: mongodbAdapter(db),
  emailAndPassword: {
    enabled: true,
  },
  // nextCookies must be the last plugin — it intercepts Set-Cookie headers
  // so that server actions and RSCs can set cookies correctly in Next.js
  plugins: [nextCookies()],
})
