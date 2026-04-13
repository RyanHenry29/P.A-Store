"use client"

import type { Profile } from "@/lib/types"
import { NotificationsDropdown } from "./notifications-dropdown"

interface AdminHeaderProps {
  profile: Profile
}

export function AdminHeader({ profile }: AdminHeaderProps) {
  return (
    <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6">
      <div />
      
      <div className="flex items-center gap-4">
        {/* System Status */}
        <div className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse" />
          <span className="text-[#00ff88]">Sistema ativo</span>
        </div>

        {/* Notifications - Real-time */}
        <NotificationsDropdown />
      </div>
    </header>
  )
}
