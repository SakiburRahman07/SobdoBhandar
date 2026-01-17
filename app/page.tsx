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
