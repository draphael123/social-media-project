"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const deliverableSchema = z.object({
  title: z.string().min(1, "Title is required"),
  platform: z.enum(["instagram", "tiktok", "facebook", "linkedin", "youtube", "x", "email", "blog", "other"]),
  format: z.enum(["static_post", "carousel", "story", "reel", "short", "long_video", "ad", "email", "landing_page", "other"]),
  goal: z.enum(["engagement", "lead_gen", "retention", "announcement", "education", "conversion", "other"]),
  due_at: z.string().min(1, "Due date is required"),
  priority: z.enum(["p0", "p1", "p2", "p3"]),
  complexity: z.enum(["s", "m", "l"]),
  campaign_name: z.string().optional(),
  audience: z.string().optional(),
  cta: z.string().optional(),
  copy_direction: z.string().optional(),
  hashtags: z.string().optional(),
  notes: z.string().optional(),
  assignee_id: z.string().optional(),
  compliance_flags: z.array(z.string()).default([]),
  required_disclaimer: z.boolean().default(false),
  disclaimer_text: z.string().optional(),
  hipaa_confirmed: z.boolean().default(false),
}).refine(
  (data) => {
    if (data.required_disclaimer && !data.disclaimer_text) {
      return false
    }
    return true
  },
  {
    message: "Disclaimer text is required when disclaimer is required",
    path: ["disclaimer_text"],
  }
).refine(
  (data) => {
    if (data.compliance_flags.includes("hipaa_sensitive") && !data.hipaa_confirmed) {
      return false
    }
    return true
  },
  {
    message: "You must confirm that no PHI is included",
    path: ["hipaa_confirmed"],
  }
)

type DeliverableFormData = z.infer<typeof deliverableSchema>

