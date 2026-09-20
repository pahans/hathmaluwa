import { Avatar, Box, Card, Flex, Link as RadixLink, Text } from '@radix-ui/themes';
import { relativeTime } from '../lib/relativeTime';

type PostWithBlog = {
  id: string;
  url: string;
  postTitle: string;
  timestamp: Date;
  summary: string | null;
  thumbnail: string | null;
  blog: { name: string; url: string };
};

function PostCard({ post }: { post: PostWithBlog }) {
  return (
    <Card mb="5" size="2">
      <RadixLink
        asChild
        style={{
          display: 'block',
          backgroundColor: 'var(--gray-8)',
          color: 'white',
          margin: '-1rem -1rem 1rem',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-3) var(--radius-3) 0 0',
        }}
      >
        <a href={post.url} target="_blank" rel="noopener noreferrer">
          <Text size="4" weight="bold" style={{ color: 'white' }}>
            {post.postTitle}
          </Text>
        </a>
      </RadixLink>

      <Text size="2" mb="3" as="div">
        <RadixLink href={post.blog.url} target="_blank" rel="noopener noreferrer">
          {post.blog.name}
        </RadixLink>
        <Text color="gray"> | {relativeTime(post.timestamp)}</Text>
      </Text>

      <Flex gap="3" align="start">
        {post.thumbnail && (
          <Avatar src={post.thumbnail} fallback={post.blog.name[0]} radius="full" size="3" />
        )}
        {post.summary && (
          <Box>
            <Text size="2" color="gray">
              {post.summary}
            </Text>
          </Box>
        )}
      </Flex>
    </Card>
  );
}

export default PostCard
