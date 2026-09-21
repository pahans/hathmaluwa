'use client';

import { useLinkStatus } from 'next/link';

function NavLinkStatus() {
  const { pending } = useLinkStatus();
  return <span aria-hidden className={`hm-nav-pending${pending ? ' is-pending' : ''}`} />;
}

export default NavLinkStatus;
