/**
 * SM-2 Spaced Repetition Algorithm
 * Based on the SuperMemo 2 algorithm by Piotr Wozniak
 * 
 * Quality ratings:
 * 0 - Complete blackout, no memory at all
 * 1 - Incorrect response, but remembered something
 * 2 - Incorrect response, but easy to recall
 * 3 - Correct response with difficulty (মাঝারি)
 * 4 - Correct response with hesitation (সহজ)
 * 5 - Perfect response (খুব সহজ)
 */

export interface ReviewData {
  easeFactor: number      // Initially 2.5, minimum 1.3
  interval: number        // Days until next review
  repetitions: number     // Number of successful reviews
  nextReviewDate: Date    // When to review next
}

export interface ReviewResult {
  newEaseFactor: number
  newInterval: number
  newRepetitions: number
  nextReviewDate: Date
}

/**
 * Calculate the next review parameters based on performance
 * @param quality - Rating from 0-5 (0=blackout, 5=perfect)
 * @param currentData - Current review data
 * @returns New review parameters
 */
export function calculateNextReview(
  quality: number,
  currentData: ReviewData
): ReviewResult {
  const { easeFactor, interval, repetitions } = currentData
  
  let newEaseFactor = easeFactor
  let newInterval: number
  let newRepetitions: number

  // If quality is less than 3, reset the repetitions (failed recall)
  if (quality < 3) {
    newRepetitions = 0
    newInterval = 1 // Review again tomorrow
  } else {
    // Successful recall
    newRepetitions = repetitions + 1
    
    // Calculate new interval based on repetition count
    if (newRepetitions === 1) {
      newInterval = 1 // 1 day
    } else if (newRepetitions === 2) {
      newInterval = 3 // 3 days (changed from 6 for more frequent early reviews)
    } else {
      newInterval = Math.round(interval * easeFactor)
    }
  }

  // Update ease factor (always update, even on failure)
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  
  // Ease factor should not go below 1.3
  if (newEaseFactor < 1.3) {
    newEaseFactor = 1.3
  }

  // Calculate next review date
  const nextReviewDate = new Date()
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval)

  return {
    newEaseFactor,
    newInterval,
    newRepetitions,
    nextReviewDate,
  }
}

/**
 * Get initial review data for a new word
 */
export function getInitialReviewData(): ReviewData {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  return {
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReviewDate: tomorrow,
  }
}

/**
 * Convert difficulty button to quality rating
 * কঠিন (Hard) = 1
 * মাঝারি (Medium) = 3
 * সহজ (Easy) = 5
 */
export function difficultyToQuality(difficulty: 'hard' | 'medium' | 'easy'): number {
  switch (difficulty) {
    case 'hard':
      return 1
    case 'medium':
      return 3
    case 'easy':
      return 5
    default:
      return 3
  }
}

/**
 * Get words due for review today
 */
export function isWordDueForReview(nextReviewDate: Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const reviewDate = new Date(nextReviewDate)
  reviewDate.setHours(0, 0, 0, 0)
  
  return reviewDate <= today
}
