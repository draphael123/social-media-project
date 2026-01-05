-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable array support
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'requester' CHECK (role IN ('requester', 'assignee', 'approver', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pipeline stages table
CREATE TABLE pipeline_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  order_index INTEGER NOT NULL,
  wip_limit INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disclaimers library
CREATE TABLE disclaimers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deliverables table
CREATE TABLE deliverables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  assignee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'facebook', 'linkedin', 'youtube', 'x', 'email', 'blog', 'other')),
  format TEXT NOT NULL CHECK (format IN ('static_post', 'carousel', 'story', 'reel', 'short', 'long_video', 'ad', 'email', 'landing_page', 'other')),
  goal TEXT NOT NULL CHECK (goal IN ('engagement', 'lead_gen', 'retention', 'announcement', 'education', 'conversion', 'other')),
  due_at TIMESTAMPTZ NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('p0', 'p1', 'p2', 'p3')),
  complexity TEXT NOT NULL CHECK (complexity IN ('s', 'm', 'l')),
  status TEXT NOT NULL,
  blocked BOOLEAN DEFAULT FALSE,
  blocked_reason TEXT,
  campaign_name TEXT,
  audience TEXT,
  cta TEXT,
  copy_direction TEXT,
  compliance_flags TEXT[] DEFAULT '{}',
  required_disclaimer BOOLEAN DEFAULT FALSE,
  disclaimer_text TEXT,
  hashtags TEXT,
  notes TEXT,
  revision_round INTEGER DEFAULT 0,
  revision_limit INTEGER DEFAULT 2,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (status) REFERENCES pipeline_stages(name) ON DELETE RESTRICT
);

-- Versions table
CREATE TABLE versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deliverable_id UUID NOT NULL REFERENCES deliverables(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('copy', 'design', 'video', 'other')),
  storage_path TEXT,
  external_url TEXT,
  summary_notes TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(deliverable_id, version_number)
);

-- Approvals table
CREATE TABLE approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deliverable_id UUID NOT NULL REFERENCES deliverables(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  approver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'changes_requested')),
  decision_at TIMESTAMPTZ,
  decision_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deliverable_id UUID NOT NULL REFERENCES deliverables(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  UNIQUE(user_id, entity_type, entity_id, type, created_at)
);

-- Activity log table
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deliverable_id UUID NOT NULL REFERENCES deliverables(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_deliverables_requester ON deliverables(requester_id);
CREATE INDEX idx_deliverables_assignee ON deliverables(assignee_id);
CREATE INDEX idx_deliverables_status ON deliverables(status);
CREATE INDEX idx_deliverables_due_at ON deliverables(due_at);
CREATE INDEX idx_deliverables_priority ON deliverables(priority);
CREATE INDEX idx_versions_deliverable ON versions(deliverable_id);
CREATE INDEX idx_approvals_deliverable ON approvals(deliverable_id);
CREATE INDEX idx_approvals_status ON approvals(status);
CREATE INDEX idx_comments_deliverable ON comments(deliverable_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read_at);
CREATE INDEX idx_activity_deliverable ON activity_log(deliverable_id);
CREATE INDEX idx_pipeline_stages_order ON pipeline_stages(order_index);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pipeline_stages_updated_at BEFORE UPDATE ON pipeline_stages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deliverables_updated_at BEFORE UPDATE ON deliverables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_approvals_updated_at BEFORE UPDATE ON approvals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'requester'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to get next version number
CREATE OR REPLACE FUNCTION get_next_version_number(deliverable_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  max_version INTEGER;
BEGIN
  SELECT COALESCE(MAX(version_number), 0) INTO max_version
  FROM versions
  WHERE deliverable_id = deliverable_uuid;
  RETURN max_version + 1;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE disclaimers ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Deliverables policies
CREATE POLICY "Requesters can view their deliverables"
  ON deliverables FOR SELECT
  USING (
    requester_id = auth.uid() OR
    assignee_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM approvals
      WHERE approvals.deliverable_id = deliverables.id
      AND approvals.approver_id = auth.uid()
      AND approvals.status = 'pending'
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Requesters can create deliverables"
  ON deliverables FOR INSERT
  WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Assignees and admins can update deliverables"
  ON deliverables FOR UPDATE
  USING (
    assignee_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Versions policies
CREATE POLICY "Users can view versions for accessible deliverables"
  ON versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM deliverables
      WHERE deliverables.id = versions.deliverable_id
      AND (
        deliverables.requester_id = auth.uid() OR
        deliverables.assignee_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM approvals
          WHERE approvals.deliverable_id = deliverables.id
          AND approvals.approver_id = auth.uid()
        ) OR
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
    )
  );

CREATE POLICY "Assignees and admins can create versions"
  ON versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM deliverables
      WHERE deliverables.id = versions.deliverable_id
      AND (
        deliverables.assignee_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
    )
  );

-- Approvals policies
CREATE POLICY "Users can view approvals for accessible deliverables"
  ON approvals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM deliverables
      WHERE deliverables.id = approvals.deliverable_id
      AND (
        deliverables.requester_id = auth.uid() OR
        deliverables.assignee_id = auth.uid() OR
        approvals.approver_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
    )
  );

CREATE POLICY "Assignees can request approval"
  ON approvals FOR INSERT
  WITH CHECK (
    requested_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM deliverables
      WHERE deliverables.id = approvals.deliverable_id
      AND deliverables.assignee_id = auth.uid()
    )
  );

CREATE POLICY "Approvers and admins can update approvals"
  ON approvals FOR UPDATE
  USING (
    approver_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Comments policies
CREATE POLICY "Users can view comments for accessible deliverables"
  ON comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM deliverables
      WHERE deliverables.id = comments.deliverable_id
      AND (
        deliverables.requester_id = auth.uid() OR
        deliverables.assignee_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM approvals
          WHERE approvals.deliverable_id = deliverables.id
          AND approvals.approver_id = auth.uid()
        ) OR
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
    )
  );

CREATE POLICY "Users can create comments for accessible deliverables"
  ON comments FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM deliverables
      WHERE deliverables.id = comments.deliverable_id
      AND (
        deliverables.requester_id = auth.uid() OR
        deliverables.assignee_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM approvals
          WHERE approvals.deliverable_id = deliverables.id
          AND approvals.approver_id = auth.uid()
        ) OR
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
    )
  );

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- Activity log policies
CREATE POLICY "Users can view activity for accessible deliverables"
  ON activity_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM deliverables
      WHERE deliverables.id = activity_log.deliverable_id
      AND (
        deliverables.requester_id = auth.uid() OR
        deliverables.assignee_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM approvals
          WHERE approvals.deliverable_id = deliverables.id
          AND approvals.approver_id = auth.uid()
        ) OR
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
    )
  );

-- Pipeline stages policies
CREATE POLICY "Everyone can view pipeline stages"
  ON pipeline_stages FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage pipeline stages"
  ON pipeline_stages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Disclaimers policies
CREATE POLICY "Everyone can view disclaimers"
  ON disclaimers FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage disclaimers"
  ON disclaimers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

