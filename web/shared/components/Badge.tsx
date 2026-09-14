import type { ReactNode } from 'react'
import { BoltIcon } from './icons'

/**
 * Tone, not domain status — no `ReservationStatus`/booking vocabulary here.
 * The consuming screen maps its own domain status to one of these five tones.
 */
export type BadgeTone = 'success' | 'warning' | 'info' | 'danger' | 'neutral'

const toneClasses: Record<BadgeTone, { bg: string; text: string; dot: string }> = {
  success: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-700' },
  warning: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-700' },
  info: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-700' },
  danger: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-700' },
  neutral: { bg: 'bg-stone-100', text: 'text-stone-600', dot: 'bg-stone-600' },
}

const pill = 'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap'

export function StatusBadge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  const c = toneClasses[tone]
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

/** The plain white chip from Components.html's "curated" badges — the navy backdrop it's shown on there is the photo/swatch behind it, not part of the badge itself. */
export function CuratedBadge({ children }: { children: ReactNode }) {
  return <span className={`${pill} bg-surface shadow-pill text-ink`}>{children}</span>
}

const countToneClasses = {
  neutral: 'bg-stone-100 text-ink-secondary', // Tabs
  'gold-soft': 'bg-gold-100 text-ink', // light/host Sidebar
  'gold-solid': 'bg-primary text-on-primary', // dark/admin Sidebar
} as const

export function CountBadge({
  tone = 'neutral',
  children,
}: {
  tone?: keyof typeof countToneClasses
  children: ReactNode
}) {
  return <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${countToneClasses[tone]}`}>{children}</span>
}
