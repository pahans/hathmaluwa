import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600 * 1000)

const blogs = [
  {
    url: 'https://lankaday.example.com',
    name: 'Lanka Day',
    author: 'Nimal Perera',
    authorEmail: 'nimal@lankaday.example.com',
    posts: [
      {
        postTitle: 'Daily cartoon roundup',
        url: 'https://lankaday.example.com/posts/daily-cartoon-roundup',
        timestamp: hoursAgo(2),
        summary: 'A collection of today’s most-shared editorial cartoons from around the island.',
        thumbnail: 'https://images.unsplash.com/photo-1585951237318-9ea5e175b891?w=100&h=100&fit=crop',
      },
      {
        postTitle: 'Weekend market prices: what went up, what came down',
        url: 'https://lankaday.example.com/posts/weekend-market-prices',
        timestamp: hoursAgo(30),
        summary: 'Vegetable and fish prices across Colombo, Kandy and Galle markets, compared week over week.',
        thumbnail: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&h=100&fit=crop',
      },
    ],
  },
  {
    url: 'https://bioscopesinhalen.example.com',
    name: 'Bioscope Cinema',
    author: 'Sajith Fernando',
    authorEmail: 'sajith@bioscope.example.com',
    posts: [
      {
        postTitle: 'Twister (1996) review with Sinhala subtitles',
        url: 'https://bioscopesinhalen.example.com/posts/twister-1996-review',
        timestamp: hoursAgo(3),
        summary: 'Revisiting the 1996 disaster classic that scored 6.2 on IMDb — still a fun weekend watch.',
        thumbnail: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=100&h=100&fit=crop',
      },
      {
        postTitle: 'Atlantis (2014) S02E03 with Sinhala subtitles',
        url: 'https://bioscopesinhalen.example.com/posts/atlantis-s02e03',
        timestamp: hoursAgo(3.5),
        summary: 'The gang races against time before the harbour festival begins — subtitle file linked inside.',
        thumbnail: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=100&h=100&fit=crop',
      },
      {
        postTitle: 'Top 5 rainy-day movies to stream this month',
        url: 'https://bioscopesinhalen.example.com/posts/top-5-rainy-day-movies',
        timestamp: hoursAgo(20),
        summary: 'From cosy comedies to slow-burn dramas, here’s what to queue up when the monsoon hits.',
        thumbnail: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=100&h=100&fit=crop',
      },
    ],
  },
  {
    url: 'https://karaliya.example.com',
    name: 'KaraLiya.com',
    author: 'Chamari Jayawardena',
    authorEmail: 'chamari@karaliya.example.com',
    posts: [
      {
        postTitle: 'Opposition slams government over new tax proposal',
        url: 'https://karaliya.example.com/posts/opposition-tax-proposal',
        timestamp: hoursAgo(4),
        summary: 'Parliament session runs late as members debate the fine print of the draft bill.',
        thumbnail: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=100&h=100&fit=crop',
      },
      {
        postTitle: 'Colombo port sees record container traffic this quarter',
        url: 'https://karaliya.example.com/posts/colombo-port-record-traffic',
        timestamp: hoursAgo(28),
        summary: 'Officials credit new automated scheduling for the jump in throughput.',
        thumbnail: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=100&h=100&fit=crop',
      },
    ],
  },
  {
    url: 'https://foodcorner.example.com',
    name: 'Food Corner LK',
    author: 'Dilani Silva',
    authorEmail: 'dilani@foodcorner.example.com',
    posts: [
      {
        postTitle: 'Five-minute coconut sambol for busy mornings',
        url: 'https://foodcorner.example.com/posts/five-minute-coconut-sambol',
        timestamp: hoursAgo(6),
        summary: 'A quick, no-fuss pol sambol recipe that pairs with almost anything on the breakfast table.',
        thumbnail: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=100&h=100&fit=crop',
      },
      {
        postTitle: 'Weekend baking: easy love cake for beginners',
        url: 'https://foodcorner.example.com/posts/easy-love-cake-beginners',
        timestamp: hoursAgo(48),
        summary: 'Skip the semolina soaking anxiety — this simplified version still turns out moist and fragrant.',
        thumbnail: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=100&h=100&fit=crop',
      },
    ],
  },
  {
    url: 'https://techlk.example.com',
    name: 'Tech LK',
    author: 'Ravindu Kumara',
    authorEmail: 'ravindu@techlk.example.com',
    posts: [
      {
        postTitle: 'Local startup launches ride-hailing app for three-wheelers',
        url: 'https://techlk.example.com/posts/ride-hailing-three-wheelers',
        timestamp: hoursAgo(8),
        summary: 'The app promises fixed fares and driver ratings, starting in Colombo and Negombo.',
        thumbnail: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=100&h=100&fit=crop',
      },
      {
        postTitle: 'Broadband speeds improve islandwide, new report shows',
        url: 'https://techlk.example.com/posts/broadband-speeds-improve',
        timestamp: hoursAgo(72),
        summary: 'Average download speeds are up 18% year over year, driven by fibre rollout in provincial towns.',
        thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=100&h=100&fit=crop',
      },
    ],
  },
  {
    url: 'https://travelisle.example.com',
    name: 'Travel Isle',
    author: 'Anushka Gunasekara',
    authorEmail: 'anushka@travelisle.example.com',
    posts: [
      {
        postTitle: 'A quiet weekend in Ella without the crowds',
        url: 'https://travelisle.example.com/posts/quiet-weekend-in-ella',
        timestamp: hoursAgo(10),
        summary: 'Skip Nine Arches at sunrise — here’s where else to go for the same views, minus the queue.',
        thumbnail: 'https://images.unsplash.com/photo-1586183189334-1121e0d3f5f7?w=100&h=100&fit=crop',
      },
      {
        postTitle: 'Budget guide: three days in Jaffna for under LKR 15,000',
        url: 'https://travelisle.example.com/posts/budget-guide-jaffna',
        timestamp: hoursAgo(96),
        summary: 'Where to eat, stay, and get around without breaking the bank on a northern trip.',
        thumbnail: null,
      },
    ],
  },
]

async function main() {
  for (const { posts, ...blog } of blogs) {
    await prisma.blog.upsert({
      where: { url: blog.url },
      update: blog,
      create: {
        ...blog,
        posts: { create: posts },
      },
    })
  }

  const [blogCount, blogPostCount] = await Promise.all([
    prisma.blog.count(),
    prisma.blogPost.count(),
  ])
  console.log(`Seeded ${blogCount} blogs and ${blogPostCount} posts.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
