import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  BookOpen, 
  Flame, 
  Target, 
  TrendingUp, 
  Plus, 
  ArrowRight,
  Calendar,
  Clock
} from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get today's date
  const today = new Date().toISOString().split('T')[0]

  // Fetch statistics
  const [
    { count: totalWords },
    { count: dueToday },
    { data: progressData },
    { data: recentWords }
  ] = await Promise.all([
    supabase.from('words').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('review_schedule').select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .lte('next_review_date', today),
    supabase.from('daily_progress')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(7),
    supabase.from('words')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)
  ])

  // Calculate streak
  const streakCount = progressData?.[0]?.streak_count ?? 0
  const wordsLearnedToday = progressData?.find(p => p.date === today)?.words_reviewed ?? 0
  const totalWordsLearned = progressData?.reduce((acc, p) => acc + (p.words_reviewed || 0), 0) ?? 0

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            স্বাগতম! 👋
          </h1>
          <p className="text-muted-foreground">
            আজকের শেখার লক্ষ্য অর্জন করুন
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="glass-card border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">মোট শব্দ</p>
                  <p className="text-3xl font-bold">{totalWords ?? 0}</p>
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
                  <p className="text-sm text-muted-foreground">আজ পড়তে হবে</p>
                  <p className="text-3xl font-bold text-yellow-400">{dueToday ?? 0}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">স্ট্রিক</p>
                  <p className="text-3xl font-bold text-orange-400">{streakCount}</p>
                </div>
                <div className={`w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center ${streakCount > 0 ? 'streak-fire' : ''}`}>
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
                  <p className="text-3xl font-bold text-green-400">{totalWordsLearned}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Start Learning */}
          <Card className="glass-card border-white/10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 pointer-events-none" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-400" />
                আজকের পর্যালোচনা
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">অগ্রগতি</span>
                  <span>{wordsLearnedToday}/{dueToday ?? 0} শব্দ</span>
                </div>
                <Progress 
                  value={dueToday ? (wordsLearnedToday / dueToday) * 100 : 0} 
                  className="h-2"
                />
              </div>
              
              {(dueToday ?? 0) > 0 ? (
                <Link href="/learn">
                  <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                    শেখা শুরু করুন
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              ) : (
                <Button className="w-full" disabled>
                  <Clock className="w-4 h-4 mr-2" />
                  আজকের জন্য সম্পন্ন!
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Add New Word */}
          <Card className="glass-card border-white/10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 pointer-events-none" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-400" />
                নতুন শব্দ যোগ করুন
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                আপনার শব্দভাণ্ডারে নতুন ইংরেজি শব্দ যোগ করুন এবং বাংলা অর্থ সহ সংরক্ষণ করুন।
              </p>
              <Link href="/words/add">
                <Button variant="outline" className="w-full border-green-500/30 text-green-400 hover:bg-green-500/10">
                  শব্দ যোগ করুন
                  <Plus className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Words */}
        <Card className="glass-card border-white/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              সাম্প্রতিক শব্দ
            </CardTitle>
            <Link href="/words">
              <Button variant="ghost" size="sm">
                সব দেখুন
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentWords && recentWords.length > 0 ? (
              <div className="space-y-3">
                {recentWords.map((word) => (
                  <div 
                    key={word.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div>
                      <p className="font-medium font-english">{word.english_word}</p>
                      <p className="text-sm text-muted-foreground font-bangla">{word.bangla_meaning}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      word.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                      word.difficulty === 'hard' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {word.difficulty === 'easy' ? 'সহজ' : word.difficulty === 'hard' ? 'কঠিন' : 'মাঝারি'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>কোন শব্দ যোগ করা হয়নি</p>
                <Link href="/words/add">
                  <Button variant="link" className="text-indigo-400 mt-2">
                    প্রথম শব্দ যোগ করুন
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
