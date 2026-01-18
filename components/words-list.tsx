'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Info, Pencil } from 'lucide-react'
import { WordDetailsDialog } from '@/components/word-details-dialog'
import { WordEditDialog } from '@/components/word-edit-dialog'
import { Button } from '@/components/ui/button'

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
  review_schedule?: Array<{
    next_review_date: string
    interval_days: number
  }> | null
}

interface WordsListProps {
  words: Word[]
}

export function WordsList({ words }: WordsListProps) {
  return (
    <div className="grid gap-4">
      {words.map((word) => {
        const nextReview = word.review_schedule?.[0]?.next_review_date
        const nextReviewDate = nextReview ? new Date(nextReview) : null
        const isOverdue = nextReviewDate && nextReviewDate <= new Date()
        
        return (
          <Card key={word.id} className="glass-card border-white/10 hover:border-white/20 transition-colors">
            <CardContent className="py-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-xl font-semibold font-english">{word.english_word}</h3>
                    {word.part_of_speech && (
                      <Badge variant="outline" className="border-purple-500/30 text-purple-300 text-xs">
                        {word.part_of_speech}
                      </Badge>
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
                  <p className="text-lg text-muted-foreground font-bangla mb-2">{word.bangla_meaning}</p>
                  {word.example_sentence && (
                    <p className="text-sm text-muted-foreground font-english italic">
                      &ldquo;{word.example_sentence}&rdquo;
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {nextReviewDate && (
                    <div className={`text-sm flex items-center gap-1 mr-2 ${isOverdue ? 'text-yellow-400' : 'text-muted-foreground'}`}>
                      <Calendar className="w-4 h-4" />
                      {isOverdue ? 'আজ পড়তে হবে' : nextReviewDate.toLocaleDateString('bn-BD')}
                    </div>
                  )}
                  <WordEditDialog word={word}>
                    <Button variant="outline" size="sm" className="border-yellow-500/30 hover:bg-yellow-500/10">
                      <Pencil className="w-4 h-4 mr-1" />
                      সম্পাদনা
                    </Button>
                  </WordEditDialog>
                  <WordDetailsDialog word={word}>
                    <Button variant="outline" size="sm" className="border-indigo-500/30 hover:bg-indigo-500/10">
                      <Info className="w-4 h-4 mr-1" />
                      বিস্তারিত
                    </Button>
                  </WordDetailsDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
