import { useNavigate } from 'react-router'
import { AuthCard } from '../../../../shared/components/AuthCard'
import { setAccessToken } from '../../../../shared/api/token'
import { useSignUpMutation } from '../../../../shared/api/generated.graphql'

export function SignUpPage() {
  const navigate = useNavigate()
  const [signUp, { loading, error }] = useSignUpMutation()

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
