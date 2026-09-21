import type { Metadata } from 'next'
import { Button, Callout, Card, Container, Flex, Heading, Text } from '@radix-ui/themes'

export const metadata: Metadata = {
  title: 'Admin sign in',
}

export default async function AdminLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="hm">
      <Flex justify="center" align="center" px="4" style={{ minHeight: '100vh' }}>
        <Container size="1">
          <Card size="4">
            <Heading as="h1" size="6" align="center">
              Hathmaluwa Admin
            </Heading>
            <Text as="p" size="2" align="center" mt="2" color="gray">
              Sign in with the Google account authorized for admin access.
            </Text>

            {error && (
              <Callout.Root color="red" mt="4" role="alert">
                <Callout.Text>{error}</Callout.Text>
              </Callout.Root>
            )}

            <Flex justify="center" mt="5">
              <Button asChild size="3">
                <a href="/api/admin/auth/google">Sign in with Google</a>
              </Button>
            </Flex>
          </Card>
        </Container>
      </Flex>
    </div>
  )
}
