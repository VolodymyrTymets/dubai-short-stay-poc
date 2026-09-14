import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ApolloProvider } from '@apollo/client'
import './index.css'
import App from './App.tsx'
import { createApolloClient } from '../../../shared/apollo/client'

const client = createApolloClient(
  import.meta.env.VITE_GRAPHQL_URL ?? 'http://localhost:3001/graphql',
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </StrictMode>,
)
