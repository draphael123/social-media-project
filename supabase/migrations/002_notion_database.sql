-- Notion-style Database Tables
-- This extends the existing schema with dynamic table/column support

-- Tables (the main database containers)
CREATE TABLE database_tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Columns (dynamic columns for each table)
CREATE TABLE database_columns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_id UUID NOT NULL REFERENCES database_tables(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('text', 'number', 'date', 'select', 'checkbox', 'url', 'email', 'phone', 'rich_text')),
  order_index INTEGER NOT NULL DEFAULT 0,
  options JSONB, -- For select type, stores options array
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(table_id, name)
);

-- Rows (data entries)
CREATE TABLE database_rows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_id UUID NOT NULL REFERENCES database_tables(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cell values (the actual data in cells)
CREATE TABLE database_cells (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  row_id UUID NOT NULL REFERENCES database_rows(id) ON DELETE CASCADE,
  column_id UUID NOT NULL REFERENCES database_columns(id) ON DELETE CASCADE,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(row_id, column_id)
);

-- Indexes for performance
CREATE INDEX idx_database_columns_table ON database_columns(table_id);
CREATE INDEX idx_database_columns_order ON database_columns(table_id, order_index);
CREATE INDEX idx_database_rows_table ON database_rows(table_id);
CREATE INDEX idx_database_cells_row ON database_cells(row_id);
CREATE INDEX idx_database_cells_column ON database_cells(column_id);

-- Triggers for updated_at
CREATE TRIGGER update_database_tables_updated_at BEFORE UPDATE ON database_tables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_database_columns_updated_at BEFORE UPDATE ON database_columns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_database_rows_updated_at BEFORE UPDATE ON database_rows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_database_cells_updated_at BEFORE UPDATE ON database_cells
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies

ALTER TABLE database_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE database_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE database_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE database_cells ENABLE ROW LEVEL SECURITY;

-- Tables policies - allow all authenticated users to read/write (collaborative)
CREATE POLICY "Anyone authenticated can view tables"
  ON database_tables FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone authenticated can create tables"
  ON database_tables FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Anyone authenticated can update tables"
  ON database_tables FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone authenticated can delete tables"
  ON database_tables FOR DELETE
  USING (auth.role() = 'authenticated');

-- Columns policies
CREATE POLICY "Anyone authenticated can view columns"
  ON database_columns FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone authenticated can manage columns"
  ON database_columns FOR ALL
  USING (auth.role() = 'authenticated');

-- Rows policies
CREATE POLICY "Anyone authenticated can view rows"
  ON database_rows FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone authenticated can manage rows"
  ON database_rows FOR ALL
  USING (auth.role() = 'authenticated');

-- Cells policies
CREATE POLICY "Anyone authenticated can view cells"
  ON database_cells FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone authenticated can manage cells"
  ON database_cells FOR ALL
  USING (auth.role() = 'authenticated');

-- Create default table for David + Daniel
INSERT INTO database_tables (name, description, created_by)
SELECT 
  'David + Daniel Shared Database',
  'A lightweight Notion-style database tracker for collaborative project management',
  id
FROM profiles
LIMIT 1
ON CONFLICT DO NOTHING;

