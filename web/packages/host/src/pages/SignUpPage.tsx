import { useMutation } from '@apollo/client'
import { useNavigate } from 'react-router'
import { AuthCard } from '../../../../shared/components/AuthCard'
import { setAccessToken } from '../../../../shared/api/token'
import { SignUpDocument } from '../gql/graphql'

export function SignUpPage() {
  const navigate = useNavigate()
  const [signUp, { loading, error }] = useMutation(SignUpDocument)

  async function handleSubmit(fields: { email: string; password: string }) {
    try {
      const { data } = await signUp({ variables: { signUpInput: fields } })
      if (data?.signUp.accessToken) {
        setAccessToken(data.signUp.accessToken)
        navigate('/')
      }
    } catch {
      // WHY: useMutation rethrows on error; already surfaced to the user via the `error` state below.
    }
  }

  return <AuthCard activeTab="signup" onSubmit={handleSubmit} loading={loading} error={error?.message} />
}
