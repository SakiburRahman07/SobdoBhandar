import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, BookOpen } from 'lucide-react'
import { WordsList } from '@/components/words-list'

export default async function WordsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch all words with review schedules
  const { data: words } = await supabase
    .from('words')
    .select(`
      *,
      review_schedule (next_review_date, interval_days)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">শব্দ তালিকা</h1>
            <p className="text-muted-foreground">
              আপনার সংরক্ষিত সব শব্দ
            </p>
          </div>
          <Link href="/words/add">
            <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              নতুন শব্দ
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="glass-card border-white/10">
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold">{words?.length ?? 0}</p>
              <p className="text-sm text-muted-foreground">মোট শব্দ</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-white/10">
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-green-400">
                {words?.filter(w => w.difficulty === 'easy').length ?? 0}
              </p>
              <p className="text-sm text-muted-foreground">সহজ</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-white/10">
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-red-400">
                {words?.filter(w => w.difficulty === 'hard').length ?? 0}
              </p>
              <p className="text-sm text-muted-foreground">কঠিন</p>
            </CardContent>
          </Card>
        </div>

        {/* Word List */}
        {words && words.length > 0 ? (
          <WordsList words={words} />
        ) : (
          <Card className="glass-card border-white/10">
            <CardContent className="py-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="text-xl font-semibold mb-2">কোন শব্দ নেই</h3>
              <p className="text-muted-foreground mb-4">
                আপনার শব্দভাণ্ডারে এখনো কোন শব্দ যোগ করা হয়নি
              </p>
              <Link href="/words/add">
                <Button className="bg-gradient-to-r from-indigo-500 to-purple-600">
                  <Plus className="w-4 h-4 mr-2" />
                  প্রথম শব্দ যোগ করুন
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

