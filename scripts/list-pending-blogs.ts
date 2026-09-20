import prisma from '../lib/prisma'

// Lists /signup submissions awaiting a pnpm approve-blog before they show up
// in the feed and RSS.
async function main() {
  const blogs = await prisma.blog.findMany({
    where: { approved: false },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { posts: true } } },
  })

  if (blogs.length === 0) {
    console.log('No pending submissions.')
    return
  }

  for (const blog of blogs) {
    console.log(
      `${blog.name} <${blog.author} — ${blog.authorEmail}>\n  ${blog.url}\n  ${blog._count.posts} post(s) backfilled, submitted ${blog.createdAt.toISOString()}\n`,
    )
  }
  console.log(`${blogs.length} pending submission(s).`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
