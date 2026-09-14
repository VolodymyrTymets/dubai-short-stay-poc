import { useRef, type KeyboardEvent } from 'react'
import { CountBadge } from './Badge'

export type Tab = {
  id: string
  label: string
  count?: number
  /** id of the tabpanel this tab controls — omit if the consumer doesn't render one. */
  panelId?: string
}

export type TabsProps = {
  tabs: Tab[]
  activeId: string
  onChange: (id: string) => void
}

export function Tabs({ tabs, activeId, onChange }: TabsProps) {
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  function selectAndFocus(id: string) {
    onChange(id)
    buttonRefs.current[id]?.focus()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const lastIndex = tabs.length - 1
    let nextIndex: number | null = null
    if (event.key === 'ArrowRight') nextIndex = index === lastIndex ? 0 : index + 1
    else if (event.key === 'ArrowLeft') nextIndex = index === 0 ? lastIndex : index - 1
    else if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = lastIndex
    if (nextIndex === null) return
    event.preventDefault()
    selectAndFocus(tabs[nextIndex].id)
  }

  return (
    <div role="tablist" className="flex gap-7 border-b border-line">
      {tabs.map((tab, index) => {
        const active = tab.id === activeId
        return (
          <button
            key={tab.id}
            ref={(el) => {
              buttonRefs.current[tab.id] = el
            }}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={tab.panelId}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
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
