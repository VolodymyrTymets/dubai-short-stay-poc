import { Button } from './Button'
import { BoltIcon, ChevronDownIcon } from './icons'

export type PriceLineItem = {
  label: string
  amount: string
}

export type BookingCardProps = {
  pricePerNight: string
  vatNote?: string
  checkIn: string
  checkOut: string
  guestsSummary: string
  onEditDates?: () => void
  ctaLabel?: string
  onReserve?: () => void
  instantBookNote?: string
  lineItems: PriceLineItem[]
  total: string
}

export function BookingCard({
  pricePerNight,
  vatNote,
  checkIn,
  checkOut,
  guestsSummary,
  onEditDates,
  ctaLabel = 'Reserve',
  onReserve,
  instantBookNote,
  lineItems,
  total,
}: BookingCardProps) {
  return (
    <div className="w-[400px] bg-surface border border-line rounded-2xl shadow-card p-6 flex flex-col gap-5">
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-1.5">
          <span className="price text-[28px] leading-8 text-ink">{pricePerNight}</span>
          <span className="text-base text-ink-secondary">night</span>
        </div>
        {vatNote && <span className="text-xs text-ink-muted">{vatNote}</span>}
      </div>

      <div className="border border-line-strong rounded-xl overflow-hidden">
        <div className="flex">
          <div className="flex-1 p-3.5 border-r border-line-strong flex flex-col gap-0.5">
            <span className="text-[10px] font-medium uppercase tracking-[0.6px] text-ink">Check-in</span>
            <span className="text-sm text-ink">{checkIn}</span>
          </div>
          <div className="flex-1 p-3.5 flex flex-col gap-0.5">
            <span className="text-[10px] font-medium uppercase tracking-[0.6px] text-ink">Checkout</span>
            <span className="text-sm text-ink">{checkOut}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onEditDates}
          className="w-full flex justify-between items-center p-3.5 border-t border-line-strong text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-line-focus"
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-medium uppercase tracking-[0.6px] text-ink">Guests</span>
            <span className="text-sm text-ink">{guestsSummary}</span>
          </div>
          <ChevronDownIcon size={18} />
        </button>
      </div>

      <Button variant="primary" size="lg" className="w-full" onClick={onReserve}>
        {ctaLabel}
      </Button>

      {instantBookNote && (
        <div className="flex items-center justify-center gap-1.5">
          <BoltIcon size={14} className="text-ink-accent" />
          <span className="text-sm text-ink-secondary">{instantBookNote}</span>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {lineItems.map((item) => (
          <div key={item.label} className="flex justify-between gap-4">
            <span className="text-base text-ink underline">{item.label}</span>
            <span className="text-base text-ink whitespace-nowrap">{item.amount}</span>
          </div>
        ))}
      </div>

      <div className="h-px bg-line" />

      <div className="flex justify-between gap-4">
        <span className="text-base font-semibold text-ink">Total</span>
        <span className="text-base font-semibold text-ink whitespace-nowrap">{total}</span>
      </div>
    </div>
  )
}
