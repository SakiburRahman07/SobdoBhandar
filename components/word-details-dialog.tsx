'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  Volume2,
  MessageSquare,
  Repeat,
  ArrowLeftRight,
  Info
} from 'lucide-react'
import { useCallback, useState } from 'react'
import { getPartOfSpeechLabel, getSubTypeLabel } from '@/lib/parts-of-speech-data'

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

interface WordDetailsDialogProps {
  word: Word
  children?: React.ReactNode
}

export function WordDetailsDialog({ word, children }: WordDetailsDialogProps) {
  const [isSpeaking, setIsSpeaking] = useState(false)

  const speakWord = useCallback(() => {
    if (!word.english_word) return
    
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(word.english_word)
      utterance.lang = 'en-US'
      utterance.rate = 0.85
      
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      
      speechSynthesis.speak(utterance)
    }
  }, [word.english_word])



  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="border-indigo-500/30 hover:bg-indigo-500/10">
            <Info className="w-4 h-4 mr-1" />
            বিস্তারিত
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg bg-background/95 backdrop-blur-xl border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            <span className="font-english">{word.english_word}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={speakWord}
              className="h-8 w-8"
            >
              <Volume2 className={`w-5 h-5 ${isSpeaking ? 'text-indigo-400 animate-pulse' : 'text-muted-foreground'}`} />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Parts of Speech & Sub-Type & Pronunciation */}
          <div className="flex flex-wrap items-center gap-3">
            {word.part_of_speech && (
              <Badge variant="outline" className="border-purple-500/30 text-purple-300 text-sm">
                {getPartOfSpeechLabel(word.part_of_speech)}
              </Badge>
            )}
            {word.sub_type && word.part_of_speech && (
              <Badge variant="outline" className="border-indigo-500/30 text-indigo-300 text-xs">
                {getSubTypeLabel(word.part_of_speech, word.sub_type)}
              </Badge>
            )}
            {word.pronunciation && (
              <span className="text-muted-foreground font-english text-sm">
                /{word.pronunciation}/
              </span>
            )}
            <Badge 
              variant="outline"
              className={
                word.difficulty === 'easy' 
                  ? 'border-green-500/30 text-green-400' 
                  : word.difficulty === 'hard'
                    ? 'border-red-500/30 text-red-400'
                    : 'border-yellow-500/30 text-yellow-400'
              }
            >
              {word.difficulty === 'easy' ? 'সহজ' : word.difficulty === 'hard' ? 'কঠিন' : 'মাঝারি'}
            </Badge>
          </div>

          {/* Bangla Meaning */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
            <h4 className="text-sm text-muted-foreground mb-1">বাংলা অর্থ</h4>
            <p className="text-lg font-bangla">{word.bangla_meaning}</p>
          </div>

          {/* Verb Forms */}
          {word.part_of_speech === 'verb' && word.verb_forms && (
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <h4 className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                <Repeat className="w-4 h-4" />
                ক্রিয়ার রূপ (Verb Forms)
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {word.verb_forms.present && (
                  <div>
                    <span className="text-muted-foreground">Present: </span>
                    <span className="font-english">{word.verb_forms.present}</span>
                  </div>
                )}
                {word.verb_forms.past && (
                  <div>
                    <span className="text-muted-foreground">Past: </span>
                    <span className="font-english">{word.verb_forms.past}</span>
                  </div>
                )}
                {word.verb_forms.past_participle && (
                  <div>
                    <span className="text-muted-foreground">Past Participle: </span>
                    <span className="font-english">{word.verb_forms.past_participle}</span>
                  </div>
                )}
                {word.verb_forms.present_participle && (
                  <div>
                    <span className="text-muted-foreground">Present Participle: </span>
                    <span className="font-english">{word.verb_forms.present_participle}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Example Sentences */}
          {(word.example_sentence || word.example_sentence_bn) && (
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <h4 className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                উদাহরণ বাক্য
              </h4>
              {word.example_sentence && (
                <p className="font-english italic text-sm mb-2">"{word.example_sentence}"</p>
              )}
              {word.example_sentence_bn && (
                <p className="font-bangla text-sm text-indigo-300">→ {word.example_sentence_bn}</p>
              )}
            </div>
          )}

          {/* Synonyms & Antonyms */}
          <div className="grid grid-cols-2 gap-4">
            {word.synonyms && word.synonyms.length > 0 && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <h4 className="text-xs text-green-400 mb-2 flex items-center gap-1">
                  <ArrowLeftRight className="w-3 h-3" />
                  প্রতিশব্দ
                </h4>
                <div className="flex flex-wrap gap-1">
                  {word.synonyms.map((syn, i) => (
                    <Badge key={i} variant="outline" className="text-xs border-green-500/30 text-green-300">
                      {syn}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {word.antonyms && word.antonyms.length > 0 && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <h4 className="text-xs text-red-400 mb-2 flex items-center gap-1">
                  <ArrowLeftRight className="w-3 h-3" />
                  বিপরীত শব্দ
                </h4>
                <div className="flex flex-wrap gap-1">
                  {word.antonyms.map((ant, i) => (
                    <Badge key={i} variant="outline" className="text-xs border-red-500/30 text-red-300">
                      {ant}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
