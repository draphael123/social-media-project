"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

interface AddRowDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tableId: string
  columns: any[]
}

export function AddRowDialog({ open, onOpenChange, tableId, columns }: AddRowDialogProps) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create row
      const rowResponse = await fetch("/api/database/rows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table_id: tableId }),
      })

      if (!rowResponse.ok) throw new Error("Failed to create row")

      const { id: rowId } = await rowResponse.json()

      // Create cells for each column
      const cellPromises = columns.map((column) => {
        const value = values[column.id] || ""
        if (!value && column.type !== "checkbox") return Promise.resolve()

        return fetch("/api/database/cells", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            row_id: rowId,
            column_id: column.id,
            value: column.type === "checkbox" ? (values[column.id] === "true" ? "true" : "false") : value,
          }),
        })
      })

      await Promise.all(cellPromises)

      toast({
        title: "Success",
        description: "Row added successfully",
      })

      setValues({})
      onOpenChange(false)
      window.location.reload()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const renderField = (column: any) => {
    const value = values[column.id] || ""

    switch (column.type) {
      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={column.id}
              checked={value === "true"}
              onCheckedChange={(checked) =>
                setValues((prev) => ({ ...prev, [column.id]: checked ? "true" : "false" }))
              }
            />
            <Label htmlFor={column.id}>{column.name}</Label>
          </div>
        )

      case "date":
        return (
          <div className="space-y-2">
            <Label htmlFor={column.id}>{column.name}</Label>
            <Input
              id={column.id}
              type="date"
              value={value}
              onChange={(e) => setValues((prev) => ({ ...prev, [column.id]: e.target.value }))}
            />
          </div>
        )

      case "number":
        return (
          <div className="space-y-2">
            <Label htmlFor={column.id}>{column.name}</Label>
            <Input
              id={column.id}
              type="number"
              value={value}
              onChange={(e) => setValues((prev) => ({ ...prev, [column.id]: e.target.value }))}
            />
          </div>
        )

      case "select":
        const options = column.options?.options || []
        return (
          <div className="space-y-2">
            <Label htmlFor={column.id}>{column.name}</Label>
            <Select value={value} onValueChange={(val) => setValues((prev) => ({ ...prev, [column.id]: val }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {options.map((opt: string) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case "url":
      case "email":
        return (
          <div className="space-y-2">
            <Label htmlFor={column.id}>{column.name}</Label>
            <Input
              id={column.id}
              type={column.type}
              value={value}
              onChange={(e) => setValues((prev) => ({ ...prev, [column.id]: e.target.value }))}
              placeholder={`Enter ${column.type}...`}
            />
          </div>
        )

      default:
        return (
          <div className="space-y-2">
            <Label htmlFor={column.id}>{column.name}</Label>
            <Input
              id={column.id}
              type="text"
              value={value}
              onChange={(e) => setValues((prev) => ({ ...prev, [column.id]: e.target.value }))}
              placeholder={`Enter ${column.name}...`}
            />
          </div>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Row</DialogTitle>
            <DialogDescription>
              Fill in the fields below to add a new row to your database
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {columns.map((column) => (
              <div key={column.id}>{renderField(column)}</div>
            ))}
            {columns.length === 0 && (
              <p className="text-sm text-muted-foreground">Add columns first before adding rows</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || columns.length === 0}>
              Add Row
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

