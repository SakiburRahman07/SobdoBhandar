'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  Trophy, 
  Medal,
  Crown,
  Flame,
  BookOpen,
  Loader2,
  TrendingUp
} from 'lucide-react'

interface LeaderboardEntry {
  user_id: string
  display_name: string | null
  email: string | null
  avatar_url: string | null
  total_words: number
  current_streak: number
  rank: number
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [userRank, setUserRank] = useState<number | null>(null)
  const [userEntry, setUserEntry] = useState<LeaderboardEntry | null>(null)
  const [isUserInTop10, setIsUserInTop10] = useState(false)
  
  const { user } = useAuth()
  const supabase = createClient()

  // Mask email: show first 2 chars + *** + last 2 chars before @ + @domain
  const maskEmail = (email: string | null): string => {
    if (!email) return 'Unknown'
    const [localPart, domain] = email.split('@')
    if (!domain) return email
    if (localPart.length <= 4) {
      return `${localPart[0]}***@${domain}`
    }
    return `${localPart.slice(0, 2)}***${localPart.slice(-2)}@${domain}`
  }

  useEffect(() => {
    const fetchLeaderboard = async () => {
      // Fetch top users by total words
      // Fetch ALL profiles to get proper rankings (including email)
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('id, email, display_name, avatar_url, total_words_learned')
        .order('total_words_learned', { ascending: false })

      if (error) {
        console.error('Error fetching leaderboard:', error)
        setLoading(false)
        return
      }

      // Get current streaks for each user
      const entries: LeaderboardEntry[] = []
      
      for (let i = 0; i < (profiles?.length || 0); i++) {
        const profile = profiles![i]
        
        // Get latest streak
        const { data: progress } = await supabase
          .from('daily_progress')
          .select('streak_count')
          .eq('user_id', profile.id)
          .order('date', { ascending: false })
          .limit(1)
          .single()

        const entry: LeaderboardEntry = {
          user_id: profile.id,
          display_name: profile.display_name,
          email: profile.email || null, // Use email from database
          avatar_url: profile.avatar_url,
          total_words: profile.total_words_learned || 0,
          current_streak: progress?.streak_count || 0,
          rank: i + 1
        }
        
        entries.push(entry)

        if (user && profile.id === user.id) {
          // Current user found
          const rank = i + 1
          setUserRank(rank)
          setUserEntry({ ...entry, email: user.email || null })
          setIsUserInTop10(rank <= 10)
        }
      }

      // Only show top 10
      setLeaderboard(entries.slice(0, 10))
      setLoading(false)
    }

    fetchLeaderboard()
  }, [user, supabase])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-lg font-bold text-muted-foreground">{rank}</span>
    }
  }

  const getRankBg = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) return 'bg-indigo-500/20 border-indigo-500/30'
    switch (rank) {
      case 1:
        return 'bg-yellow-500/10 border-yellow-500/20'
      case 2:
        return 'bg-gray-500/10 border-gray-500/20'
      case 3:
        return 'bg-amber-500/10 border-amber-500/20'
      default:
        return 'glass-card border-white/10'
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header with Trophy Image */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-8">
          <img src="/images/trophy.png" alt="Trophy" className="w-32 h-32 rounded-2xl shadow-lg shadow-yellow-500/20" />
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold mb-2">লিডারবোর্ড</h1>
            <p className="text-muted-foreground">সেরা শিক্ষার্থীদের র‍্যাংকিং</p>
          </div>
        </div>


        {/* Leaderboard List - Top 10 */}
        <div className="space-y-3">
          {leaderboard.length > 0 ? (
            <>
              {leaderboard.map((entry) => {
                const isCurrentUser = user?.id === entry.user_id
                
                return (
                  <Card 
                    key={entry.user_id}
                    className={`${getRankBg(entry.rank, isCurrentUser)} transition-all hover:scale-[1.02] ${isCurrentUser ? 'ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/30' : ''}`}
                  >
                    <CardContent className="py-4">
                      <div className="flex items-center gap-4">
                        {/* Rank */}
                        <div className="w-10 flex-shrink-0">
                          {getRankIcon(entry.rank)}
                        </div>

                        {/* Avatar */}
                        <Avatar className={`w-12 h-12 border-2 ${isCurrentUser ? 'border-indigo-500' : 'border-white/10'}`}>
                          <AvatarImage src={entry.avatar_url || ''} />
                          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600">
                            {entry.display_name?.[0]?.toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>

                        {/* Name */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">
                            {entry.display_name || (entry.email ? maskEmail(entry.email) : `user_${entry.user_id.slice(0, 8)}`)}
                            {isCurrentUser && (
                              <Badge variant="outline" className="ml-2 text-xs border-indigo-500/50 bg-indigo-500/20 text-indigo-300">
                                আপনি
                              </Badge>
                            )}
                          </p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-3 h-3" />
                              {entry.total_words} শব্দ
                            </span>
                            {entry.current_streak > 0 && (
                              <span className="flex items-center gap-1 text-orange-400">
                                <Flame className="w-3 h-3" />
                                {entry.current_streak} দিন
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Score Badge */}
                        <Badge 
                          className={`${
                            entry.rank === 1 ? 'bg-yellow-500 text-yellow-950' :
                            entry.rank === 2 ? 'bg-gray-400 text-gray-950' :
                            entry.rank === 3 ? 'bg-amber-500 text-amber-950' :
                            isCurrentUser ? 'bg-indigo-500 text-white' :
                            'bg-white/10'
                          }`}
                        >
                          {entry.total_words} পয়েন্ট
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
              
              {/* User's rank as 11th entry if not in top 10 */}
              {userRank && !isUserInTop10 && userEntry && (
                <>
                  <div className="flex items-center gap-2 py-2">
                    <div className="flex-1 border-t border-dashed border-white/20" />
                    <span className="text-xs text-muted-foreground">আপনার অবস্থান</span>
                    <div className="flex-1 border-t border-dashed border-white/20" />
                  </div>
                  <Card className="ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/30 bg-gradient-to-r from-indigo-500/20 to-purple-500/10 border-indigo-500/30 transition-all">
                    <CardContent className="py-4">
                      <div className="flex items-center gap-4">
                        {/* Rank */}
                        <div className="w-10 flex-shrink-0">
                          <span className="w-6 h-6 flex items-center justify-center text-lg font-bold text-indigo-400">#{userRank}</span>
                        </div>

                        {/* Avatar */}
                        <Avatar className="w-12 h-12 border-2 border-indigo-500">
                          <AvatarImage src={userEntry.avatar_url || ''} />
                          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600">
                            {(userEntry.display_name || userEntry.email)?.[0]?.toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>

                        {/* Name */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">
                            {userEntry.display_name || userEntry.email?.split('@')[0] || 'আপনি'}
                            <Badge variant="outline" className="ml-2 text-xs border-indigo-500/50 bg-indigo-500/20 text-indigo-300">
                              আপনি
                            </Badge>
                          </p>
                          <p className="text-sm text-muted-foreground">{userEntry.total_words} শব্দ</p>
                        </div>

                        {/* Score Badge */}
                        <Badge className="bg-indigo-500 text-white">{userEntry.total_words} পয়েন্ট</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </>
          ) : (
            <Card className="glass-card border-white/10">
              <CardContent className="py-12 text-center">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-muted-foreground">এখনো কোন র‍্যাংকিং নেই</p>
                <p className="text-sm text-muted-foreground mt-2">
                  শব্দ শিখুন এবং লিডারবোর্ডে আসুন!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
