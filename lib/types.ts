export type UserRole = "requester" | "assignee" | "approver" | "admin"

export type Platform =
  | "instagram"
  | "tiktok"
  | "facebook"
  | "linkedin"
  | "youtube"
  | "x"
  | "email"
  | "blog"
  | "other"

export type Format =
  | "static_post"
  | "carousel"
  | "story"
  | "reel"
  | "short"
  | "long_video"
  | "ad"
  | "email"
  | "landing_page"
  | "other"

export type Goal =
  | "engagement"
  | "lead_gen"
  | "retention"
  | "announcement"
  | "education"
  | "conversion"
  | "other"

export type Priority = "p0" | "p1" | "p2" | "p3"

export type Complexity = "s" | "m" | "l"

export type ComplianceFlag =
  | "medical_claims"
  | "before_after"
  | "testimonials"
  | "hipaa_sensitive"
  | "prescription"
  | "other"

export type VersionType = "copy" | "design" | "video" | "other"

export type ApprovalStatus = "pending" | "approved" | "changes_requested"

export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface PipelineStage {
  id: string
  name: string
  order_index: number
  wip_limit: number | null
  created_at: string
  updated_at: string
}

export interface Deliverable {
  id: string
  title: string
  requester_id: string
  assignee_id: string | null
  platform: Platform
  format: Format
  goal: Goal
  due_at: string
  priority: Priority
  complexity: Complexity
  status: string
  blocked: boolean
  blocked_reason: string | null
  campaign_name: string | null
  audience: string | null
  cta: string | null
  copy_direction: string | null
  compliance_flags: ComplianceFlag[]
  required_disclaimer: boolean
  disclaimer_text: string | null
  hashtags: string | null
  notes: string | null
  revision_round: number
  revision_limit: number
  created_at: string
  updated_at: string
  requester?: Profile
  assignee?: Profile
}

export interface Version {
  id: string
  deliverable_id: string
  version_number: number
  type: VersionType
  storage_path: string | null
  external_url: string | null
  summary_notes: string | null
  created_by: string
  created_at: string
  creator?: Profile
}

export interface Approval {
  id: string
  deliverable_id: string
  requested_by: string
  requested_at: string
  approver_id: string | null
  status: ApprovalStatus
  decision_at: string | null
  decision_notes: string | null
  created_at: string
  updated_at: string
  requester?: Profile
  approver?: Profile
}

export interface Comment {
  id: string
  deliverable_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
  user?: Profile
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  body: string
  entity_type: string | null
  entity_id: string | null
  created_at: string
  read_at: string | null
}

export interface Disclaimer {
  id: string
  name: string
  text: string
  created_at: string
  updated_at: string
}

export interface ActivityLog {
  id: string
  deliverable_id: string
  user_id: string | null
  action: string
  details: Record<string, any> | null
  created_at: string
  user?: Profile
}

