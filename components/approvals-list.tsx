"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { CheckCircle, XCircle, Clock } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useState } from "react"

interface ApprovalsListProps {
  approvals: any[]
  deliverable: any
  currentUserRole: string
  currentUserId: string
  onUpdate: () => void
}

export function ApprovalsList({
  approvals,
  deliverable,
  currentUserRole,
  currentUserId,
  onUpdate,
}: ApprovalsListProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [decisionDialogOpen, setDecisionDialogOpen] = useState(false)
  const [selectedApproval, setSelectedApproval] = useState<any>(null)
  const [decision, setDecision] = useState<"approved" | "changes_requested">("approved")
  const [decisionNotes, setDecisionNotes] = useState("")

  const pendingApproval = approvals.find((a) => a.status === "pending")
  const isApprover = currentUserRole === "approver" || currentUserRole === "admin"
  const canApprove = isApprover && pendingApproval && pendingApproval.approver_id === currentUserId

  const handleDecision = async () => {
    if (!selectedApproval) return

    setLoading(true)
    try {
      const response = await fetch(`/api/approvals/${selectedApproval.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: decision,
          decision_notes: decisionNotes || null,
        }),
      })

      if (!response.ok) throw new Error("Failed to update approval")

      toast({
        title: "Success",
        description: `Approval ${decision === "approved" ? "approved" : "requested changes"}`,
      })
      setDecisionDialogOpen(false)
      setSelectedApproval(null)
      setDecisionNotes("")
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "changes_requested":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>
      case "changes_requested":
        return <Badge variant="destructive">Changes Requested</Badge>
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {canApprove && pendingApproval && (
        <Card className="border-yellow-500">
          <CardHeader>
            <CardTitle>Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              This deliverable is waiting for your approval. Requested by{" "}
              {pendingApproval.requester?.full_name || pendingApproval.requester?.email} on{" "}
              {format(new Date(pendingApproval.requested_at), "MMM d, yyyy")}
            </p>
            <div className="flex gap-2">
              <Dialog open={decisionDialogOpen} onOpenChange={setDecisionDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      setSelectedApproval(pendingApproval)
                      setDecision("approved")
                    }}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Approve Deliverable</DialogTitle>
                    <DialogDescription>
                      Approve this deliverable and optionally add notes
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="decisionNotes">Notes (optional)</Label>
                      <Textarea
                        id="decisionNotes"
                        value={decisionNotes}
                        onChange={(e) => setDecisionNotes(e.target.value)}
                        placeholder="Add any notes about this approval..."
                        rows={4}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDecisionDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleDecision} disabled={loading}>
                      Approve
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={decisionDialogOpen} onOpenChange={setDecisionDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setSelectedApproval(pendingApproval)
                      setDecision("changes_requested")
                    }}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Request Changes
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Request Changes</DialogTitle>
                    <DialogDescription>
                      Request changes to this deliverable
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="decisionNotes">Change Request Details *</Label>
                      <Textarea
                        id="decisionNotes"
                        value={decisionNotes}
                        onChange={(e) => setDecisionNotes(e.target.value)}
                        placeholder="What changes are needed?"
                        rows={4}
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDecisionDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleDecision}
                      disabled={loading || !decisionNotes}
                      variant="destructive"
                    >
                      Request Changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )}

      {approvals.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No approvals yet
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {approvals.map((approval) => (
            <Card key={approval.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getStatusIcon(approval.status)}
                    Approval Request
                  </CardTitle>
                  {getStatusBadge(approval.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <p>
                    <strong>Requested by:</strong>{" "}
                    {approval.requester?.full_name || approval.requester?.email} on{" "}
                    {format(new Date(approval.requested_at), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                  {approval.approver && (
                    <p>
                      <strong>Approver:</strong>{" "}
                      {approval.approver.full_name || approval.approver.email}
                    </p>
                  )}
                  {approval.decision_at && (
                    <p>
                      <strong>Decided on:</strong>{" "}
                      {format(new Date(approval.decision_at), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  )}
                  {approval.decision_notes && (
                    <div className="mt-2 rounded-lg bg-muted p-3">
                      <p className="font-semibold">Notes:</p>
                      <p className="whitespace-pre-wrap">{approval.decision_notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

