import prisma from '../lib/prisma'

// Public /signup submissions land with approved=false; run this once you've
// checked a submission out to make it (and its already-backfilled posts)
// show up in the feed and RSS.
async function main() {
  const blogUrl = process.argv[2]
  if (!blogUrl) {
    console.error('Usage: pnpm approve-blog <blog-url>')
    process.exit(1)
  }

  const blog = await prisma.blog.update({ where: { url: blogUrl }, data: { approved: true } })
  console.log(`Approved "${blog.name}" (${blog.url}).`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
