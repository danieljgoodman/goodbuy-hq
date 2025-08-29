'use client'

import { useState } from 'react'
import {
  Menu,
  X,
  Home,
  Search,
  Building2,
  User,
  Settings,
  HelpCircle,
} from 'lucide-react'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

const navigationItems = [
  {
    name: 'Home',
    href: '/',
    icon: Home,
  },
  {
    name: 'Search Businesses',
    href: '/search',
    icon: Search,
  },
  {
    name: 'Browse Categories',
    href: '/categories',
    icon: Building2,
  },
  {
    name: 'My Account',
    href: '/account',
    icon: User,
    requiresAuth: true,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    requiresAuth: true,
  },
  {
    name: 'Help & Support',
    href: '/support',
    icon: HelpCircle,
  },
]

export function MobileNavDrawer() {
  const [open, setOpen] = useState(false)
  const { data: session } = useSession()

  const filteredItems = navigationItems.filter(
    item => !item.requiresAuth || session
  )

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Navigation</DrawerTitle>
          <DrawerDescription>
            Access all main sections of Goodbuy HQ
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-6">
          <nav className="space-y-2">
            {filteredItems.map(item => {
              const Icon = item.icon
              return (
                <DrawerClose asChild key={item.name}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-secondary-900 hover:bg-secondary-100 transition-colors"
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                </DrawerClose>
              )
            })}
          </nav>

          {!session && (
            <div className="mt-6 pt-4 border-t border-secondary-200 space-y-2">
              <DrawerClose asChild>
                <Link href="/login">
                  <Button variant="outline" className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
              </DrawerClose>
              <DrawerClose asChild>
                <Link href="/signup">
                  <Button className="w-full justify-start">Get Started</Button>
                </Link>
              </DrawerClose>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
