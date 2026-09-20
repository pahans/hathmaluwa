'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import ThemeToggle from './theme-toggle'

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/subscribe', label: 'Subscribe' },
  { href: '/badge', label: 'Badge' },
  { href: '/contact', label: 'Contact' },
]

function NavBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const query = searchParams.get('q') ?? ''

  return (
    <header className="hm-site-header">
      <div className="hm-header-inner">
        <Link className="hm-brand" href="/" aria-label="Hathmaluwa home">
          {/* The logo is used exactly as supplied. See design/hathmaluwa/logos-README.md. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/badges/hathmaluwa-horizontal.png" width={131} height={40} alt="හත්මාළුව Hathmaluwa" />
        </Link>

        <nav className="hm-nav" aria-label="Main">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} aria-current={pathname === link.href ? 'page' : undefined}>
              {link.label}
            </Link>
          ))}
        </nav>

        <form className="hm-search" role="search" action="/" method="get">
          <label htmlFor="hm-q" className="hm-sr-only">
            Search posts
          </label>
          <input id="hm-q" name="q" type="search" placeholder="Search" autoComplete="off" defaultValue={query} key={query} />
        </form>

        <ThemeToggle />
        <Link className="hm-btn hm-btn-header" href="/signup">
          Add Your Blog
        </Link>
      </div>
    </header>
  )
}

export default NavBar
