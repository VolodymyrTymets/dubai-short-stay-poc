export type LogoProps = {
  variant?: 'light' | 'dark'
  /** Wordmark font size in px — the design system doesn't token this, sizes come from the mockups (28 default, 26 in Header). */
  size?: number
  className?: string
}

export function Logo({ variant = 'light', size = 28, className }: LogoProps) {
  const textColor = variant === 'dark' ? 'text-ink-inverse' : 'text-ink'

  return (
    <div className={`flex items-center gap-2.5 ${className ?? ''}`}>
      <svg
        width={size + 6}
        height={size + 6}
        viewBox="0 0 32 32"
        fill="none"
        className="block shrink-0"
        aria-hidden="true"
      >
        <path
          d="M17 3.5 A12.5 12.5 0 1 0 17 28.5"
          stroke="var(--color-gold-500)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <circle cx="14.5" cy="16" r="3.6" fill="var(--color-gold-500)" />
      </svg>
      <div
        className={`font-serif font-medium leading-none whitespace-nowrap -tracking-[0.2px] ${textColor}`}
        style={{ fontSize: size }}
      >
        Dubai
        <span className="italic text-gold">Short</span>
        Stay
      </div>
    </div>
  )
}
