"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { AlertTriangle, Clock, Download, ExternalLink, Printer, User } from "lucide-react"
import { DeliverableBrief } from "@/components/deliverable-brief"
import { VersionsList } from "@/components/versions-list"
import { ApprovalsList } from "@/components/approvals-list"
import { CommentsList } from "@/components/comments-list"
import { ActivityFeed } from "@/components/activity-feed"
import { QuickActions } from "@/components/quick-actions"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface DeliverableDetailProps {
  deliverable: any
  versions: any[]
  approvals: any[]
  comments: any[]
  activity: any[]
  currentUserRole: string
  currentUserId: string
}

export function DeliverableDetail({
  deliverable,
  versions,
  approvals,
  comments,
  activity,
  currentUserRole,
  currentUserId,
}: DeliverableDetailProps) {
  const { toast } = useToast()
  const router = useRouter()
  const now = new Date()
  const isOverdue = new Date(deliverable.due_at) < now && deliverable.status !== "Posted" && deliverable.status !== "Archived"

  const handlePrint = () => {
    window.print()
  }

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
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{deliverable.title}</h1>
            {isOverdue && (
              <Badge variant="destructive" className="gap-1">
                <Clock className="h-3 w-3" />
                Overdue
              </Badge>
            )}
            {deliverable.blocked && (
              <Badge variant="outline" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                Blocked
              </Badge>
            )}
            <Badge variant={getPriorityColor(deliverable.priority)}>
              {deliverable.priority.toUpperCase()}
            </Badge>
            <Badge variant="outline">{deliverable.status}</Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Platform: {deliverable.platform}</span>
            <span>•</span>
            <span>Format: {deliverable.format}</span>
            <span>•</span>
            <span>Due: {format(new Date(deliverable.due_at), "MMM d, yyyy 'at' h:mm a")}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print Brief
          </Button>
        </div>
      </div>

      <QuickActions
        deliverable={deliverable}
        currentUserRole={currentUserRole}
        currentUserId={currentUserId}
        onUpdate={() => router.refresh()}
      />

      <Tabs defaultValue="brief" className="space-y-4">
        <TabsList>
          <TabsTrigger value="brief">Brief</TabsTrigger>
          <TabsTrigger value="versions">
            Versions ({versions.length})
          </TabsTrigger>
          <TabsTrigger value="approvals">
            Approvals ({approvals.length})
          </TabsTrigger>
          <TabsTrigger value="comments">
            Comments ({comments.length})
          </TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="brief" className="space-y-4">
          <DeliverableBrief deliverable={deliverable} />
        </TabsContent>

        <TabsContent value="versions" className="space-y-4">
          <VersionsList
            versions={versions}
            deliverableId={deliverable.id}
            canCreate={currentUserRole === "assignee" || currentUserRole === "admin"}
            onUpdate={() => router.refresh()}
          />
        </TabsContent>

        <TabsContent value="approvals" className="space-y-4">
          <ApprovalsList
            approvals={approvals}
            deliverable={deliverable}
            currentUserRole={currentUserRole}
            currentUserId={currentUserId}
            onUpdate={() => router.refresh()}
          />
        </TabsContent>

        <TabsContent value="comments" className="space-y-4">
          <CommentsList
            comments={comments}
            deliverableId={deliverable.id}
            currentUserId={currentUserId}
            onUpdate={() => router.refresh()}
          />
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <ActivityFeed activity={activity} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

