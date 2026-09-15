import { useEffect, useRef, useSyncExternalStore, type ReactNode } from 'react'
import { useApolloClient } from '@apollo/client'
import { Link } from 'react-router'
import { useAccountQuery } from '../api/generated.graphql'
import { getAccessToken, subscribeToAccessToken, clearAccessToken } from '../api/token'

function computeInitials(firstName?: string | null, lastName?: string | null): string {
  const initials = `${firstName?.trim()?.[0] ?? ''}${lastName?.trim()?.[0] ?? ''}`.toUpperCase()
  return initials || '?'
}

const pillLinkClass =
  'flex items-center h-11 px-4 rounded-full border border-line-strong bg-surface text-sm font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-line-focus'

export type AccountProps = {
  /** Sizes the loading placeholder; the real avatar's size is up to `children`. */
  size?: number
  signInHref?: string
  className?: string
  children: (initials: string) => ReactNode
}

export function Account({ size = 40, signInHref = '/sign-in', className, children }: AccountProps) {
  const token = useSyncExternalStore(subscribeToAccessToken, getAccessToken)
  const client = useApolloClient()
  const previousToken = useRef(token)

  // WHY: `skip: !token` only reacts to token presence flipping, not to *which* token it is —
  // signing in again (an expired token refreshed, or a different account entirely) keeps
  // `!!token` at `true` throughout, so useAccountQuery would silently keep serving the old
  // cached/errored result. Resetting the store on an actual token-value change (not on mount,
  // where the initial fetch below already uses the current token) forces a real refetch.
  useEffect(() => {
    if (previousToken.current !== token) {
      previousToken.current = token
      client.resetStore().catch(() => {})
    }
  }, [token, client])

  const { data, loading, error, refetch } = useAccountQuery({ skip: !token })
  const isAuthError = error?.graphQLErrors.some((gqlError) => gqlError.extensions?.code === 'UNAUTHENTICATED') ?? false

  // WHY: an expired/invalid token that isn't cleared would keep re-firing this same failing
  // query (and keep being sent as a dead bearer token) on every future render.
  useEffect(() => {
    if (isAuthError) {
      clearAccessToken()
    }
  }, [isAuthError])

  if (token && loading) {
    return (
      <div
        role="status"
        aria-label="Loading account"
        className={`shrink-0 rounded-full bg-subtle animate-pulse ${className ?? ''}`}
        style={{ width: size, height: size }}
      />
    )
  }

  if (error && !isAuthError) {
    return (
      <button type="button" onClick={() => refetch()} className={`${pillLinkClass} ${className ?? ''}`}>
        Retry
      </button>
    )
  }

  if (!token || error || !data) {
    return (
      <Link to={signInHref} className={`${pillLinkClass} ${className ?? ''}`}>
        Sign in
      </Link>
    )
  }

  return <>{children(computeInitials(data.account.AccountProfile?.firstName, data.account.AccountProfile?.lastName))}</>
}
