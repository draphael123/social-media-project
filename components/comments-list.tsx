"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import { Send } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useState } from "react"

interface CommentsListProps {
  comments: any[]
  deliverableId: string
  currentUserId: string
  onUpdate: () => void
}

export function CommentsList({ comments, deliverableId, currentUserId, onUpdate }: CommentsListProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [newComment, setNewComment] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setLoading(true)
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliverable_id: deliverableId,
          content: newComment,
        }),
      })

      if (!response.ok) throw new Error("Failed to create comment")

      toast({
        title: "Success",
        description: "Comment added",
      })
      setNewComment("")
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
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              rows={3}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={loading || !newComment.trim()}>
                <Send className="mr-2 h-4 w-4" />
                Post Comment
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {comments.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No comments yet
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {comments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">
                      {comment.user?.full_name || comment.user?.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(comment.created_at), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  <p className="whitespace-pre-wrap">{comment.content}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

