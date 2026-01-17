'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Plus, X } from 'lucide-react'
import { toast } from 'sonner'

interface WordFormProps {
  userId: string
  onSuccess?: () => void
}

export function WordForm({ userId, onSuccess }: WordFormProps) {
  const [englishWord, setEnglishWord] = useState('')
  const [banglaMeaning, setBanglaMeaning] = useState('')
  const [exampleSentence, setExampleSentence] = useState('')
  const [pronunciation, setPronunciation] = useState('')
  const [synonyms, setSynonyms] = useState<string[]>([])
  const [antonyms, setAntonyms] = useState<string[]>([])
  const [newSynonym, setNewSynonym] = useState('')
  const [newAntonym, setNewAntonym] = useState('')
  const [loading, setLoading] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  const addSynonym = () => {
    if (newSynonym.trim() && !synonyms.includes(newSynonym.trim())) {
      setSynonyms([...synonyms, newSynonym.trim()])
      setNewSynonym('')
    }
  }

  const addAntonym = () => {
    if (newAntonym.trim() && !antonyms.includes(newAntonym.trim())) {
      setAntonyms([...antonyms, newAntonym.trim()])
      setNewAntonym('')
    }
  }

  const removeSynonym = (index: number) => {
    setSynonyms(synonyms.filter((_, i) => i !== index))
  }

  const removeAntonym = (index: number) => {
    setAntonyms(antonyms.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!englishWord.trim() || !banglaMeaning.trim()) {
      toast.error('ইংরেজি শব্দ এবং বাংলা অর্থ আবশ্যক')
      return
    }

    setLoading(true)

    try {
      // Insert word
      const { data: wordData, error: wordError } = await supabase
        .from('words')
        .insert({
          user_id: userId,
          english_word: englishWord.trim(),
          bangla_meaning: banglaMeaning.trim(),
          example_sentence: exampleSentence.trim() || null,
          pronunciation: pronunciation.trim() || null,
          synonyms: synonyms.length > 0 ? synonyms : null,
          antonyms: antonyms.length > 0 ? antonyms : null,
          difficulty: 'medium',
        })
        .select()
        .single()

      if (wordError) throw wordError

      // Create initial review schedule
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      const { error: scheduleError } = await supabase
        .from('review_schedule')
        .insert({
          word_id: wordData.id,
          user_id: userId,
          next_review_date: tomorrow.toISOString().split('T')[0],
          interval_days: 1,
          ease_factor: 2.5,
          repetitions: 0,
        })

      if (scheduleError) throw scheduleError

      toast.success('শব্দ যোগ করা হয়েছে! 🎉')
      
      // Reset form
      setEnglishWord('')
      setBanglaMeaning('')
      setExampleSentence('')
      setPronunciation('')
      setSynonyms([])
      setAntonyms([])
      
      if (onSuccess) {
        onSuccess()
      }
      
      router.refresh()
    } catch (error) {
      console.error('Error adding word:', error)
      toast.error('শব্দ যোগ করতে সমস্যা হয়েছে')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="glass-card border-white/10">
      <CardHeader>
        <CardTitle className="text-xl gradient-text">নতুন শব্দ যোগ করুন</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* English Word */}
            <div className="space-y-2">
              <Label htmlFor="englishWord">ইংরেজি শব্দ *</Label>
              <Input
                id="englishWord"
                value={englishWord}
                onChange={(e) => setEnglishWord(e.target.value)}
                placeholder="e.g., Serendipity"
                className="bg-background/50 border-white/10 font-english"
                required
              />
            </div>

            {/* Bangla Meaning */}
            <div className="space-y-2">
              <Label htmlFor="banglaMeaning">বাংলা অর্থ *</Label>
              <Input
                id="banglaMeaning"
                value={banglaMeaning}
                onChange={(e) => setBanglaMeaning(e.target.value)}
                placeholder="যেমন: সৌভাগ্যজনক আবিষ্কার"
                className="bg-background/50 border-white/10 font-bangla"
                required
              />
            </div>
          </div>

          {/* Example Sentence */}
          <div className="space-y-2">
            <Label htmlFor="exampleSentence">উদাহরণ বাক্য</Label>
            <Input
              id="exampleSentence"
              value={exampleSentence}
              onChange={(e) => setExampleSentence(e.target.value)}
              placeholder="The discovery was a happy serendipity."
              className="bg-background/50 border-white/10 font-english"
            />
          </div>

          {/* Pronunciation */}
          <div className="space-y-2">
            <Label htmlFor="pronunciation">উচ্চারণ</Label>
            <Input
              id="pronunciation"
              value={pronunciation}
              onChange={(e) => setPronunciation(e.target.value)}
              placeholder="ser-uhn-DIP-i-tee"
              className="bg-background/50 border-white/10 font-english"
            />
          </div>

          {/* Synonyms */}
          <div className="space-y-2">
            <Label>প্রতিশব্দ (Synonyms)</Label>
            <div className="flex gap-2">
              <Input
                value={newSynonym}
                onChange={(e) => setNewSynonym(e.target.value)}
                placeholder="luck, fortune"
                className="bg-background/50 border-white/10 font-english"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addSynonym()
                  }
                }}
              />
              <Button type="button" variant="outline" size="icon" onClick={addSynonym}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {synonyms.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-2">
                {synonyms.map((syn, i) => (
                  <span
                    key={i}
                    className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {syn}
                    <button type="button" onClick={() => removeSynonym(i)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Antonyms */}
          <div className="space-y-2">
            <Label>বিপরীত শব্দ (Antonyms)</Label>
            <div className="flex gap-2">
              <Input
                value={newAntonym}
                onChange={(e) => setNewAntonym(e.target.value)}
                placeholder="misfortune, bad luck"
                className="bg-background/50 border-white/10 font-english"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addAntonym()
                  }
                }}
              />
              <Button type="button" variant="outline" size="icon" onClick={addAntonym}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {antonyms.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-2">
                {antonyms.map((ant, i) => (
                  <span
                    key={i}
                    className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {ant}
                    <button type="button" onClick={() => removeAntonym(i)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            শব্দ যোগ করুন
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
