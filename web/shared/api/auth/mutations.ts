import gql from 'graphql-tag';
    export const SIGN_IN_MUTATION = gql`mutation SignIn($signInPasswordInput: SignInPasswordInput!) {
    signIn(signInPasswordInput: $signInPasswordInput) {
        accessToken
    }
}`

export const SIGN_UP_MUTATION = gql`mutation SignUp($signUpInput: SignUpInput!) {
    signUp(signUpInput: $signUpInput) {
        accessToken
    }
}`
