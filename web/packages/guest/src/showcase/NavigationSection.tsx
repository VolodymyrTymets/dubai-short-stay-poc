import { useState, type SVGProps } from 'react'
import { Sidebar, type SidebarNavItem } from '../../../../shared/components/Sidebar'
import { Section } from './layout'

function icon(d: string, props?: SVGProps<SVGSVGElement>) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d={d} />
    </svg>
  )
}

const hostItems: SidebarNavItem[] = [
  { id: 'today', label: 'Today', icon: icon('m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z') },
  { id: 'listings', label: 'Listings', icon: icon('M4 4h16v16H4zM9 20v-6h6v6') },
  { id: 'calendar', label: 'Calendar', icon: icon('M3 10h18M7 3v4M17 3v4M5 6h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z') },
  { id: 'reservations', label: 'Reservations', icon: icon('M5 5h14v14H5zM8 9h8M8 13h5'), count: 3 },
]

const adminItems: SidebarNavItem[] = [
  { id: 'queue', label: 'Booking queue', icon: icon('m3 17 2 2 4-4M3 7l2 2 4-4M13 6h8M13 12h8M13 18h8'), count: 14 },
  { id: 'disputes', label: 'Disputes', icon: icon('M12 3v18M3 7h18M6 7l-3 8a4 4 0 0 0 6 0zM18 7l-3 8a4 4 0 0 0 6 0z'), count: 3 },
  { id: 'kyc', label: 'KYC review', icon: icon('M4 5h16v14H4zM8 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM6 17a3 3 0 0 1 6 0M14 9h5M14 13h4'), count: 9 },
]

export function NavigationSection() {
  const [hostActive, setHostActive] = useState('listings')
  const [adminActive, setAdminActive] = useState('queue')

  return (
    <Section title="App navigation">
      <div className="flex gap-8 items-start">
        <Sidebar variant="light" items={hostItems} activeId={hostActive} onSelect={setHostActive} />
        <Sidebar
          variant="dark"
          groupLabel="Operations"
          items={adminItems}
          activeId={adminActive}
          onSelect={setAdminActive}
        />
      </div>
    </Section>
  )
}
