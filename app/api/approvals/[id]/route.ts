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

    // Get approval
    const { data: approval } = await supabase
      .from("approvals")
      .select("*, deliverable:deliverables(*)")
      .eq("id", params.id)
      .single()

    if (!approval) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    // Check permissions
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    const canApprove =
      profile?.role === "admin" ||
      (profile?.role === "approver" && approval.approver_id === user.id)

    if (!canApprove) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (approval.status !== "pending") {
      return NextResponse.json({ error: "Approval already decided" }, { status: 400 })
    }

    // Update approval
    const { data: updatedApproval, error } = await supabase
      .from("approvals")
      .update({
        status: body.status,
        decision_at: new Date().toISOString(),
        decision_notes: body.decision_notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const deliverable = approval.deliverable

    // Update deliverable based on decision
    if (body.status === "approved") {
      await supabase
        .from("deliverables")
        .update({ status: "Scheduled" })
        .eq("id", deliverable.id)
    } else if (body.status === "changes_requested") {
      // Move back to In Progress and increment revision round
      const newRevisionRound = (deliverable.revision_round || 0) + 1
      await supabase
        .from("deliverables")
        .update({
          status: "In Progress",
          revision_round: newRevisionRound,
        })
        .eq("id", deliverable.id)

      // Check if revision limit reached
      if (newRevisionRound >= deliverable.revision_limit) {
        // Create warning notification
        await createNotification(
          supabase,
          deliverable.requester_id,
          "revision_limit_reached",
          "Revision limit reached",
          `${deliverable.title} has reached its revision limit (${deliverable.revision_limit})`,
          "deliverable",
          deliverable.id
        )
      }
    }

    // Create activity log
    await supabase.from("activity_log").insert({
      deliverable_id: deliverable.id,
      user_id: user.id,
      action: "approval_decision",
      details: { approval_id: params.id, status: body.status },
    })

    // Create notifications
    await createNotification(
      supabase,
      deliverable.requester_id,
      "approval_decision",
      body.status === "approved" ? "Deliverable approved" : "Changes requested",
      `${deliverable.title} has been ${body.status === "approved" ? "approved" : "requested changes"}`,
      "deliverable",
      deliverable.id
    )

    if (deliverable.assignee_id) {
      await createNotification(
        supabase,
        deliverable.assignee_id,
        "approval_decision",
        body.status === "approved" ? "Deliverable approved" : "Changes requested",
        `${deliverable.title} has been ${body.status === "approved" ? "approved" : "requested changes"}`,
        "deliverable",
        deliverable.id
      )
    }

    return NextResponse.json(updatedApproval)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

