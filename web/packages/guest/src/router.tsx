import { createBrowserRouter } from 'react-router'
import { Layout } from './Layout'
import { HomePage } from './pages/HomePage'
import { SignInPage } from './pages/SignInPage'
import { SignUpPage } from './pages/SignUpPage'
import { ComponentsShowcase } from './ComponentsShowcase'

export const router = createBrowserRouter([
  {
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: 'sign-in', Component: SignInPage },
      { path: 'sign-up', Component: SignUpPage },
    ],
  },
  // Not part of the routed shell — keeps the existing component-library preview reachable
  // outside the guest chrome instead of deleting it (see docs/features/web-page-layout/spec.md AC7).
  { path: 'dev/components', Component: ComponentsShowcase },
])
