import prisma from '../lib/prisma'
import { backfillBlog } from '../lib/websub/backfillBlog'

async function main() {
  const blogUrl = process.argv[2]
  if (!blogUrl) {
    console.error('Usage: pnpm backfill-blog <blog-url>')
    process.exit(1)
  }

  const blog = await prisma.blog.findUnique({ where: { url: blogUrl } })
  if (!blog) throw new Error(`No Blog row found for ${blogUrl}. Run add-blog first.`)

  const count = await backfillBlog(blog)
  console.log(`Backfilled ${count} posts for ${blogUrl}.`)
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
    .finally(() => prisma.$disconnect())
}
