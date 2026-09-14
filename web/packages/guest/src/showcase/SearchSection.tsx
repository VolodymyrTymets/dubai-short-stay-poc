import { SearchBar } from '../../../../shared/components/SearchBar'
import { Section } from './layout'

const demoProps = {
  where: 'Dubai Marina',
  checkIn: '12',
  checkOut: '15 Oct',
  guests: '2 guests',
}

export function SearchSection() {
  return (
    <Section title="Search">
      <div className="flex flex-col gap-6 items-start">
        <SearchBar variant="hero" {...demoProps} />
        <SearchBar variant="compact" {...demoProps} />
      </div>
    </Section>
  )
}
