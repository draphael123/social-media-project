import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { DeliverablesList } from "@/components/deliverables-list"
import { DeliverablesFilters } from "@/components/deliverables-filters"

export default async function DeliverablesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const search = typeof searchParams.search === "string" ? searchParams.search : ""
  const platform = typeof searchParams.platform === "string" ? searchParams.platform : ""
  const status = typeof searchParams.status === "string" ? searchParams.status : ""
  const priority = typeof searchParams.priority === "string" ? searchParams.priority : ""
  const blocked = typeof searchParams.blocked === "string" ? searchParams.blocked : ""

  let query = supabase
    .from("deliverables")
    .select("*, requester:profiles!deliverables_requester_id_fkey(*), assignee:profiles!deliverables_assignee_id_fkey(*)")
    .order("created_at", { ascending: false })

  if (search) {
    query = query.or(`title.ilike.%${search}%,campaign_name.ilike.%${search}%`)
  }

  if (platform) {
    query = query.eq("platform", platform)
  }

  if (status) {
    query = query.eq("status", status)
  }

  if (priority) {
    query = query.eq("priority", priority)
  }

  if (blocked === "true") {
    query = query.eq("blocked", true)
  } else if (blocked === "false") {
    query = query.eq("blocked", false)
  }

  const { data: deliverables } = await query

  // Get pipeline stages for status filter
  const { data: stages } = await supabase
    .from("pipeline_stages")
    .select("name")
    .order("order_index", { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Deliverables</h1>
          <p className="text-muted-foreground">View and manage all deliverables</p>
        </div>
        <Button asChild>
          <Link href="/deliverables/new">Create New</Link>
        </Button>
      </div>

      <DeliverablesFilters stages={stages || []} />

      <DeliverablesList deliverables={deliverables || []} />
    </div>
  )
}

