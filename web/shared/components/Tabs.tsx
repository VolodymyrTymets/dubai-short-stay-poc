import { CountBadge } from './Badge'

export type Tab = {
  id: string
  label: string
  count?: number
}

export type TabsProps = {
  tabs: Tab[]
  activeId: string
  onChange: (id: string) => void
}

export function Tabs({ tabs, activeId, onChange }: TabsProps) {
  return (
    <div role="tablist" className="flex gap-7 border-b border-line">
      {tabs.map((tab) => {
        const active = tab.id === activeId
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 pb-3 -mb-px border-b-2 text-sm rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-line-focus ${
              active ? 'border-line-focus text-ink font-semibold' : 'border-transparent text-ink-muted font-medium'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && <CountBadge>{tab.count}</CountBadge>}
          </button>
        )
      })}
    </div>
  )
}
