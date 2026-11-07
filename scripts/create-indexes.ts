import { closeMongoClient, mongoDBConfig } from '../lib/mongo-client'
import { createMongoDbIndexes } from '../lib/mongo-utils'

async function main() {
  if (
    !['development', 'test', 'production'].includes(process.env.NODE_ENV ?? '')
  ) {
    throw new Error(
      'Set NODE_ENV explicitly to development, test, or production.',
    )
  }
  try {
    await createMongoDbIndexes(mongoDBConfig.dbName)
  } finally {
    await closeMongoClient()
  }
}

main().catch((error) => {
  console.error(
    error instanceof Error ? error.message : 'Index creation failed',
  )
  process.exitCode = 1
})
