import { useNavigate, Link } from 'react-router'
import { SearchBar } from '../../../../shared/components/SearchBar'
import { Badge } from '../../../../shared/components/Badge'
import { usePropertiesQuery } from '../../../../shared/api/generated.graphql'
import { PropertyResultsGrid } from '../components/PropertyResultsGrid'

const AREA_CHIPS = ['Dubai Marina', 'Downtown Dubai', 'Palm Jumeirah', 'JBR', 'Business Bay']

const HAND_PICKED_TAKE = 8

function LicensedHostsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

function AllInclusiveIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <path d="M12 17.5v-11" />
    </svg>
  )
}

function CuratedIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
    </svg>
  )
}

const WHY_CARDS = [
  {
    Icon: LicensedHostsIcon,
    title: 'Licensed hosts only',
    body: 'Every listing carries a valid DET holiday-home permit, checked by our team before it goes live.',
  },
  {
    Icon: AllInclusiveIcon,
    title: 'All-inclusive, transparent pricing',
    body: 'The nightly rate covers utilities, Wi-Fi and 5% VAT. The Tourism Dirham Fee is shown before you pay.',
  },
  {
    Icon: CuratedIcon,
    title: 'Curated, not crowded',
    body: 'Homes are reviewed for accuracy, photography and guest experience — backed by 23 years of operator know-how.',
  },
]

const ctaButton =
  'inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg font-semibold text-base whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-line-focus'

export function HomePage() {
  const navigate = useNavigate()
  const { data, loading, error, refetch } = usePropertiesQuery({
    variables: { pagination: { take: HAND_PICKED_TAKE, orderBy: [{ field: 'createdAt', order: 'desc' }] } },
    notifyOnNetworkStatusChange: true,
  })

  function goToSearch() {
    navigate('/search')
  }

  function retryHandPicked() {
    // WHY: refetch() rejects with the same ApolloError already surfaced via the `error` state below —
    // this just stops it from becoming an unhandled promise rejection (rule D5).
    void refetch().catch(() => {})
  }

  return (
    <>
      <section className="pt-18 px-20 pb-16 flex flex-col items-center gap-6 text-center">
        <div className="eyebrow">Curated short stays · Dubai</div>
        <h1 className="font-serif font-medium text-[64px] leading-[68px] tracking-[-1px] text-ink max-w-[900px]">
          The <span className="italic text-ink-accent">curated</span> short-stay marketplace for Dubai.
        </h1>
        <p className="text-lg leading-7 text-ink-secondary max-w-[640px]">
          Every home is reviewed by our team and listed by a DET-licensed operator. Rates are all-inclusive —
          utilities, Wi-Fi and 5% VAT included.
        </p>
        <div className="mt-4">
          <SearchBar variant="hero" where="Search Dubai areas" checkIn="Add dates" checkOut="Add dates" guests="Add guests" onSearch={goToSearch} />
        </div>
        <div className="flex gap-2.5 mt-1">
          {AREA_CHIPS.map((area) => (
            <Badge key={area}>{area}</Badge>
          ))}
        </div>
      </section>

      <section className="px-20 pb-20 flex flex-col gap-8">
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-2">
            <div className="eyebrow">Hand-picked</div>
            <h2 className="font-serif font-medium text-[36px] leading-10 tracking-[-0.25px] text-ink">Dubai Favorites</h2>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-x-6 gap-y-10">
          <PropertyResultsGrid
            loading={loading}
            hasError={!!error}
            properties={data?.properties}
            onRetry={retryHandPicked}
            skeletonCount={HAND_PICKED_TAKE}
          />
        </div>
        <div className="flex justify-center">
          <Link to="/search" className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-surface border border-line-strong font-semibold text-base text-ink">
            Show all stays
          </Link>
        </div>
      </section>

      <section className="bg-section py-18 px-20 flex flex-col gap-10">
        <div className="flex flex-col gap-2 items-center text-center">
          <div className="eyebrow">Why DubaiShortStay</div>
          <h2 className="font-serif font-medium text-[36px] leading-10 tracking-[-0.25px] text-ink">
            Book like a local, with operator-grade standards
          </h2>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {WHY_CARDS.map(({ Icon, title, body }) => (
            <div key={title} className="bg-surface rounded-2xl p-7 flex flex-col gap-3.5 border border-sky-200">
              <div className="w-12 h-12 rounded-xl bg-gold-50 flex items-center justify-center text-ink-accent">
                <Icon />
              </div>
              <h3 className="font-serif font-semibold text-2xl leading-[30px] text-ink">{title}</h3>
              <p className="text-base leading-6 text-ink-secondary">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="p-20">
        <div className="flex items-center justify-between gap-12 bg-navy-900 rounded-3xl py-14 px-16 overflow-hidden relative">
          <div className="flex flex-col gap-4 max-w-[620px]">
            <div className="font-mono text-xs tracking-[0.15em] uppercase text-gold-300">For DET-licensed operators</div>
            <h2 className="font-serif font-medium text-[36px] leading-10 tracking-[-0.25px] text-ink-inverse">
              List your holiday home with DubaiShortStay
            </h2>
            <p className="text-base leading-6 text-navy-100">
              Reach guests looking for quality stays. 12% all-inclusive commission — listing, photography
              guidance and distribution. VAT and Tourism Dirham handled for you.
            </p>
            {/* TODO(volodymyr, guest-home-search): no host-listing flow/URL exists yet to point these at —
                same not-yet-wired state as Header's own "List your property". */}
            <div className="flex gap-3 mt-2">
              <a href="#" className={`${ctaButton} bg-primary text-on-primary`}>
                Start listing
              </a>
              <a href="#" className={`${ctaButton} bg-transparent border border-navy-600 text-ink-inverse`}>
                How hosting works
              </a>
            </div>
          </div>
          <div className="w-[360px] h-[240px] rounded-2xl bg-cream-300 shrink-0" />
        </div>
      </section>
    </>
  )
}
