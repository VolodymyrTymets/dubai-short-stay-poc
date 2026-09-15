import { Avatar } from '../../../shared/components/Avatar'
import { Account } from '../../../shared/components/Account'
import { SearchIcon, BellIcon } from '../../../shared/components/icons'

export type TopbarProps = {
  onSearch?: () => void
  onSwitchToTravelling?: () => void
  onOpenNotifications?: () => void
}

export function Topbar({ onSearch, onSwitchToTravelling, onOpenNotifications }: TopbarProps) {
  return (
    <header className="flex items-center justify-between h-[72px] px-10 border-b border-line bg-surface">
      {/* TODO(volodymyr, web-page-layout): real text input + results once search is built. */}
      <button
        type="button"
        onClick={onSearch}
        className="flex items-center gap-2.5 w-[380px] h-10 px-3.5 rounded-full bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-line-focus"
      >
        <SearchIcon size={16} className="text-ink-muted shrink-0" />
        <span className="text-sm text-ink-muted">Search reservations, guests, listings</span>
      </button>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onSwitchToTravelling}
          className="h-8 px-3.5 rounded-lg text-sm font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-line-focus"
        >
          Switch to travelling
        </button>
        <button
          type="button"
          onClick={onOpenNotifications}
          aria-label="Notifications"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-surface border border-line focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-line-focus"
        >
          <BellIcon size={18} className="text-ink" />
        </button>
        <Account size={36}>{(initials) => <Avatar initials={initials} size={36} />}</Account>
      </div>
    </header>
  )
}
