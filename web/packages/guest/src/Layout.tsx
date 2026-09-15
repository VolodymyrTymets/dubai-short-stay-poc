import { Outlet, useNavigate } from 'react-router'
import { Header } from '../../../shared/components/Header'
import { Footer } from './Footer'

export function Layout() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col bg-page">
      <Header
        // TODO(volodymyr, guest-home-search): where/checkIn/checkOut/guests still hardcoded — no real
        // search-state model exists yet (search.ts's PropertiesQuery only takes title/slug), so the header
        // can't reflect an actual query. onSearch navigating to /search is wired now.
        where="Anywhere"
        checkIn="Add dates"
        checkOut="Add dates"
        guests="Add guests"
        onSearch={() => navigate('/search')}
      />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
