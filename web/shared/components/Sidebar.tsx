import type { ReactNode } from 'react'

export type SidebarNavItem = {
  id: string
  label: string
  icon: ReactNode
  count?: number
}

export type SidebarProps = {
  variant?: 'light' | 'dark'
  groupLabel?: string
  items: SidebarNavItem[]
  activeId?: string
  onSelect?: (id: string) => void
}

export function Sidebar({ variant = 'light', groupLabel, items, activeId, onSelect }: SidebarProps) {
  const dark = variant === 'dark'

  return (
    <nav className={`w-64 p-4 rounded-2xl flex flex-col gap-1 ${dark ? 'bg-navy-900' : 'bg-cream-200'}`}>
      {groupLabel && (
        <div
          className={`px-3 pt-4 pb-1.5 font-mono text-[11px] font-medium uppercase tracking-[1.8px] ${
            dark ? 'text-navy-300' : 'text-ink-accent'
          }`}
        >
          {groupLabel}
        </div>
      )}
      {items.map((item) => {
        const active = item.id === activeId
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect?.(item.id)}
            aria-current={active ? 'page' : undefined}
            className={`flex items-center gap-3 h-10 px-3 rounded-lg text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-line-focus ${
              dark
                ? active
                  ? 'bg-navy-700 text-white font-semibold'
                  : 'text-navy-100 font-medium hover:bg-navy-800'
                : active
                  ? 'bg-surface shadow-[0_1px_2px_0_rgb(0_0_0_/_0.05)] text-ink font-semibold'
                  : 'text-ink-secondary font-medium hover:bg-surface/60'
            }`}
          >
            <span
              className={
                dark ? (active ? 'text-gold-300' : 'text-navy-100') : active ? 'text-ink' : 'text-ink-secondary'
              }
            >
              {item.icon}
            </span>
            <span className="flex-1 text-left">{item.label}</span>
            {item.count !== undefined && (
              <span
                className={`text-xs font-medium rounded-full px-2 py-0.5 ${
                  dark ? 'bg-primary text-on-primary' : 'bg-gold-100 text-ink'
                }`}
              >
                {item.count}
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )
}
