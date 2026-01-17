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

      {/* Header */}
      <header className="border-b border-white/10 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Shield className="w-8 h-8 text-red-400" />
          <h1 className="text-2xl font-bold">অ্যাডমিন প্যানেল</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="glass-card border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">মোট ব্যবহারকারী</p>
                  <p className="text-3xl font-bold">{stats.totalUsers}</p>
                </div>
                <Users className="w-8 h-8 text-indigo-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">মোট শব্দ</p>
                  <p className="text-3xl font-bold">{stats.totalWords}</p>
                </div>
                <BookOpen className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">মোট পরামর্শ</p>
                  <p className="text-3xl font-bold">{stats.totalSuggestions}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">অপেক্ষমান</p>
                  <p className="text-3xl font-bold text-yellow-400">{stats.pendingSuggestions}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
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
                  <div key={suggestion.id} className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{suggestion.title}</h4>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {suggestion.category}
                        </Badge>
                      </div>
                      <Badge variant="outline" className={getStatusColor(suggestion.status)}>
                        {suggestion.status}
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
