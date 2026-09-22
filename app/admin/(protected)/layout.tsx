import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Box, Button, Flex, Heading, Text } from '@radix-ui/themes'
import { getAdminSession } from '../../../lib/adminAuth'

export const metadata: Metadata = {
  title: 'Admin',
}

// Every admin page is session-gated (cookies()), so none of it can be
// prerendered - opt the whole subtree out of the static-shell requirement.
export const instant = false

// The real (not just optimistic) auth check - proxy.ts only confirms a
// session cookie exists, this verifies its signature and re-checks the
// email allowlist. Every route under (protected) shares this layout, so
// nothing here can be reached without a valid session.
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getAdminSession()
  if (!session) {
    redirect('/admin/login')
  }

  return (
    <div className="hm">
      <Box style={{ borderBottom: '1px solid var(--gray-a5)' }} px="5" py="3">
        <Flex justify="between" align="center">
          <Heading as="h1" size="4">
            Hathmaluwa Admin
          </Heading>
          <Flex align="center" gap="4">
            <Text size="2" color="gray">
              {session.email}
            </Text>
            <form action="/api/admin/auth/logout" method="POST">
              <Button type="submit" variant="soft" size="1">
                Sign out
              </Button>
            </form>
          </Flex>
        </Flex>
      </Box>
      <Box px="5" py="5">
        {children}
      </Box>
    </div>
  )
}
