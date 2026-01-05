"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface AdminSettingsProps {
  stages: any[]
  disclaimers: any[]
}

export function AdminSettings({ stages: initialStages, disclaimers: initialDisclaimers }: AdminSettingsProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [stages, setStages] = useState(initialStages)
  const [disclaimers, setDisclaimers] = useState(initialDisclaimers)
  const [newStageName, setNewStageName] = useState("")
  const [newStageWip, setNewStageWip] = useState("")
  const [newDisclaimerName, setNewDisclaimerName] = useState("")
  const [newDisclaimerText, setNewDisclaimerText] = useState("")

  const handleUpdateStageWip = async (stageId: string, wipLimit: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/stages/${stageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wip_limit: wipLimit ? parseInt(wipLimit) : null,
        }),
      })

      if (!response.ok) throw new Error("Failed to update")

      toast({
        title: "Success",
        description: "WIP limit updated",
      })
      // Refresh stages
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

  const handleAddDisclaimer = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch("/api/admin/disclaimers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newDisclaimerName,
          text: newDisclaimerText,
        }),
      })

      if (!response.ok) throw new Error("Failed to create")

      toast({
        title: "Success",
        description: "Disclaimer added",
      })
      setNewDisclaimerName("")
      setNewDisclaimerText("")
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
    <Tabs defaultValue="stages" className="space-y-4">
      <TabsList>
        <TabsTrigger value="stages">Pipeline Stages</TabsTrigger>
        <TabsTrigger value="disclaimers">Disclaimers</TabsTrigger>
      </TabsList>

      <TabsContent value="stages" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Pipeline Stages & WIP Limits</CardTitle>
            <CardDescription>
              Configure work-in-progress limits for each stage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stage Name</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>WIP Limit</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stages.map((stage) => (
                  <TableRow key={stage.id}>
                    <TableCell className="font-medium">{stage.name}</TableCell>
                    <TableCell>{stage.order_index}</TableCell>
                    <TableCell>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          const formData = new FormData(e.currentTarget)
                          const wipLimit = formData.get("wip_limit") as string
                          handleUpdateStageWip(stage.id, wipLimit)
                        }}
                        className="flex gap-2"
                      >
                        <Input
                          name="wip_limit"
                          type="number"
                          min="0"
                          defaultValue={stage.wip_limit || ""}
                          placeholder="No limit"
                          className="w-24"
                        />
                        <Button type="submit" size="sm" disabled={loading}>
                          Update
                        </Button>
                      </form>
                    </TableCell>
                    <TableCell>-</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="disclaimers" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Disclaimer Library</CardTitle>
            <CardDescription>
              Manage reusable disclaimers for deliverables
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleAddDisclaimer} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="disclaimerName">Name</Label>
                <Input
                  id="disclaimerName"
                  value={newDisclaimerName}
                  onChange={(e) => setNewDisclaimerName(e.target.value)}
                  placeholder="e.g., Medical Disclaimer"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="disclaimerText">Text</Label>
                <Textarea
                  id="disclaimerText"
                  value={newDisclaimerText}
                  onChange={(e) => setNewDisclaimerText(e.target.value)}
                  placeholder="Enter disclaimer text..."
                  rows={4}
                  required
                />
              </div>
              <Button type="submit" disabled={loading}>
                Add Disclaimer
              </Button>
            </form>

            <div className="space-y-2 mt-6">
              <h3 className="font-semibold">Existing Disclaimers</h3>
              {disclaimers.map((disclaimer) => (
                <Card key={disclaimer.id}>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">{disclaimer.name}</h4>
                    <p className="text-sm text-muted-foreground">{disclaimer.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

