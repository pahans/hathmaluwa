import prisma from '../lib/prisma'

// One-off cleanup for posts stored twice before parseFeed.ts started
// canonicalising blogspot post urls to https: Blogger's WebSub hub pushed
// http:// links while backfill/poll stored https:// ones. Deletes each http
// row that has an https twin, then rewrites the remaining http blogspot rows
// to https so future upserts match them.
async function main() {
  const dryRun = !process.argv.includes('--apply')

  const twin = `from blog_posts h join blog_posts s on s.url = 'https://' || substring(h.url from 8)
    where h.url ~* '^http://[^/]+\\.blogspot\\.com/'`
  const [{ dupes }] = await prisma.$queryRawUnsafe<{ dupes: number }[]>(`select count(*)::int dupes ${twin}`)
  const [{ rest }] = await prisma.$queryRawUnsafe<{ rest: number }[]>(
    `select count(*)::int rest from blog_posts where url ~* '^http://[^/]+\\.blogspot\\.com/'`,
  )
  console.log(`${dryRun ? 'WOULD DELETE' : 'DELETE'}  ${dupes} http rows with an https twin`)
  console.log(`${dryRun ? 'WOULD REWRITE' : 'REWRITE'} ${rest - dupes} remaining http rows to https`)
  if (dryRun) return console.log('Dry run - pass --apply to make changes.')

  await prisma.$transaction([
    prisma.$executeRawUnsafe(`delete from blog_posts where id in (select h.id ${twin})`),
    prisma.$executeRawUnsafe(
      `update blog_posts set url = 'https://' || substring(url from 8) where url ~* '^http://[^/]+\\.blogspot\\.com/'`,
    ),
  ])
  console.log('Done.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
