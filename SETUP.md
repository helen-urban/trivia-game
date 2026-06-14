# 🚀 Complete Setup Guide - World News Trivia Game

## Prerequisites
- Node.js 16+ installed
- GitHub account
- (Optional) npm or yarn

## Step 1: Set Up Supabase (Database & API) - FREE ✅

### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" → Sign up with GitHub
3. Create a new organization
4. Create a new project:
   - Name: `trivia-game`
   - Region: Choose closest to you
   - Password: Save this!
5. Wait for project to initialize (2-3 minutes)

### Create Database Tables

1. Go to **SQL Editor** in your Supabase dashboard
2. Click **New Query**
3. Paste this SQL and click **Run**:

```sql
-- Create scores table
CREATE TABLE scores (
  id BIGSERIAL PRIMARY KEY,
  user_name TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 5),
  total_questions INTEGER DEFAULT 5,
  answers JSONB,
  quiz_session_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Create quiz_sessions table
CREATE TABLE quiz_sessions (
  id TEXT PRIMARY KEY,
  questions JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_scores_created_at ON scores(created_at DESC);
CREATE INDEX idx_scores_quiz_session ON scores(quiz_session_id);
CREATE INDEX idx_quiz_sessions_created_at ON quiz_sessions(created_at DESC);

-- Enable row-level security (optional but recommended)
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;

-- Create public access policies
CREATE POLICY "Public read access" ON scores FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON scores FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read access" ON quiz_sessions FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON quiz_sessions FOR INSERT WITH CHECK (true);
