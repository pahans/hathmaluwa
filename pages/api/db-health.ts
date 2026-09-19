import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const [blogCount, blogPostCount] = await Promise.all([
    prisma.blog.count(),
    prisma.blogPost.count(),
  ])

  res.status(200).json({ ok: true, blogCount, blogPostCount })
}
