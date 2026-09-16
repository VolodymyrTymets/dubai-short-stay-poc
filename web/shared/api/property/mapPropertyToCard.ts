import type { PropertiesQuery } from '../generated.graphql'
import type { PropertyCardProps } from '../../components/PropertyCard'

export type PropertyRow = PropertiesQuery['properties'][number]

// No real listing photo can be resolved yet — PropertyPhotoEntity has no public URL field, and even
// FileEntity.publicUrl (which exists) would sign against S3 using the dev seed's picsum.photos URL as if
// it were a real object key, producing a broken link (see docs/features/guest-home-search/spec.md's
// mocked-field table). Flat cream-300 tile, matching the mockup's own pre-photo placeholder colour.
const PLACEHOLDER_IMAGE =
  'data:image/svg+xml,' +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="#E6DDCD"/></svg>')

// No booking/length-of-stay model exists yet, so there is no real total to show — an illustrative
// 3-night stay stands in for it until Booking ships (spec.md's mocked-field table).
const SAMPLE_STAY_NIGHTS = 3

// Matches PropertyCard's own contract ("Omit to show 'New' instead of a rating — fewer than 3 reviews").
const MIN_REVIEWS_FOR_RATING = 3

// PropertyCard renders one dot per photo in a fixed-width card — cap so a host with many photos doesn't
// overflow the row (the mockup itself never shows more than 5).
const MAX_PHOTO_DOTS = 5

function formatAed(amountAed: number, currency: string): string {
  return new Intl.NumberFormat('en-AE', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amountAed)
}

function detailsLine(bedrooms: number, maxGuests: number): string {
  const bedroomsLabel = bedrooms === 0 ? 'Studio' : `${bedrooms} bedroom${bedrooms === 1 ? '' : 's'}`
  return `${bedroomsLabel} · ${maxGuests} guest${maxGuests === 1 ? '' : 's'}`
}

const SUBTITLE_MAX_LENGTH = 60

// No dedicated subtitle field exists on Property (e.g. building name/view) — reuse the host's real
// description, truncated, rather than a fabricated string (spec.md's mocked-field table).
function subtitleFrom(description: string): string {
  const trimmed = description.trim()
  return trimmed.length > SUBTITLE_MAX_LENGTH ? `${trimmed.slice(0, SUBTITLE_MAX_LENGTH).trimEnd()}…` : trimmed
}

export function mapPropertyToCard(property: PropertyRow): Omit<PropertyCardProps, 'onToggleFavorite' | 'isFavorited'> {
  const totalAed = property.basePriceAed * SAMPLE_STAY_NIGHTS + (property.cleaningFeeAed ?? 0)
  const fileId = property.photos[0]?.fileId

  return {
    href: `/property/${property.slug}`,
    fileId: fileId,
    imageAlt: property.title,
    title: property.title,
    subtitle: subtitleFrom(property.description),
    details: detailsLine(property.bedrooms, property.maxGuests),
    pricePerNight: formatAed(property.basePriceAed, property.currency),
    totalPrice: `${formatAed(totalAed, property.currency)} total · ${SAMPLE_STAY_NIGHTS} nights`,
    rating: property.reviewCount >= MIN_REVIEWS_FOR_RATING ? (property.rating ?? undefined) : undefined,
    photoCount: Math.min(Math.max(property.photos.length, 1), MAX_PHOTO_DOTS),
  }
}
