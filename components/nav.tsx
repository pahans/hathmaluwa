import { Box, Container, DropdownMenu, Flex, Link as RadixLink, Text, TextField } from '@radix-ui/themes';
import Link from 'next/link';

function NavItem({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <RadixLink asChild style={{ color: 'white' }} size="1" weight="bold" highContrast>
      <Link href={href} style={{ textTransform: 'uppercase' }}>
        {children}
      </Link>
    </RadixLink>
  );
}

function NavBar() {
  return (
    <Box style={{ backgroundColor: 'var(--gray-12)' }} py="3" mb="4" width="100%">
      <Container px="4">
        <Flex align="center" justify="between" gap="4" wrap="wrap">
          <Text size="3" weight="bold" style={{ color: 'white', textTransform: 'uppercase' }}>
            Hathmaluwa
          </Text>

          <Flex gap="5" align="center" wrap="wrap">
            <NavItem href="/">Home</NavItem>
            <NavItem href="/signup">Add Your Blog</NavItem>
            <NavItem href="/subscribe">Subscribe</NavItem>

            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <Text
                  size="1"
                  weight="bold"
                  style={{ color: 'white', textTransform: 'uppercase', cursor: 'pointer' }}
                >
                  Support
                </Text>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                <DropdownMenu.Item asChild>
                  <Link href="/donate">Donate</Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                  <Link href="/sponsor">Sponsor</Link>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>

            <NavItem href="/badge">Badge</NavItem>
            <NavItem href="/contact">Contact</NavItem>
          </Flex>

          <TextField.Root placeholder="Search" size="2" style={{ width: '12rem' }} />
        </Flex>
      </Container>
    </Box>
  );
}

export default NavBar
