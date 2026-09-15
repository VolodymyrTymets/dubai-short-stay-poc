import { usePropertiesQuery } from '../../../../shared/api/generated.graphql'
import { ChevronDownIcon, BoltIcon } from '../../../../shared/components/icons'
import { PropertyResultsGrid } from '../components/PropertyResultsGrid'

const RESULTS_TAKE = 9

function SelfCheckInIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M13 4h3a2 2 0 0 1 2 2v14" />
      <path d="M2 20h3" />
      <path d="M13 20h9" />
      <path d="M10 12v.01" />
      <path d="M13 4.56v16.16a1 1 0 0 1-1.24.97L5 20V5.56a2 2 0 0 1 1.52-1.94l4-1A2 2 0 0 1 13 4.56Z" />
    </svg>
  )
}

function FiltersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 4h-7" />
      <path d="M10 4H3" />
      <path d="M21 12h-9" />
      <path d="M8 12H3" />
      <path d="M21 20h-5" />
      <path d="M12 20H3" />
      <path d="M14 2v4" />
      <path d="M8 10v4" />
      <path d="M16 18v4" />
    </svg>
  )
}

const filterChip = 'flex items-center gap-1.5 h-9 px-3.5 rounded-full border text-sm font-medium'

// Filters, sort and pagination below are decorative — the public `properties` query only supports
// `search: { title, slug }` + pagination, no price/bedroom/amenity/instant-book/accessibility args and no
// total-count field to paginate against. See docs/features/guest-home-search/spec.md's explicit out-of-scope.
const FILTER_PILLS = ['Property type', 'Bedrooms', 'Amenities', 'Accessibility']

export function SearchResultsPage() {
  const { data, loading, error, refetch } = usePropertiesQuery({
    variables: { pagination: { take: RESULTS_TAKE, orderBy: [{ field: 'createdAt', order: 'desc' }] } },
    notifyOnNetworkStatusChange: true,
  })

  const count = data?.properties.length ?? 0

  function retry() {
    // WHY: refetch() rejects with the same ApolloError already surfaced via the `error` state below —
    // this just stops it from becoming an unhandled promise rejection (rule D5).
    void refetch().catch(() => {})
  }

  return (
    <>
      <div className="flex items-center gap-2.5 py-4 px-20 bg-surface border-b border-line">
        <div className={`${filterChip} border-ink bg-navy-50 text-ink`}>
          Price
          <ChevronDownIcon size={14} className="text-ink-muted" />
        </div>
        {FILTER_PILLS.map((label) => (
          <div key={label} className={`${filterChip} border-line-strong bg-surface text-ink`}>
            {label}
            <ChevronDownIcon size={14} className="text-ink-muted" />
          </div>
        ))}
        <div className={`${filterChip} border-line-strong bg-surface text-ink`}>
          <BoltIcon size={14} strokeWidth={1.75} />
          Instant Book
        </div>
        <div className={`${filterChip} border-line-strong bg-surface text-ink`}>
          <SelfCheckInIcon />
          Self check-in
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2 h-9 px-3.5 rounded-full border border-line-strong text-sm font-medium text-ink">
          <FiltersIcon />
          Filters
          <span className="text-xs font-medium text-on-secondary bg-secondary rounded-full px-1.5 py-px">2</span>
        </div>
      </div>

      <div className="pt-6 px-20 pb-14 flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <span className="text-[22px] leading-7 tracking-[-0.2px] font-semibold text-ink">
              {loading ? 'Loading stays…' : `${count} stays shown`}
            </span>
            <span className="text-sm text-ink-muted">Prices include 5% VAT · Tourism Dirham Fee added at checkout</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-ink-muted">Sort</span>
            <div className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-line-strong bg-surface text-sm font-medium text-ink">
              Recommended
              <ChevronDownIcon size={14} className="text-ink-muted" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-x-6 gap-y-9">
          <PropertyResultsGrid
            loading={loading}
            hasError={!!error}
            properties={data?.properties}
            onRetry={retry}
            skeletonCount={RESULTS_TAKE}
          />
        </div>

        {count > 0 && (
          <div className="flex flex-col items-center gap-2 mt-2">
            <p className="text-xs text-ink-muted">Showing the first {count} stays</p>
          </div>
        )}
      </div>
    </>
  )
}
