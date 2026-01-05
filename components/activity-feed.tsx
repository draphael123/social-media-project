"use client"

import { Card, CardContent } from "@/components/ui/card"
import { format } from "date-fns"

interface ActivityFeedProps {
  activity: any[]
}

export function ActivityFeed({ activity }: ActivityFeedProps) {
  if (activity.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          No activity yet
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {activity.map((item) => (
        <Card key={item.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-semibold">{item.action}</p>
                {item.user && (
                  <p className="text-sm text-muted-foreground">
                    by {item.user.full_name || item.user.email}
                  </p>
                )}
                {item.details && (
                  <p className="mt-2 text-sm">{JSON.stringify(item.details, null, 2)}</p>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {format(new Date(item.created_at), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

