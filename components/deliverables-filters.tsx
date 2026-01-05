"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

interface PipelineStage {
  name: string
}

export function DeliverablesFilters({ stages }: { stages: PipelineStage[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const search = searchParams.get("search") || ""
  const platform = searchParams.get("platform") || ""
  const status = searchParams.get("status") || ""
  const priority = searchParams.get("priority") || ""

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const params = new URLSearchParams()
    
    if (formData.get("search")) params.set("search", formData.get("search") as string)
    if (formData.get("platform")) params.set("platform", formData.get("platform") as string)
    if (formData.get("status")) params.set("status", formData.get("status") as string)
    if (formData.get("priority")) params.set("priority", formData.get("priority") as string)
    
    router.push(`/deliverables?${params.toString()}`)
  }

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-5">
          <Input
            name="search"
            placeholder="Search by title or campaign..."
            defaultValue={search}
          />
          <Select name="platform" defaultValue={platform}>
            <SelectTrigger>
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Platforms</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
              <SelectItem value="x">X</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="blog">Blog</SelectItem>
            </SelectContent>
          </Select>
          <Select name="status" defaultValue={status}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              {stages.map((stage) => (
                <SelectItem key={stage.name} value={stage.name}>
                  {stage.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select name="priority" defaultValue={priority}>
            <SelectTrigger>
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Priorities</SelectItem>
              <SelectItem value="p0">P0 - Critical</SelectItem>
              <SelectItem value="p1">P1 - High</SelectItem>
              <SelectItem value="p2">P2 - Medium</SelectItem>
              <SelectItem value="p3">P3 - Low</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button type="submit">Filter</Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/deliverables">Clear</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

