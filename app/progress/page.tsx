'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  TrendingUp, 
  Flame, 
  Target, 
  BookOpen,
  Calendar,
  Award,
  Loader2
} from 'lucide-react'

interface DailyProgress {
  date: string
  words_reviewed: number
  streak_count: number
}

interface WordStats {
  total: number
  easy: number
  medium: number
  hard: number
}

const COLORS = ['#22c55e', '#eab308', '#ef4444']

export default function ProgressPage() {
  const [dailyProgress, setDailyProgress] = useState<DailyProgress[]>([])
  const [wordStats, setWordStats] = useState<WordStats>({ total: 0, easy: 0, medium: 0, hard: 0 })
  const [loading, setLoading] = useState(true)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [totalReviewed, setTotalReviewed] = useState(0)
  
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (!user) return

    const fetchProgress = async () => {
      // Fetch last 7 days progress
      const { data: progressData } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(7)

      if (progressData) {
        // Fill in missing days
        const last7Days = []
        for (let i = 6; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          const dateStr = date.toISOString().split('T')[0]
          const dayProgress = progressData.find(p => p.date === dateStr)
          last7Days.push({
            date: date.toLocaleDateString('bn-BD', { weekday: 'short' }),
            words_reviewed: dayProgress?.words_reviewed ?? 0,
            streak_count: dayProgress?.streak_count ?? 0
          })
        }
        setDailyProgress(last7Days)
        setCurrentStreak(progressData[0]?.streak_count ?? 0)
        setTotalReviewed(progressData.reduce((acc, p) => acc + (p.words_reviewed || 0), 0))
      }

      // Fetch word statistics
      const { data: words } = await supabase
        .from('words')
        .select('difficulty')
        .eq('user_id', user.id)

      if (words) {
        setWordStats({
          total: words.length,
          easy: words.filter(w => w.difficulty === 'easy').length,
          medium: words.filter(w => w.difficulty === 'medium').length,
          hard: words.filter(w => w.difficulty === 'hard').length
        })
      }

      setLoading(false)
    }

    fetchProgress()
  }, [user, supabase])

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

  const pieData = [
    { name: 'সহজ', value: wordStats.easy },
    { name: 'মাঝারি', value: wordStats.medium },
    { name: 'কঠিন', value: wordStats.hard }
  ].filter(d => d.value > 0)

  const masteryPercent = wordStats.total > 0 
    ? Math.round((wordStats.easy / wordStats.total) * 100) 
    : 0

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">অগ্রগতি</h1>
          <p className="text-muted-foreground">
            আপনার শেখার পরিসংখ্যান দেখুন
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="glass-card border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">মোট শব্দ</p>
                  <p className="text-3xl font-bold">{wordStats.total}</p>
                </div>
                <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-indigo-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">বর্তমান স্ট্রিক</p>
                  <p className="text-3xl font-bold text-orange-400">{currentStreak}</p>
                </div>
                <div className={`w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center ${currentStreak > 0 ? 'streak-fire' : ''}`}>
                  <Flame className="w-6 h-6 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">এই সপ্তাহে</p>
                  <p className="text-3xl font-bold text-green-400">{totalReviewed}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">দক্ষতা</p>
                  <p className="text-3xl font-bold text-purple-400">{masteryPercent}%</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Weekly Chart */}
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                সাপ্তাহিক অগ্রগতি
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyProgress}>
                    <XAxis 
                      dataKey="date" 
                      stroke="#64748b"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#64748b"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px'
                      }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Bar 
                      dataKey="words_reviewed" 
                      fill="url(#barGradient)"
                      radius={[4, 4, 0, 0]}
                      name="শব্দ পড়া হয়েছে"
                    />
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Difficulty Distribution */}
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-green-400" />
                শব্দ বিভাজন
              </CardTitle>
            </CardHeader>
            <CardContent>
              {wordStats.total > 0 ? (
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  কোন ডেটা নেই
                </div>
              )}
              
              {/* Legend */}
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm">সহজ ({wordStats.easy})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="text-sm">মাঝারি ({wordStats.medium})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm">কঠিন ({wordStats.hard})</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mastery Progress */}
        <Card className="glass-card border-white/10 mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-400" />
              দক্ষতার অগ্রগতি
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">সহজ শব্দের শতাংশ</span>
                <span className="font-semibold">{masteryPercent}%</span>
              </div>
              <Progress value={masteryPercent} className="h-3" />
              <p className="text-sm text-muted-foreground">
                আপনার {wordStats.total} টি শব্দের মধ্যে {wordStats.easy} টি শব্দ সহজ হিসেবে চিহ্নিত। 
                লক্ষ্য হলো সব শব্দ সহজ করে তোলা!
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
