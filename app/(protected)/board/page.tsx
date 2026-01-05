import { createClient } from "@/lib/supabase/server"
import { KanbanBoard } from "@/components/kanban-board"

export default async function BoardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get pipeline stages
  const { data: stages } = await supabase
    .from("pipeline_stages")
    .select("*")
    .order("order_index", { ascending: true })

  // Get all deliverables
  const { data: deliverables } = await supabase
    .from("deliverables")
    .select("*, requester:profiles!deliverables_requester_id_fkey(*), assignee:profiles!deliverables_assignee_id_fkey(*)")
    .not("status", "eq", "Archived")
    .order("due_at", { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Kanban Board</h1>
        <p className="text-muted-foreground">Drag and drop deliverables between stages</p>
      </div>
      <KanbanBoard stages={stages || []} deliverables={deliverables || []} />
    </div>
  )
}

