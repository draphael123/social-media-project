import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { createNotification } from "@/lib/notifications"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Get deliverable
    const { data: deliverable } = await supabase
      .from("deliverables")
      .select("*")
      .eq("id", body.deliverable_id)
      .single()

    if (!deliverable) {
      return NextResponse.json({ error: "Deliverable not found" }, { status: 404 })
    }

    // Check permissions
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    const canRequest =
      profile?.role === "admin" ||
      (profile?.role === "assignee" && deliverable.assignee_id === user.id)

    if (!canRequest) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Find an approver (in a real app, this would be more sophisticated)
    const { data: approver } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "approver")
      .limit(1)
      .single()

    // Create approval
    const { data: approval, error } = await supabase
      .from("approvals")
      .insert({
        deliverable_id: body.deliverable_id,
        requested_by: user.id,
        approver_id: approver?.id || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Update deliverable status
    await supabase
      .from("deliverables")
      .update({ status: "Approval Needed" })
      .eq("id", body.deliverable_id)

    // Create activity log
    await supabase.from("activity_log").insert({
      deliverable_id: body.deliverable_id,
      user_id: user.id,
      action: "approval_requested",
      details: { approval_id: approval.id },
    })

    // Create notifications
    if (approver) {
      await createNotification(
        supabase,
        approver.id,
        "approval_requested",
        "Approval requested",
        `${deliverable.title} needs your approval`,
        "deliverable",
        deliverable.id
      )
    }

    return NextResponse.json(approval)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

