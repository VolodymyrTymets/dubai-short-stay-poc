import gql from 'graphql-tag';

export const ACCOUNT_QUERY = gql`query Account {
    account {
        id
        AccountProfile {
            firstName
            lastName
        }
    }
}`
