import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'

export default defineConfig([
  ...nextVitals,
  {
    // Legacy generated shadcn skeleton; regenerate the primitive to fix its random width.
    files: ['components/ui/sidebar.tsx'],
    rules: { 'react-hooks/purity': 'warn' },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
])
