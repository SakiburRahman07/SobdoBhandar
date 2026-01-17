'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { WordWithReview } from '@/lib/types'
import { Volume2, RotateCcw, ThumbsUp, ThumbsDown, Minus } from 'lucide-react'

interface FlashcardProps {
  word: WordWithReview
  showAnswer: boolean
  onFlip: () => void
  onRate: (difficulty: 'hard' | 'medium' | 'easy') => void
}

export function Flashcard({ word, showAnswer, onFlip, onRate }: FlashcardProps) {
  const [isFlipping, setIsFlipping] = useState(false)
  const [ratingFeedback, setRatingFeedback] = useState<string | null>(null)

  const handleFlip = () => {
    if (isFlipping) return
    setIsFlipping(true)
    onFlip()
    setTimeout(() => setIsFlipping(false), 600)
  }

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  const handleRate = (difficulty: 'hard' | 'medium' | 'easy') => {
    // Show feedback animation
    setRatingFeedback(difficulty)
    setTimeout(() => {
      setRatingFeedback(null)
      onRate(difficulty)
    }, 500)
  }

  return (
    <div className="relative max-w-lg mx-auto perspective-1000">
      {/* Rating Feedback Overlay */}
      <AnimatePresence>
        {ratingFeedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 z-50 flex items-center justify-center"
          >
            <div className={`p-8 rounded-full ${
              ratingFeedback === 'easy' ? 'bg-green-500/30' :
              ratingFeedback === 'hard' ? 'bg-red-500/30' :
              'bg-yellow-500/30'
            }`}>
              {ratingFeedback === 'easy' && <ThumbsUp className="w-16 h-16 text-green-400" />}
              {ratingFeedback === 'hard' && <ThumbsDown className="w-16 h-16 text-red-400" />}
              {ratingFeedback === 'medium' && <Minus className="w-16 h-16 text-yellow-400" />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flashcard Container */}
      <motion.div
        className="relative w-full aspect-[3/4] cursor-pointer"
        onClick={handleFlip}
        animate={{ 
          rotateY: showAnswer ? 180 : 0,
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30,
          duration: 0.6
        }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front - English Word */}
        <motion.div
          className="absolute inset-0"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <Card className="w-full h-full glass-card border-white/10 p-8 flex flex-col items-center justify-center text-center overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Badge variant="outline" className="mb-6 text-indigo-400 border-indigo-400/30 px-4 py-1">
                ইংরেজি শব্দ
              </Badge>
            </motion.div>
            
            <motion.h2 
              className="text-5xl font-bold text-white mb-4 font-english"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              {word.english_word}
            </motion.h2>
            
            {word.pronunciation && (
              <motion.p 
                className="text-muted-foreground text-lg mb-6 font-english"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                /{word.pronunciation}/
              </motion.p>
            )}
            
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                variant="ghost"
                size="lg"
                className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 gap-2"
                onClick={(e) => {
                  e.stopPropagation()
                  handleSpeak(word.english_word)
                }}
              >
                <Volume2 className="w-5 h-5" />
                উচ্চারণ শুনুন
              </Button>
            </motion.div>
            
            <motion.p 
              className="text-sm text-muted-foreground mt-8 flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <RotateCcw className="w-4 h-4" />
              ক্লিক করে উত্তর দেখুন
            </motion.p>
          </Card>
        </motion.div>

        {/* Back - Bangla Meaning */}
        <motion.div
          className="absolute inset-0"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <Card className="w-full h-full glass-card border-white/10 p-8 flex flex-col overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
            
            <div className="text-center mb-6">
              <Badge variant="outline" className="text-green-400 border-green-400/30 px-4 py-1">
                বাংলা অর্থ
              </Badge>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center">
              <h2 className="text-4xl font-bold text-white mb-4 font-bangla text-center">
                {word.bangla_meaning}
              </h2>
              
              {word.example_sentence && (
                <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10 w-full">
                  <p className="text-sm text-muted-foreground mb-1">উদাহরণ:</p>
                  <p className="text-sm font-english italic text-center">
                    &ldquo;{word.example_sentence}&rdquo;
                  </p>
                </div>
              )}
              
              {((word.synonyms && word.synonyms.length > 0) || (word.antonyms && word.antonyms.length > 0)) && (
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {word.synonyms?.slice(0, 3).map((syn, i) => (
                    <Badge key={i} variant="outline" className="border-blue-500/30 text-blue-400">
                      ≈ {syn}
                    </Badge>
                  ))}
                  {word.antonyms?.slice(0, 2).map((ant, i) => (
                    <Badge key={i} variant="outline" className="border-orange-500/30 text-orange-400">
                      ≠ {ant}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Rating Buttons */}
      <AnimatePresence>
        {showAnswer && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex justify-center gap-3"
          >
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleRate('hard')}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 gap-2 px-6"
            >
              <ThumbsDown className="w-5 h-5" />
              কঠিন
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleRate('medium')}
              className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-300 gap-2 px-6"
            >
              <Minus className="w-5 h-5" />
              মাঝারি
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleRate('easy')}
              className="border-green-500/30 text-green-400 hover:bg-green-500/10 hover:text-green-300 gap-2 px-6"
            >
              <ThumbsUp className="w-5 h-5" />
              সহজ
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
