"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Filter, Sprout, Trash2, Edit2, X, Check } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { DatabaseRow } from "@/components/database-row"
import { AddColumnDialog } from "@/components/add-column-dialog"
import { AddRowDialog } from "@/components/add-row-dialog"
import { createClient } from "@/lib/supabase/client"

interface DatabaseViewProps {
  table: any
  columns: any[]
  rows: any[]
  cells: any[]
}

export function DatabaseView({ table: initialTable, columns: initialColumns, rows: initialRows, cells: initialCells }: DatabaseViewProps) {
  const [columns, setColumns] = useState(initialColumns)
  const [rows, setRows] = useState(initialRows)
  const [cells, setCells] = useState(initialCells)
  const [searchQuery, setSearchQuery] = useState("")
  const [addColumnOpen, setAddColumnOpen] = useState(false)
  const [addRowOpen, setAddRowOpen] = useState(false)
  const [editingColumn, setEditingColumn] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("database-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "database_rows",
        },
        () => {
          // Refresh data
          window.location.reload()
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "database_cells",
        },
        () => {
          window.location.reload()
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "database_columns",
        },
        () => {
          window.location.reload()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const handleDeleteColumn = async (columnId: string) => {
    try {
      const response = await fetch(`/api/database/columns/${columnId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete column")

      toast({
        title: "Success",
        description: "Column deleted",
      })
      window.location.reload()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleReorderColumn = async (columnId: string, newIndex: number) => {
    try {
      const response = await fetch(`/api/database/columns/${columnId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_index: newIndex }),
      })

      if (!response.ok) throw new Error("Failed to reorder column")

      window.location.reload()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  // Filter rows based on search
  const filteredRows = rows.filter((row) => {
    if (!searchQuery) return true
    const rowCells = cells.filter((c) => c.row_id === row.id)
    return rowCells.some((cell) => {
      const column = columns.find((col) => col.id === cell.column_id)
      if (!column) return false
      const value = cell.value || ""
      return value.toLowerCase().includes(searchQuery.toLowerCase())
    })
  })

  const getCellValue = (rowId: string, columnId: string) => {
    const cell = cells.find((c) => c.row_id === rowId && c.column_id === columnId)
    return cell?.value || ""
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-purple-900 text-white p-4 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{initialTable.name}</h1>
            <span>✨</span>
            <span>📖</span>
            <span>🧠</span>
          </div>
        </div>

        {/* Database Interface */}
        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search across all columns..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {rows.length === 0 ? (
              <div className="text-center py-12">
                <Sprout className="h-16 w-16 mx-auto mb-4 text-green-500" />
                <p className="text-lg font-semibold mb-2">No rows yet. Add your first row!</p>
                <Button
                  onClick={() => setAddRowOpen(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Row
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      {columns.map((column, index) => (
                        <th
                          key={column.id}
                          className="p-3 text-left font-semibold border-r last:border-r-0 min-w-[150px]"
                        >
                          <div className="flex items-center justify-between group">
                            <span>{column.name}</span>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => setEditingColumn(column.id)}
                                className="p-1 hover:bg-accent rounded"
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteColumn(column.id)}
                                className="p-1 hover:bg-destructive/10 rounded text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs mt-1">
                            {column.type}
                          </Badge>
                        </th>
                      ))}
                      <th className="p-3 text-left font-semibold min-w-[100px]">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setAddColumnOpen(true)}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row) => (
                      <DatabaseRow
                        key={row.id}
                        row={row}
                        columns={columns}
                        cells={cells.filter((c) => c.row_id === row.id)}
                        onUpdate={() => window.location.reload()}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Section */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>
              Purpose of this site 💬❤️
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Welcome to our shared lightweight Notion-style database tracker! 📖✨ This collaborative workspace is designed for <strong>David and Daniel</strong> to manage projects, tasks, and ideas together.
            </p>
            <div>
              <h3 className="font-semibold mb-2">Key Features:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>✨ <strong>Dynamic Columns:</strong> Add, edit, reorder, and customize column types (text, numbers, dates, selects, checkboxes, URLs, and more)</li>
                <li>🌿 <strong>Collaborative Editing:</strong> Both users can add, edit, and delete rows in real-time</li>
                <li>💾 <strong>Persistent Storage:</strong> All data is stored in a PostgreSQL database and persists through redeploys - no data loss!</li>
                <li>🔍 <strong>Search & Filter:</strong> Quickly find what you're looking for with powerful search and filter capabilities</li>
                <li>📱 <strong>Mobile Friendly:</strong> Responsive design that works beautifully on desktop and mobile devices</li>
              </ul>
            </div>
            <p>
              This is a private shared workspace where we can track projects, manage priorities, set due dates, and stay organized together. The database structure grows with our needs! 🚀
            </p>
            <p className="text-sm text-muted-foreground">
              Built with Next.js, TypeScript, Supabase, and lots of ❤️
            </p>
          </CardContent>
        </Card>

        {/* Dialogs */}
        <AddColumnDialog
          open={addColumnOpen}
          onOpenChange={setAddColumnOpen}
          tableId={initialTable.id}
          existingColumns={columns}
        />
        <AddRowDialog
          open={addRowOpen}
          onOpenChange={setAddRowOpen}
          tableId={initialTable.id}
          columns={columns}
        />
      </div>
    </div>
  )
}

