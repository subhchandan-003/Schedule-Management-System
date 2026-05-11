-- Run this in Supabase SQL Editor

-- Drop old tables if migrating from v0
DROP TABLE IF EXISTS schedule_entries;
DROP TABLE IF EXISTS courses;

-- User course selections (only table needed)
CREATE TABLE IF NOT EXISTS user_courses (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID    NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  term        INTEGER NOT NULL CHECK (term IN (4, 5, 6)),
  course_code TEXT    NOT NULL,
  UNIQUE (user_id, term, course_code)
);

-- Row Level Security — students only ever see their own rows
ALTER TABLE user_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own" ON user_courses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "insert_own" ON user_courses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own" ON user_courses
  FOR DELETE USING (auth.uid() = user_id);
