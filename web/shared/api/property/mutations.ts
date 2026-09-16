import gql from 'graphql-tag';

export const CREATE_PROPERTY_MUTATION = gql`mutation CreateProperty($input: CreatePropertyInput!) {
    createProperty(input: $input) {
        id
        slug
        status
        title
    }
}`
