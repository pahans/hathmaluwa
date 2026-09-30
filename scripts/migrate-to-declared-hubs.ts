import prisma from '../lib/prisma'
import {
  defaultBloggerFeedUrl,
  discoverFeedUrl,
  discoverHub,
  isFeedBurnerUrl,
  NoHubAdvertisedError,
} from '../lib/websub/discover'
import { generateSubscriptionSecret } from '../lib/websub/secret'
import { sendSubscription } from '../lib/websub/subscribe'

// One-off migration off websubhub.com, back to each feed's own declared hub.
// We'd moved every blog to websubhub.com because Google's
// pubsubhubbub.appspot.com (the hub every Blogger feed declares) was dropping
// subscribe requests; Google has since fixed that
// (https://issuetracker.google.com/issues/558997993). While at it, this also
// moves every blog onto its default feed: FeedBurner feeds are replaced by the
// blog's own feed, and Blogger's ?alt=rss / www.blogger.com/feeds/<id>
// variants are collapsed onto <blog>/feeds/posts/default, the topic Blogger
// actually pings its hub for.
//
// Each migrated blog gets a fresh subscription secret, so anything websubhub.com
// still delivers under the old subscription fails signature checks until its
// lease runs out.
const CONCURRENCY = 10

type Plan =
  | { kind: 'subscribe'; feedUrl: string; hubUrl: string }
  | { kind: 'unsupported'; feedUrl: string }

async function planFor(blog: { url: string; feedUrl: string }): Promise<Plan> {
  // Blogger now rejects many of the old www.blogger.com/feeds/<id> URLs
  // (400/401), so those are rebuilt from the blog's own address instead.
  const sourceFeed = isFeedBurnerUrl(blog.feedUrl)
    ? await discoverFeedUrl(blog.url)
    : new URL(blog.feedUrl).hostname === 'www.blogger.com'
      ? `${new URL(blog.url).origin}/feeds/posts/default`
      : (defaultBloggerFeedUrl(blog.feedUrl) ?? blog.feedUrl)

  try {
    const discovered = await discoverHub(sourceFeed)
    return { kind: 'subscribe', feedUrl: discovered.feedUrl, hubUrl: discovered.hubUrl }
  } catch (error) {
    if (!(error instanceof NoHubAdvertisedError)) throw error
    return { kind: 'unsupported', feedUrl: sourceFeed }
  }
}

async function main() {
  const dryRun = !process.argv.includes('--apply')

  const blogs = await prisma.blog.findMany({ where: { feedUrl: { not: null } } })
  const counts: Record<string, number> = {}
  const bump = (key: string) => (counts[key] = (counts[key] ?? 0) + 1)

  let next = 0
  async function worker() {
    while (next < blogs.length) {
      const blog = blogs[next++]
      let plan: Plan
      try {
        plan = await planFor({ url: blog.url, feedUrl: blog.feedUrl! })
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.log(`SKIP   ${blog.url} (${blog.subscriptionStatus}): ${message}`)
        bump(`skipped: feed unreachable (${blog.subscriptionStatus})`)
        continue
      }

      const hubUrl = plan.kind === 'subscribe' ? plan.hubUrl : null
      if (plan.feedUrl === blog.feedUrl && hubUrl === blog.hubUrl) {
        bump('unchanged')
        continue
      }

      console.log(
        `${dryRun ? 'WOULD ' : ''}MOVE ${blog.url} (${blog.subscriptionStatus})\n` +
          `         feed ${blog.feedUrl} -> ${plan.feedUrl}\n` +
          `         hub  ${blog.hubUrl} -> ${hubUrl}`,
      )
      bump(`${plan.kind}: ${hubUrl ?? 'no hub, polling'}`)
      if (dryRun) continue

      if (plan.kind === 'unsupported') {
        await prisma.blog.update({
          where: { id: blog.id },
          data: {
            feedUrl: plan.feedUrl,
            hubUrl: null,
            subscriptionSecret: null,
            subscriptionStatus: 'unsupported',
            leaseExpiresAt: null,
            pollFailureCount: 0,
          },
        })
        continue
      }

      const secret = generateSubscriptionSecret()
      // Written 'pending' *before* sending the subscribe request, same as
      // onboardBlog.ts - the hub's verification GET can reach the callback
      // route (which also needs the new feedUrl to match hub.topic) before
      // sendSubscription() resolves.
      await prisma.blog.update({
        where: { id: blog.id },
        data: {
          feedUrl: plan.feedUrl,
          hubUrl: plan.hubUrl,
          subscriptionSecret: secret,
          subscriptionStatus: 'pending',
          leaseExpiresAt: null,
          pollFailureCount: 0,
        },
      })
      try {
        await sendSubscription({
          hubUrl: plan.hubUrl,
          topicUrl: plan.feedUrl,
          blogId: blog.id,
          secret,
          mode: 'subscribe',
        })
      } catch (error) {
        console.log(`ERROR  ${blog.url}: ${error instanceof Error ? error.message : String(error)}`)
        bump('subscribe request failed')
        await prisma.blog.update({ where: { id: blog.id }, data: { subscriptionStatus: 'failed' } })
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, blogs.length) }, worker))

  console.log(`\n${blogs.length} blog(s) checked${dryRun ? ' (dry run)' : ''}:`)
  for (const [key, count] of Object.entries(counts).sort()) console.log(`  ${String(count).padStart(4)}  ${key}`)
  if (dryRun) console.log('\nDry run only - rerun with --apply to update the DB and send subscribe requests.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
