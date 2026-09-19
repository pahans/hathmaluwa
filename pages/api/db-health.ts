import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prisma'

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const [blogCount, blogPostCount] = await Promise.all([
      prisma.blog.count(),
      prisma.blogPost.count(),
    ])

    res.status(200).json({ ok: true, blogCount, blogPostCount })
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
