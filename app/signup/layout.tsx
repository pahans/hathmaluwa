import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Sign up',
  description: 'Add your Sinhala blog to Hathmaluwa and reach thousands of readers.',
}

export default function SignupLayout({ children }: { children: ReactNode }) {
  return children
}
