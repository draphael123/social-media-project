"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { format } from "date-fns"
import { AlertTriangle, Clock } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Deliverable {
  id: string
  title: string
  platform: string
  format: string
  status: string
  priority: string
  due_at: string
  blocked: boolean
  blocked_reason: string | null
  assignee?: { full_name: string | null; email: string | null }
  requester?: { full_name: string | null; email: string | null }
}

export function DeliverablesList({ deliverables }: { deliverables: Deliverable[] }) {
  const now = new Date()

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

  const isOverdue = (dueAt: string) => {
    return new Date(dueAt) < now
  }

  if (deliverables.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          No deliverables found
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {deliverables.map((item) => (
        <Link key={item.id} href={`/deliverables/${item.id}`}>
          <Card className="hover:bg-accent transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{item.title}</h3>
                    {isOverdue(item.due_at) && item.status !== "Posted" && item.status !== "Archived" && (
                      <Badge variant="destructive" className="gap-1">
                        <Clock className="h-3 w-3" />
                        Overdue
                      </Badge>
                    )}
                    {item.blocked && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant="outline" className="gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Blocked
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{item.blocked_reason || "This item is blocked"}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span>{item.platform}</span>
                    <span>•</span>
                    <span>{item.format}</span>
                    <span>•</span>
                    <span>{item.status}</span>
                    {item.assignee && (
                      <>
                        <span>•</span>
                        <span>Assigned to: {item.assignee.full_name || item.assignee.email}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getPriorityColor(item.priority)}>
                    {item.priority.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Due: {format(new Date(item.due_at), "MMM d, yyyy")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}

