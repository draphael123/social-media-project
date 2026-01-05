"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"

interface DatabaseRowProps {
  row: any
  columns: any[]
  cells: any[]
  onUpdate: () => void
}

export function DatabaseRow({ row, columns, cells, onUpdate }: DatabaseRowProps) {
  const { toast } = useToast()
  const [editingCell, setEditingCell] = useState<string | null>(null)
  const [cellValues, setCellValues] = useState<Record<string, string>>(() => {
    const values: Record<string, string> = {}
    cells.forEach((cell) => {
      values[cell.column_id] = cell.value || ""
    })
    return values
  })

  const getCellValue = (columnId: string) => {
    return cellValues[columnId] || ""
  }

  const handleCellChange = async (columnId: string, value: string) => {
    setCellValues((prev) => ({ ...prev, [columnId]: value }))

    try {
      const response = await fetch("/api/database/cells", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          row_id: row.id,
          column_id: columnId,
          value,
        }),
      })

      if (!response.ok) throw new Error("Failed to update cell")

      onUpdate()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleDeleteRow = async () => {
    if (!confirm("Are you sure you want to delete this row?")) return

    try {
      const response = await fetch(`/api/database/rows/${row.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete row")

      toast({
        title: "Success",
        description: "Row deleted",
      })
      onUpdate()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const renderCell = (column: any) => {
    const value = getCellValue(column.id)
    const isEditing = editingCell === column.id

    switch (column.type) {
      case "checkbox":
        return (
          <div className="flex items-center justify-center p-2">
            <Checkbox
              checked={value === "true"}
              onCheckedChange={(checked) =>
                handleCellChange(column.id, checked ? "true" : "false")
              }
            />
          </div>
        )

      case "date":
        return (
          <Input
            type="date"
            value={value || ""}
            onChange={(e) => handleCellChange(column.id, e.target.value)}
            className="border-0 focus-visible:ring-0"
            onFocus={() => setEditingCell(column.id)}
            onBlur={() => setEditingCell(null)}
          />
        )

      case "number":
        return (
          <Input
            type="number"
            value={value || ""}
            onChange={(e) => handleCellChange(column.id, e.target.value)}
            className="border-0 focus-visible:ring-0"
            onFocus={() => setEditingCell(column.id)}
            onBlur={() => setEditingCell(null)}
          />
        )

      case "select":
        const options = column.options?.options || []
        return (
          <select
            value={value || ""}
            onChange={(e) => handleCellChange(column.id, e.target.value)}
            className="w-full p-2 border-0 bg-transparent focus:outline-none"
          >
            <option value="">Select...</option>
            {options.map((opt: string) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        )

      case "url":
      case "email":
        return (
          <Input
            type={column.type}
            value={value || ""}
            onChange={(e) => handleCellChange(column.id, e.target.value)}
            className="border-0 focus-visible:ring-0"
            onFocus={() => setEditingCell(column.id)}
            onBlur={() => setEditingCell(null)}
            placeholder={`Enter ${column.type}...`}
          />
        )

      default:
        return (
          <Input
            type="text"
            value={value || ""}
            onChange={(e) => handleCellChange(column.id, e.target.value)}
            className="border-0 focus-visible:ring-0"
            onFocus={() => setEditingCell(column.id)}
            onBlur={() => setEditingCell(null)}
            placeholder="Enter text..."
          />
        )
    }
  }

  return (
    <tr className="border-b hover:bg-accent/50 transition-colors">
      {columns.map((column) => (
        <td key={column.id} className="p-2 border-r last:border-r-0">
          {renderCell(column)}
        </td>
      ))}
      <td className="p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDeleteRow}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  )
}

