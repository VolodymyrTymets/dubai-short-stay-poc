import { useParams } from 'react-router'
import { usePropertyBySlugQuery } from '../../../../shared/api/generated.graphql'
import { Badge } from '../../../../shared/components/Badge'
import { Button } from '../../../../shared/components/Button'
import { BoltIcon, StarIcon, HomeIcon } from '../../../../shared/components/icons'

// No real listing photo can be resolved yet — same known gap as mapPropertyToCard.ts
// (PropertyPhotoEntity has no public URL field). Flat cream-300 tile, matching the mockup's own
// pre-photo placeholder colour.
const PLACEHOLDER_IMAGE =
  'data:image/svg+xml,' +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="600" height="600" fill="#E6DDCD"/></svg>')

const MAX_GALLERY_TILES = 5
const MIN_REVIEWS_FOR_RATING = 3

const CANCELLATION_POLICY_LABEL: Record<string, string> = {
  FLEXIBLE: 'Flexible — free cancellation until 24 hours before check-in.',
  MODERATE: 'Moderate — free cancellation until 5 days before check-in.',
  STRICT: 'Strict — free cancellation until 14 days before check-in.',
}

function formatAed(amountAed: number, currency: string): string {
  return new Intl.NumberFormat('en-AE', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amountAed)
}

function bedroomsLabel(bedrooms: number): string {
  return bedrooms === 0 ? 'Studio' : `${bedrooms} bedroom${bedrooms === 1 ? '' : 's'}`
}

function bedsLabel(beds: { type: string; count: number }[]): string {
  const total = beds.reduce((sum, bed) => sum + bed.count, 0)
  return `${total} bed${total === 1 ? '' : 's'}`
}

