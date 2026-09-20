import type { ReactNode } from 'react'
import NavBar from './nav'
import Footer from './footer'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="hm">
      <NavBar />
      {children}
      <Footer />
    </div>
  )
}
