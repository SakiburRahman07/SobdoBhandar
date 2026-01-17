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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { 
  User, 
  Mail, 
  Target, 
  Trophy,
  Calendar,
  Save,
  Loader2,
  BookOpen,
  Flame
} from 'lucide-react'

interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  target_words_per_day: number
  notification_enabled: boolean
  total_words_learned: number
  longest_streak: number
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [targetWords, setTargetWords] = useState(10)
  
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

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error)
      }

      if (data) {
        setProfile(data)
        setDisplayName(data.display_name || '')
        setBio(data.bio || '')
        setTargetWords(data.target_words_per_day || 10)
      } else {
        // Create profile if doesn't exist
        const { data: newProfile } = await supabase
          .from('user_profiles')
          .insert({ id: user.id })
          .select()
          .single()
        
        if (newProfile) setProfile(newProfile)
      }

      setLoading(false)
    }

    fetchProfile()
  }, [user, authLoading, supabase, router])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)

    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        display_name: displayName || null,
        bio: bio || null,
        target_words_per_day: targetWords,
        updated_at: new Date().toISOString()
      })

    if (error) {
      toast.error('সংরক্ষণ করতে সমস্যা হয়েছে')
      console.error('Error saving profile:', error)
    } else {
      toast.success('প্রোফাইল সংরক্ষিত হয়েছে! ✨')
    }

    setSaving(false)
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">প্রোফাইল সেটিংস</h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="glass-card border-white/10 md:col-span-1">
            <CardContent className="pt-6 text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4 border-2 border-indigo-500/30">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl">
                  {displayName ? displayName[0].toUpperCase() : user?.email?.[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold">
                {displayName || 'ব্যবহারকারী'}
              </h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              
              <Separator className="my-4" />
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> মোট শব্দ
                  </span>
                  <span className="font-semibold">{profile?.total_words_learned ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Flame className="w-4 h-4" /> সর্বোচ্চ স্ট্রিক
                  </span>
                  <span className="font-semibold">{profile?.longest_streak ?? 0} দিন</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> যোগদান
                  </span>
                  <span className="font-semibold text-sm">
                    {new Date(user?.created_at || '').toLocaleDateString('bn-BD')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit Form */}
          <Card className="glass-card border-white/10 md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-400" />
                তথ্য সম্পাদনা
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="displayName">প্রদর্শন নাম</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="আপনার নাম"
                  className="bg-white/5 border-white/10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" /> ইমেইল
                </Label>
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-white/5 border-white/10 opacity-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">বায়ো</Label>
                <Input
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="আপনার সম্পর্কে কিছু লিখুন..."
                  className="bg-white/5 border-white/10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target" className="flex items-center gap-2">
                  <Target className="w-4 h-4" /> দৈনিক লক্ষ্য (শব্দ সংখ্যা)
                </Label>
                <Input
                  id="target"
                  type="number"
                  min={1}
                  max={100}
                  value={targetWords}
                  onChange={(e) => setTargetWords(parseInt(e.target.value) || 10)}
                  className="bg-white/5 border-white/10 w-32"
                />
              </div>

              <Button 
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                সংরক্ষণ করুন
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
