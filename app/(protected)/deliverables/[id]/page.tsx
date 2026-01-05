import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { DeliverableDetail } from "@/components/deliverable-detail"

export default async function DeliverableDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: deliverable } = await supabase
    .from("deliverables")
    .select("*, requester:profiles!deliverables_requester_id_fkey(*), assignee:profiles!deliverables_assignee_id_fkey(*)")
    .eq("id", params.id)
    .single()

  if (!deliverable) {
    notFound()
  }

  const { data: versions } = await supabase
    .from("versions")
    .select("*, creator:profiles!versions_created_by_fkey(*)")
    .eq("deliverable_id", params.id)
    .order("version_number", { ascending: false })

  const { data: approvals } = await supabase
    .from("approvals")
    .select("*, requester:profiles!approvals_requested_by_fkey(*), approver:profiles!approvals_approver_id_fkey(*)")
    .eq("deliverable_id", params.id)
    .order("requested_at", { ascending: false })

  const { data: comments } = await supabase
    .from("comments")
    .select("*, user:profiles!comments_user_id_fkey(*)")
    .eq("deliverable_id", params.id)
    .order("created_at", { ascending: true })

  const { data: activity } = await supabase
    .from("activity_log")
    .select("*, user:profiles!activity_log_user_id_fkey(*)")
    .eq("deliverable_id", params.id)
    .order("created_at", { ascending: false })
    .limit(50)

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  return (
    <DeliverableDetail
      deliverable={deliverable}
      versions={versions || []}
      approvals={approvals || []}
      comments={comments || []}
      activity={activity || []}
      currentUserRole={profile?.role || "requester"}
      currentUserId={user.id}
    />
  )
}

