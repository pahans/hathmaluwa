import prisma from '../../../lib/prisma'

export async function GET() {
  try {
    const [blogCount, blogPostCount] = await Promise.all([
      prisma.blog.count(),
      prisma.blogPost.count(),
    ])

    return Response.json({ ok: true, blogCount, blogPostCount })
  } catch (error) {
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
