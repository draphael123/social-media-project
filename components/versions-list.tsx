"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ExternalLink, Upload } from "lucide-react"
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

interface VersionsListProps {
  versions: any[]
  deliverableId: string
  canCreate: boolean
  onUpdate: () => void
}

export function VersionsList({ versions, deliverableId, canCreate, onUpdate }: VersionsListProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [versionType, setVersionType] = useState("design")
  const [externalUrl, setExternalUrl] = useState("")
  const [summaryNotes, setSummaryNotes] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/versions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliverable_id: deliverableId,
          type: versionType,
          external_url: externalUrl || null,
          summary_notes: summaryNotes || null,
        }),
      })

      if (!response.ok) throw new Error("Failed to create version")

      toast({
        title: "Success",
        description: "Version created successfully",
      })
      setDialogOpen(false)
      setExternalUrl("")
      setSummaryNotes("")
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

  return (
    <div className="space-y-4">
      {canCreate && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Add Version
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Add New Version</DialogTitle>
                <DialogDescription>
                  Upload a new version of this deliverable
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="versionType">Type</Label>
                  <Select value={versionType} onValueChange={setVersionType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="copy">Copy</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="externalUrl">External URL (Google Drive, Dropbox, etc.)</Label>
                  <Input
                    id="externalUrl"
                    type="url"
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    placeholder="https://..."
                  />
                  <p className="text-sm text-muted-foreground">
                    Note: File uploads via Supabase Storage would be implemented here
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="summaryNotes">Summary Notes</Label>
                  <Textarea
                    id="summaryNotes"
                    value={summaryNotes}
                    onChange={(e) => setSummaryNotes(e.target.value)}
                    placeholder="What changed in this version?"
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading || !externalUrl}>
                  Create Version
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {versions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No versions yet
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {versions.map((version) => (
            <Card key={version.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Version {version.version_number} - {version.type}
                  </CardTitle>
                  <Badge variant="outline">{version.type}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {version.summary_notes && (
                  <p className="text-sm">{version.summary_notes}</p>
                )}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    Created by {version.creator?.full_name || version.creator?.email} on{" "}
                    {format(new Date(version.created_at), "MMM d, yyyy 'at' h:mm a")}
                  </span>
                  {version.external_url && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={version.external_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View
                      </a>
                    </Button>
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

