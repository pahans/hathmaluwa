import Head from 'next/head'
import { Flex, Heading, Text } from '@radix-ui/themes';
import NavBar from './components/nav'

export default function Home() {
  return (
    <div>
      <Head>
        <title>Hathmaluwa</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <NavBar />
        <Heading size="9">Hello</Heading>
        <Text as="p">world</Text>
      </main>
      <Flex asChild align="center" justify="center" width="100%" height="6rem" style={{ borderTop: '1px solid var(--gray-a5)' }}>
        <footer>
          <a
            style={{ display: 'flex', alignItems: 'center' }}
            href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Powered by{' '}
            <img src="/vercel.svg" alt="Vercel Logo" style={{ height: '1rem', marginLeft: '0.5rem' }} />
          </a>
        </footer>
      </Flex>
    </div>
  )
}
