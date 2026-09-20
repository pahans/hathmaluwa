import prisma from '../lib/prisma'
import { onboardBlog } from '../lib/websub/onboardBlog'

async function main() {
  const [blogUrl, name, author, authorEmail] = process.argv.slice(2)
  if (!blogUrl || !name || !author || !authorEmail) {
    console.error('Usage: pnpm add-blog <blog-url> <name> <author> <author-email>')
    process.exit(1)
  }

  await onboardBlog(blogUrl, name, author, authorEmail)
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
    .finally(() => prisma.$disconnect())
}
