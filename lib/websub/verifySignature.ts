import { createHmac, timingSafeEqual } from 'crypto'

// WebSub hubs sign content distribution requests with
// `X-Hub-Signature: sha1=<hex>` or `sha256=<hex>`, an HMAC of the raw request
// body keyed with the secret we supplied at subscribe time.
export function verifySignature(rawBody: string, header: string | null, secret: string): boolean {
  if (!header) return false

  const [algo, signature] = header.split('=')
  if (!algo || !signature) return false

  const hashAlgo = algo.toLowerCase()
  if (hashAlgo !== 'sha1' && hashAlgo !== 'sha256') return false

  const expected = createHmac(hashAlgo, secret).update(rawBody).digest('hex')

  const expectedBuf = Buffer.from(expected, 'hex')
  const signatureBuf = Buffer.from(signature, 'hex')
  if (expectedBuf.length !== signatureBuf.length) return false

  return timingSafeEqual(expectedBuf, signatureBuf)
}
