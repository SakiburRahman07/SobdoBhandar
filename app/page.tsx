import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { redirect } from 'next/navigation'
import { 
  Brain, 
  Flame, 
  BarChart3, 
  ArrowRight,
  Sparkles,
  Target,
  Clock
} from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If logged in, redirect to dashboard
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-pink-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-background/50 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image 
              src="/logo.png" 
              alt="শব্দভাণ্ডার" 
              width={48} 
              height={48} 
              className="w-12 h-12 rounded-2xl shadow-lg shadow-indigo-500/30"
            />
            <span className="text-2xl font-bold gradient-text">শব্দভাণ্ডার</span>
          </div>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="ghost">লগইন</Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                শুরু করুন
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-8">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-muted-foreground">বৈজ্ঞানিক পদ্ধতিতে শব্দ মনে রাখুন</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="gradient-text">ইংরেজি শব্দ</span>
              <br />
              <span className="text-white">সহজে শিখুন</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl">
              Spaced Repetition এবং Active Recall পদ্ধতি ব্যবহার করে ইংরেজি থেকে বাংলা শব্দ চিরস্থায়ীভাবে মনে রাখুন।
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/signup">
                <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-lg px-8 shadow-lg shadow-indigo-500/30">
                  বিনামূল্যে শুরু করুন
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg px-8 border-white/20 hover:bg-white/5">
                  একাউন্ট আছে? লগইন করুন
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Hero Illustration */}
          <div className="hidden lg:block">
            <Image 
              src="/images/hero.png" 
              alt="বাংলা শব্দ শিখুন" 
              width={500} 
              height={500}
              className="w-full max-w-lg mx-auto rounded-3xl shadow-2xl shadow-indigo-500/20"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          কেন <span className="gradient-text">শব্দভাণ্ডার</span>?
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass-card border-white/10 hover:border-indigo-500/30 transition-colors">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Spaced Repetition</h3>
              <p className="text-muted-foreground text-sm">
                বৈজ্ঞানিক SM-2 অ্যালগরিদম ব্যবহার করে সঠিক সময়ে পুনরাবৃত্তি
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10 hover:border-green-500/30 transition-colors">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Active Recall</h3>
              <p className="text-muted-foreground text-sm">
                শব্দ দেখে অর্থ মনে করার মাধ্যমে স্মৃতি শক্তিশালী করুন
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10 hover:border-orange-500/30 transition-colors">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4">
                <Flame className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">স্ট্রিক ট্র্যাকিং</h3>
              <p className="text-muted-foreground text-sm">
                প্রতিদিন অনুশীলন করে স্ট্রিক বজায় রাখুন এবং অভ্যাস গড়ুন
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10 hover:border-purple-500/30 transition-colors">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">অগ্রগতি দেখুন</h3>
              <p className="text-muted-foreground text-sm">
                আপনার শেখার অগ্রগতি চার্ট এবং পরিসংখ্যান দিয়ে ট্র্যাক করুন
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          কিভাবে <span className="gradient-text">কাজ করে</span>?
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
              <span className="text-2xl font-bold text-white">১</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">শব্দ যোগ করুন</h3>
            <p className="text-muted-foreground text-sm">
              ইংরেজি শব্দ, বাংলা অর্থ এবং উদাহরণ বাক্য দিয়ে নতুন শব্দ যোগ করুন
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
              <span className="text-2xl font-bold text-white">২</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">প্রতিদিন অনুশীলন</h3>
            <p className="text-muted-foreground text-sm">
              ফ্ল্যাশকার্ড দিয়ে প্রতিদিন নির্ধারিত শব্দগুলো পুনরাবৃত্তি করুন
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30">
              <span className="text-2xl font-bold text-white">৩</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">চিরস্থায়ী স্মৃতি</h3>
            <p className="text-muted-foreground text-sm">
              ক্রমবর্ধমান বিরতিতে পুনরাবৃত্তির মাধ্যমে শব্দ দীর্ঘমেয়াদী স্মৃতিতে স্থানান্তরিত হয়
            </p>
          </div>
        </div>
      </section>

      {/* Detailed How-To Guide Section */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            কিভাবে <span className="gradient-text">ব্যবহার করবেন</span>?
          </h2>
          <p className="text-center text-muted-foreground mb-12">How to Use শব্দভাণ্ডার</p>

          {/* What is Spaced Repetition */}
          <Card className="glass-card border-white/10 mb-8">
            <CardContent className="py-8">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Brain className="w-7 h-7 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3">Spaced Repetition কি? (ব্যবধানমূলক পুনরাবৃত্তি)</h3>
                  <div className="space-y-3 text-muted-foreground">
                    <p>
                      <strong className="text-white">বাংলা:</strong> Spaced Repetition হলো একটি বৈজ্ঞানিক পদ্ধতি যেখানে আপনি একটি তথ্য ভুলে যাওয়ার ঠিক আগে সেটি পুনরায় দেখেন। এতে আপনার মস্তিষ্ক সেই তথ্যকে গুরুত্বপূর্ণ মনে করে দীর্ঘমেয়াদী স্মৃতিতে সংরক্ষণ করে।
                    </p>
                    <p>
                      <strong className="text-white">English:</strong> Spaced Repetition is a scientifically proven learning technique where you review information just before you're about to forget it. This tells your brain that the information is important, moving it to long-term memory.
                    </p>
                    <div className="bg-white/5 rounded-lg p-4 mt-4">
                      <p className="text-sm">
                        <strong className="text-indigo-400">উদাহরণ:</strong> আজ একটি শব্দ শিখলে, কাল আবার দেখাবে। সঠিক মনে করলে ৩ দিন পর, তারপর ১ সপ্তাহ পর, তারপর ২ সপ্তাহ পর... এভাবে বিরতি বাড়তে থাকে।
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What is Active Recall */}
          <Card className="glass-card border-white/10 mb-8">
            <CardContent className="py-8">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Target className="w-7 h-7 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3">Active Recall কি? (সক্রিয় স্মরণ)</h3>
                  <div className="space-y-3 text-muted-foreground">
                    <p>
                      <strong className="text-white">বাংলা:</strong> Active Recall হলো সক্রিয়ভাবে কিছু মনে করার চেষ্টা করা, শুধু পড়া নয়। যখন আপনি একটি শব্দ দেখে তার অর্থ মনে করার চেষ্টা করেন, তখন আপনার মস্তিষ্কের নিউরন সংযোগ শক্তিশালী হয়।
                    </p>
                    <p>
                      <strong className="text-white">English:</strong> Active Recall means actively trying to remember something, rather than just passively reading it. When you see a word and try to remember its meaning, your brain's neural connections become stronger.
                    </p>
                    <div className="bg-white/5 rounded-lg p-4 mt-4">
                      <p className="text-sm">
                        <strong className="text-green-400">কিভাবে কাজ করে:</strong> ফ্ল্যাশকার্ডে ইংরেজি শব্দ দেখুন → বাংলা অর্থ মনে করার চেষ্টা করুন → কার্ড উল্টে সঠিক উত্তর দেখুন
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Website Sections Guide */}
          <Card className="glass-card border-white/10 mb-8">
            <CardContent className="py-8">
              <h3 className="text-xl font-bold mb-6 text-center">ওয়েবসাইটের বিভাগগুলো / Website Sections</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-lg">
                    <h4 className="font-semibold text-indigo-400 mb-2">📊 ড্যাশবোর্ড (Dashboard)</h4>
                    <p className="text-sm text-muted-foreground">আপনার সামগ্রিক অগ্রগতি দেখুন - মোট শব্দ, স্ট্রিক, এবং আজকের জন্য পড়ার শব্দ সংখ্যা।</p>
                    <p className="text-xs text-muted-foreground mt-1">View your overall progress - total words, streak, and today's due words.</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <h4 className="font-semibold text-green-400 mb-2">📖 শিখুন (Learn)</h4>
                    <p className="text-sm text-muted-foreground">ফ্ল্যাশকার্ড দিয়ে শব্দ অনুশীলন করুন। কার্ড উল্টে বাংলা অর্থ দেখুন এবং "জানি" বা "জানি না" চাপুন।</p>
                    <p className="text-xs text-muted-foreground mt-1">Practice with flashcards. Flip to see meaning, then press "Know" or "Don't Know".</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <h4 className="font-semibold text-purple-400 mb-2">📚 শব্দ তালিকা (Word List)</h4>
                    <p className="text-sm text-muted-foreground">আপনার সব শব্দ দেখুন, সম্পাদনা করুন, বা মুছুন। নতুন শব্দ যোগ করতে এখানে আসুন।</p>
                    <p className="text-xs text-muted-foreground mt-1">View, edit, or delete all your words. Add new words here.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-lg">
                    <h4 className="font-semibold text-orange-400 mb-2">📈 অগ্রগতি (Progress)</h4>
                    <p className="text-sm text-muted-foreground">আপনার শেখার পরিসংখ্যান দেখুন - কতটি শব্দ সহজ, মাঝারি, বা কঠিন।</p>
                    <p className="text-xs text-muted-foreground mt-1">View learning statistics - how many words are easy, medium, or hard.</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <h4 className="font-semibold text-yellow-400 mb-2">🏆 লিডারবোর্ড (Leaderboard)</h4>
                    <p className="text-sm text-muted-foreground">অন্যান্য শিক্ষার্থীদের সাথে প্রতিযোগিতা করুন। সবচেয়ে বেশি শব্দ শেখা ব্যক্তিদের র‍্যাংকিং দেখুন।</p>
                    <p className="text-xs text-muted-foreground mt-1">Compete with others. See rankings of top vocabulary learners.</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <h4 className="font-semibold text-cyan-400 mb-2">🤖 AI চ্যাটবট (AI Chatbot)</h4>
                    <p className="text-sm text-muted-foreground">যেকোনো শব্দের অর্থ, ব্যবহার, বা ব্যাকরণ সম্পর্কে AI কে জিজ্ঞেস করুন।</p>
                    <p className="text-xs text-muted-foreground mt-1">Ask AI about any word's meaning, usage, or grammar.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step by Step Usage */}
          <Card className="glass-card border-white/10">
            <CardContent className="py-8">
              <h3 className="text-xl font-bold mb-6 text-center">ধাপে ধাপে ব্যবহার / Step-by-Step Guide</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-indigo-500/10 to-transparent rounded-lg">
                  <span className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">১</span>
                  <div>
                    <h4 className="font-semibold">একাউন্ট তৈরি করুন / Create Account</h4>
                    <p className="text-sm text-muted-foreground">"শুরু করুন" বাটনে ক্লিক করে ইমেইল ও পাসওয়ার্ড দিয়ে রেজিস্ট্রেশন করুন।</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-500/10 to-transparent rounded-lg">
                  <span className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">২</span>
                  <div>
                    <h4 className="font-semibold">নতুন শব্দ যোগ করুন / Add New Words</h4>
                    <p className="text-sm text-muted-foreground">"শব্দ তালিকা" → "নতুন শব্দ যোগ করুন" এ গিয়ে ইংরেজি শব্দ লিখুন। AI স্বয়ংক্রিয়ভাবে বাংলা অর্থ, উচ্চারণ ও উদাহরণ তৈরি করবে।</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-orange-500/10 to-transparent rounded-lg">
                  <span className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">৩</span>
                  <div>
                    <h4 className="font-semibold">প্রতিদিন অনুশীলন করুন / Practice Daily</h4>
                    <p className="text-sm text-muted-foreground">"শিখুন" পেজে গিয়ে আজকের জন্য নির্ধারিত শব্দগুলো ফ্ল্যাশকার্ড দিয়ে অনুশীলন করুন। প্রতিদিন ১৫-২০ মিনিট যথেষ্ট।</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-500/10 to-transparent rounded-lg">
                  <span className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">৪</span>
                  <div>
                    <h4 className="font-semibold">স্ট্রিক বজায় রাখুন / Maintain Streak</h4>
                    <p className="text-sm text-muted-foreground">প্রতিদিন অন্তত একটি শব্দ পড়ুন। ধারাবাহিকতা আপনার শেখাকে আরও কার্যকর করে।</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <Card className="glass-card border-white/10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10" />
          <CardContent className="relative py-12 text-center">
            <Clock className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">আজই শুরু করুন!</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              প্রতিদিন মাত্র ১৫-২০ মিনিট অনুশীলন করে ২-৩ মাসে আপনার শব্দভাণ্ডার উল্লেখযোগ্যভাবে বাড়ান
            </p>
            <Link href="/signup">
              <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                বিনামূল্যে শুরু করুন
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© ২০২৬ শব্দভাণ্ডার। বাংলাদেশ থেকে ❤️ দিয়ে তৈরি</p>
        </div>
      </footer>
    </div>
  )
}
