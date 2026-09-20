import { AsyncLocalStorage } from 'async_hooks'

// The SSRF guard only makes sense for URLs that came from an untrusted
// caller (the public /signup form) - operator-run scripts and the
// integration test deliberately target 127.0.0.1/private mock servers, so
// the guard must stay off for them. This flag rides the async context
// instead of a parameter threaded through every function in lib/websub, so
// enabling it for one code path (the signup route) can't be missed anywhere
// downstream.
const store = new AsyncLocalStorage<boolean>()

export function withPublicUrlGuard<T>(fn: () => Promise<T>): Promise<T> {
  return store.run(true, fn)
}

export function isPublicUrlGuardActive(): boolean {
  return store.getStore() === true
}
