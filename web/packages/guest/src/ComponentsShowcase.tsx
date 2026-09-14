import { Logo } from '../../../shared/components/Logo'
import { Button, type ButtonSize, type ButtonVariant } from '../../../shared/components/Button'
import { ArrowRightIcon, HeartIcon, XIcon } from '../../../shared/components/icons'

const buttonVariants: ButtonVariant[] = ['primary', 'secondary', 'outline', 'ghost', 'danger']
const buttonSizes: ButtonSize[] = ['lg', 'md', 'sm']

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-6">
      <h2 className="font-serif text-3xl font-semibold text-ink">{title}</h2>
      {children}
    </section>
  )
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-line bg-surface p-7 ${className ?? ''}`}>{children}</div>
  )
}

/**
 * Live reference for every web/shared/components primitive, mirroring
 * designs/dss-v1-web-mockups-html/Components.html. This is the real-browser
 * verification surface for the ui-component-library ticket (ADR-007) until
 * real guest screens exist.
 */
export function ComponentsShowcase() {
  return (
    <div className="min-h-screen bg-page px-20 py-14 flex flex-col gap-14">
      <div className="flex flex-col gap-3">
        <div className="eyebrow">Design system · V1 web</div>
        <h1 className="font-serif text-6xl font-medium text-ink -tracking-[1px]">Components</h1>
      </div>

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
    </div>
  )
}
