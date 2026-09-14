import { SearchIcon } from './icons'

export type SearchBarProps = {
  variant?: 'hero' | 'compact'
  where: string
  checkIn: string
  checkOut: string
  guests: string
  onSearch?: () => void
}

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-line-focus'

export function SearchBar({ variant = 'hero', where, checkIn, checkOut, guests, onSearch }: SearchBarProps) {
  if (variant === 'compact') {
    return (
      <div className="inline-flex items-center h-12 rounded-full bg-surface border border-line shadow-pill pl-6 pr-2 gap-4">
        <span className="text-sm font-semibold text-ink whitespace-nowrap">{where}</span>
        <span className="w-px h-6 bg-line" />
        <span className="text-sm font-semibold text-ink whitespace-nowrap">
          {checkIn} – {checkOut}
        </span>
        <span className="w-px h-6 bg-line" />
        <span className="text-sm text-ink-secondary whitespace-nowrap">{guests}</span>
        <button
          type="button"
          onClick={onSearch}
          aria-label="Search"
          className={`w-[34px] h-[34px] rounded-full bg-primary flex items-center justify-center shrink-0 ${focusRing}`}
        >
          <SearchIcon size={16} strokeWidth={2.5} className="text-on-primary" />
        </button>
      </div>
    )
  }

  const segments = [
    { label: 'Where', value: where, width: 300 },
    { label: 'Check in', value: checkIn, width: 170 },
    { label: 'Check out', value: checkOut, width: 170 },
    { label: 'Guests', value: guests, width: 150 },
  ]

  return (
    <div className="flex items-center h-[68px] rounded-full bg-surface border border-line shadow-card pl-1 pr-2.5">
      {segments.map((seg, i) => (
        <div
          key={seg.label}
          className={`flex flex-col justify-center gap-0.5 px-7 text-left shrink-0 ${
            i < segments.length - 1 ? 'border-r border-line' : ''
          }`}
          style={{ width: seg.width }}
        >
          <span className="text-xs font-medium text-ink tracking-[0.2px]">{seg.label}</span>
          <span className="text-sm text-ink-muted whitespace-nowrap">{seg.value}</span>
        </div>
      ))}
      <div className="flex-1" />
      <button
        type="button"
        onClick={onSearch}
        className={`flex items-center gap-2 h-[52px] pl-[18px] pr-[22px] rounded-full bg-primary ${focusRing}`}
      >
        <SearchIcon size={18} strokeWidth={2.25} className="text-on-primary" />
        <span className="font-semibold text-base text-on-primary">Search</span>
      </button>
    </div>
  )
}
