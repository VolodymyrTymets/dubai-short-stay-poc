const ACCESS_TOKEN_KEY = 'dss_access_token'

type Listener = () => void
const listeners = new Set<Listener>()

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
  listeners.forEach((listener) => listener())
}

// WHY: a client-side route change (e.g. navigate('/') right after signIn/signUp) doesn't
// remount or re-render sibling components like Header/Topbar on its own, so Account needs an
// explicit subscription to know the token changed rather than re-reading it only on mount.
export function subscribeToAccessToken(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
