'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Loader2, 
  Plus, 
  X, 
  Sparkles, 
  Volume2, 
  BookOpen,
  MessageSquare,
  RefreshCw,
  Check
} from 'lucide-react'
import { toast } from 'sonner'

interface WordFormProps {
  userId: string
  onSuccess?: () => void
}

interface WordData {
  word: string
  part_of_speech?: string
  sub_type?: string
  meaning_bn: string
  example: string
  example_bn?: string
  pronunciation: string
  synonyms: string[]
  antonyms: string[]
  verb_forms?: {
    present: string
    past: string
    past_participle: string
    present_participle: string
  }
  ai_generated?: boolean
}

import { PARTS_OF_SPEECH, getSubTypes } from '@/lib/parts-of-speech-data'

export function WordForm({ userId, onSuccess }: WordFormProps) {
  const [englishWord, setEnglishWord] = useState('')
  const [banglaMeaning, setBanglaMeaning] = useState('')
  const [partOfSpeech, setPartOfSpeech] = useState('')
  const [subType, setSubType] = useState('')
  const [exampleSentence, setExampleSentence] = useState('')
  const [exampleSentenceBn, setExampleSentenceBn] = useState('')
  const [pronunciation, setPronunciation] = useState('')
  const [verbForms, setVerbForms] = useState<{ present: string; past: string; past_participle: string; present_participle: string } | null>(null)
  const [synonyms, setSynonyms] = useState<string[]>([])
  const [antonyms, setAntonyms] = useState<string[]>([])
  const [newSynonym, setNewSynonym] = useState('')
  const [newAntonym, setNewAntonym] = useState('')
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [aiGenerated, setAiGenerated] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  // Generate word data with AI
  const generateWithAI = useCallback(async () => {
    if (!englishWord.trim()) {
      toast.error('প্রথমে ইংরেজি শব্দ লিখুন')
      return
    }

    setGenerating(true)
    setAiGenerated(false)

    try {
      const response = await fetch('/api/generate-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: englishWord.trim() })
      })

      const data: WordData & { error?: string; rate_limited?: boolean } = await response.json()

      if (data.error) {
        toast.error(data.error)
        return
      }

      if (data.word) setEnglishWord(data.word)
      if (data.part_of_speech) setPartOfSpeech(data.part_of_speech)
      if (data.sub_type) setSubType(data.sub_type)
      if (data.meaning_bn) setBanglaMeaning(data.meaning_bn)
      if (data.example) setExampleSentence(data.example)
      if (data.example_bn) setExampleSentenceBn(data.example_bn)
      if (data.pronunciation) setPronunciation(data.pronunciation)
      if (data.synonyms?.length) setSynonyms(data.synonyms)
      if (data.antonyms?.length) setAntonyms(data.antonyms)
      if (data.verb_forms) setVerbForms(data.verb_forms)

      if (data.ai_generated) {
        setAiGenerated(true)
        toast.success('AI দ্বারা তথ্য তৈরি হয়েছে!')
      }
    } catch (error) {
      console.error('AI generation error:', error)
      toast.error('AI তথ্য তৈরি করতে পারেনি')
    } finally {
      setGenerating(false)
    }
  }, [englishWord])

  // Text-to-Speech
  const speakWord = useCallback(() => {
    if (!englishWord.trim()) return
    
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(englishWord.trim())
      utterance.lang = 'en-US'
      utterance.rate = 0.85
      
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      
      speechSynthesis.speak(utterance)
    }
  }, [englishWord])

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

  const removeSynonym = (index: number) => setSynonyms(synonyms.filter((_, i) => i !== index))
  const removeAntonym = (index: number) => setAntonyms(antonyms.filter((_, i) => i !== index))

  const resetForm = () => {
    setEnglishWord('')
    setBanglaMeaning('')
    setPartOfSpeech('')
    setSubType('')
    setExampleSentence('')
    setExampleSentenceBn('')
    setPronunciation('')
    setVerbForms(null)
    setSynonyms([])
    setAntonyms([])
    setAiGenerated(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!englishWord.trim() || !banglaMeaning.trim()) {
      toast.error('ইংরেজি শব্দ এবং বাংলা অর্থ আবশ্যক')
      return
    }

    setLoading(true)

    try {
      const { data: wordData, error: wordError } = await supabase
        .from('words')
        .insert({
          user_id: userId,
          english_word: englishWord.trim(),
          bangla_meaning: banglaMeaning.trim(),
          part_of_speech: partOfSpeech || null,
          sub_type: subType || null,
          verb_forms: verbForms || null,
          example_sentence: exampleSentence.trim() || null,
          example_sentence_bn: exampleSentenceBn.trim() || null,
          pronunciation: pronunciation.trim() || null,
          synonyms: synonyms.length > 0 ? synonyms : null,
          antonyms: antonyms.length > 0 ? antonyms : null,
          difficulty: 'medium',
        })
        .select()
        .single()

      if (wordError) throw wordError

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      await supabase
        .from('review_schedule')
        .insert({
          word_id: wordData.id,
          user_id: userId,
          next_review_date: tomorrow.toISOString().split('T')[0],
          interval_days: 1,
          ease_factor: 2.5,
          repetitions: 0,
        })

      toast.success('শব্দ যোগ করা হয়েছে!')
      resetForm()
      if (onSuccess) onSuccess()
      router.refresh()
    } catch (error) {
      console.error('Error adding word:', error)
      toast.error('শব্দ যোগ করতে সমস্যা হয়েছে')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="glass-card border-white/10 overflow-hidden">
      <CardHeader className="border-b border-white/10">
        <CardTitle className="text-xl gradient-text flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          নতুন শব্দ যোগ করুন
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          আপনার শব্দভাণ্ডারে নতুন ইংরেজি শব্দ যোগ করুন
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* English Word with AI Button */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="englishWord" className="flex items-center gap-2">
                ইংরেজি শব্দ *
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="englishWord"
                    value={englishWord}
                    onChange={(e) => {
                      setEnglishWord(e.target.value)
                      setAiGenerated(false)
                    }}
                    placeholder="e.g., Serendipity"
                    className="bg-background/50 border-white/10 font-english pr-10"
                    required
                  />
                  {englishWord && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={speakWord}
                      disabled={isSpeaking}
                    >
                      <Volume2 className={`w-4 h-4 ${isSpeaking ? 'text-indigo-400 animate-pulse' : 'text-muted-foreground'}`} />
                    </Button>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateWithAI}
                  disabled={generating || !englishWord.trim()}
                  className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 shrink-0"
                >
                  {generating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline ml-2">AI</span>
                </Button>
              </div>
            </div>

            {/* Bangla Meaning */}
            <div className="space-y-2">
              <Label htmlFor="banglaMeaning" className="flex items-center gap-2">
                বাংলা অর্থ *
                {aiGenerated && <Badge variant="outline" className="text-xs border-green-500/30 text-green-400"><Check className="w-3 h-3 mr-1" />AI</Badge>}
              </Label>
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

          {/* Parts of Speech Dropdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="partOfSpeech" className="flex items-center gap-2">
                পদ প্রকার (Parts of Speech)
                {aiGenerated && partOfSpeech && <Badge variant="outline" className="text-xs border-green-500/30 text-green-400"><Check className="w-3 h-3 mr-1" />AI</Badge>}
              </Label>
              <select
                id="partOfSpeech"
                value={partOfSpeech}
                onChange={(e) => {
                  setPartOfSpeech(e.target.value)
                  setSubType('')
                  if (e.target.value !== 'verb') setVerbForms(null)
                }}
                className="flex h-10 w-full rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">নির্বাচন করুন</option>
                {PARTS_OF_SPEECH.map(pos => (
                  <option key={pos.value} value={pos.value}>{pos.label} ({pos.labelBn})</option>
                ))}
              </select>
            </div>

            {/* Sub-Type Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="subType" className="flex items-center gap-2">
                উপ-প্রকার (Sub-Type)
                {aiGenerated && subType && <Badge variant="outline" className="text-xs border-green-500/30 text-green-400"><Check className="w-3 h-3 mr-1" />AI</Badge>}
              </Label>
              <select
                id="subType"
                value={subType}
                onChange={(e) => setSubType(e.target.value)}
                disabled={!partOfSpeech}
                className="flex h-10 w-full rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
              >
                <option value="">নির্বাচন করুন</option>
                {getSubTypes(partOfSpeech).map(st => (
                  <option key={st.value} value={st.value}>{st.label} ({st.labelBn})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Bengali Example Sentence */}
          <div className="space-y-2">
            <Label htmlFor="exampleSentenceBn" className="flex items-center gap-2">
              উদাহরণের বাংলা অনুবাদ
              {aiGenerated && exampleSentenceBn && <Badge variant="outline" className="text-xs border-green-500/30 text-green-400"><Check className="w-3 h-3 mr-1" />AI</Badge>}
            </Label>
            <Input
              id="exampleSentenceBn"
              value={exampleSentenceBn}
              onChange={(e) => setExampleSentenceBn(e.target.value)}
              placeholder="আবিষ্কারটি ছিল এক সুখকর সৌভাগ্য।"
              className="bg-background/50 border-white/10 font-bangla"
            />
          </div>

          {/* Verb Forms (conditional) */}
          {partOfSpeech === 'verb' && (
            <div className="space-y-3 p-4 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
              <Label className="flex items-center gap-2 text-indigo-300">
                ক্রিয়ার রূপ (Verb Forms)
                {aiGenerated && verbForms && <Badge variant="outline" className="text-xs border-green-500/30 text-green-400"><Check className="w-3 h-3 mr-1" />AI</Badge>}
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Present (বর্তমান)</Label>
                  <Input
                    value={verbForms?.present || ''}
                    onChange={(e) => setVerbForms(prev => ({ ...prev!, present: e.target.value }))}
                    placeholder="go"
                    className="bg-background/50 border-white/10 font-english h-9 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Past (অতীত)</Label>
                  <Input
                    value={verbForms?.past || ''}
                    onChange={(e) => setVerbForms(prev => ({ ...prev!, past: e.target.value }))}
                    placeholder="went"
                    className="bg-background/50 border-white/10 font-english h-9 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Past Participle</Label>
                  <Input
                    value={verbForms?.past_participle || ''}
                    onChange={(e) => setVerbForms(prev => ({ ...prev!, past_participle: e.target.value }))}
                    placeholder="gone"
                    className="bg-background/50 border-white/10 font-english h-9 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Present Participle</Label>
                  <Input
                    value={verbForms?.present_participle || ''}
                    onChange={(e) => setVerbForms(prev => ({ ...prev!, present_participle: e.target.value }))}
                    placeholder="going"
                    className="bg-background/50 border-white/10 font-english h-9 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Example Sentence */}
          <div className="space-y-2">
            <Label htmlFor="exampleSentence" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              উদাহরণ বাক্য (English)
              {aiGenerated && exampleSentence && <Badge variant="outline" className="text-xs border-green-500/30 text-green-400"><Check className="w-3 h-3 mr-1" />AI</Badge>}
            </Label>
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
            <Label htmlFor="pronunciation" className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-muted-foreground" />
              উচ্চারণ
              {aiGenerated && pronunciation && <Badge variant="outline" className="text-xs border-green-500/30 text-green-400"><Check className="w-3 h-3 mr-1" />AI</Badge>}
            </Label>
            <div className="flex gap-2">
              <Input
                id="pronunciation"
                value={pronunciation}
                onChange={(e) => setPronunciation(e.target.value)}
                placeholder="ser-uhn-DIP-i-tee"
                className="bg-background/50 border-white/10 font-english"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={speakWord}
                disabled={!englishWord.trim() || isSpeaking}
                className="shrink-0"
              >
                <Volume2 className={`w-4 h-4 ${isSpeaking ? 'text-indigo-400 animate-pulse' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Synonyms */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              প্রতিশব্দ (Synonyms)
              {aiGenerated && synonyms.length > 0 && <Badge variant="outline" className="text-xs border-green-500/30 text-green-400"><Check className="w-3 h-3 mr-1" />AI</Badge>}
            </Label>
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
            <AnimatePresence>
              {synonyms.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex gap-2 flex-wrap mt-2"
                >
                  {synonyms.map((syn, i) => (
                    <motion.span
                      key={syn}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      {syn}
                      <button type="button" onClick={() => removeSynonym(i)} className="hover:text-white">
                        <X className="w-3 h-3" />
                      </button>
                    </motion.span>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Antonyms */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              বিপরীত শব্দ (Antonyms)
              {aiGenerated && antonyms.length > 0 && <Badge variant="outline" className="text-xs border-green-500/30 text-green-400"><Check className="w-3 h-3 mr-1" />AI</Badge>}
            </Label>
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
            <AnimatePresence>
              {antonyms.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex gap-2 flex-wrap mt-2"
                >
                  {antonyms.map((ant, i) => (
                    <motion.span
                      key={ant}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      {ant}
                      <button type="button" onClick={() => removeAntonym(i)} className="hover:text-white">
                        <X className="w-3 h-3" />
                      </button>
                    </motion.span>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              className="border-white/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              রিসেট
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              শব্দ যোগ করুন
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
