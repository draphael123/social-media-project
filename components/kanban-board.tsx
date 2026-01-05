"use client"

import { useState, useEffect } from "react"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Clock, AlertTriangle } from "lucide-react"
import { KanbanColumn } from "@/components/kanban-column"
import { KanbanItem } from "@/components/kanban-item"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface KanbanBoardProps {
  stages: any[]
  deliverables: any[]
}

export function KanbanBoard({ stages, deliverables }: KanbanBoardProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [items, setItems] = useState(deliverables)

  useEffect(() => {
    setItems(deliverables)
  }, [deliverables])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      setActiveId(null)
      return
    }

    const deliverableId = active.id as string
    const newStatus = over.id as string

    // Find the deliverable
    const deliverable = items.find((item) => item.id === deliverableId)
    if (!deliverable || deliverable.status === newStatus) {
      setActiveId(null)
      return
    }

    // Check WIP limit
    const stage = stages.find((s) => s.name === newStatus)
    if (stage?.wip_limit) {
      const itemsInStage = items.filter((item) => item.status === newStatus)
      if (itemsInStage.length >= stage.wip_limit) {
        toast({
          title: "WIP Limit Reached",
          description: `Cannot move to ${newStatus}. Maximum ${stage.wip_limit} items allowed.`,
          variant: "destructive",
        })
        setActiveId(null)
        return
      }
    }

    // Optimistically update
    setItems((prev) =>
      prev.map((item) =>
        item.id === deliverableId ? { ...item, status: newStatus } : item
      )
    )

    // Update on server
    try {
      const response = await fetch(`/api/deliverables/${deliverableId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update")
      }

      toast({
        title: "Success",
        description: "Deliverable moved",
      })
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
      // Revert optimistic update
      setItems(deliverables)
    }

    setActiveId(null)
  }

  const activeItem = activeId ? items.find((item) => item.id === activeId) : null

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageItems = items.filter((item) => item.status === stage.name)
          const isAtLimit = stage.wip_limit && stageItems.length >= stage.wip_limit

          return (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              items={stageItems}
              isAtLimit={isAtLimit || false}
            />
          )
        })}
      </div>
      <DragOverlay>
        {activeItem ? <KanbanItem item={activeItem} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  )
}

