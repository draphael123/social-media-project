import { SupabaseClient } from "@supabase/supabase-js"

export async function createNotification(
  supabase: SupabaseClient,
  userId: string,
  type: string,
  title: string,
  body: string,
  entityType?: string,
  entityId?: string
) {
  // Check if notification already exists
  if (entityType && entityId) {
    const { data: existing } = await supabase
      .from("notifications")
      .select("id")
      .eq("user_id", userId)
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .eq("type", type)
      .is("read_at", null)
      .limit(1)
      .single()

    if (existing) {
      return // Notification already exists
    }
  }

  await supabase.from("notifications").insert({
    user_id: userId,
    type,
    title,
    body,
    entity_type: entityType || null,
    entity_id: entityId || null,
  })
}

export async function checkAndCreateOverdueNotifications(
  supabase: SupabaseClient,
  currentUserId: string
) {
  const now = new Date()

  // Find overdue deliverables
  const { data: overdue } = await supabase
    .from("deliverables")
    .select("id, title, assignee_id, requester_id")
    .lt("due_at", now.toISOString())
    .not("status", "eq", "Posted")
    .not("status", "eq", "Archived")

  if (!overdue) return

  for (const deliverable of overdue) {
    // Notify assignee if exists
    if (deliverable.assignee_id) {
      await createNotification(
        supabase,
        deliverable.assignee_id,
        "overdue",
        "Deliverable is overdue",
        `${deliverable.title} is past its due date`,
        "deliverable",
        deliverable.id
      )
    }

    // Notify requester
    if (deliverable.requester_id) {
      await createNotification(
        supabase,
        deliverable.requester_id,
        "overdue",
        "Deliverable is overdue",
        `${deliverable.title} is past its due date`,
        "deliverable",
        deliverable.id
      )
    }
  }
}

