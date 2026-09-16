import { Outlet, useLocation, useNavigate } from 'react-router'
import { Logo } from '../../../shared/components/Logo'
import { Sidebar, type SidebarNavItem } from '../../../shared/components/Sidebar'
import { Avatar } from '../../../shared/components/Avatar'
import {
  HomeIcon,
  ListingsIcon,
  CalendarIcon,
  ReservationsIcon,
  MessagesIcon,
  EarningsIcon,
  VerificationIcon,
  SettingsIcon,
} from '../../../shared/components/icons'
import { Topbar } from './Topbar'

const mainNavItems: SidebarNavItem[] = [
  { id: 'today', label: 'Today', icon: <HomeIcon size={18} /> },
  { id: 'listings', label: 'Listings', icon: <ListingsIcon size={18} /> },
  { id: 'calendar', label: 'Calendar', icon: <CalendarIcon size={18} /> },
  { id: 'reservations', label: 'Reservations', icon: <ReservationsIcon size={18} />, count: 3 },
  { id: 'messages', label: 'Messages', icon: <MessagesIcon size={18} />, count: 2 },
  { id: 'earnings', label: 'Earnings', icon: <EarningsIcon size={18} /> },
]

const accountNavItems: SidebarNavItem[] = [
  { id: 'verification', label: 'Verification', icon: <VerificationIcon size={18} /> },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon size={18} /> },
]

export function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const activeMainNavId = location.pathname.startsWith('/listings') ? 'listings' : undefined

  function handleMainNavSelect(id: string) {
    // TODO(volodymyr, web-page-layout): only "listings" has a real route so far — see the
    // pre-existing TODO below for the rest (Calendar/Reservations/Messages/Earnings/Today).
    if (id === 'listings') navigate('/listings/new')
  }

  return (
    <div className="flex min-h-screen bg-page">
      <aside className="w-64 shrink-0 flex flex-col gap-4 p-4 bg-cream-200 border-r border-line">
        <div className="flex items-center gap-2.5 px-2">
          <Logo size={22} />
          <span className="font-mono text-[11px] font-medium uppercase tracking-[1.8px] text-ink-accent">
            Host
          </span>
        </div>
        {/* TODO(volodymyr, web-page-layout): wire activeId/onSelect once Listings/Calendar/
            Reservations/Messages/Earnings/Verification/Settings each have a real route — this
            ticket only adds Home/Sign In/Sign Up. */}
        <Sidebar
          items={mainNavItems}
          activeId={activeMainNavId}
          onSelect={handleMainNavSelect}
          bare
          ariaLabel="Main"
        />
        <Sidebar groupLabel="Account" items={accountNavItems} bare ariaLabel="Account" />
        <div className="flex-1" />
        {/* TODO(volodymyr, web-page-layout): replace with the signed-in Host's real name/DET
            permit once account data is wired. */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-line">
          <Avatar initials="KP" size={36} />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-ink truncate">Keys Please</span>
            <span className="text-xs text-ink-muted truncate">Host owner · DET #727937</span>
          </div>
        </div>
      </aside>
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
