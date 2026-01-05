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

    // Get default status (first pipeline stage)
    const { data: stages } = await supabase
      .from("pipeline_stages")
      .select("name")
      .order("order_index", { ascending: true })
      .limit(1)
      .single()

    const status = stages?.name || "Intake"

    // Create deliverable
    const { data: deliverable, error } = await supabase
      .from("deliverables")
      .insert({
        title: body.title,
        requester_id: user.id,
        assignee_id: body.assignee_id || null,
        platform: body.platform,
        format: body.format,
        goal: body.goal,
        due_at: body.due_at,
        priority: body.priority,
        complexity: body.complexity,
        status,
        campaign_name: body.campaign_name || null,
        audience: body.audience || null,
        cta: body.cta || null,
        copy_direction: body.copy_direction || null,
        compliance_flags: body.compliance_flags || [],
        required_disclaimer: body.required_disclaimer || false,
        disclaimer_text: body.disclaimer_text || null,
        hashtags: body.hashtags || null,
        notes: body.notes || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Create activity log
    await supabase.from("activity_log").insert({
      deliverable_id: deliverable.id,
      user_id: user.id,
      action: "created",
      details: { title: deliverable.title },
    })

    // Create notifications
    if (deliverable.assignee_id) {
      await createNotification(
        supabase,
        deliverable.assignee_id,
        "deliverable_assigned",
        "New deliverable assigned",
        `You've been assigned to: ${deliverable.title}`,
        "deliverable",
        deliverable.id
      )
    } else {
      // Notify admins if no assignee
      const { data: admins } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "admin")

      if (admins) {
        for (const admin of admins) {
          await createNotification(
            supabase,
            admin.id,
            "deliverable_created",
            "New deliverable created",
            `${deliverable.title} needs an assignee`,
            "deliverable",
            deliverable.id
          )
        }
      }
    }

    return NextResponse.json(deliverable)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

