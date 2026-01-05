import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DeliverablesList } from "@/components/deliverables-list"
import { format, startOfToday, endOfToday, startOfWeek, endOfWeek } from "date-fns"
import { checkAndCreateOverdueNotifications } from "@/lib/notifications"

export default async function MyQueuePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Check for overdue items
  await checkAndCreateOverdueNotifications(supabase, user.id)

  const filter = typeof searchParams.filter === "string" ? searchParams.filter : "all"

  const now = new Date()
  const todayStart = startOfToday()
  const todayEnd = endOfToday()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })

  let query = supabase
    .from("deliverables")
    .select("*, requester:profiles!deliverables_requester_id_fkey(*), assignee:profiles!deliverables_assignee_id_fkey(*)")
    .eq("assignee_id", user.id)
    .not("status", "eq", "Posted")
    .not("status", "eq", "Archived")

  let todayItems: any[] = []
  let weekItems: any[] = []
  let overdueItems: any[] = []
  let blockedItems: any[] = []
  let allItems: any[] = []

  // Get all items
  const { data: all } = await query.order("due_at", { ascending: true })
  allItems = all || []

  // Filter by category
  todayItems = allItems.filter(
    (item) =>
      new Date(item.due_at) >= todayStart && new Date(item.due_at) <= todayEnd
  )

  weekItems = allItems.filter(
    (item) =>
      new Date(item.due_at) >= weekStart && new Date(item.due_at) <= weekEnd
  )

  overdueItems = allItems.filter(
    (item) => new Date(item.due_at) < now && item.status !== "Posted" && item.status !== "Archived"
  )

  blockedItems = allItems.filter((item) => item.blocked)

  const getDisplayItems = () => {
    switch (filter) {
      case "today":
        return todayItems
      case "week":
        return weekItems
      case "overdue":
        return overdueItems
      case "blocked":
        return blockedItems
      default:
        return allItems
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Queue</h1>
        <p className="text-muted-foreground">Your assigned deliverables</p>
      </div>

      <Tabs defaultValue={filter} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All ({allItems.length})</TabsTrigger>
          <TabsTrigger value="today">Today ({todayItems.length})</TabsTrigger>
          <TabsTrigger value="week">This Week ({weekItems.length})</TabsTrigger>
          <TabsTrigger value="overdue">
            Overdue ({overdueItems.length})
          </TabsTrigger>
          <TabsTrigger value="blocked">Blocked ({blockedItems.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <DeliverablesList deliverables={allItems} />
        </TabsContent>

        <TabsContent value="today">
          <DeliverablesList deliverables={todayItems} />
        </TabsContent>

        <TabsContent value="week">
          <DeliverablesList deliverables={weekItems} />
        </TabsContent>

        <TabsContent value="overdue">
          <DeliverablesList deliverables={overdueItems} />
        </TabsContent>

        <TabsContent value="blocked">
          <DeliverablesList deliverables={blockedItems} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

