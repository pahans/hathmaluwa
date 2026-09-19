import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import type { AppProps /*, AppContext */ } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Theme accentColor="teal">
      <Component {...pageProps} />
    </Theme>
  );
}

export default MyApp