export function DeliverableForm() {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [hipaaWarning, setHipaaWarning] = useState(false)

  const form = useForm<DeliverableFormData>({
    resolver: zodResolver(deliverableSchema),
    defaultValues: {
      compliance_flags: [],
      required_disclaimer: false,
      hipaa_confirmed: false,
    },
  })

  const complianceFlags = form.watch("compliance_flags")
  const requiredDisclaimer = form.watch("required_disclaimer")

  const onSubmit = async (data: DeliverableFormData) => {
    setLoading(true)

    try {
      const response = await fetch("/api/deliverables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          hipaa_confirmed: undefined, // Don't send this to the server
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create deliverable")
      }

      const result = await response.json()
      toast({
        title: "Success",
        description: "Deliverable created successfully",
      })
      router.push(`/deliverables/${result.id}`)
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Required fields for the deliverable</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...form.register("title")}
              placeholder="e.g., Q1 Product Launch Instagram Post"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="platform">Platform *</Label>
              <Select
                value={form.watch("platform")}
                onValueChange={(value) => form.setValue("platform", value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="x">X (Twitter)</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="blog">Blog</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.platform && (
                <p className="text-sm text-destructive">{form.formState.errors.platform.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="format">Format *</Label>
              <Select
                value={form.watch("format")}
                onValueChange={(value) => form.setValue("format", value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="static_post">Static Post</SelectItem>
                  <SelectItem value="carousel">Carousel</SelectItem>
                  <SelectItem value="story">Story</SelectItem>
                  <SelectItem value="reel">Reel</SelectItem>
                  <SelectItem value="short">Short</SelectItem>
                  <SelectItem value="long_video">Long Video</SelectItem>
                  <SelectItem value="ad">Ad</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="landing_page">Landing Page</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.format && (
                <p className="text-sm text-destructive">{form.formState.errors.format.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="goal">Goal *</Label>
              <Select
                value={form.watch("goal")}
                onValueChange={(value) => form.setValue("goal", value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="engagement">Engagement</SelectItem>
                  <SelectItem value="lead_gen">Lead Generation</SelectItem>
                  <SelectItem value="retention">Retention</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="conversion">Conversion</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.goal && (
                <p className="text-sm text-destructive">{form.formState.errors.goal.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select
                value={form.watch("priority")}
                onValueChange={(value) => form.setValue("priority", value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="p0">P0 - Critical</SelectItem>
                  <SelectItem value="p1">P1 - High</SelectItem>
                  <SelectItem value="p2">P2 - Medium</SelectItem>
                  <SelectItem value="p3">P3 - Low</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.priority && (
                <p className="text-sm text-destructive">{form.formState.errors.priority.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="complexity">Complexity *</Label>
              <Select
                value={form.watch("complexity")}
                onValueChange={(value) => form.setValue("complexity", value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select complexity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="s">Small</SelectItem>
                  <SelectItem value="m">Medium</SelectItem>
                  <SelectItem value="l">Large</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.complexity && (
                <p className="text-sm text-destructive">{form.formState.errors.complexity.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="due_at">Due Date *</Label>
            <Input
              id="due_at"
              type="datetime-local"
              {...form.register("due_at")}
            />
            {form.formState.errors.due_at && (
              <p className="text-sm text-destructive">{form.formState.errors.due_at.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Details</CardTitle>
          <CardDescription>Optional information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="campaign_name">Campaign Name</Label>
            <Input
              id="campaign_name"
              {...form.register("campaign_name")}
              placeholder="e.g., Spring 2024 Launch"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="audience">Target Audience</Label>
            <Input
              id="audience"
              {...form.register("audience")}
              placeholder="e.g., Healthcare professionals, ages 25-45"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cta">Call to Action</Label>
            <Input
              id="cta"
              {...form.register("cta")}
              placeholder="e.g., Sign up now, Learn more"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="copy_direction">Copy Direction</Label>
            <Textarea
              id="copy_direction"
              {...form.register("copy_direction")}
              placeholder="Guidance for copywriting..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hashtags">Hashtags</Label>
            <Input
              id="hashtags"
              {...form.register("hashtags")}
              placeholder="#hashtag1 #hashtag2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...form.register("notes")}
              placeholder="Additional notes..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Compliance & Disclaimers</CardTitle>
          <CardDescription>Compliance flags and disclaimer requirements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Compliance Flags</Label>
            <div className="space-y-2">
              {[
                { value: "medical_claims", label: "Medical Claims" },
                { value: "before_after", label: "Before/After" },
                { value: "testimonials", label: "Testimonials" },
                { value: "hipaa_sensitive", label: "HIPAA Sensitive" },
                { value: "prescription", label: "Prescription" },
                { value: "other", label: "Other" },
              ].map((flag) => (
                <div key={flag.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={flag.value}
                    checked={complianceFlags.includes(flag.value)}
                    onCheckedChange={(checked) => {
                      const current = complianceFlags || []
                      if (checked) {
                        form.setValue("compliance_flags", [...current, flag.value])
                        if (flag.value === "hipaa_sensitive") {
                          setHipaaWarning(true)
                        }
                      } else {
                        form.setValue(
                          "compliance_flags",
                          current.filter((f) => f !== flag.value)
                        )
                        if (flag.value === "hipaa_sensitive") {
                          setHipaaWarning(false)
                          form.setValue("hipaa_confirmed", false)
                        }
                      }
                    }}
                  />
                  <Label htmlFor={flag.value} className="font-normal">
                    {flag.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {hipaaWarning && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">HIPAA Sensitive Content Warning</p>
                  <p>This content is marked as HIPAA sensitive. Please confirm that no Protected Health Information (PHI) is included.</p>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hipaa_confirmed"
                      checked={form.watch("hipaa_confirmed")}
                      onCheckedChange={(checked) => form.setValue("hipaa_confirmed", checked as boolean)}
                    />
                    <Label htmlFor="hipaa_confirmed" className="font-normal">
                      I confirm that no PHI is included in this content
                    </Label>
                  </div>
                  {form.formState.errors.hipaa_confirmed && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.hipaa_confirmed.message}
                    </p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="required_disclaimer"
                checked={requiredDisclaimer}
                onCheckedChange={(checked) => {
                  form.setValue("required_disclaimer", checked as boolean)
                  if (!checked) {
                    form.setValue("disclaimer_text", "")
                  }
                }}
              />
              <Label htmlFor="required_disclaimer" className="font-normal">
                Required Disclaimer
              </Label>
            </div>
            {requiredDisclaimer && (
              <div className="mt-2">
                <Label htmlFor="disclaimer_text">Disclaimer Text *</Label>
                <Textarea
                  id="disclaimer_text"
                  {...form.register("disclaimer_text")}
                  placeholder="Enter disclaimer text..."
                  rows={3}
                />
                {form.formState.errors.disclaimer_text && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.disclaimer_text.message}
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Deliverable"}
        </Button>
      </div>
    </form>
  )
}

