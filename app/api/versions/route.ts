import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

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

    const canCreate =
      profile?.role === "admin" ||
      (profile?.role === "assignee" && deliverable.assignee_id === user.id)

    if (!canCreate) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get next version number
    const { data: maxVersion } = await supabase
      .from("versions")
      .select("version_number")
      .eq("deliverable_id", body.deliverable_id)
      .order("version_number", { ascending: false })
      .limit(1)
      .single()

    const versionNumber = maxVersion ? maxVersion.version_number + 1 : 1

    // Create version
    const { data: version, error } = await supabase
      .from("versions")
      .insert({
        deliverable_id: body.deliverable_id,
        version_number: versionNumber,
        type: body.type,
        storage_path: body.storage_path || null,
        external_url: body.external_url || null,
        summary_notes: body.summary_notes || null,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Create activity log
    await supabase.from("activity_log").insert({
      deliverable_id: body.deliverable_id,
      user_id: user.id,
      action: "version_created",
      details: { version_number: versionNumber, type: body.type },
    })

    return NextResponse.json(version)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

