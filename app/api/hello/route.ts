// Next.js Route Handlers: https://nextjs.org/docs/app/api-reference/file-conventions/route

export async function GET() {
  return Response.json({ name: 'John Doe' })
}
