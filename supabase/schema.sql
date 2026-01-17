-- শব্দভাণ্ডার Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PHASE 1: Core Tables
-- =============================================

-- Words table
CREATE TABLE IF NOT EXISTS words (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  english_word TEXT NOT NULL,
  bangla_meaning TEXT NOT NULL,
  example_sentence TEXT,
  pronunciation TEXT,
  synonyms TEXT[],
  antonyms TEXT[],
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Review Schedule table (for spaced repetition)
CREATE TABLE IF NOT EXISTS review_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word_id UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  next_review_date DATE NOT NULL,
  interval_days INTEGER DEFAULT 1,
  ease_factor FLOAT DEFAULT 2.5,
  repetitions INTEGER DEFAULT 0,
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Progress table (for streak tracking)
CREATE TABLE IF NOT EXISTS daily_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  words_reviewed INTEGER DEFAULT 0,
  words_learned INTEGER DEFAULT 0,
  streak_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- =============================================
-- PHASE 2: AI & Enhanced Features
-- =============================================

-- User Profiles (extended user info)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  target_words_per_day INTEGER DEFAULT 10,
  notification_enabled BOOLEAN DEFAULT true,
  total_words_learned INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Messages (AI chatbot history)
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  role TEXT CHECK (role IN ('user', 'assistant')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Suggestions/Feedback
CREATE TABLE IF NOT EXISTS suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT DEFAULT 'general' CHECK (category IN ('bug', 'feature', 'improvement', 'general')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'implemented', 'rejected')),
  admin_response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Users
CREATE TABLE IF NOT EXISTS admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_words_user_id ON words(user_id);
CREATE INDEX IF NOT EXISTS idx_words_created_at ON words(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_review_schedule_user_id ON review_schedule(user_id);
CREATE INDEX IF NOT EXISTS idx_review_schedule_next_review ON review_schedule(next_review_date);
CREATE INDEX IF NOT EXISTS idx_daily_progress_user_id ON daily_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_progress_date ON daily_progress(date DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_status ON suggestions(status);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Words policies
CREATE POLICY "Users can view own words" ON words FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own words" ON words FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own words" ON words FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own words" ON words FOR DELETE USING (auth.uid() = user_id);

-- Review Schedule policies
CREATE POLICY "Users can view own review schedules" ON review_schedule FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own review schedules" ON review_schedule FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own review schedules" ON review_schedule FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own review schedules" ON review_schedule FOR DELETE USING (auth.uid() = user_id);

-- Daily Progress policies
CREATE POLICY "Users can view own progress" ON daily_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON daily_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON daily_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own progress" ON daily_progress FOR DELETE USING (auth.uid() = user_id);

-- User Profiles policies
CREATE POLICY "Users can view all profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- Chat Messages policies
CREATE POLICY "Users can view own chat" ON chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat" ON chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Suggestions policies
CREATE POLICY "Users can view own suggestions" ON suggestions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all suggestions" ON suggestions FOR SELECT USING (
  EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
);
CREATE POLICY "Users can insert suggestions" ON suggestions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update suggestions" ON suggestions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
);

-- Admins policies (users can check if they are admin)
CREATE POLICY "Users can check own admin status" ON admins FOR SELECT USING (auth.uid() = user_id);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to get leaderboard
CREATE OR REPLACE FUNCTION get_leaderboard(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  avatar_url TEXT,
  total_words INTEGER,
  current_streak INTEGER,
  rank BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.id as user_id,
    up.display_name,
    up.avatar_url,
    COALESCE(up.total_words_learned, 0) as total_words,
    COALESCE(dp.streak_count, 0) as current_streak,
    ROW_NUMBER() OVER (ORDER BY COALESCE(up.total_words_learned, 0) DESC) as rank
  FROM user_profiles up
  LEFT JOIN (
    SELECT DISTINCT ON (user_id) user_id, streak_count
    FROM daily_progress
    ORDER BY user_id, date DESC
  ) dp ON up.id = dp.user_id
  ORDER BY total_words DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
