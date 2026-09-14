import { Header } from '../../../../shared/components/Header'
import { Section } from './layout'

export function HeaderSection() {
  return (
    <Section title="Header">
      <div className="rounded-2xl overflow-hidden border border-line">
        <Header where="Dubai Marina" checkIn="12" checkOut="15 Oct" guests="2 guests" userInitials="LA" />
      </div>
    </Section>
  )
}
