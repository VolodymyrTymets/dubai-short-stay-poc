import { createBrowserRouter } from 'react-router'
import { Layout } from './Layout'
import { HomePage } from './pages/HomePage'
import { SignInPage } from './pages/SignInPage'
import { SignUpPage } from './pages/SignUpPage'
import { CreatePropertyPage } from './pages/CreatePropertyPage'

export const router = createBrowserRouter([
  {
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: 'sign-in', Component: SignInPage },
      { path: 'sign-up', Component: SignUpPage },
      { path: 'listings/new', Component: CreatePropertyPage },
    ],
  },
])
