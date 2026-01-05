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

    const { data: column, error } = await supabase
      .from("database_columns")
      .insert({
        table_id: body.table_id,
        name: body.name,
        type: body.type,
        order_index: body.order_index || 0,
        options: body.options || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(column)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

