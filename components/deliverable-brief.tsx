"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface DeliverableBriefProps {
  deliverable: any
}

export function DeliverableBrief({ deliverable }: DeliverableBriefProps) {
  return (
    <div className="space-y-4 print:space-y-2">
      <Card className="print:border-none print:shadow-none">
        <CardHeader>
          <CardTitle>{deliverable.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground">Platform</h3>
              <p className="text-lg">{deliverable.platform}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground">Format</h3>
              <p className="text-lg">{deliverable.format}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground">Goal</h3>
              <p className="text-lg">{deliverable.goal}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground">Priority</h3>
              <Badge>{deliverable.priority.toUpperCase()}</Badge>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground">Complexity</h3>
              <p className="text-lg">{deliverable.complexity.toUpperCase()}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground">Due Date</h3>
              <p className="text-lg">{format(new Date(deliverable.due_at), "MMM d, yyyy 'at' h:mm a")}</p>
            </div>
            {deliverable.campaign_name && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground">Campaign</h3>
                <p className="text-lg">{deliverable.campaign_name}</p>
              </div>
            )}
            {deliverable.assignee && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground">Assignee</h3>
                <p className="text-lg">{deliverable.assignee.full_name || deliverable.assignee.email}</p>
              </div>
            )}
          </div>

          {deliverable.audience && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground">Target Audience</h3>
              <p>{deliverable.audience}</p>
            </div>
          )}

          {deliverable.cta && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground">Call to Action</h3>
              <p>{deliverable.cta}</p>
            </div>
          )}

          {deliverable.copy_direction && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground">Copy Direction</h3>
              <p className="whitespace-pre-wrap">{deliverable.copy_direction}</p>
            </div>
          )}

          {deliverable.hashtags && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground">Hashtags</h3>
              <p>{deliverable.hashtags}</p>
            </div>
          )}

          {deliverable.compliance_flags && deliverable.compliance_flags.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground">Compliance Flags</h3>
              <div className="flex flex-wrap gap-2">
                {deliverable.compliance_flags.map((flag: string) => (
                  <Badge key={flag} variant="outline">
                    {flag.replace("_", " ")}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {deliverable.required_disclaimer && deliverable.disclaimer_text && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground">Required Disclaimer</h3>
              <p className="whitespace-pre-wrap">{deliverable.disclaimer_text}</p>
            </div>
          )}

          {deliverable.notes && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground">Notes</h3>
              <p className="whitespace-pre-wrap">{deliverable.notes}</p>
            </div>
          )}

          {deliverable.blocked && deliverable.blocked_reason && (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
              <h3 className="text-sm font-semibold text-destructive">Blocked</h3>
              <p>{deliverable.blocked_reason}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

