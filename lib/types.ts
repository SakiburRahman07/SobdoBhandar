export type Difficulty = "easy" | "medium" | "hard";

export interface VerbForms {
  present: string;
  past: string;
  past_participle: string;
  present_participle: string;
}

export interface Word {
  id: string;
  user_id: string;
  english_word: string;
  bangla_meaning: string;
  part_of_speech?: string | null;
  sub_type?: string | null;
  verb_forms?: VerbForms | null;
  example_sentence: string | null;
  example_sentence_bn?: string | null;
  pronunciation: string | null;
  synonyms: string[] | null;
  antonyms: string[] | null;
  difficulty: Difficulty;
  is_pinned?: boolean | null;
  created_at: string;
}

export interface ReviewSchedule {
  id: string;
  word_id: string;
  user_id: string;
  next_review_date: string;
  interval_days: number;
  ease_factor: number;
  repetitions: number;
  last_reviewed_at: string | null;
  created_at: string;
}

export interface DailyProgress {
  id: string;
  user_id: string;
  date: string;
  words_reviewed: number;
  words_learned: number;
  streak_count: number;
  created_at?: string;
}

export interface WordWithReview extends Word {
  review_schedule: ReviewSchedule | null;
}

export interface WordListItem extends Word {
  review_schedule?: ReviewSchedule | ReviewSchedule[] | null;
}

export interface DashboardSummary {
  totalWords: number;
  dueToday: number;
  weeklyReviewed: number;
  currentStreak: number;
  mastery: number;
}

export interface ProgressOverview {
  totalWords: number;
  easyWords: number;
  mediumWords: number;
  hardWords: number;
  currentStreak: number;
  weeklyReviewed: number;
  masteryPercent: number;
}

export interface UserProfileRecord {
  id: string;
  email?: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  target_words_per_day?: number | null;
  notification_enabled?: boolean | null;
  total_words_learned?: number | null;
  longest_streak?: number | null;
  onboarding_completed_at?: string | null;
}

export interface LeaderboardEntry {
  user_id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  total_words: number;
  current_streak: number;
  rank: number;
}

export interface SuggestionRecord {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  admin_response: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface User {
  id: string;
  email: string;
}
