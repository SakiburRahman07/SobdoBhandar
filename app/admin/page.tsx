'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { 
  Shield, 
  Users,
  MessageSquare,
  BookOpen,
  TrendingUp,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Suggestion {
  id: string
  user_id: string
  title: string
  description: string
  category: string
  status: string
  admin_response: string | null
  created_at: string
}

interface Stats {
  totalUsers: number
  totalWords: number
  totalSuggestions: number
  pendingSuggestions: number
}

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalWords: 0, totalSuggestions: 0, pendingSuggestions: 0 })
  const [responseText, setResponseText] = useState<{ [key: string]: string }>({})
  
  const { user, loading: authLoading } = useAuth()
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    const checkAdmin = async () => {
      try {
        const { data, error } = await supabase
          .from('admins')
          .select('user_id')
          .eq('user_id', user.id)
          .single()

        console.log('Admin check:', { userId: user.id, data, error })

        if (error) {
          console.error('Admin check error:', error)
          if (error.code === 'PGRST116') {
            toast.error('আপনি অ্যাডমিন নন')
            router.push('/dashboard')
            return
          }
          toast.error('অ্যাডমিন চেক করতে সমস্যা হয়েছে')
          setLoading(false)
          return
        }

        if (!data) {
          toast.error('আপনি অ্যাডমিন নন')
          router.push('/dashboard')
          return
        }

        setIsAdmin(true)
        await fetchData()
        setLoading(false)
      } catch (err) {
        console.error('Admin check failed:', err)
        toast.error('সার্ভার এরর হয়েছে')
        setLoading(false)
      }
    }

    const fetchData = async () => {
      // Fetch suggestions
      const { data: suggestionsData } = await supabase
        .from('suggestions')
        .select('*')
        .order('created_at', { ascending: false })

      setSuggestions(suggestionsData || [])

      // Fetch stats
      const [
        { count: usersCount },
        { count: wordsCount },
        { count: suggestionsCount }
      ] = await Promise.all([
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('words').select('*', { count: 'exact', head: true }),
        supabase.from('suggestions').select('*', { count: 'exact', head: true })
      ])

      setStats({
        totalUsers: usersCount || 0,
        totalWords: wordsCount || 0,
        totalSuggestions: suggestionsCount || 0,
        pendingSuggestions: (suggestionsData || []).filter(s => s.status === 'pending').length
      })
    }

    checkAdmin()
  }, [user, authLoading, supabase, router])

  const updateStatus = async (id: string, status: string) => {
    const response = responseText[id] || null
    
    const { error } = await supabase
      .from('suggestions')
      .update({ 
        status, 
        admin_response: response,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      toast.error('আপডেট করতে সমস্যা হয়েছে')
    } else {
      toast.success('স্ট্যাটাস আপডেট হয়েছে')
      setSuggestions(prev => prev.map(s => 
        s.id === id ? { ...s, status, admin_response: response } : s
      ))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 border-yellow-500/30'
      case 'reviewed': return 'text-blue-400 border-blue-500/30'
      case 'implemented': return 'text-green-400 border-green-500/30'
      case 'rejected': return 'text-red-400 border-red-500/30'
      default: return ''
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      </div>

      {/* Enhanced Header */}
      <header className="relative border-b border-white/10 bg-gradient-to-r from-red-900/30 via-orange-900/20 to-purple-900/30 backdrop-blur-lg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10" />
        <div className="container mx-auto px-4 py-6 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">অ্যাডমিন প্যানেল</h1>
                <p className="text-sm text-muted-foreground">শব্দভাণ্ডার ম্যানেজমেন্ট</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-white/20 hover:bg-white/10"
                onClick={() => window.location.reload()}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                রিফ্রেশ
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-white/20 hover:bg-white/10"
                onClick={() => router.push('/dashboard')}
              >
                ড্যাশবোর্ডে ফিরুন
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Enhanced Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="relative overflow-hidden border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 hover:scale-[1.02] transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/20 rounded-full blur-2xl" />
            <CardContent className="pt-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">মোট ব্যবহারকারী</p>
                  <p className="text-3xl font-bold text-indigo-300">{stats.totalUsers}</p>
                </div>
                <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-indigo-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-green-500/20 bg-gradient-to-br from-green-500/10 to-emerald-500/10 hover:scale-[1.02] transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/20 rounded-full blur-2xl" />
            <CardContent className="pt-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">মোট শব্দ</p>
                  <p className="text-3xl font-bold text-green-300">{stats.totalWords}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-pink-500/10 hover:scale-[1.02] transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/20 rounded-full blur-2xl" />
            <CardContent className="pt-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">মোট পরামর্শ</p>
                  <p className="text-3xl font-bold text-purple-300">{stats.totalSuggestions}</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 hover:scale-[1.02] transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/20 rounded-full blur-2xl" />
            <CardContent className="pt-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">অপেক্ষমান</p>
                  <p className="text-3xl font-bold text-yellow-300">{stats.pendingSuggestions}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center animate-pulse">
                  <Clock className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Suggestions List */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-400" />
              পরামর্শসমূহ
            </CardTitle>
          </CardHeader>
          <CardContent>
            {suggestions.length > 0 ? (
              <div className="space-y-4">
                {suggestions.map((suggestion) => (
                  <div key={suggestion.id} className="relative p-5 rounded-xl bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10 hover:border-white/20 transition-all duration-300">
                    {/* Status indicator line */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${
                      suggestion.status === 'pending' ? 'bg-yellow-500' :
                      suggestion.status === 'reviewed' ? 'bg-blue-500' :
                      suggestion.status === 'implemented' ? 'bg-green-500' :
                      'bg-red-500'
                    }`} />
                    
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{suggestion.title}</h4>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs bg-purple-500/10 border-purple-500/30 text-purple-300">
                            {suggestion.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(suggestion.created_at).toLocaleDateString('bn-BD', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className={`${getStatusColor(suggestion.status)} font-medium`}>
                        {suggestion.status === 'pending' ? '⏳ অপেক্ষমান' :
                         suggestion.status === 'reviewed' ? '👀 পর্যালোচিত' :
                         suggestion.status === 'implemented' ? '✅ বাস্তবায়িত' :
                         '❌ প্রত্যাখ্যাত'}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">{suggestion.description}</p>
                    
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="অ্যাডমিন উত্তর..."
                        value={responseText[suggestion.id] || ''}
                        onChange={(e) => setResponseText(prev => ({ ...prev, [suggestion.id]: e.target.value }))}
                        className="bg-white/5 border-white/10 text-sm"
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            স্ট্যাটাস
                            <ChevronDown className="w-4 h-4 ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => updateStatus(suggestion.id, 'reviewed')}>
                            <CheckCircle2 className="w-4 h-4 mr-2 text-blue-400" />
                            পর্যালোচিত
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateStatus(suggestion.id, 'implemented')}>
                            <CheckCircle2 className="w-4 h-4 mr-2 text-green-400" />
                            বাস্তবায়িত
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateStatus(suggestion.id, 'rejected')}>
                            <XCircle className="w-4 h-4 mr-2 text-red-400" />
                            প্রত্যাখ্যাত
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(suggestion.created_at).toLocaleDateString('bn-BD')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>কোন পরামর্শ নেই</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
