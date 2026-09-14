export type AvatarProps = {
  initials: string
  size?: number
  /** The gold double-ring highlight state from Components.html — a box-shadow, not a single Tailwind ring utility (no two-color ring token exists). */
  ring?: boolean
  className?: string
}

export function Avatar({ initials, size = 40, ring = false, className }: AvatarProps) {
  return (
    <div
      className={`shrink-0 rounded-full flex items-center justify-center bg-navy-900 ${className ?? ''}`}
      style={{
        width: size,
        height: size,
        boxShadow: ring ? '0 0 0 2px var(--color-surface), 0 0 0 4px var(--color-gold-500)' : undefined,
      }}
    >
      {/* initials scale with the avatar itself (no discrete size token for this) — ratio matches Components.html's 40px/15px and 48px/18px pairs */}
      <span className="font-semibold leading-none text-gold-300" style={{ fontSize: size * 0.375 }}>
        {initials}
      </span>
    </div>
  )
}
