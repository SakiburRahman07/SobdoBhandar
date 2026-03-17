"use client";

import { useCallback, useState } from "react";
import { ArrowLeftRight, BookOpen, Info, MessageSquare, Repeat, Volume2 } from "lucide-react";
import { getPartOfSpeechLabel, getSubTypeLabel } from "@/lib/parts-of-speech-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Word {
  id: string;
  english_word: string;
  bangla_meaning: string;
  part_of_speech?: string | null;
  sub_type?: string | null;
  verb_forms?: {
    present: string;
    past: string;
    past_participle: string;
    present_participle: string;
  } | null;
  example_sentence?: string | null;
  example_sentence_bn?: string | null;
  pronunciation?: string | null;
  synonyms?: string[] | null;
  antonyms?: string[] | null;
  difficulty?: string;
}

interface WordDetailsDialogProps {
  word: Word;
  children?: React.ReactNode;
}

export function WordDetailsDialog({ word, children }: WordDetailsDialogProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speakWord = useCallback(() => {
    if (!word.english_word) return;

    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(word.english_word);
      utterance.lang = "en-US";
      utterance.rate = 0.85;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      speechSynthesis.speak(utterance);
    }
  }, [word.english_word]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="border-indigo-500/30 hover:bg-indigo-500/10">
            <Info className="mr-1 h-4 w-4" />
            Details
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg border-white/10 bg-background/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <BookOpen className="h-6 w-6 text-indigo-400" />
            <span className="font-english">{word.english_word}</span>
            <Button variant="ghost" size="icon" onClick={speakWord} className="h-8 w-8">
              <Volume2 className={`h-5 w-5 ${isSpeaking ? "animate-pulse text-indigo-400" : "text-muted-foreground"}`} />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="flex flex-wrap items-center gap-3">
            {word.part_of_speech ? (
              <Badge variant="outline" className="border-purple-500/30 text-sm text-purple-300">
                {getPartOfSpeechLabel(word.part_of_speech)}
              </Badge>
            ) : null}
            {word.sub_type && word.part_of_speech ? (
              <Badge variant="outline" className="border-indigo-500/30 text-xs text-indigo-300">
                {getSubTypeLabel(word.part_of_speech, word.sub_type)}
              </Badge>
            ) : null}
            {word.pronunciation ? (
              <span className="font-english text-sm text-muted-foreground">/{word.pronunciation}/</span>
            ) : null}
            <Badge
              variant="outline"
              className={
                word.difficulty === "easy"
                  ? "border-green-500/30 text-green-400"
                  : word.difficulty === "hard"
                    ? "border-red-500/30 text-red-400"
                    : "border-yellow-500/30 text-yellow-400"
              }
            >
              {word.difficulty === "easy" ? "Easy" : word.difficulty === "hard" ? "Hard" : "Medium"}
            </Badge>
          </div>

          <div className="rounded-lg border border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-4">
            <h4 className="mb-1 text-sm text-muted-foreground">Bangla meaning</h4>
            <p className="text-lg font-bangla">{word.bangla_meaning}</p>
          </div>

          {word.part_of_speech === "verb" && word.verb_forms ? (
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <h4 className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Repeat className="h-4 w-4" />
                Verb forms
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {word.verb_forms.present ? (
                  <div>
                    <span className="text-muted-foreground">Present: </span>
                    <span className="font-english">{word.verb_forms.present}</span>
                  </div>
                ) : null}
                {word.verb_forms.past ? (
                  <div>
                    <span className="text-muted-foreground">Past: </span>
                    <span className="font-english">{word.verb_forms.past}</span>
                  </div>
                ) : null}
                {word.verb_forms.past_participle ? (
                  <div>
                    <span className="text-muted-foreground">Past participle: </span>
                    <span className="font-english">{word.verb_forms.past_participle}</span>
                  </div>
                ) : null}
                {word.verb_forms.present_participle ? (
                  <div>
                    <span className="text-muted-foreground">Present participle: </span>
                    <span className="font-english">{word.verb_forms.present_participle}</span>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {word.example_sentence || word.example_sentence_bn ? (
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <h4 className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                <MessageSquare className="h-4 w-4" />
                Example sentence
              </h4>
              {word.example_sentence ? (
                <p className="mb-2 font-english text-sm italic">&ldquo;{word.example_sentence}&rdquo;</p>
              ) : null}
              {word.example_sentence_bn ? (
                <p className="text-sm text-indigo-300">Translation: {word.example_sentence_bn}</p>
              ) : null}
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-4">
            {word.synonyms && word.synonyms.length > 0 ? (
              <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-3">
                <h4 className="mb-2 flex items-center gap-1 text-xs text-green-400">
                  <ArrowLeftRight className="h-3 w-3" />
                  Synonyms
                </h4>
                <div className="flex flex-wrap gap-1">
                  {word.synonyms.map((synonym) => (
                    <Badge key={synonym} variant="outline" className="border-green-500/30 text-xs text-green-300">
                      {synonym}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
            {word.antonyms && word.antonyms.length > 0 ? (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                <h4 className="mb-2 flex items-center gap-1 text-xs text-red-400">
                  <ArrowLeftRight className="h-3 w-3" />
                  Antonyms
                </h4>
                <div className="flex flex-wrap gap-1">
                  {word.antonyms.map((antonym) => (
                    <Badge key={antonym} variant="outline" className="border-red-500/30 text-xs text-red-300">
                      {antonym}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
