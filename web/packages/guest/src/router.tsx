import { createBrowserRouter } from 'react-router'
import { Layout } from './Layout'
import { HomePage } from './pages/HomePage'
import { SearchResultsPage } from './pages/SearchResultsPage'
import { PropertyDetailPage } from './pages/PropertyDetailPage'
import { SignInPage } from './pages/SignInPage'
import { SignUpPage } from './pages/SignUpPage'

export const router = createBrowserRouter([
  {
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: 'search', Component: SearchResultsPage },
      { path: 'property/:slug', Component: PropertyDetailPage },
      { path: 'sign-in', Component: SignInPage },
      { path: 'sign-up', Component: SignUpPage },
    ],
  },
  // Not part of the routed shell — keeps the existing component-library preview reachable
  // outside the guest chrome instead of deleting it (see docs/features/web-page-layout/spec.md AC7).
  // Lazy-loaded so the dev-only preview doesn't ship in the initial bundle.
  {
    path: 'dev/components',
    lazy: async () => ({ Component: (await import('./ComponentsShowcase')).ComponentsShowcase }),
  },
])
