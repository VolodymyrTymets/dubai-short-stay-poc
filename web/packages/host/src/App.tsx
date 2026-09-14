import { Logo } from '../../../shared/components/Logo'
import { Button } from '../../../shared/components/Button'

/**
 * Smoke test proving web/shared/components resolves from `host`, not just
 * `guest` — ADR-006's "only web/shared/ may be imported by both apps"
 * boundary. The full component set is showcased from `guest` (see
 * guest/src/ComponentsShowcase.tsx).
 */
function App() {
  return (
    <main className="min-h-screen bg-page flex flex-col items-center justify-center gap-6">
      <Logo />
      <h1 className="font-serif text-4xl text-ink">Dubai Short Stay — Host</h1>
      <Button variant="primary">List your property</Button>
    </main>
  )
}

export default App
