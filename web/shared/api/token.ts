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

export function clearAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  listeners.forEach((listener) => listener())
}

// WHY: a client-side route change (e.g. navigate('/') right after signIn/signUp) doesn't
// remount or re-render sibling components like Header/Topbar on its own, so Account needs an
// explicit subscription to know the token changed rather than re-reading it only on mount.
// Also forwards the cross-tab `storage` event (fired in *other* tabs on the same origin, never
// the tab that made the change) so a sign-in/out in one tab is reflected in another.
export function subscribeToAccessToken(listener: Listener): () => void {
  listeners.add(listener)
  window.addEventListener('storage', listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', listener)
  }
}
