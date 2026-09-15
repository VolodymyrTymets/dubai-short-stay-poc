import { useMutation } from '@apollo/client'
import { useNavigate } from 'react-router'
import { AuthCard } from '../../../../shared/components/AuthCard'
import { setAccessToken } from '../../../../shared/api/token'
import { SignInDocument } from '../gql/graphql'

export function SignInPage() {
  const navigate = useNavigate()
  const [signIn, { loading, error }] = useMutation(SignInDocument)

  async function handleSubmit(fields: { email: string; password: string }) {
    const { data } = await signIn({ variables: { signInPasswordInput: fields } })
    if (data?.signIn.accessToken) {
      setAccessToken(data.signIn.accessToken)
      navigate('/')
    }
  }

  return <AuthCard activeTab="login" onSubmit={handleSubmit} loading={loading} error={error?.message} />
}
