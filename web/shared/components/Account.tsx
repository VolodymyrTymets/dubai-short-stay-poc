import { useSyncExternalStore, type ReactNode } from 'react'
import { Link } from 'react-router'
import { useAccountQuery } from '../api/generated.graphql'
import { getAccessToken, subscribeToAccessToken } from '../api/token'

function computeInitials(firstName?: string | null, lastName?: string | null): string {
  const initials = `${firstName?.trim()?.[0] ?? ''}${lastName?.trim()?.[0] ?? ''}`.toUpperCase()
  return initials || '?'
}

const signInLinkClass =
  'flex items-center h-11 px-4 rounded-full border border-line-strong bg-surface text-sm font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-line-focus'

export type AccountProps = {
  /** Sizes the loading placeholder; the real avatar's size is up to `children`. */
  size?: number
  signInHref?: string
  className?: string
  children: (initials: string) => ReactNode
}

export function Account({ size = 40, signInHref = '/sign-in', className, children }: AccountProps) {
  const hasToken = useSyncExternalStore(subscribeToAccessToken, () => !!getAccessToken())
  const { data, loading, error } = useAccountQuery({ skip: !hasToken })

  if (hasToken && loading) {
    return (
      <div
        aria-hidden="true"
        className="shrink-0 rounded-full bg-subtle animate-pulse"
        style={{ width: size, height: size }}
      />
    )
  }

  // WHY: a query error here is almost always an expired/invalid stored token, not a transient
  // network blip — re-authenticating (the sign-in link) is the actual recovery action, so it
  // doubles as this view's "error, with retry" state rather than a separate retry button.
  if (!hasToken || error || !data) {
    return (
      <Link to={signInHref} className={`${signInLinkClass} ${className ?? ''}`}>
        Sign in
      </Link>
    )
  }

  return <>{children(computeInitials(data.account.AccountProfile?.firstName, data.account.AccountProfile?.lastName))}</>
}
