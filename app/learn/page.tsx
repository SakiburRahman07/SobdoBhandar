'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'
import { Navbar } from '@/components/navbar'
import { Flashcard } from '@/components/flashcard'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  calculateNextReview, 
  difficultyToQuality 
} from '@/lib/spaced-repetition'
import type { WordWithReview } from '@/lib/types'
import { 
  Trophy, 
  ArrowLeft, 
  Loader2, 
  Sparkles,
  BookOpen
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function LearnPage() {
  const [words, setWords] = useState<WordWithReview[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [loading, setLoading] = useState(true)
  const [completed, setCompleted] = useState(false)
  const [sessionStats, setSessionStats] = useState({ easy: 0, medium: 0, hard: 0 })
  
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()

  const fetchDueWords = useCallback(async () => {
    if (!user) return

    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('words')
      .select(`
        *,
        review_schedule (*)
      `)
      .eq('user_id', user.id)
      .lte('review_schedule.next_review_date', today)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching words:', error)
      toast.error('শব্দ লোড করতে সমস্যা হয়েছে')
      return
    }

    // Filter words that actually have due reviews
    const dueWords = (data || []).filter(word => 
      word.review_schedule && word.review_schedule.length > 0
    ).map(word => ({
      ...word,
      review_schedule: word.review_schedule[0]
    }))

    setWords(dueWords as WordWithReview[])
    setLoading(false)
  }, [user, supabase])

  useEffect(() => {
    fetchDueWords()
  }, [fetchDueWords])

  const handleRate = async (difficulty: 'hard' | 'medium' | 'easy') => {
    const currentWord = words[currentIndex]
    if (!currentWord || !currentWord.review_schedule || !user) return

    const quality = difficultyToQuality(difficulty)
    const reviewData = {
      easeFactor: currentWord.review_schedule.ease_factor,
      interval: currentWord.review_schedule.interval_days,
      repetitions: currentWord.review_schedule.repetitions,
      nextReviewDate: new Date(currentWord.review_schedule.next_review_date)
    }

    const result = calculateNextReview(quality, reviewData)

    // Update review schedule
    const { error: scheduleError } = await supabase
      .from('review_schedule')
      .update({
        next_review_date: result.nextReviewDate.toISOString().split('T')[0],
        interval_days: result.newInterval,
        ease_factor: result.newEaseFactor,
        repetitions: result.newRepetitions,
        last_reviewed_at: new Date().toISOString()
      })
      .eq('id', currentWord.review_schedule.id)

    if (scheduleError) {
      console.error('Error updating schedule:', scheduleError)
      toast.error('আপডেট করতে সমস্যা হয়েছে')
      return
    }

    // Update word difficulty
    await supabase
      .from('words')
      .update({ difficulty })
      .eq('id', currentWord.id)

    // Update session stats
    setSessionStats(prev => ({
      ...prev,
      [difficulty]: prev[difficulty] + 1
    }))

    // Move to next word or complete
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setShowAnswer(false)
    } else {
      // Session complete - update daily progress
      await updateDailyProgress()
      setCompleted(true)
    }
  }

  const updateDailyProgress = async () => {
    if (!user) return

    const today = new Date().toISOString().split('T')[0]
    
    // Check if progress exists for today
    const { data: existingProgress } = await supabase
      .from('daily_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single()

    // Get yesterday's progress for streak
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const { data: yesterdayProgress } = await supabase
      .from('daily_progress')
      .select('streak_count')
      .eq('user_id', user.id)
      .eq('date', yesterday.toISOString().split('T')[0])
      .single()

    const newStreak = yesterdayProgress ? yesterdayProgress.streak_count + 1 : 1
    const wordsReviewed = words.length

    if (existingProgress) {
      await supabase
        .from('daily_progress')
        .update({
          words_reviewed: existingProgress.words_reviewed + wordsReviewed,
          streak_count: Math.max(existingProgress.streak_count, newStreak)
        })
        .eq('id', existingProgress.id)
    } else {
      await supabase
        .from('daily_progress')
        .insert({
          user_id: user.id,
          date: today,
          words_reviewed: wordsReviewed,
          words_learned: 0,
          streak_count: newStreak
        })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      </div>
    )
  }

  if (words.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto glass-card border-white/10 text-center">
            <CardContent className="pt-12 pb-8">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">অভিনন্দন! 🎉</h2>
              <p className="text-muted-foreground mb-6">
                আজকের জন্য পড়ার কোন শব্দ নেই! নতুন শব্দ যোগ করুন বা পরে আবার আসুন।
              </p>
              <div className="flex flex-col gap-3">
                <Link href="/words/add">
                  <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600">
                    নতুন শব্দ যোগ করুন
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full">
                    ড্যাশবোর্ডে ফিরুন
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (completed) {
    const totalWords = sessionStats.easy + sessionStats.medium + sessionStats.hard
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        
        {/* Celebration Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto glass-card border-white/10 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 pointer-events-none" />
            <CardContent className="relative pt-12 pb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/30 animate-bounce">
                <Trophy className="w-12 h-12 text-white" />
              </div>
              
              <h2 className="text-3xl font-bold mb-2 gradient-text">অসাধারণ! 🎉</h2>
              <p className="text-muted-foreground mb-6">
                আপনি আজকের সেশন সম্পন্ন করেছেন!
              </p>

              {/* Session Stats */}
              <div className="bg-white/5 rounded-xl p-4 mb-6">
                <p className="text-sm text-muted-foreground mb-3">সেশন পরিসংখ্যান</p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">{sessionStats.easy}</p>
                    <p className="text-xs text-muted-foreground">সহজ</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-400">{sessionStats.medium}</p>
                    <p className="text-xs text-muted-foreground">মাঝারি</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-400">{sessionStats.hard}</p>
                    <p className="text-xs text-muted-foreground">কঠিন</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-lg font-semibold">মোট শব্দ পড়া হয়েছে: {totalWords}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Link href="/dashboard">
                  <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600">
                    <Sparkles className="w-4 h-4 mr-2" />
                    ড্যাশবোর্ডে ফিরুন
                  </Button>
                </Link>
                <Link href="/words/add">
                  <Button variant="outline" className="w-full">
                    আরো শব্দ যোগ করুন
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const currentWord = words[currentIndex]
  const progressPercent = ((currentIndex) / words.length) * 100

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            ফিরে যান
          </Button>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} / {words.length}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-lg mx-auto mb-8">
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Flashcard */}
        <Flashcard 
          word={currentWord}
          showAnswer={showAnswer}
          onFlip={() => setShowAnswer(!showAnswer)}
          onRate={handleRate}
        />
      </main>
    </div>
  )
}
