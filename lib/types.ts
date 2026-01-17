export interface Word {
  id: string
  user_id: string
  english_word: string
  bangla_meaning: string
  example_sentence: string | null
  pronunciation: string | null
  synonyms: string[] | null
  antonyms: string[] | null
  difficulty: 'easy' | 'medium' | 'hard'
  created_at: string
}

export interface ReviewSchedule {
  id: string
  word_id: string
  user_id: string
  next_review_date: string
  interval_days: number
  ease_factor: number
  repetitions: number
  last_reviewed_at: string | null
  created_at: string
}

export interface DailyProgress {
  id: string
  user_id: string
  date: string
  words_reviewed: number
  words_learned: number
  streak_count: number
  created_at: string
}

export interface WordWithReview extends Word {
  review_schedule: ReviewSchedule | null
}

export interface User {
  id: string
  email: string
}
