"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Clock, AlertTriangle } from "lucide-react"
import Link from "next/link"

interface KanbanItemProps {
  item: any
  isDragging?: boolean
}

export function KanbanItem({ item, isDragging }: KanbanItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging || isDragging ? 0.5 : 1,
  }

  const now = new Date()
  const isOverdue = new Date(item.due_at) < now && item.status !== "Posted" && item.status !== "Archived"

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "p0":
        return "destructive"
      case "p1":
        return "default"
      case "p2":
        return "secondary"
      case "p3":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Link href={`/deliverables/${item.id}`}>
        <Card className="hover:bg-accent transition-colors cursor-grab active:cursor-grabbing">
          <CardContent className="p-3">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm line-clamp-2">{item.title}</h3>
              <div className="flex items-center gap-2 flex-wrap">
                {isOverdue && (
                  <Badge variant="destructive" className="gap-1 text-xs">
                    <Clock className="h-3 w-3" />
                    Overdue
                  </Badge>
                )}
                {item.blocked && (
                  <Badge variant="outline" className="gap-1 text-xs">
                    <AlertTriangle className="h-3 w-3" />
                    Blocked
                  </Badge>
                )}
                <Badge variant={getPriorityColor(item.priority)} className="text-xs">
                  {item.priority.toUpperCase()}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                <p>Due: {format(new Date(item.due_at), "MMM d")}</p>
                {item.assignee && (
                  <p className="mt-1">Assigned to: {item.assignee.full_name || item.assignee.email}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}

