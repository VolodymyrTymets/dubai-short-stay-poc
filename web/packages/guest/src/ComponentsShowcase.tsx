import { LogoSection } from './showcase/LogoSection'
import { ButtonsSection } from './showcase/ButtonsSection'
import { BadgesSection } from './showcase/BadgesSection'
import { FormControlsSection } from './showcase/FormControlsSection'
import { SearchSection } from './showcase/SearchSection'

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

      <LogoSection />
      <ButtonsSection />
      <BadgesSection />
      <FormControlsSection />
      <SearchSection />
    </div>
  )
}
