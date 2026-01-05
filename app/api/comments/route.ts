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

    // Create comment
    const { data: comment, error } = await supabase
      .from("comments")
      .insert({
        deliverable_id: body.deliverable_id,
        user_id: user.id,
        content: body.content,
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
      action: "comment_added",
      details: { comment_id: comment.id },
    })

    return NextResponse.json(comment)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

