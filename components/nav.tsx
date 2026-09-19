import * as NavigationMenu from '@radix-ui/react-navigation-menu'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

const navLinkClass =
  'px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75'

function NavBar() {
  return (
    <nav className="flex flex-wrap items-center justify-between px-4 py-3 bg-gray-900 w-full">
      <a
        className="text-sm font-bold leading-relaxed inline-block mr-4 py-2 whitespace-nowrap uppercase text-white"
        href="/"
      >
        Hathmaluwa
      </a>

      <NavigationMenu.Root className="flex-grow" delayDuration={0}>
        <NavigationMenu.List className="flex flex-col lg:flex-row list-none items-center">
          <NavigationMenu.Item>
            <NavigationMenu.Link className={navLinkClass} href="/">
              Home
            </NavigationMenu.Link>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <NavigationMenu.Link className={navLinkClass} href="/add-your-blog">
              Add Your Blog
            </NavigationMenu.Link>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <NavigationMenu.Link className={navLinkClass} href="/subscribe">
              Subscribe
            </NavigationMenu.Link>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger className={`${navLinkClass} bg-transparent border-none cursor-pointer`}>
                Support
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="bg-white text-gray-800 text-xs rounded shadow-lg py-2 min-w-[160px] z-50"
                  sideOffset={4}
                >
                  <DropdownMenu.Item className="px-4 py-2 outline-none hover:bg-gray-100 cursor-pointer">
                    <a href="/donate">Donate</a>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className="px-4 py-2 outline-none hover:bg-gray-100 cursor-pointer">
                    <a href="/sponsor">Sponsor</a>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <NavigationMenu.Link className={navLinkClass} href="/badge">
              Badge
            </NavigationMenu.Link>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <NavigationMenu.Link className={navLinkClass} href="/contact">
              Contact
            </NavigationMenu.Link>
          </NavigationMenu.Item>
        </NavigationMenu.List>
      </NavigationMenu.Root>

      <input
        type="search"
        placeholder="Search"
        className="bg-gray-100 text-gray-800 text-sm rounded px-3 py-2 w-48 outline-none"
      />
    </nav>
  )
}

export default NavBar
