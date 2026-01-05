-- Seed script for Social Deliverables Hub
-- Run this after migrations to populate initial data

-- Insert default pipeline stages
INSERT INTO pipeline_stages (name, order_index, wip_limit) VALUES
  ('Intake', 1, NULL),
  ('Brief Ready', 2, NULL),
  ('In Progress', 3, 3),
  ('Compliance Review', 4, 5),
  ('Approval Needed', 5, 5),
  ('Scheduled', 6, NULL),
  ('Posted', 7, NULL),
  ('Archived', 8, NULL)
ON CONFLICT (name) DO NOTHING;

-- Insert example disclaimers
INSERT INTO disclaimers (name, text) VALUES
  ('Medical Disclaimer', 'This content is for informational purposes only and is not intended as medical advice. Consult your healthcare provider before making any health-related decisions.'),
  ('Results May Vary', 'Individual results may vary. Results are not guaranteed and may differ based on individual circumstances.'),
  ('Testimonial Disclaimer', 'Testimonials are based on individual experiences and may not be representative of all users.'),
  ('FDA Disclaimer', 'These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.')
ON CONFLICT DO NOTHING;

-- Note: User profiles will be created automatically via trigger when users sign up
-- To set a user as admin, run this SQL after they sign up:
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-admin-email@example.com';

