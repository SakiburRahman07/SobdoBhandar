"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookAudio, Layers3, Minus, RotateCcw, ThumbsDown, ThumbsUp, Volume2 } from "lucide-react";
import type { WordWithReview } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface FlashcardProps {
  word: WordWithReview;
  showAnswer: boolean;
  onFlip: () => void;
  onRate: (difficulty: "hard" | "medium" | "easy") => void;
}

export function Flashcard({ word, showAnswer, onFlip, onRate }: FlashcardProps) {
  const [ratingFeedback, setRatingFeedback] = useState<string | null>(null);

  const handleSpeak = (text: string) => {
    if (!("speechSynthesis" in window)) return;

    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.86;
    speechSynthesis.speak(utterance);
  };

  const handleRate = (difficulty: "hard" | "medium" | "easy") => {
    setRatingFeedback(difficulty);
    setTimeout(() => {
      setRatingFeedback(null);
      onRate(difficulty);
    }, 320);
  };

  return (
    <div className="relative mx-auto max-w-4xl">
      <AnimatePresence>
        {ratingFeedback ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.72 }}
            className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
          >
            <div
              className={`rounded-full p-8 ${
                ratingFeedback === "easy"
                  ? "bg-emerald-400/20"
                  : ratingFeedback === "medium"
                    ? "bg-amber-400/20"
                    : "bg-rose-400/20"
              }`}
            >
              {ratingFeedback === "easy" ? (
                <ThumbsUp className="size-16 text-emerald-300" />
              ) : ratingFeedback === "medium" ? (
                <Minus className="size-16 text-amber-300" />
              ) : (
                <ThumbsDown className="size-16 text-rose-300" />
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.div
        className="relative min-h-[29rem] cursor-pointer"
        onClick={onFlip}
        animate={{ rotateY: showAnswer ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 28 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <motion.div className="absolute inset-0" style={{ backfaceVisibility: "hidden" }}>
          <div className="v2-card relative flex min-h-[29rem] flex-col overflow-hidden rounded-[2rem] border p-6 sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(73,198,255,0.22),transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(253,186,77,0.16),transparent_30%)]" />
            <div className="relative z-10 flex h-full flex-col">
              <div className="flex items-center justify-between gap-3">
                <Badge variant="outline" className="rounded-full border-primary/20 bg-primary/10 px-3 py-1 text-primary">
                  Front side
                </Badge>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="rounded-2xl border-border/80 bg-background/40"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleSpeak(word.english_word);
                  }}
                >
                  <Volume2 className="size-4" />
                </Button>
              </div>

              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <div className="space-y-4">
                  <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">English word</p>
                  <h2 className="font-display text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
                    {word.english_word}
                  </h2>
                  {word.pronunciation ? (
                    <p className="font-english text-lg text-muted-foreground">/{word.pronunciation}/</p>
                  ) : null}
                </div>
              </div>

              <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-border/70 bg-background/45 px-4 py-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <RotateCcw className="size-4" />
                  Click or press Space to reveal the answer
                </div>
                {word.part_of_speech ? (
                  <Badge variant="outline" className="rounded-full border-border/70 bg-surface px-3 py-1 text-muted-foreground">
                    {word.part_of_speech}
                  </Badge>
                ) : null}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div className="absolute inset-0" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
          <div className="v2-card relative flex min-h-[29rem] flex-col overflow-hidden rounded-[2rem] border p-6 sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(52,211,153,0.2),transparent_36%),radial-gradient(circle_at_bottom_left,_rgba(73,198,255,0.14),transparent_30%)]" />
            <div className="relative z-10 flex h-full flex-col gap-5">
              <div className="flex items-center justify-between gap-3">
                <Badge variant="outline" className="rounded-full border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-emerald-300">
                  Answer side
                </Badge>
                <div className="flex items-center gap-2">
                  {word.synonyms?.length ? (
                    <Badge variant="outline" className="rounded-full border-border/70 bg-surface px-3 py-1 text-muted-foreground">
                      <Layers3 className="mr-2 size-3.5" />
                      {word.synonyms.length} synonyms
                    </Badge>
                  ) : null}
                  {word.example_sentence ? (
                    <Badge variant="outline" className="rounded-full border-border/70 bg-surface px-3 py-1 text-muted-foreground">
                      <BookAudio className="mr-2 size-3.5" />
                      Example ready
                    </Badge>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-center gap-6 text-center">
                <div className="space-y-3">
                  <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">Bangla meaning</p>
                  <h2 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">{word.bangla_meaning}</h2>
                </div>

                {word.example_sentence || word.example_sentence_bn ? (
                  <div className="rounded-[1.5rem] border border-border/70 bg-background/45 p-5 text-left">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Example</p>
                    {word.example_sentence ? (
                      <p className="mt-3 font-english text-base leading-7 text-foreground">{word.example_sentence}</p>
                    ) : null}
                    {word.example_sentence_bn ? (
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{word.example_sentence_bn}</p>
                    ) : null}
                  </div>
                ) : null}

                {word.synonyms?.length || word.antonyms?.length ? (
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {word.synonyms?.slice(0, 3).map((synonym) => (
                      <Badge key={synonym} variant="outline" className="rounded-full border-primary/20 bg-primary/10 px-3 py-1 text-primary">
                        Syn: {synonym}
                      </Badge>
                    ))}
                    {word.antonyms?.slice(0, 2).map((antonym) => (
                      <Badge key={antonym} variant="outline" className="rounded-full border-rose-400/20 bg-rose-400/10 px-3 py-1 text-rose-300">
                        Ant: {antonym}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showAnswer ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} className="mt-6 grid gap-3 sm:grid-cols-3">
            <Button type="button" variant="outline" className="h-14 rounded-2xl border-rose-400/25 bg-rose-400/10 text-base text-rose-300 hover:bg-rose-400/15" onClick={() => handleRate("hard")}>
              <ThumbsDown className="mr-2 size-4" />
              Hard
            </Button>
            <Button type="button" variant="outline" className="h-14 rounded-2xl border-amber-400/25 bg-amber-400/10 text-base text-amber-300 hover:bg-amber-400/15" onClick={() => handleRate("medium")}>
              <Minus className="mr-2 size-4" />
              Medium
            </Button>
            <Button type="button" variant="outline" className="h-14 rounded-2xl border-emerald-400/25 bg-emerald-400/10 text-base text-emerald-300 hover:bg-emerald-400/15" onClick={() => handleRate("easy")}>
              <ThumbsUp className="mr-2 size-4" />
              Easy
            </Button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
