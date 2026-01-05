import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertTriangle, Calendar, CheckCircle, Clock } from "lucide-react"
import { format } from "date-fns"
import { checkAndCreateOverdueNotifications } from "@/lib/notifications"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Check for overdue items and create notifications
  await checkAndCreateOverdueNotifications(supabase, user.id)

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // Get stats
  const now = new Date()

  // Overdue deliverables
  const { data: overdue } = await supabase
    .from("deliverables")
    .select("*, requester:profiles!deliverables_requester_id_fkey(*), assignee:profiles!deliverables_assignee_id_fkey(*)")
    .lt("due_at", now.toISOString())
    .not("status", "eq", "Posted")
    .not("status", "eq", "Archived")
    .order("due_at", { ascending: true })
    .limit(10)

  // Due today
  const startOfToday = new Date(now.setHours(0, 0, 0, 0))
  const endOfToday = new Date(now.setHours(23, 59, 59, 999))
  const { data: dueToday } = await supabase
    .from("deliverables")
    .select("*, requester:profiles!deliverables_requester_id_fkey(*), assignee:profiles!deliverables_assignee_id_fkey(*)")
    .gte("due_at", startOfToday.toISOString())
    .lte("due_at", endOfToday.toISOString())
    .not("status", "eq", "Posted")
    .not("status", "eq", "Archived")
    .order("priority", { ascending: true })
    .limit(10)

  // Pending approvals
  const { data: pendingApprovals } = await supabase
    .from("approvals")
    .select("*, deliverable:deliverables(*), approver:profiles!approvals_approver_id_fkey(*)")
    .eq("status", "pending")
    .eq("approver_id", user.id)
    .order("requested_at", { ascending: true })
    .limit(10)

  // My assigned deliverables
  const { data: myDeliverables } = await supabase
    .from("deliverables")
    .select("*, requester:profiles!deliverables_requester_id_fkey(*)")
    .eq("assignee_id", user.id)
    .not("status", "eq", "Posted")
    .not("status", "eq", "Archived")
    .order("due_at", { ascending: true })
    .limit(10)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {profile?.full_name || profile?.email}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdue?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Today</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dueToday?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingApprovals?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Assignments</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myDeliverables?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {overdue && overdue.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Overdue Deliverables</CardTitle>
              <CardDescription>Items past their due date</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {overdue.map((item: any) => (
                  <Link
                    key={item.id}
                    href={`/deliverables/${item.id}`}
                    className="block rounded-lg border p-3 hover:bg-accent"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Due: {format(new Date(item.due_at), "MMM d, yyyy")}
                        </p>
                      </div>
                      <Badge variant="destructive">Overdue</Badge>
                    </div>
                  </Link>
                ))}
              </div>
              <Button asChild variant="outline" className="mt-4 w-full">
                <Link href="/deliverables?filter=overdue">View All</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {dueToday && dueToday.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Due Today</CardTitle>
              <CardDescription>Items due today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {dueToday.map((item: any) => (
                  <Link
                    key={item.id}
                    href={`/deliverables/${item.id}`}
                    className="block rounded-lg border p-3 hover:bg-accent"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{item.title}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline">{item.priority}</Badge>
                          <Badge variant="outline">{item.status}</Badge>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <Button asChild variant="outline" className="mt-4 w-full">
                <Link href="/my-queue?filter=today">View All</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {pendingApprovals && pendingApprovals.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>Waiting for your review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pendingApprovals.map((approval: any) => (
                  <Link
                    key={approval.id}
                    href={`/deliverables/${approval.deliverable.id}`}
                    className="block rounded-lg border p-3 hover:bg-accent"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{approval.deliverable.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Requested: {format(new Date(approval.requested_at), "MMM d, yyyy")}
                        </p>
                      </div>
                      <Badge variant="outline">Pending</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex gap-4">
        <Button asChild>
          <Link href="/deliverables/new">Create New Deliverable</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/board">View Board</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/my-queue">My Queue</Link>
        </Button>
      </div>
    </div>
  )
}

