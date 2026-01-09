"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, Newspaper, BookOpen, Database, Settings, ArrowLeft } from "lucide-react"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/stories", label: "Stories", icon: BookOpen },
  { href: "/admin/articles", label: "Articles", icon: Newspaper },
  { href: "/admin/sources", label: "Sources", icon: Database },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex">
        {/* Sidebar */}
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background">
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">N</span>
              </div>
              <span className="font-bold">Admin Panel</span>
            </Link>
          </div>
          <nav className="flex flex-col gap-1 p-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <div className="absolute bottom-4 left-4 right-4">
            <Button variant="outline" className="w-full bg-transparent" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Site
              </Link>
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="ml-64 flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}
