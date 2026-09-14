import {
  Badge,
  StatusBadge,
  InstantBookBadge,
  CuratedBadge,
  type BadgeStatus,
} from '../../../../shared/components/Badge'
import { Avatar } from '../../../../shared/components/Avatar'
import { Section, Card } from './layout'

const statuses: { status: BadgeStatus; label: string }[] = [
  { status: 'confirmed', label: 'Confirmed' },
  { status: 'awaiting', label: 'Awaiting host approval' },
  { status: 'pending', label: 'Payment pending' },
  { status: 'cancelled', label: 'Cancelled' },
  { status: 'draft', label: 'Draft' },
]

export function BadgesSection() {
  return (
    <Section title="Badges">
      <Card className="flex flex-wrap items-center gap-3">
        {statuses.map(({ status, label }) => (
          <StatusBadge key={status} status={status}>
            {label}
          </StatusBadge>
        ))}
        <InstantBookBadge />
        <Badge variant="outline">Deluxe Holiday Home</Badge>
        <Badge variant="solid">Host</Badge>
        <CuratedBadge>Dubai Favorite</CuratedBadge>
        <Avatar initials="LA" />
        <Avatar initials="KP" size={48} ring />
      </Card>
    </Section>
  )
}
