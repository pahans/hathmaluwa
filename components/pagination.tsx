import Link from 'next/link'
import { pageList } from '../lib/pagination'

function hrefFor(page: number, query: string) {
  const params = new URLSearchParams()
  if (query) params.set('q', query)
  if (page > 1) params.set('page', String(page))
  const qs = params.toString()
  return qs ? `/?${qs}` : '/'
}

function Pagination({ currentPage, totalPages, query }: { currentPage: number; totalPages: number; query: string }) {
  if (totalPages <= 1) return null

  const prevDisabled = currentPage <= 1
  const nextDisabled = currentPage >= totalPages

  return (
    <nav className="hm-pagination" aria-label="Pagination">
      <Link
        className="hm-pg"
        href={hrefFor(currentPage - 1, query)}
        aria-label="Previous page"
        aria-disabled={prevDisabled}
        tabIndex={prevDisabled ? -1 : undefined}
      >
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="hm-pg-label">Previous</span>
      </Link>

      {pageList(currentPage, totalPages).map((entry, index) =>
        entry === 'gap' ? (
          <span key={`gap-${index}`} className="hm-pg-gap" aria-hidden="true">
            …
          </span>
        ) : (
          <Link
            key={entry}
            className="hm-pg"
            href={hrefFor(entry, query)}
            aria-label={`Page ${entry}`}
            aria-current={entry === currentPage ? 'page' : undefined}
          >
            {entry}
          </Link>
        )
      )}

      <Link
        className="hm-pg"
        href={hrefFor(currentPage + 1, query)}
        aria-label="Next page"
        aria-disabled={nextDisabled}
        tabIndex={nextDisabled ? -1 : undefined}
      >
        <span className="hm-pg-label">Next</span>
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </nav>
  )
}

export default Pagination
