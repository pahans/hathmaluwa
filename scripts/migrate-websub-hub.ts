import prisma from '../lib/prisma'
import { sendSubscription, WEBSUB_HUB_URL } from '../lib/websub/subscribe'

// One-off migration for blogs onboarded before onboardBlog.ts switched to
// always subscribing via WEBSUB_HUB_URL (see subscribe.ts) instead of
// whatever hub the feed itself declares. Almost all of our blogs are
// Blogger/Blogspot, which all declare Google's abandoned
// pubsubhubbub.appspot.com - it's still reachable but drops the large
// majority of subscribe requests, which is why so many blogs are stuck
// 'failed'. This re-points every blog still on an old hub at
// WEBSUB_HUB_URL and re-sends the subscribe request.
async function main() {
  const dryRun = !process.argv.includes('--apply')

  const blogs = await prisma.blog.findMany({
    where: {
      hubUrl: { not: null, notIn: [WEBSUB_HUB_URL] },
      feedUrl: { not: null },
      subscriptionSecret: { not: null },
    },
  })

  if (blogs.length === 0) {
    console.log('No blogs found on an old hub.')
    return
  }

  let migrated = 0
  for (const blog of blogs) {
    console.log(`${dryRun ? 'WOULD MIGRATE' : 'MIGRATE'}  ${blog.name}: ${blog.hubUrl} -> ${WEBSUB_HUB_URL}`)
    if (dryRun) continue

    try {
      // Written 'pending' *before* sending the subscribe request, same as
      // onboardBlog.ts - the hub's verification GET can (and often does)
      // reach our callback route before this script's own next line runs,
      // so a status write issued after sendSubscription() would race the
      // callback and can clobber 'active' back to 'pending'.
      await prisma.blog.update({
        where: { id: blog.id },
        data: { hubUrl: WEBSUB_HUB_URL, subscriptionStatus: 'pending' },
      })
      await sendSubscription({
        hubUrl: WEBSUB_HUB_URL,
        topicUrl: blog.feedUrl!,
        blogId: blog.id,
        secret: blog.subscriptionSecret!,
        mode: 'subscribe',
      })
      migrated++
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.log(`ERROR ${blog.name}: ${message}`)
      await prisma.blog.update({
        where: { id: blog.id },
        data: { hubUrl: WEBSUB_HUB_URL, subscriptionStatus: 'failed' },
      })
    }
  }

  console.log(`\n${migrated} of ${blogs.length} blog(s) ${dryRun ? 'would be' : 'were'} migrated.`)
  if (dryRun) {
    console.log('Dry run only - rerun with --apply to send subscribe requests and update the DB.')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
