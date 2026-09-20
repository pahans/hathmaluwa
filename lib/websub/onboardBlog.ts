import prisma from '../prisma'
import { discoverFeedUrl, discoverHub, NoHubAdvertisedError } from './discover'
import { generateSubscriptionSecret } from './secret'
import { sendSubscription, WEBSUB_HUB_URL } from './subscribe'
import { backfillBlog } from './backfillBlog'

export interface OnboardBlogOptions {
  // New rows default to approved (operator-run CLI/bulk imports are already
  // curated); the public /signup route passes false so submissions need a
  // manual pnpm approve-blog before they show up in the feed.
  approved?: boolean
  // Skips discoverFeedUrl and uses this feed URL directly - lets a submitter
  // give us their feed URL when we can't discover it ourselves (e.g. the
  // homepage is behind bot protection but the feed itself is reachable).
  feedUrlOverride?: string
}

// Onboards a blog: discovers its feed, and either subscribes to its WebSub
// hub, or - if it doesn't advertise one - marks it 'unsupported' so
// scripts/poll-unsupported-blogs.ts picks it up instead. Either way, does a
// one-time backfill so the feed isn't empty until the next update.
export async function onboardBlog(
  blogUrl: string,
  name: string,
  author: string,
  authorEmail: string,
  options: OnboardBlogOptions = {},
) {
  const { approved = true, feedUrlOverride } = options

  const feedUrl = feedUrlOverride ?? (await discoverFeedUrl(blogUrl))

  let topicUrl = feedUrl
  let hubUrl: string | null = null
  let subscriptionSecret: string | null = null

  try {
    const discovered = await discoverHub(feedUrl)
    topicUrl = discovered.feedUrl
    // We ignore discovered.hubUrl and always subscribe through WEBSUB_HUB_URL
    // (see subscribe.ts) - discoverHub is still used to confirm the feed
    // advertises a hub at all, so feeds with none still fall back to polling.
    hubUrl = WEBSUB_HUB_URL
    subscriptionSecret = generateSubscriptionSecret()
  } catch (error) {
    if (!(error instanceof NoHubAdvertisedError)) throw error
    console.log(`${blogUrl}: no WebSub hub advertised, falling back to polling.`)
  }

  // The Blog row is only created once discovery above has confirmed blogUrl
  // resolves to a real, fetchable feed - so a bad URL, an unreachable site,
  // or an SSRF-guard rejection (all reachable from the public, unauthenticated
  // /signup form) throws before anything is persisted, instead of leaving a
  // stub row with attacker-supplied name/author/authorEmail behind.
  const blog = await prisma.blog.upsert({
    where: { url: blogUrl },
    update: {
      name,
      author,
      authorEmail,
      feedUrl: topicUrl,
      hubUrl,
      subscriptionSecret,
      subscriptionStatus: hubUrl ? 'pending' : 'unsupported',
    },
    create: {
      url: blogUrl,
      name,
      author,
      authorEmail,
      approved,
      feedUrl: topicUrl,
      hubUrl,
      subscriptionSecret,
      subscriptionStatus: hubUrl ? 'pending' : 'unsupported',
    },
  })

  if (hubUrl && subscriptionSecret) {
    try {
      await sendSubscription({
        hubUrl,
        topicUrl,
        blogId: blog.id,
        secret: subscriptionSecret,
        mode: 'subscribe',
      })
      console.log(`Subscribe request sent to ${hubUrl} for ${topicUrl}. Awaiting hub verification.`)
    } catch (error) {
      // The hub rejecting/erroring on subscribe (e.g. a transient 503) is not
      // a reason to skip the backfill below - scripts/renew-subscriptions.ts
      // will retry 'failed' subscriptions on its next run.
      await prisma.blog.update({ where: { id: blog.id }, data: { subscriptionStatus: 'failed' } })
      console.error(`Subscribe request to ${hubUrl} failed, will retry later: ${error}`)
    }
  }

  const backfilled = await backfillBlog({ id: blog.id, feedUrl: topicUrl })
  console.log(`Backfilled ${backfilled} existing posts for ${blogUrl}.`)

  return blog
}
