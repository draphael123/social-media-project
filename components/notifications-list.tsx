"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { useState } from "react"
import Link from "next/link"

interface NotificationsListProps {
  notifications: any[]
}

export function NotificationsList({ notifications }: NotificationsListProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [markingRead, setMarkingRead] = useState<string | null>(null)

  const handleMarkRead = async (id: string) => {
    setMarkingRead(id)
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: "POST",
      })

      if (!response.ok) throw new Error("Failed to mark as read")

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setMarkingRead(null)
    }
  }

  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          No notifications
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {notifications.map((notification) => {
        const isUnread = !notification.read_at
        const linkHref =
          notification.entity_type && notification.entity_id
            ? `/${notification.entity_type}s/${notification.entity_id}`
            : "#"

        return (
          <Card
            key={notification.id}
            className={`transition-colors ${
              isUnread ? "border-primary bg-primary/5" : ""
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{notification.title}</h3>
                    {isUnread && <Badge variant="default">New</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {notification.body}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(notification.created_at), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  {isUnread && (
                    <button
                      onClick={() => handleMarkRead(notification.id)}
                      disabled={markingRead === notification.id}
                      className="text-xs text-primary hover:underline"
                    >
                      Mark read
                    </button>
                  )}
                  {linkHref !== "#" && (
                    <Link
                      href={linkHref}
                      className="text-xs text-primary hover:underline"
                      onClick={() => {
                        if (isUnread) {
                          handleMarkRead(notification.id)
                        }
                      }}
                    >
                      View
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

