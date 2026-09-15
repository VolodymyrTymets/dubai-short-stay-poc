import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { getAccessToken } from '../api/token'

export function createApolloClient(uri: string) {
  const authLink = setContext((_, prevContext) => {
    const token = getAccessToken()
    return {
      headers: {
        ...prevContext.headers,
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
    }
  })

  return new ApolloClient({
    link: authLink.concat(new HttpLink({ uri })),
    cache: new InMemoryCache(),
  })
}
