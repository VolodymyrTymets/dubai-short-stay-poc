import { HeartIcon, StarIcon } from './icons'

export type PropertyCardProps = {
  imageSrc: string
  imageAlt: string
  title: string
  subtitle: string
  details: string
  pricePerNight: string
  totalPrice: string
  /** Omit to show "New" instead of a rating (fewer than 3 reviews). */
  rating?: number
  favoriteBadge?: string
  isFavorited?: boolean
  onToggleFavorite?: () => void
  photoCount?: number
}

export function PropertyCard({
  imageSrc,
  imageAlt,
  title,
  subtitle,
  details,
  pricePerNight,
  totalPrice,
  rating,
  favoriteBadge,
  isFavorited = false,
  onToggleFavorite,
  photoCount = 1,
}: PropertyCardProps) {
  return (
    <div className="flex flex-col gap-3 w-[302px] shrink-0">
      <div className="relative w-full h-[287px] rounded-xl overflow-hidden bg-cream-300 shrink-0">
        <img src={imageSrc} alt={imageAlt} className="w-full h-full object-cover block" />
        {favoriteBadge && (
          <div className="absolute left-3 top-3">
            <span className="inline-flex items-center rounded-full bg-surface shadow-pill px-2.5 py-1 text-xs font-medium text-ink whitespace-nowrap">
              {favoriteBadge}
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={onToggleFavorite}
          aria-label={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
          aria-pressed={isFavorited}
          className="absolute right-3 top-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white rounded-full"
        >
          <HeartIcon
            filled={isFavorited}
            size={24}
            strokeWidth={2}
            className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
          />
        </button>
        {photoCount > 1 && (
          <div className="absolute left-0 right-0 bottom-3 flex justify-center gap-1.5">
            {Array.from({ length: photoCount }).map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full bg-white ${i === 0 ? 'opacity-100' : 'opacity-60'}`}
              />
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-0.5">
        <div className="flex justify-between items-center gap-2">
          <span className="font-semibold text-base text-ink whitespace-nowrap overflow-hidden text-ellipsis">
            {title}
          </span>
          {rating !== undefined ? (
            <div className="flex items-center gap-1 shrink-0">
              <StarIcon size={12} className="text-ink" />
              <span className="text-sm text-ink">{rating.toFixed(2)}</span>
            </div>
          ) : (
            <span className="text-sm font-semibold text-ink-accent shrink-0">New</span>
          )}
        </div>
        <span className="text-sm text-ink-muted">{subtitle}</span>
        <span className="text-sm text-ink-muted">{details}</span>
        <div className="flex items-baseline gap-1.5 mt-1.5">
          <span className="price text-xl text-ink">{pricePerNight}</span>
          <span className="text-sm text-ink-secondary">night</span>
          <span className="text-sm text-ink-muted underline">· {totalPrice}</span>
        </div>
      </div>
    </div>
  )
}
