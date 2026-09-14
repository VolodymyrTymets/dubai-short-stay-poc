import type { ReactNode } from 'react'
import { BoltIcon } from './icons'

export type BadgeStatus = 'confirmed' | 'awaiting' | 'pending' | 'cancelled' | 'draft'

const statusClasses: Record<BadgeStatus, { bg: string; text: string; dot: string }> = {
  confirmed: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-700' },
  awaiting: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-700' },
  pending: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-700' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-700' },
  draft: { bg: 'bg-stone-100', text: 'text-stone-600', dot: 'bg-stone-600' },
}

const pill = 'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap'

export function StatusBadge({ status, children }: { status: BadgeStatus; children: ReactNode }) {
  const c = statusClasses[status]
  return (
    <span className={`${pill} ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {children}
    </span>
  )
}

export function InstantBookBadge() {
  return (
    <span className={`${pill} bg-gold-50 text-ink-accent`}>
      <BoltIcon size={12} strokeWidth={2} />
      Instant Book
    </span>
  )
}

export type BadgeProps = {
  variant?: 'outline' | 'solid'
  children: ReactNode
  className?: string
}

export function Badge({ variant = 'outline', children, className }: BadgeProps) {
  const variantClass =
    variant === 'solid' ? 'bg-secondary text-on-secondary' : 'bg-surface border border-line-strong text-ink'
  return <span className={`${pill} ${variantClass} ${className ?? ''}`}>{children}</span>
}

export function CuratedBadge({ children }: { children: ReactNode }) {
  return (
    <div className="p-2.5 rounded-xl bg-navy-600">
      <span className={`${pill} bg-surface shadow-pill text-ink`}>{children}</span>
    </div>
  )
}

export function CountBadge({ children }: { children: ReactNode }) {
  return (
    <span className="text-xs font-medium text-ink-secondary bg-stone-100 rounded-full px-2 py-0.5">
      {children}
    </span>
  )
}
