import { RouterProvider } from 'react-router/dom'
import { router } from './router'

// The routed Layout (src/Layout.tsx) imports web/shared/components/Sidebar and Logo,
// which already proves web/shared/ resolves from `host` — the prior standalone smoke
// test this file used to render is superseded.
function App() {
  return <RouterProvider router={router} />
}

export default App
