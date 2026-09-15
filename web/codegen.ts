import 'dotenv/config'
import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: `${process.env.VITE_GRAPHQL_URL}`,
  documents: ['shared/api/**/*.{js,ts}', '!src/api/**/generated.graphql.tsx'],
  ignoreNoDocuments: true,
  overwrite: true,
  generates: {
    'shared/api/generated.graphql.tsx': {
      plugins: [
        'typescript-operations',
        'typescript-react-apollo',
      ],
    },
    'introspection.json': {
      plugins: ['introspection'],
      config: {
        minify: true,
      },
    },
  },
  hooks: {
    afterAllFileWrite: 'prettier --write',
  },
}

export default config
