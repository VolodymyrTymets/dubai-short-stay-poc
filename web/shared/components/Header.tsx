import { Logo } from './Logo'
import { SearchBar } from './SearchBar'
import { Avatar } from './Avatar'
import { GlobeIcon, MenuIcon } from './icons'

export type HeaderProps = {
  where: string
  checkIn: string
  checkOut: string
  guests: string
  userInitials: string
  onSearch?: () => void
  onOpenMenu?: () => void
}

export function Header({ where, checkIn, checkOut, guests, userInitials, onSearch, onOpenMenu }: HeaderProps) {
  return (
    <header className="relative flex items-center justify-between h-20 px-10 bg-surface border-b border-line">
      <Logo size={26} />
      <SearchBar variant="compact" where={where} checkIn={checkIn} checkOut={checkOut} guests={guests} onSearch={onSearch} />
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-ink px-3 py-2.5">List your property</span>
        <div className="flex items-center gap-1.5 px-3 py-2.5">
          <GlobeIcon size={18} />
          <span className="text-sm font-medium text-ink">EN · AED</span>
        </div>
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open menu"
          className="flex items-center gap-3 h-11 pl-3.5 pr-1.5 rounded-full border border-line-strong bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-line-focus"
        >
          <MenuIcon size={18} />
          <Avatar initials={userInitials} size={32} />
        </button>
      </div>
      <div className="absolute left-0 right-0 -bottom-px h-0.5 bg-gold" />
    </header>
  )
}
