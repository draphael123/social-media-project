import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { createNotification } from "@/lib/notifications"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Get current deliverable
    const { data: current } = await supabase
      .from("deliverables")
      .select("*")
      .eq("id", params.id)
      .single()

    if (!current) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    // Check permissions
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    const canEdit =
      profile?.role === "admin" ||
      (profile?.role === "assignee" && current.assignee_id === user.id)

    if (!canEdit) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Check WIP limits if status is changing
    if (body.status && body.status !== current.status) {
      const { data: stage } = await supabase
        .from("pipeline_stages")
        .select("wip_limit")
        .eq("name", body.status)
        .single()

      if (stage?.wip_limit) {
        const { count } = await supabase
          .from("deliverables")
          .select("*", { count: "exact", head: true })
          .eq("status", body.status)

        if (count && count >= stage.wip_limit) {
          return NextResponse.json(
            { error: `WIP limit reached for ${body.status} (${stage.wip_limit} items)` },
            { status: 400 }
          )
        }
      }
    }

    // Update deliverable
    const { data: deliverable, error } = await supabase
      .from("deliverables")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Create activity log
    const changes: Record<string, any> = {}
    if (body.status && body.status !== current.status) {
      changes.status = { from: current.status, to: body.status }
    }
    if (body.assignee_id !== undefined && body.assignee_id !== current.assignee_id) {
      changes.assignee = { from: current.assignee_id, to: body.assignee_id }
    }
    if (body.blocked !== undefined && body.blocked !== current.blocked) {
      changes.blocked = { from: current.blocked, to: body.blocked }
    }

    if (Object.keys(changes).length > 0) {
      await supabase.from("activity_log").insert({
        deliverable_id: params.id,
        user_id: user.id,
        action: "updated",
        details: changes,
      })
    }

    // Create notifications
    if (body.assignee_id && body.assignee_id !== current.assignee_id) {
      await createNotification(
        supabase,
        body.assignee_id,
        "deliverable_assigned",
        "Deliverable assigned",
        `You've been assigned to: ${deliverable.title}`,
        "deliverable",
        deliverable.id
      )
    }

    return NextResponse.json(deliverable)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

