import { Logo } from './Logo'
import { SearchBar } from './SearchBar'
import { Avatar } from './Avatar'
import { Account } from './Account'
import { GlobeIcon, MenuIcon } from './icons'

const actionButton =
  'flex items-center gap-1.5 px-3 py-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-line-focus'

export type HeaderProps = {
  where: string
  checkIn: string
  checkOut: string
  guests: string
  onSearch?: () => void
  onListProperty?: () => void
  onOpenLocale?: () => void
  onOpenMenu?: () => void
}

export function Header({
  where,
  checkIn,
  checkOut,
  guests,
  onSearch,
  onListProperty,
  onOpenLocale,
  onOpenMenu,
}: HeaderProps) {
  return (
    <header className="relative flex items-center justify-between h-20 px-10 bg-surface border-b border-line">
      <Logo size={26} />
      <SearchBar variant="compact" where={where} checkIn={checkIn} checkOut={checkOut} guests={guests} onSearch={onSearch} />
      <div className="flex items-center gap-2">
        <button type="button" onClick={onListProperty} className={actionButton}>
          <span className="text-sm font-semibold text-ink">List your property</span>
        </button>
        <button type="button" onClick={onOpenLocale} className={actionButton}>
          <GlobeIcon size={18} />
          <span className="text-sm font-medium text-ink">EN · AED</span>
        </button>
        <Account size={32}>
          {(initials) => (
            <button
              type="button"
              onClick={onOpenMenu}
              aria-label="Open menu"
              className="flex items-center gap-3 h-11 pl-3.5 pr-1.5 rounded-full border border-line-strong bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-line-focus"
            >
              <MenuIcon size={18} />
              <Avatar initials={initials} size={32} />
            </button>
          )}
        </Account>
      </div>
      <div className="absolute left-0 right-0 -bottom-px h-0.5 bg-gold" />
    </header>
  )
}
