import { PropertyCard } from '../../../../shared/components/PropertyCard'
import { BookingCard } from '../../../../shared/components/BookingCard'
import { Section } from './layout'

export function CardsSection() {
  return (
    <Section title="Property card & booking card">
      <div className="flex gap-8 items-start flex-wrap">
        <PropertyCard
          imageSrc="/marina.svg"
          imageAlt="Apartment in Dubai Marina"
          title="Apartment in Dubai Marina"
          subtitle="Marina Gate 2 · Full sea view"
          details="2 bedrooms · 4 guests"
          pricePerNight="AED 840"
          totalPrice="AED 2,820 total"
          rating={4.92}
          favoriteBadge="Dubai Favorite"
          photoCount={5}
        />
        <PropertyCard
          imageSrc="/living.svg"
          imageAlt="Studio in Business Bay"
          title="Studio in Business Bay"
          subtitle="Canal-side · Walk to Downtown"
          details="Studio · 2 guests"
          pricePerNight="AED 420"
          totalPrice="AED 1,414 total"
          photoCount={5}
        />
        <BookingCard
          pricePerNight="AED 840"
          vatNote="incl. 5% VAT"
          checkIn="Mon, 12 Oct"
          checkOut="Thu, 15 Oct"
          guestsSummary="2 adults"
          instantBookNote="Instant Book · You won't be charged yet"
          lineItems={[
            { label: 'AED 800 × 3 nights', amount: 'AED 2,400' },
            { label: 'Cleaning fee', amount: 'AED 200' },
            { label: 'VAT (5%)', amount: 'AED 130' },
            { label: 'Tourism Dirham Fee · 3 × AED 30', amount: 'AED 90' },
          ]}
          total="AED 2,820"
        />
      </div>
    </Section>
  )
}
