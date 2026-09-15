import { PropertyCard } from '../../../../shared/components/PropertyCard'
import { mapPropertyToCard, type PropertyRow } from '../../../../shared/api/property/mapPropertyToCard'

export type PropertyResultsGridProps = {
  loading: boolean
  hasError: boolean
  properties?: PropertyRow[]
  onRetry: () => void
  skeletonCount?: number
  emptyMessage?: string
}

/**
 * Renders only the grid *items* (skeleton tiles / error / empty message / cards) — the caller owns the
 * `<div className="grid ...">` wrapper so `HomePage`'s 4-column and `SearchResultsPage`'s 3-column grids
 * can each keep their own column/gap classes (frontend-react.md rule 9: extracted once used twice).
 */
export function PropertyResultsGrid({
  loading,
  hasError,
  properties,
  onRetry,
  skeletonCount = 8,
  emptyMessage = 'No stays match yet — check back soon.',
}: PropertyResultsGridProps) {
  if (loading) {
    return (
      <>
        {/* One live-region announcement for the whole set, not one per tile — the tiles below are
            aria-hidden decoration (rule 15). `sr-only` is position:absolute, so it doesn't consume a
            grid cell in the caller's grid container. */}
        <span role="status" className="sr-only">
          Loading stays
        </span>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} aria-hidden="true" className="flex flex-col gap-3 w-[302px] shrink-0">
            <div className="w-full h-[287px] rounded-xl bg-subtle animate-pulse" />
            <div className="h-4 w-3/4 rounded bg-subtle animate-pulse" />
            <div className="h-4 w-1/2 rounded bg-subtle animate-pulse" />
          </div>
        ))}
      </>
    )
  }

  if (hasError) {
    return (
      <div className="col-span-full flex flex-col items-center gap-3 py-12 text-center">
        <p className="text-ink-secondary">Couldn't load stays right now.</p>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center justify-center h-10 px-5 rounded-lg border border-line-strong bg-surface text-sm font-semibold text-ink"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!properties || properties.length === 0) {
    return (
      <div className="col-span-full flex justify-center py-12 text-center">
        <p className="text-ink-secondary">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <>
      {properties.map((property) => (
        <PropertyCard key={property.id} {...mapPropertyToCard(property)} />
      ))}
    </>
  )
}
