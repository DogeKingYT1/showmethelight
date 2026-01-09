"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Search, Shield, ShieldOff } from "lucide-react"
import type { Profile } from "@/lib/types"

interface UsersTableProps {
  users: Profile[]
  currentUserId: string
}

export function UsersTable({ users, currentUserId }: UsersTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const filteredUsers = users.filter(
    (user) =>
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.display_name?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const toggleAdmin = async (userId: string, currentIsAdmin: boolean) => {
    if (userId === currentUserId) return

    setIsUpdating(userId)
    await supabase.from("profiles").update({ is_admin: !currentIsAdmin }).eq("id", userId)
    router.refresh()
    setIsUpdating(null)
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.display_name || "No name"}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.is_admin ? <Badge>Admin</Badge> : <Badge variant="secondary">User</Badge>}
                  </TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={user.id === currentUserId}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => toggleAdmin(user.id, user.is_admin)}
                          disabled={isUpdating === user.id}
                        >
                          {user.is_admin ? (
                            <>
                              <ShieldOff className="mr-2 h-4 w-4" />
                              Remove Admin
                            </>
                          ) : (
                            <>
                              <Shield className="mr-2 h-4 w-4" />
                              Make Admin
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
