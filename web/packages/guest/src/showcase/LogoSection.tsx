import { Logo } from '../../../../shared/components/Logo'
import { Section, Card } from './layout'

export function LogoSection() {
  return (
    <Section title="Logo">
      <div className="flex gap-6">
        <Card className="flex items-center">
          <Logo variant="light" />
        </Card>
        <Card className="flex items-center bg-navy-900">
          <Logo variant="dark" />
        </Card>
      </div>
    </Section>
  )
}
