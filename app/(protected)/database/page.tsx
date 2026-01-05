import { createClient } from "@/lib/supabase/server"
import { DatabaseView } from "@/components/database-view"

export default async function DatabasePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get the default table (or create one if none exists)
  let { data: table } = await supabase
    .from("database_tables")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .single()

  if (!table) {
    // Create default table
    const { data: newTable } = await supabase
      .from("database_tables")
      .insert({
        name: "David + Daniel Shared Database",
        description: "A lightweight Notion-style database tracker",
        created_by: user.id,
      })
      .select()
      .single()
    table = newTable
  }

  // Get columns for this table
  const { data: columns } = await supabase
    .from("database_columns")
    .select("*")
    .eq("table_id", table.id)
    .order("order_index", { ascending: true })

  // Get rows
  const { data: rows } = await supabase
    .from("database_rows")
    .select("*")
    .eq("table_id", table.id)
    .order("created_at", { ascending: false })

  // Get all cells for these rows
  const rowIds = rows?.map((r) => r.id) || []
  const { data: cells } = await supabase
    .from("database_cells")
    .select("*")
    .in("row_id", rowIds)

  return (
    <DatabaseView
      table={table}
      columns={columns || []}
      rows={rows || []}
      cells={cells || []}
    />
  )
}

