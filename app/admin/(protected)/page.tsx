import type { ComponentProps } from 'react'
import { Badge, Button, Card, Flex, Heading, Table, Text } from '@radix-ui/themes'
import type { Blog } from '@prisma/client'
import prisma from '../../../lib/prisma'
import {
  approveBlogAction,
  deleteBlogAction,
  pollBlogAction,
  renewBlogAction,
  unpublishBlogAction,
} from './actions'

type BlogWithCount = Blog & { _count: { posts: number } }

function statusColor(status: Blog['subscriptionStatus']): ComponentProps<typeof Badge>['color'] {
  switch (status) {
    case 'active':
      return 'green'
    case 'pending':
      return 'blue'
    case 'unsupported':
      return 'gray'
    case 'expiring':
      return 'amber'
    case 'failed':
      return 'red'
    default:
      return 'gray'
  }
}

function relativeOrNever(date: Date | null): string {
  if (!date) return 'never'
  return date.toLocaleString()
}

function BlogActions({ blog }: { blog: BlogWithCount }) {
  const canRenew = Boolean(blog.hubUrl && blog.feedUrl && blog.subscriptionSecret)
  const canPoll = Boolean(blog.feedUrl) && blog.subscriptionStatus === 'unsupported'

  return (
    <Flex gap="2" wrap="wrap">
      {!blog.approved && (
        <form action={approveBlogAction.bind(null, blog.id)}>
          <Button type="submit" size="1" color="green" variant="soft">
            Approve
          </Button>
        </form>
      )}
      {blog.approved && (
        <form action={unpublishBlogAction.bind(null, blog.id)}>
          <Button type="submit" size="1" color="amber" variant="soft">
            Unpublish
          </Button>
        </form>
      )}
      {canRenew && (
        <form action={renewBlogAction.bind(null, blog.id)}>
          <Button type="submit" size="1" variant="soft">
            Renew now
          </Button>
        </form>
      )}
      {canPoll && (
        <form action={pollBlogAction.bind(null, blog.id)}>
          <Button type="submit" size="1" variant="soft">
            Poll now
          </Button>
        </form>
      )}
      <form action={deleteBlogAction.bind(null, blog.id)}>
        <Button type="submit" size="1" color="red" variant="soft">
          Delete
        </Button>
      </form>
    </Flex>
  )
}

function BlogTable({ blogs }: { blogs: BlogWithCount[] }) {
  if (blogs.length === 0) {
    return (
      <Text as="p" size="2" color="gray">
        None.
      </Text>
    )
  }

  return (
    <Table.Root variant="surface">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>Blog</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Posts</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Last verified / polled</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Submitted</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {blogs.map((blog) => (
          <Table.Row key={blog.id}>
            <Table.RowHeaderCell>
              <Text weight="medium">
                <a href={blog.url} target="_blank" rel="noreferrer noopener">
                  {blog.name}
                </a>
              </Text>
              <br />
              <Text size="1" color="gray">
                {blog.author} · {blog.authorEmail}
              </Text>
              <br />
              <Text size="1">
                <a href={blog.url} target="_blank" rel="noreferrer noopener">
                  {blog.url}
                </a>
              </Text>
            </Table.RowHeaderCell>
            <Table.Cell>
              <Flex direction="column" gap="1" align="start">
                <Badge color={statusColor(blog.subscriptionStatus)}>{blog.subscriptionStatus}</Badge>
                {!blog.approved && <Badge color="orange">pending review</Badge>}
              </Flex>
            </Table.Cell>
            <Table.Cell>{blog._count.posts}</Table.Cell>
            <Table.Cell>
              <Text size="1">{relativeOrNever(blog.lastVerifiedAt ?? blog.lastPolledAt)}</Text>
            </Table.Cell>
            <Table.Cell>
              <Text size="1">{blog.createdAt.toLocaleDateString()}</Text>
            </Table.Cell>
            <Table.Cell>
              <BlogActions blog={blog} />
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  )
}

export default async function AdminDashboard() {
  const blogs = await prisma.blog.findMany({
    orderBy: [{ approved: 'asc' }, { createdAt: 'desc' }],
    include: { _count: { select: { posts: true } } },
  })

  const pending = blogs.filter((b) => !b.approved)
  const approved = blogs.filter((b) => b.approved)

  return (
    <Flex direction="column" gap="6">
      <section>
        <Heading as="h2" size="5" mb="3">
          Pending approval ({pending.length})
        </Heading>
        <Card size="2">
          <BlogTable blogs={pending} />
        </Card>
      </section>

      <section>
        <Heading as="h2" size="5" mb="3">
          All blogs ({approved.length})
        </Heading>
        <Card size="2">
          <BlogTable blogs={approved} />
        </Card>
      </section>
    </Flex>
  )
}