export function PropertyDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data, loading, error, refetch } = usePropertyBySlugQuery({
    variables: { slug: slug ?? '' },
    skip: !slug,
    notifyOnNetworkStatusChange: true,
  })

  function retry() {
    // WHY: refetch() rejects with the same ApolloError already surfaced via the `error` state below —
    // this just stops it from becoming an unhandled promise rejection (rule D5).
    void refetch().catch(() => {})
  }

  if (loading) {
    return (
      <div className="px-20 py-16 flex flex-col gap-6" role="status" aria-label="Loading property">
        <div className="h-9 w-2/3 rounded bg-subtle animate-pulse" />
        <div className="h-[424px] w-full rounded-2xl bg-subtle animate-pulse" />
        <div className="h-5 w-1/3 rounded bg-subtle animate-pulse" />
        <div className="h-24 w-full rounded bg-subtle animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-20 py-24 flex flex-col items-center gap-4 text-center">
        <p className="text-ink-secondary">Couldn't load this property right now.</p>
        <Button variant="outline" onClick={retry}>
          Retry
        </Button>
      </div>
    )
  }

  const property = data?.propertyBySlug

  if (!property) {
    return (
      <div className="px-20 py-24 flex flex-col items-center gap-3 text-center">
        <h1 className="font-serif font-medium text-3xl text-ink">This stay isn't available</h1>
        <p className="text-ink-secondary">The listing you're looking for doesn't exist or is no longer live.</p>
      </div>
    )
  }

  const galleryCount = Math.min(Math.max(property.photos.length, 1), MAX_GALLERY_TILES)
  const showRating = property.reviewCount >= MIN_REVIEWS_FOR_RATING

  return (
    <div className="w-[1120px] mx-auto py-8 pb-20 flex flex-col gap-8">
      <div className="flex justify-between items-end gap-6">
        <div className="flex flex-col gap-2">
          <Badge>{property.propertyType}</Badge>
          <h1 className="font-serif font-medium text-4xl leading-10 tracking-[-0.25px] text-ink">{property.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-[2fr_1fr_1fr] grid-rows-2 gap-2 rounded-2xl overflow-hidden">
        <div className="row-span-2">
          <img src={PLACEHOLDER_IMAGE} alt={property.title} className="w-full h-[424px] object-cover block" />
        </div>
        {Array.from({ length: Math.max(galleryCount - 1, 0) }).map((_, i) => (
          <img key={i} src={PLACEHOLDER_IMAGE} alt="" className="w-full h-[208px] object-cover block" />
        ))}
      </div>

      <div className="flex gap-20 items-start">
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="pb-7 flex flex-col gap-1.5">
            <h2 className="font-sans font-semibold text-[22px] leading-7 tracking-[-0.2px] text-ink">
              {`Entire ${property.propertyType.toLowerCase()}`}
            </h2>
            <span className="text-base text-ink-secondary">
              {`${property.maxGuests} guest${property.maxGuests === 1 ? '' : 's'} · ${bedroomsLabel(property.bedrooms)} · ${bedsLabel(property.beds)} · ${property.bathrooms} bath${property.bathrooms === 1 ? '' : 's'}`}
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              {showRating ? (
                <>
                  <StarIcon size={14} className="text-ink" />
                  <span className="text-base font-semibold text-ink">{property.rating?.toFixed(2)}</span>
                  <span className="text-base text-ink-secondary">·</span>
                  <span className="text-base font-semibold text-ink underline">{property.reviewCount} reviews</span>
                </>
              ) : (
                <span className="text-base font-semibold text-ink-accent">New listing</span>
              )}
            </div>
          </div>

          <div className="h-px bg-line" />

          {/* No host display name is exposed over GraphQL yet (spec.md's out-of-scope) — static copy,
              not a fabricated name, matching the mocked/decorative convention used elsewhere on this page. */}
          <div className="flex items-center gap-4 py-6">
            <div className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center bg-navy-900">
              <HomeIcon size={20} strokeWidth={1.75} className="text-gold-300" />
            </div>
            <span className="text-base font-semibold text-ink">Hosted by a DubaiShortStay host</span>
          </div>

          <div className="h-px bg-line" />

          <div className="flex flex-col gap-6 py-7">
            {property.isInstantBook && (
              <div className="flex gap-5">
                <BoltIcon size={26} strokeWidth={1.75} className="text-ink shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-base font-semibold text-ink">Instant Book</span>
                  <span className="text-sm text-ink-muted">
                    Your booking is confirmed straight away — no waiting for host approval.
                  </span>
                </div>
              </div>
            )}
            {property.detPermitNumber && (
              <div className="flex gap-5">
                <HomeIcon size={26} strokeWidth={1.75} className="text-ink shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-base font-semibold text-ink">DET-licensed holiday home</span>
                  <span className="text-sm text-ink-muted">
                    Permit <span className="font-mono text-[13px]">{property.detPermitNumber}</span> · verified by
                    DubaiShortStay
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="h-px bg-line" />

          <div className="py-7 flex flex-col gap-3">
            <p className="text-base leading-6 text-ink">{property.description}</p>
          </div>

          <div className="h-px bg-line" />

          <div className="py-7 flex flex-col gap-5">
            <h3 className="font-serif font-semibold text-2xl leading-[30px] text-ink">What this place offers</h3>
            <p className="text-base text-ink-secondary">
              {property.amenityIds.length} amenit{property.amenityIds.length === 1 ? 'y' : 'ies'} included
              {property.accessibilityIds.length > 0 &&
                ` · ${property.accessibilityIds.length} accessibility feature${property.accessibilityIds.length === 1 ? '' : 's'}`}
            </p>
          </div>

          <div className="h-px bg-line" />

          <div className="py-7 flex flex-col gap-3">
            <h3 className="font-serif font-semibold text-2xl leading-[30px] text-ink">Cancellation policy</h3>
            <p className="text-base text-ink-secondary">
              {CANCELLATION_POLICY_LABEL[property.cancellationPolicy] ?? property.cancellationPolicy}
            </p>
          </div>
        </div>

        <div className="sticky top-6">
          <div className="w-[400px] bg-surface border border-line rounded-2xl shadow-card p-6 flex flex-col gap-5">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="price text-[28px] leading-8 text-ink">{formatAed(property.basePriceAed, property.currency)}</span>
                <span className="text-base text-ink-secondary">night</span>
              </div>
            </div>
            {property.cleaningFeeAed != null && (
              <div className="flex justify-between gap-4">
                <span className="text-base text-ink">Cleaning fee</span>
                <span className="text-base text-ink whitespace-nowrap">{formatAed(property.cleaningFeeAed, property.currency)}</span>
              </div>
            )}
            <Button variant="primary" size="lg" className="w-full" disabled>
              Reserve
            </Button>
            <p className="text-xs text-ink-muted text-center">
              Booking isn't available in this preview yet — dates and payment aren't wired up.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
