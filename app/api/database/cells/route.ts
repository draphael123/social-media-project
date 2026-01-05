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

    // Upsert cell (insert or update if exists)
    const { data: cell, error } = await supabase
      .from("database_cells")
      .upsert(
        {
          row_id: body.row_id,
          column_id: body.column_id,
          value: body.value || null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "row_id,column_id",
        }
      )
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(cell)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

