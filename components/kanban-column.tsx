"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { KanbanItem } from "@/components/kanban-item"

interface KanbanColumnProps {
  stage: any
  items: any[]
  isAtLimit: boolean
}

export function KanbanColumn({ stage, items, isAtLimit }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.name,
  })

  return (
    <div className="flex-shrink-0 w-80">
      <Card className={`h-full ${isOver ? "border-primary" : ""} ${isAtLimit ? "border-destructive" : ""}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{stage.name}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{items.length}</Badge>
              {stage.wip_limit && (
                <span className="text-xs text-muted-foreground">
                  / {stage.wip_limit}
                </span>
              )}
            </div>
          </div>
          {isAtLimit && (
            <p className="text-xs text-destructive">WIP limit reached</p>
          )}
        </CardHeader>
        <CardContent ref={setNodeRef} className="space-y-2 min-h-[400px]">
          <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
            {items.map((item) => (
              <KanbanItem key={item.id} item={item} />
            ))}
          </SortableContext>
          {items.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-8">
              No items
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

