import { Box, Card, Flex, Heading, Link as RadixLink, Text } from '@radix-ui/themes';
import type { BlogPost } from '@prisma/client';

type SidebarPost = Pick<BlogPost, 'id' | 'postTitle' | 'url'>;

function PostList({ posts }: { posts: SidebarPost[] }) {
  return (
    <Flex direction="column" gap="3" mb="5">
      {posts.map((post) => (
        <RadixLink key={post.id} href={post.url} target="_blank" rel="noopener noreferrer" size="2">
          {post.postTitle}
        </RadixLink>
      ))}
    </Flex>
  );
}

function Sidebar({
  recentPosts,
  lastWeekPosts,
}: {
  recentPosts: SidebarPost[];
  lastWeekPosts: SidebarPost[];
}) {
  return (
    <Box width={{ initial: '100%', lg: '18rem' }} flexShrink="0">
      <Card mb="4">
        <Flex align="center" gap="2">
          <Box width="2rem" height="2rem" style={{ borderRadius: 6, backgroundColor: 'var(--orange-9)' }} />
          <Heading size="5">
            hath<Text color="orange">maluwa</Text>
          </Heading>
        </Flex>
      </Card>

      <Heading size="1" mb="3" style={{ textTransform: 'uppercase', color: 'var(--gray-10)' }}>
        Popular Posts - Today/Yesterday
      </Heading>
      <PostList posts={recentPosts} />

      <Heading size="1" mb="3" style={{ textTransform: 'uppercase', color: 'var(--gray-10)' }}>
        Popular Posts - Last Week
      </Heading>
      <PostList posts={lastWeekPosts} />
    </Box>
  );
}

export default Sidebar
