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
            fileId
        }
    }
}`

export const PROPERTY_BY_SLUG_QUERY = gql`query PropertyBySlug($slug: String!) {
    propertyBySlug(slug: $slug) {
        id
        slug
        title
        description
        propertyType
        bedrooms
        bathrooms
        maxGuests
        beds {
            type
            count
        }
        basePriceAed
        cleaningFeeAed
        currency
        isInstantBook
        detPermitNumber
        amenityIds
        accessibilityIds
        cancellationPolicy
        rating
        reviewCount
        photos {
            id
            fileId
        }
    }
}`
