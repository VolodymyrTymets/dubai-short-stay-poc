import { Logo } from '../../../shared/components/Logo'

type FooterColumn = {
  heading: string
  links: string[]
}

const footerColumns: FooterColumn[] = [
  { heading: 'Guests', links: ['How booking works', 'Cancellation policies', 'Help centre', 'Trust & safety'] },
  { heading: 'Hosts', links: ['List your property', 'Host requirements', 'DET permit guide', 'Host help'] },
  { heading: 'DubaiShortStay', links: ['About', 'Areas of Dubai', 'Careers', 'Contact'] },
]

const legalLinks = ['Privacy', 'Terms', 'Cookies']

export function Footer() {
  return (
    <footer className="bg-navy-900 px-20 pt-16 pb-10">
      <div className="flex justify-between gap-12">
        <div className="flex flex-col gap-4 w-[340px]">
          <Logo variant="dark" size={24} />
          <p className="text-sm text-navy-100">
            The curated short-stay marketplace for Dubai. Every home is listed by a DET-licensed
            holiday-home operator.
          </p>
        </div>
        <div className="flex gap-6">
          {footerColumns.map((column) => (
            <div key={column.heading} className="flex flex-col gap-3 w-[220px]">
              <span className="text-sm font-semibold text-ink-inverse">{column.heading}</span>
              {column.links.map((label) => (
                <a key={label} href="#" className="text-sm text-navy-100 hover:text-gold">
                  {label}
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="h-px bg-navy-600 mt-12 mb-6" />
      {/* TODO(volodymyr, web-page-layout): entity name/DET licence copied verbatim from the mockup —
          confirm the real operator name and licence number with the product owner before this ships. */}
      <div className="flex justify-between items-center">
        <span className="text-xs text-navy-300">
          © 2026 Keys Please Holiday Homes Rental Dubai LLC · DET Licence #727937 · Prices include 5%
          VAT; Tourism Dirham Fee shown at checkout
        </span>
        <div className="flex gap-5">
          {legalLinks.map((label) => (
            <a key={label} href="#" className="text-xs text-navy-100 hover:text-gold">
              {label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
