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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

interface AddColumnDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tableId: string
  existingColumns: any[]
}

export function AddColumnDialog({ open, onOpenChange, tableId, existingColumns }: AddColumnDialogProps) {
  const [name, setName] = useState("")
  const [type, setType] = useState("text")
  const [options, setOptions] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    try {
      const orderIndex = existingColumns.length

      const columnData: any = {
        table_id: tableId,
        name: name.trim(),
        type,
        order_index: orderIndex,
      }

      if (type === "select" && options) {
        columnData.options = {
          options: options.split(",").map((opt) => opt.trim()).filter(Boolean),
        }
      }

      const response = await fetch("/api/database/columns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(columnData),
      })

      if (!response.ok) throw new Error("Failed to create column")

      toast({
        title: "Success",
        description: "Column added successfully",
      })

      setName("")
      setType("text")
      setOptions("")
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Column</DialogTitle>
            <DialogDescription>
              Add a new column to your database table
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="columnName">Column Name</Label>
              <Input
                id="columnName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Task Name, Status, Due Date"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="columnType">Column Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="checkbox">Checkbox</SelectItem>
                  <SelectItem value="select">Select (Dropdown)</SelectItem>
                  <SelectItem value="url">URL</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="rich_text">Rich Text</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {type === "select" && (
              <div className="space-y-2">
                <Label htmlFor="options">Options (comma-separated)</Label>
                <Textarea
                  id="options"
                  value={options}
                  onChange={(e) => setOptions(e.target.value)}
                  placeholder="e.g., Option 1, Option 2, Option 3"
                  rows={3}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              Add Column
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

