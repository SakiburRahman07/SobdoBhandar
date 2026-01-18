'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Pencil, Save, Loader2, Trash2, Plus, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { PARTS_OF_SPEECH, getSubTypes } from '@/lib/parts-of-speech-data'

interface Word {
  id: string
  english_word: string
  bangla_meaning: string
  part_of_speech?: string | null
  sub_type?: string | null
  verb_forms?: {
    present: string
    past: string
    past_participle: string
    present_participle: string
  } | null
  example_sentence?: string | null
  example_sentence_bn?: string | null
  pronunciation?: string | null
  synonyms?: string[] | null
  antonyms?: string[] | null
  difficulty?: string
}

interface WordEditDialogProps {
  word: Word
  children?: React.ReactNode
}

export function WordEditDialog({ word, children }: WordEditDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  
  const [englishWord, setEnglishWord] = useState(word.english_word)
  const [banglaMeaning, setBanglaMeaning] = useState(word.bangla_meaning)
  const [partOfSpeech, setPartOfSpeech] = useState(word.part_of_speech || '')
  const [subType, setSubType] = useState(word.sub_type || '')
  const [exampleSentence, setExampleSentence] = useState(word.example_sentence || '')
  const [exampleSentenceBn, setExampleSentenceBn] = useState(word.example_sentence_bn || '')
  const [pronunciation, setPronunciation] = useState(word.pronunciation || '')
  const [difficulty, setDifficulty] = useState(word.difficulty || 'medium')
  const [verbForms, setVerbForms] = useState(word.verb_forms || { present: '', past: '', past_participle: '', present_participle: '' })
  const [synonyms, setSynonyms] = useState<string[]>(word.synonyms || [])
  const [antonyms, setAntonyms] = useState<string[]>(word.antonyms || [])
  const [newSynonym, setNewSynonym] = useState('')
  const [newAntonym, setNewAntonym] = useState('')

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

  const handleSave = async () => {
    if (!englishWord.trim() || !banglaMeaning.trim()) {
      toast.error('ইংরেজি শব্দ এবং বাংলা অর্থ আবশ্যক')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('words')
        .update({
          english_word: englishWord.trim(),
          bangla_meaning: banglaMeaning.trim(),
          part_of_speech: partOfSpeech || null,
          sub_type: subType || null,
          verb_forms: partOfSpeech === 'verb' ? verbForms : null,
          example_sentence: exampleSentence.trim() || null,
          example_sentence_bn: exampleSentenceBn.trim() || null,
          pronunciation: pronunciation.trim() || null,
          synonyms: synonyms.length > 0 ? synonyms : null,
          antonyms: antonyms.length > 0 ? antonyms : null,
          difficulty: difficulty,
        })
        .eq('id', word.id)

      if (error) throw error

      toast.success('শব্দ আপডেট হয়েছে!')
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Error updating word:', error)
      toast.error('শব্দ আপডেট করতে সমস্যা হয়েছে')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('আপনি কি নিশ্চিত এই শব্দ মুছে ফেলতে চান?')) return

    setDeleting(true)
    try {
      const { error } = await supabase
        .from('words')
        .delete()
        .eq('id', word.id)

      if (error) throw error

      toast.success('শব্দ মুছে ফেলা হয়েছে')
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Error deleting word:', error)
      toast.error('শব্দ মুছতে সমস্যা হয়েছে')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="border-yellow-500/30 hover:bg-yellow-500/10">
            <Pencil className="w-4 h-4 mr-1" />
            সম্পাদনা
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-xl border-white/10 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-5 h-5 text-yellow-400" />
            শব্দ সম্পাদনা করুন
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* English Word & Bangla Meaning */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>ইংরেজি শব্দ *</Label>
              <Input
                value={englishWord}
                onChange={(e) => setEnglishWord(e.target.value)}
                className="bg-background/50 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label>বাংলা অর্থ *</Label>
              <Input
                value={banglaMeaning}
                onChange={(e) => setBanglaMeaning(e.target.value)}
                className="bg-background/50 border-white/10"
              />
            </div>
          </div>

          {/* Parts of Speech & Sub-Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>পদ প্রকার</Label>
              <select
                value={partOfSpeech}
                onChange={(e) => {
                  setPartOfSpeech(e.target.value)
                  setSubType('')
                }}
                className="flex h-10 w-full rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm"
              >
                <option value="">নির্বাচন করুন</option>
                {PARTS_OF_SPEECH.map(pos => (
                  <option key={pos.value} value={pos.value}>{pos.label} ({pos.labelBn})</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>উপ-প্রকার</Label>
              <select
                value={subType}
                onChange={(e) => setSubType(e.target.value)}
                disabled={!partOfSpeech}
                className="flex h-10 w-full rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm disabled:opacity-50"
              >
                <option value="">নির্বাচন করুন</option>
                {getSubTypes(partOfSpeech).map(st => (
                  <option key={st.value} value={st.value}>{st.label} ({st.labelBn})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Verb Forms (conditional) */}
          {partOfSpeech === 'verb' && (
            <div className="space-y-3 p-4 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
              <Label className="text-indigo-300">ক্রিয়ার রূপ (Verb Forms)</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Present</Label>
                  <Input
                    value={verbForms.present}
                    onChange={(e) => setVerbForms({ ...verbForms, present: e.target.value })}
                    placeholder="go"
                    className="bg-background/50 border-white/10 h-9 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Past</Label>
                  <Input
                    value={verbForms.past}
                    onChange={(e) => setVerbForms({ ...verbForms, past: e.target.value })}
                    placeholder="went"
                    className="bg-background/50 border-white/10 h-9 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Past Participle</Label>
                  <Input
                    value={verbForms.past_participle}
                    onChange={(e) => setVerbForms({ ...verbForms, past_participle: e.target.value })}
                    placeholder="gone"
                    className="bg-background/50 border-white/10 h-9 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Present Participle</Label>
                  <Input
                    value={verbForms.present_participle}
                    onChange={(e) => setVerbForms({ ...verbForms, present_participle: e.target.value })}
                    placeholder="going"
                    className="bg-background/50 border-white/10 h-9 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Example Sentences */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>উদাহরণ বাক্য (English)</Label>
              <Input
                value={exampleSentence}
                onChange={(e) => setExampleSentence(e.target.value)}
                className="bg-background/50 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label>উদাহরণ বাক্য (বাংলা)</Label>
              <Input
                value={exampleSentenceBn}
                onChange={(e) => setExampleSentenceBn(e.target.value)}
                className="bg-background/50 border-white/10"
              />
            </div>
          </div>

          {/* Pronunciation */}
          <div className="space-y-2">
            <Label>উচ্চারণ</Label>
            <Input
              value={pronunciation}
              onChange={(e) => setPronunciation(e.target.value)}
              className="bg-background/50 border-white/10"
            />
          </div>

          {/* Synonyms */}
          <div className="space-y-2">
            <Label>প্রতিশব্দ (Synonyms)</Label>
            <div className="flex gap-2">
              <Input
                value={newSynonym}
                onChange={(e) => setNewSynonym(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSynonym())}
                placeholder="নতুন প্রতিশব্দ"
                className="bg-background/50 border-white/10"
              />
              <Button type="button" variant="outline" size="icon" onClick={addSynonym}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {synonyms.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {synonyms.map((syn, i) => (
                  <Badge key={i} variant="outline" className="border-green-500/30 text-green-400 flex items-center gap-1">
                    {syn}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setSynonyms(synonyms.filter((_, idx) => idx !== i))} />
                  </Badge>
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
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAntonym())}
                placeholder="নতুন বিপরীত শব্দ"
                className="bg-background/50 border-white/10"
              />
              <Button type="button" variant="outline" size="icon" onClick={addAntonym}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {antonyms.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {antonyms.map((ant, i) => (
                  <Badge key={i} variant="outline" className="border-red-500/30 text-red-400 flex items-center gap-1">
                    {ant}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setAntonyms(antonyms.filter((_, idx) => idx !== i))} />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <Label>কঠিনতা</Label>
            <div className="flex gap-2">
              {['easy', 'medium', 'hard'].map((d) => (
                <Badge
                  key={d}
                  variant="outline"
                  className={`cursor-pointer ${
                    difficulty === d
                      ? d === 'easy' ? 'bg-green-500/20 border-green-500 text-green-400'
                        : d === 'hard' ? 'bg-red-500/20 border-red-500 text-red-400'
                        : 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                      : 'border-white/10'
                  }`}
                  onClick={() => setDifficulty(d)}
                >
                  {d === 'easy' ? 'সহজ' : d === 'hard' ? 'কঠিন' : 'মাঝারি'}
                </Badge>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting || loading}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Trash2 className="w-4 h-4 mr-1" />}
              মুছুন
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading || deleting}
              className="bg-gradient-to-r from-indigo-500 to-purple-600"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
              সংরক্ষণ
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

