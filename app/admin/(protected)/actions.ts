'use server'

import { revalidatePath } from 'next/cache'
import prisma from '../../../lib/prisma'
import { getAdminSession } from '../../../lib/adminAuth'
import { sendSubscription } from '../../../lib/websub/subscribe'
import { backfillBlog } from '../../../lib/websub/backfillBlog'

// Server Actions are callable like public endpoints (per Next.js's own
// guidance), so every one of these re-checks the admin session itself -
// the (protected) layout gating the page is not sufficient on its own.
async function requireAdmin() {
  const session = await getAdminSession()
  if (!session) throw new Error('Not authorized')
}

export async function approveBlogAction(blogId: string) {
  await requireAdmin()
  await prisma.blog.update({ where: { id: blogId }, data: { approved: true } })
  revalidatePath('/admin')
}

export async function unpublishBlogAction(blogId: string) {
  await requireAdmin()
  await prisma.blog.update({ where: { id: blogId }, data: { approved: false } })
  revalidatePath('/admin')
}

export async function deleteBlogAction(blogId: string) {
  await requireAdmin()
  const blog = await prisma.blog.findUnique({ where: { id: blogId } })
  if (!blog) return

  if (blog.hubUrl && blog.feedUrl && blog.subscriptionSecret) {
    try {
      await sendSubscription({
        hubUrl: blog.hubUrl,
        topicUrl: blog.feedUrl,
        blogId: blog.id,
        secret: blog.subscriptionSecret,
        mode: 'unsubscribe',
      })
    } catch (error) {
      console.error(`Failed to unsubscribe ${blog.url} before delete (continuing anyway):`, error)
    }
  }

  await prisma.blog.delete({ where: { id: blogId } })
  revalidatePath('/admin')
}

// Re-sends the subscribe request immediately instead of waiting for the
// scheduled renewal workflow. Failures are recorded on the blog rather than
// thrown, matching onboardBlog's treatment of hub errors as non-fatal.
export async function renewBlogAction(blogId: string) {
  await requireAdmin()
  const blog = await prisma.blog.findUnique({ where: { id: blogId } })
  if (!blog?.hubUrl || !blog.feedUrl || !blog.subscriptionSecret) {
    revalidatePath('/admin')
    return
  }

  try {
    await sendSubscription({
      hubUrl: blog.hubUrl,
      topicUrl: blog.feedUrl,
      blogId: blog.id,
      secret: blog.subscriptionSecret,
      mode: 'subscribe',
    })
  } catch (error) {
    console.error(`Manual renewal failed for ${blog.url}:`, error)
    await prisma.blog.update({ where: { id: blogId }, data: { subscriptionStatus: 'failed' } })
  }
  revalidatePath('/admin')
}

// Re-fetches the feed immediately instead of waiting for the scheduled
// polling workflow.
export async function pollBlogAction(blogId: string) {
  await requireAdmin()
  const blog = await prisma.blog.findUnique({ where: { id: blogId } })
  if (!blog?.feedUrl) {
    revalidatePath('/admin')
    return
  }

  try {
    await backfillBlog({ id: blog.id, feedUrl: blog.feedUrl })
    await prisma.blog.update({ where: { id: blogId }, data: { lastPolledAt: new Date() } })
  } catch (error) {
    console.error(`Manual poll failed for ${blog.url}:`, error)
  }
  revalidatePath('/admin')
}
