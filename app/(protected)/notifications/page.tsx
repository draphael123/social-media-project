import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { NotificationsList } from "@/components/notifications-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const filter = typeof searchParams.filter === "string" ? searchParams.filter : "unread"

  let query = supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (filter === "unread") {
    query = query.is("read_at", null)
  }

  const { data: notifications } = await query

  // Get unread count
  const { count: unreadCount } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("read_at", null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount || 0} unread notification{unreadCount !== 1 ? "s" : ""}
          </p>
        </div>
        {unreadCount && unreadCount > 0 && (
          <MarkAllReadButton />
        )}
      </div>

      <Tabs defaultValue={filter} className="space-y-4">
        <TabsList>
          <TabsTrigger value="unread">
            Unread ({unreadCount || 0})
          </TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value="unread">
          <NotificationsList notifications={notifications || []} />
        </TabsContent>

        <TabsContent value="all">
          <NotificationsList notifications={notifications || []} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function MarkAllReadButton() {
  return (
    <form action="/api/notifications/mark-all-read" method="POST">
      <Button type="submit" variant="outline">
        Mark All Read
      </Button>
    </form>
  )
}

