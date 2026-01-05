"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useState } from "react"
import { AlertTriangle, CheckCircle, User, X } from "lucide-react"

interface QuickActionsProps {
  deliverable: any
  currentUserRole: string
  currentUserId: string
  onUpdate: () => void
}

export function QuickActions({
  deliverable,
  currentUserRole,
  currentUserId,
  onUpdate,
}: QuickActionsProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [blockDialogOpen, setBlockDialogOpen] = useState(false)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [blockReason, setBlockReason] = useState("")
  const [assigneeId, setAssigneeId] = useState(deliverable.assignee_id || "")

  const canEdit = currentUserRole === "assignee" || currentUserRole === "admin"
  const isAssignee = deliverable.assignee_id === currentUserId
  const isApprover = currentUserRole === "approver" || currentUserRole === "admin"

  const handleBlock = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/deliverables/${deliverable.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blocked: !deliverable.blocked,
          blocked_reason: deliverable.blocked ? null : blockReason,
        }),
      })

      if (!response.ok) throw new Error("Failed to update")

      toast({
        title: "Success",
        description: deliverable.blocked ? "Deliverable unblocked" : "Deliverable blocked",
      })
      setBlockDialogOpen(false)
      setBlockReason("")
      onUpdate()
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

  const handleAssign = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/deliverables/${deliverable.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignee_id: assigneeId || null,
        }),
      })

      if (!response.ok) throw new Error("Failed to update")

      toast({
        title: "Success",
        description: "Assignee updated",
      })
      setAssignDialogOpen(false)
      onUpdate()
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

  const handleRequestApproval = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/approvals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliverable_id: deliverable.id,
        }),
      })

      if (!response.ok) throw new Error("Failed to request approval")

      toast({
        title: "Success",
        description: "Approval requested",
      })
      onUpdate()
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

  if (!canEdit && !isApprover) return null

  return (
    <div className="flex flex-wrap gap-2">
      {canEdit && (
        <>
          <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
            <DialogTrigger asChild>
              <Button variant={deliverable.blocked ? "default" : "outline"}>
                {deliverable.blocked ? (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Unblock
                  </>
                ) : (
                  <>
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Block
                  </>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {deliverable.blocked ? "Unblock Deliverable" : "Block Deliverable"}
                </DialogTitle>
                <DialogDescription>
                  {deliverable.blocked
                    ? "Remove the block on this deliverable"
                    : "Provide a reason for blocking this deliverable"}
                </DialogDescription>
              </DialogHeader>
              {!deliverable.blocked && (
                <div className="space-y-2">
                  <Label htmlFor="blockReason">Reason</Label>
                  <Textarea
                    id="blockReason"
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    placeholder="Why is this deliverable blocked?"
                  />
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setBlockDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleBlock} disabled={loading || (!deliverable.blocked && !blockReason)}>
                  {deliverable.blocked ? "Unblock" : "Block"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <User className="mr-2 h-4 w-4" />
                {deliverable.assignee ? "Reassign" : "Assign"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Deliverable</DialogTitle>
                <DialogDescription>
                  Assign this deliverable to a team member
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="assignee">Assignee</Label>
                <Input
                  id="assignee"
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  placeholder="User ID or email"
                />
                <p className="text-sm text-muted-foreground">
                  Note: In a full implementation, this would be a user selector dropdown
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAssign} disabled={loading}>
                  Assign
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {isAssignee && (
            <Button variant="outline" onClick={handleRequestApproval} disabled={loading}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Request Approval
            </Button>
          )}
        </>
      )}
    </div>
  )
}

