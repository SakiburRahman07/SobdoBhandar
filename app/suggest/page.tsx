'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { 
  Lightbulb, 
  Send,
  Bug,
  Sparkles,
  Wrench,
  MessageSquare,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react'

interface Suggestion {
  id: string
  title: string
  description: string
  category: string
  status: string
  admin_response: string | null
  created_at: string
}

const categories = [
  { value: 'feature', label: 'নতুন ফিচার', icon: Sparkles },
  { value: 'bug', label: 'বাগ রিপোর্ট', icon: Bug },
  { value: 'improvement', label: 'উন্নতি', icon: Wrench },
  { value: 'general', label: 'সাধারণ', icon: MessageSquare },
]

export default function SuggestPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('general')
  const [submitting, setSubmitting] = useState(false)
  const [mySuggestions, setMySuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(true)
  
  const { user } = useAuth()
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    const fetchSuggestions = async () => {
      const { data } = await supabase
        .from('suggestions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setMySuggestions(data || [])
      setLoading(false)
    }

    fetchSuggestions()
  }, [user, supabase, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim() || !user) return
    setSubmitting(true)

    const { error } = await supabase.from('suggestions').insert({
      user_id: user.id,
      title: title.trim(),
      description: description.trim(),
      category
    })

    if (error) {
      toast.error('জমা দিতে সমস্যা হয়েছে')
      console.error('Error submitting suggestion:', error)
    } else {
      toast.success('আপনার মতামত জমা হয়েছে! ধন্যবাদ 🙏')
      setTitle('')
      setDescription('')
      setCategory('general')
      
      // Refresh suggestions
      const { data } = await supabase
        .from('suggestions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setMySuggestions(data || [])
    }

    setSubmitting(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500/30 text-yellow-400"><Clock className="w-3 h-3 mr-1" />অপেক্ষমান</Badge>
      case 'reviewed':
        return <Badge variant="outline" className="border-blue-500/30 text-blue-400"><CheckCircle2 className="w-3 h-3 mr-1" />পর্যালোচিত</Badge>
      case 'implemented':
        return <Badge variant="outline" className="border-green-500/30 text-green-400"><CheckCircle2 className="w-3 h-3 mr-1" />বাস্তবায়িত</Badge>
      case 'rejected':
        return <Badge variant="outline" className="border-red-500/30 text-red-400"><XCircle className="w-3 h-3 mr-1" />প্রত্যাখ্যাত</Badge>
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      </div>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <Lightbulb className="w-10 h-10 text-yellow-400" />
            <h1 className="text-3xl font-bold">মতামত ও পরামর্শ</h1>
          </div>
          <p className="text-muted-foreground">শব্দভাণ্ডার আরও ভালো করতে আপনার মতামত দিন</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Suggestion Form */}
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5 text-indigo-400" />
                নতুন পরামর্শ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>বিভাগ</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((cat) => {
                      const Icon = cat.icon
                      return (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => setCategory(cat.value)}
                          className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                            category === cat.value
                              ? 'border-indigo-500 bg-indigo-500/20'
                              : 'border-white/10 hover:border-white/20'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${category === cat.value ? 'text-indigo-400' : ''}`} />
                          <span className="text-sm">{cat.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">শিরোনাম</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="সংক্ষিপ্ত শিরোনাম"
                    className="bg-white/5 border-white/10"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">বিস্তারিত</Label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="আপনার পরামর্শ বিস্তারিত লিখুন..."
                    className="w-full h-32 px-3 py-2 rounded-md bg-white/5 border border-white/10 focus:border-indigo-500 focus:outline-none resize-none"
                    required
                  />
                </div>

                <Button 
                  type="submit"
                  disabled={submitting || !title.trim() || !description.trim()}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  জমা দিন
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* My Suggestions */}
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                আমার পরামর্শসমূহ
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                </div>
              ) : mySuggestions.length > 0 ? (
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {mySuggestions.map((suggestion) => (
                    <div key={suggestion.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{suggestion.title}</h4>
                        {getStatusBadge(suggestion.status)}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{suggestion.description}</p>
                      {suggestion.admin_response && (
                        <div className="mt-2 pt-2 border-t border-white/10">
                          <p className="text-xs text-indigo-400">অ্যাডমিন উত্তর:</p>
                          <p className="text-sm">{suggestion.admin_response}</p>
                        </div>
                      )}
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
        </div>
      </main>
    </div>
  )
}
