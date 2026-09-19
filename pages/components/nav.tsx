import { Box, Container, Flex, Link as RadixLink, Text } from '@radix-ui/themes';
import Link from 'next/link';

function NavBar() {
  return (
    <Box style={{ backgroundColor: 'var(--teal-9)' }} py="3" mb="4" width="100%">
      <Container px="4">
        <Flex align="center" justify="between">
          <Text size="3" weight="bold" style={{ color: 'white', textTransform: 'uppercase' }}>
            Hathmaluwa
          </Text>
          <Flex gap="4">
            <RadixLink href="#pablo" style={{ color: 'white' }} size="1" weight="bold">
              NEWS
            </RadixLink>
            <RadixLink asChild style={{ color: 'white' }} size="1" weight="bold">
              <Link href="/signup">ADD YOUR BLOG</Link>
            </RadixLink>
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
}

export default NavBar
