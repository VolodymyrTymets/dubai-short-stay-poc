import { Outlet } from 'react-router'
import { Header } from '../../../shared/components/Header'
import { Footer } from './Footer'

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-page">
      <Header
        // TODO(volodymyr, web-page-layout): wire these to real search state once a search screen/query exists.
        where="Anywhere"
        checkIn="Add dates"
        checkOut="Add dates"
        guests="Add guests"
      />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
