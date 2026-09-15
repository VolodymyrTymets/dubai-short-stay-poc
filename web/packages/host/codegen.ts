import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: process.env.VITE_GRAPHQL_URL ?? 'http://localhost:3001/graphql',
  documents: ['src/**/*.{ts,tsx}', '../../shared/api/**/*.graphql'],
  ignoreNoDocuments: true,
  generates: {
    './src/gql/': {
      preset: 'client',
      presetConfig: {
        gqlTagName: 'gql',
      },
      config: {
        useTypeImports: true,
      },
    },
  },
}

export default config
