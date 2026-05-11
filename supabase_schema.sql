-- Run this entire file in Supabase SQL Editor

-- Master schedule entries
CREATE TABLE IF NOT EXISTS schedule_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term TEXT NOT NULL,
  date DATE NOT NULL,
  day_of_week TEXT NOT NULL,
  section TEXT NOT NULL CHECK (section IN ('A', 'B', 'COMMON')),
  slot_label TEXT NOT NULL,
  slot_start TIME NOT NULL,
  slot_end TIME NOT NULL,
  course_code TEXT,
  course_name_raw TEXT,
  session_number INTEGER,
  is_special_event BOOLEAN DEFAULT FALSE,
  special_event_label TEXT,
  custom_start_override TIME,
  custom_end_override TIME,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Course master data
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term TEXT NOT NULL,
  code TEXT NOT NULL,
  full_name TEXT NOT NULL,
  credits NUMERIC(3,1),
  area TEXT,
  faculty TEXT,
  faculty_email TEXT,
  classroom TEXT,
  sections TEXT[],
  group_email TEXT,
  total_sessions INTEGER,
  cr_a_name TEXT,
  cr_a_email TEXT,
  cr_a_phone TEXT,
  cr_b_name TEXT,
  cr_b_email TEXT,
  cr_b_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(term, code)
);

-- Enable Realtime on schedule_entries
ALTER TABLE schedule_entries REPLICA IDENTITY FULL;

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_schedule_date ON schedule_entries(date);
CREATE INDEX IF NOT EXISTS idx_schedule_term ON schedule_entries(term);
CREATE INDEX IF NOT EXISTS idx_schedule_term_section ON schedule_entries(term, section);
CREATE INDEX IF NOT EXISTS idx_schedule_course ON schedule_entries(course_code);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_schedule_updated_at
  BEFORE UPDATE ON schedule_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enable Realtime publication (run in Supabase dashboard or here)
-- ALTER PUBLICATION supabase_realtime ADD TABLE schedule_entries;
