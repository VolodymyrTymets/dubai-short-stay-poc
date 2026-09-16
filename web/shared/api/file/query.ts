import gql from 'graphql-tag';
export const FILE_QUERY = gql`query File($fileId: String!) {
    file(fileId: $fileId) {
       id
       publicUrl
    }
}`