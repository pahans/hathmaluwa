import type { Metadata } from 'next'
import Link from 'next/link'
import Layout from '../../components/layout'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Questions, feedback or something that looks wrong on Hathmaluwa? Get in touch.',
}

const CONTACT_EMAIL = 'pahan123@gmail.com'

export default function Contact() {
  return (
    <Layout>
      <main className="hm-wrap">
        <div className="hm-contact-head">
          <h1>Contact</h1>
          <p>Questions, feedback or something that looks wrong on the site? Send us an email and we&apos;ll get back to you.</p>
        </div>

        <a className="hm-btn hm-contact-email" href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>

        <p className="hm-contact-note">
          Want to add your blog to Hathmaluwa instead? Use the <Link href="/signup">signup form</Link>.
        </p>
      </main>
    </Layout>
  )
}
