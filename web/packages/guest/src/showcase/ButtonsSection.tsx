import { Button, type ButtonSize, type ButtonVariant } from '../../../../shared/components/Button'
import { ArrowRightIcon, HeartIcon, XIcon } from '../../../../shared/components/icons'
import { Section, Card } from './layout'

const buttonVariants: ButtonVariant[] = ['primary', 'secondary', 'outline', 'ghost', 'danger']
const buttonSizes: ButtonSize[] = ['lg', 'md', 'sm']

export function ButtonsSection() {
  return (
    <Section title="Buttons">
      <Card className="flex flex-col gap-4">
        {buttonVariants.map((variant) => (
          <div key={variant} className="flex items-center gap-6">
            <span className="w-24 text-sm font-medium text-ink-secondary">{variant}</span>
            {buttonSizes.map((size) => (
              <Button key={size} variant={variant} size={size}>
                Reserve
              </Button>
            ))}
            <Button variant={variant} size="md" icon={<ArrowRightIcon size={18} />}>
              Continue
            </Button>
          </div>
        ))}
        <div className="flex items-center gap-6">
          <span className="w-24 text-sm font-medium text-ink-secondary">icon</span>
          <Button variant="icon" aria-label="Save">
            <HeartIcon size={18} />
          </Button>
          <Button variant="icon" bordered={false} aria-label="Close">
            <XIcon size={18} />
          </Button>
        </div>
      </Card>
    </Section>
  )
}
