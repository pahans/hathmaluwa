import '@radix-ui/themes/styles.css'
import '../styles/tokens.css'
import '../styles/site.css'
import { Theme } from '@radix-ui/themes'
import type { AppProps /*, AppContext */ } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  // appearance="inherit": the dark/light class on <html> is set by pages/_document.tsx and components/theme-toggle.tsx.
  return (
    <Theme appearance="inherit" accentColor="blue">
      <Component {...pageProps} />
    </Theme>
  )
}

export default MyApp
