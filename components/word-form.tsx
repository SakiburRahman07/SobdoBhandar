"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { BookOpen, Check, Loader2, MessageSquare, Plus, RefreshCw, Sparkles, Volume2, X } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { getSubTypes, PARTS_OF_SPEECH } from "@/lib/parts-of-speech-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface WordFormProps {
  userId: string;
  onSuccess?: () => void;
}

interface WordData {
  word: string;
  part_of_speech?: string;
  sub_type?: string;
  meaning_bn: string;
  example: string;
  example_bn?: string;
  pronunciation: string;
  synonyms: string[];
  antonyms: string[];
  verb_forms?: {
    present: string;
    past: string;
    past_participle: string;
    present_participle: string;
  };
  ai_generated?: boolean;
}

const emptyVerbForms = {
  present: "",
  past: "",
  past_participle: "",
  present_participle: "",
};

export function WordForm({ userId, onSuccess }: WordFormProps) {
  const [englishWord, setEnglishWord] = useState("");
  const [banglaMeaning, setBanglaMeaning] = useState("");
  const [partOfSpeech, setPartOfSpeech] = useState("");
  const [subType, setSubType] = useState("");
  const [exampleSentence, setExampleSentence] = useState("");
  const [exampleSentenceBn, setExampleSentenceBn] = useState("");
  const [pronunciation, setPronunciation] = useState("");
  const [verbForms, setVerbForms] = useState(emptyVerbForms);
  const [synonyms, setSynonyms] = useState<string[]>([]);
  const [antonyms, setAntonyms] = useState<string[]>([]);
  const [newSynonym, setNewSynonym] = useState("");
  const [newAntonym, setNewAntonym] = useState("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const resetForm = () => {
    setEnglishWord("");
    setBanglaMeaning("");
    setPartOfSpeech("");
    setSubType("");
    setExampleSentence("");
    setExampleSentenceBn("");
    setPronunciation("");
    setVerbForms(emptyVerbForms);
    setSynonyms([]);
    setAntonyms([]);
    setNewSynonym("");
    setNewAntonym("");
    setAiGenerated(false);
  };

  const generateWithAI = useCallback(async () => {
    if (!englishWord.trim()) {
      toast.error("Enter an English word first.");
      return;
    }

    setGenerating(true);
    setAiGenerated(false);

    try {
      const response = await fetch("/api/generate-word", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: englishWord.trim() }),
      });

      const data: WordData & { error?: string } = await response.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      if (data.word) setEnglishWord(data.word);
      if (data.part_of_speech) setPartOfSpeech(data.part_of_speech);
      if (data.sub_type) setSubType(data.sub_type);
      if (data.meaning_bn) setBanglaMeaning(data.meaning_bn);
      if (data.example) setExampleSentence(data.example);
      if (data.example_bn) setExampleSentenceBn(data.example_bn);
      if (data.pronunciation) setPronunciation(data.pronunciation);
      if (data.synonyms?.length) setSynonyms(data.synonyms);
      if (data.antonyms?.length) setAntonyms(data.antonyms);
      if (data.verb_forms) setVerbForms({ ...emptyVerbForms, ...data.verb_forms });

      if (data.ai_generated) {
        setAiGenerated(true);
        toast.success("AI draft generated.");
      }
    } catch (error) {
      console.error("AI generation error:", error);
      toast.error("AI could not generate the draft.");
    } finally {
      setGenerating(false);
    }
  }, [englishWord]);

  const speakWord = useCallback(() => {
    if (!englishWord.trim()) return;

    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(englishWord.trim());
      utterance.lang = "en-US";
      utterance.rate = 0.85;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    }
  }, [englishWord]);

  const addSynonym = () => {
    if (newSynonym.trim() && !synonyms.includes(newSynonym.trim())) {
      setSynonyms([...synonyms, newSynonym.trim()]);
      setNewSynonym("");
    }
  };

  const addAntonym = () => {
    if (newAntonym.trim() && !antonyms.includes(newAntonym.trim())) {
      setAntonyms([...antonyms, newAntonym.trim()]);
      setNewAntonym("");
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!englishWord.trim() || !banglaMeaning.trim()) {
      toast.error("English word and Bangla meaning are required.");
      return;
    }

    setLoading(true);

    try {
      const { data: wordData, error: wordError } = await supabase
        .from("words")
        .insert({
          user_id: userId,
          english_word: englishWord.trim(),
          bangla_meaning: banglaMeaning.trim(),
          part_of_speech: partOfSpeech || null,
          sub_type: subType || null,
          verb_forms: partOfSpeech === "verb" ? verbForms : null,
          example_sentence: exampleSentence.trim() || null,
          example_sentence_bn: exampleSentenceBn.trim() || null,
          pronunciation: pronunciation.trim() || null,
          synonyms: synonyms.length > 0 ? synonyms : null,
          antonyms: antonyms.length > 0 ? antonyms : null,
          difficulty: "medium",
        })
        .select()
        .single();

      if (wordError) throw wordError;

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      await supabase.from("review_schedule").insert({
        word_id: wordData.id,
        user_id: userId,
        next_review_date: tomorrow.toISOString().split("T")[0],
        interval_days: 1,
        ease_factor: 2.5,
        repetitions: 0,
      });

      toast.success("Word added to the library.");
      resetForm();
      onSuccess?.();
      router.refresh();
    } catch (error) {
      console.error("Error adding word:", error);
      toast.error("Could not add the word.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden border-white/10 bg-background/70 shadow-[0_24px_80px_rgba(7,19,31,0.16)]">
      <CardHeader className="border-b border-white/10">
        <CardTitle className="flex items-center gap-2 text-xl text-foreground">
          <BookOpen className="h-5 w-5 text-primary" />
          Add a new word
        </CardTitle>
        <p className="text-sm text-muted-foreground">Build a high-quality entry once so review sessions stay fast later.</p>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="englishWord">English word</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="englishWord"
                    value={englishWord}
                    onChange={(event) => {
                      setEnglishWord(event.target.value);
                      setAiGenerated(false);
                    }}
                    placeholder="e.g. resilient"
                    className="border-white/10 bg-background/50 pr-10 font-english"
                    required
                  />
                  {englishWord ? (
                    <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2" onClick={speakWord} disabled={isSpeaking}>
                      <Volume2 className={`h-4 w-4 ${isSpeaking ? "animate-pulse text-primary" : "text-muted-foreground"}`} />
                    </Button>
                  ) : null}
                </div>
                <Button type="button" variant="outline" onClick={generateWithAI} disabled={generating || !englishWord.trim()} className="shrink-0 rounded-2xl border-primary/30 text-primary hover:bg-primary/10">
                  {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  <span className="ml-2 hidden sm:inline">AI draft</span>
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="banglaMeaning" className="flex items-center gap-2">
                Bangla meaning
                {aiGenerated ? <Badge variant="outline" className="border-emerald-400/20 bg-emerald-400/10 text-emerald-300"><Check className="mr-1 h-3 w-3" />AI</Badge> : null}
              </Label>
              <Input id="banglaMeaning" value={banglaMeaning} onChange={(event) => setBanglaMeaning(event.target.value)} placeholder="Student-friendly Bangla meaning" className="border-white/10 bg-background/50" required />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="partOfSpeech">Part of speech</Label>
              <select
                id="partOfSpeech"
                value={partOfSpeech}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setPartOfSpeech(nextValue);
                  setSubType("");
                  if (nextValue !== "verb") setVerbForms(emptyVerbForms);
                }}
                className="flex h-10 w-full rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm"
              >
                <option value="">Select a part of speech</option>
                {PARTS_OF_SPEECH.map((item) => (
                  <option key={item.value} value={item.value}>{item.label} ({item.labelBn})</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subType">Sub-type</Label>
              <select
                id="subType"
                value={subType}
                onChange={(event) => setSubType(event.target.value)}
                disabled={!partOfSpeech}
                className="flex h-10 w-full rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm disabled:opacity-50"
              >
                <option value="">Select a sub-type</option>
                {getSubTypes(partOfSpeech).map((item) => (
                  <option key={item.value} value={item.value}>{item.label} ({item.labelBn})</option>
                ))}
              </select>
            </div>
          </div>

          {partOfSpeech === "verb" ? (
            <div className="rounded-[1.5rem] border border-primary/20 bg-primary/5 p-4">
              <Label className="text-sm font-medium text-foreground">Verb forms</Label>
              <div className="mt-3 grid gap-3 md:grid-cols-4">
                {[
                  ["present", "Present", "go"],
                  ["past", "Past", "went"],
                  ["past_participle", "Past participle", "gone"],
                  ["present_participle", "Present participle", "going"],
                ].map(([key, label, placeholder]) => (
                  <div key={key} className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{label}</Label>
                    <Input
                      value={verbForms[key as keyof typeof verbForms]}
                      onChange={(event) => setVerbForms((prev) => ({ ...prev, [key]: event.target.value }))}
                      placeholder={placeholder}
                      className="h-9 border-white/10 bg-background/50 text-sm font-english"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="exampleSentence" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                Example sentence
              </Label>
              <textarea
                id="exampleSentence"
                value={exampleSentence}
                onChange={(event) => setExampleSentence(event.target.value)}
                placeholder="Write a natural English example sentence"
                className="min-h-28 w-full rounded-[1.25rem] border border-white/10 bg-background/50 px-4 py-3 text-sm text-foreground outline-none transition focus:border-ring focus:ring-[3px] focus:ring-ring/40"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exampleSentenceBn">Bangla translation</Label>
              <textarea
                id="exampleSentenceBn"
                value={exampleSentenceBn}
                onChange={(event) => setExampleSentenceBn(event.target.value)}
                placeholder="Translate the example sentence into Bangla"
                className="min-h-28 w-full rounded-[1.25rem] border border-white/10 bg-background/50 px-4 py-3 text-sm text-foreground outline-none transition focus:border-ring focus:ring-[3px] focus:ring-ring/40"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pronunciation">Pronunciation</Label>
            <Input id="pronunciation" value={pronunciation} onChange={(event) => setPronunciation(event.target.value)} placeholder="ri-ZIL-yuhnt" className="border-white/10 bg-background/50 font-english" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Synonyms</Label>
              <div className="flex gap-2">
                <Input
                  value={newSynonym}
                  onChange={(event) => setNewSynonym(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addSynonym();
                    }
                  }}
                  placeholder="Add a synonym"
                  className="border-white/10 bg-background/50 font-english"
                />
                <Button type="button" variant="outline" size="icon" onClick={addSynonym} className="rounded-2xl">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <AnimatePresence>
                {synonyms.length > 0 ? (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex flex-wrap gap-2 pt-2">
                    {synonyms.map((synonym, index) => (
                      <motion.span key={synonym} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="inline-flex items-center gap-1 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-sm text-sky-300">
                        {synonym}
                        <button type="button" onClick={() => setSynonyms(synonyms.filter((_, itemIndex) => itemIndex !== index))}>
                          <X className="h-3 w-3" />
                        </button>
                      </motion.span>
                    ))}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            <div className="space-y-2">
              <Label>Antonyms</Label>
              <div className="flex gap-2">
                <Input
                  value={newAntonym}
                  onChange={(event) => setNewAntonym(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addAntonym();
                    }
                  }}
                  placeholder="Add an antonym"
                  className="border-white/10 bg-background/50 font-english"
                />
                <Button type="button" variant="outline" size="icon" onClick={addAntonym} className="rounded-2xl">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <AnimatePresence>
                {antonyms.length > 0 ? (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex flex-wrap gap-2 pt-2">
                    {antonyms.map((antonym, index) => (
                      <motion.span key={antonym} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="inline-flex items-center gap-1 rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-sm text-rose-300">
                        {antonym}
                        <button type="button" onClick={() => setAntonyms(antonyms.filter((_, itemIndex) => itemIndex !== index))}>
                          <X className="h-3 w-3" />
                        </button>
                      </motion.span>
                    ))}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="button" variant="outline" onClick={resetForm} className="rounded-2xl border-white/10">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset form
            </Button>
            <Button type="submit" className="flex-1 rounded-2xl" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Save word to library
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
