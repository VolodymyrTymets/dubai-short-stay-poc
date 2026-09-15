import gql from 'graphql-tag';

export const PROPERTIES_QUERY = gql`query Properties($pagination: PaginationInput, $search: SearchInput) {
    properties(pagination: $pagination, search: $search) {
        id
        slug
        title
        propertyType
        bedrooms
        bathrooms
        maxGuests
        basePriceAed
        cleaningFeeAed
        currency
        rating
        reviewCount
        description
        photos {
            id
        }
    }
}`
