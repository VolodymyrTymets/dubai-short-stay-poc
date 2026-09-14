import {
  Badge,
  StatusBadge,
  InstantBookBadge,
  CuratedBadge,
  type BadgeTone,
} from '../../../../shared/components/Badge'
import { Avatar } from '../../../../shared/components/Avatar'
import { Section, Card } from './layout'

const statuses: { tone: BadgeTone; label: string }[] = [
  { tone: 'success', label: 'Confirmed' },
  { tone: 'warning', label: 'Awaiting host approval' },
  { tone: 'info', label: 'Payment pending' },
  { tone: 'danger', label: 'Cancelled' },
  { tone: 'neutral', label: 'Draft' },
]

export function BadgesSection() {
  return (
    <Section title="Badges">
      <Card className="flex flex-wrap items-center gap-3">
        {statuses.map(({ tone, label }) => (
          <StatusBadge key={tone} tone={tone}>
            {label}
          </StatusBadge>
        ))}
        <InstantBookBadge />
        <Badge variant="outline">Deluxe Holiday Home</Badge>
        <Badge variant="solid">Host</Badge>
        {/* the navy tile is the photo/swatch backdrop CuratedBadge sits on in real use, not part of the badge */}
        <div className="p-2.5 rounded-xl bg-navy-600">
          <CuratedBadge>Dubai Favorite</CuratedBadge>
        </div>
        <Avatar initials="LA" />
        <Avatar initials="KP" size={48} ring />
      </Card>
    </Section>
  )
}
