import prisma from '../lib/prisma'

// One-off cleanup for duplicate Blog rows left behind by the old
// bulk-add-blogs.ts bug (see fix-blog-homepage-urls.ts): the same blog got
// onboarded twice under two different feed-URL spellings (e.g. with and
// without "?alt=rss"), creating a real row (posts backfilled) and a 0-post
// stub. The stub's url is often the blog's correct homepage, which blocks
// fix-blog-homepage-urls.ts from correcting the real row's url (unique
// constraint). Deleting the stub frees that url up.
//
// Each pair here was found by fix-blog-homepage-urls.ts logging "already
// used by another blog row" - the stub id is the 0-post row from that pair.
const STUB_IDS_TO_DELETE = [
  '4913748f-d957-433f-87df-f21d773ab768', // colored-machines.blogspot.com stub
  '2da7b92b-535d-4b87-a608-22ca038485b5', // adare1.blogspot.com stub
  '55e88574-3489-4d3a-b295-9fcfe9c9fe0d', // ashenjanath.blogspot.com stub
  '3448580a-fee4-457a-963c-fe547d87fae8', // asi4ever.blogspot.com stub
  '4adf024d-3d48-4a9a-95eb-3dc640080796', // dreamsofhiranya.blogspot.com stub
]

async function main() {
  const dryRun = !process.argv.includes('--apply')

  const stubs = await prisma.blog.findMany({
    where: { id: { in: STUB_IDS_TO_DELETE } },
    include: { _count: { select: { posts: true } } },
  })

  for (const stub of stubs) {
    if (stub._count.posts > 0) {
      console.log(`SKIP  ${stub.name} (${stub.id}): has ${stub._count.posts} posts, not a 0-post stub - not deleting`)
      continue
    }
    console.log(`${dryRun ? 'WOULD DELETE' : 'DELETE'}  ${stub.name} (${stub.id})  url=${stub.url}`)
    if (!dryRun) {
      await prisma.blog.delete({ where: { id: stub.id } })
    }
  }

  const missing = STUB_IDS_TO_DELETE.filter((id) => !stubs.some((s) => s.id === id))
  for (const id of missing) {
    console.log(`SKIP  ${id}: not found (already deleted?)`)
  }

  if (dryRun) {
    console.log('\nDry run only - rerun with --apply to delete these rows.')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
