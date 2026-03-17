"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { getSubTypes, PARTS_OF_SPEECH } from "@/lib/parts-of-speech-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

interface WordEditDialogProps {
  word: Word;
  children?: React.ReactNode;
}

const emptyVerbForms = {
  present: "",
  past: "",
  past_participle: "",
  present_participle: "",
};

export function WordEditDialog({ word, children }: WordEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [englishWord, setEnglishWord] = useState(word.english_word);
  const [banglaMeaning, setBanglaMeaning] = useState(word.bangla_meaning);
  const [partOfSpeech, setPartOfSpeech] = useState(word.part_of_speech || "");
  const [subType, setSubType] = useState(word.sub_type || "");
  const [exampleSentence, setExampleSentence] = useState(word.example_sentence || "");
  const [exampleSentenceBn, setExampleSentenceBn] = useState(word.example_sentence_bn || "");
  const [pronunciation, setPronunciation] = useState(word.pronunciation || "");
  const [difficulty, setDifficulty] = useState(word.difficulty || "medium");
  const [verbForms, setVerbForms] = useState(word.verb_forms || emptyVerbForms);
  const [synonyms, setSynonyms] = useState<string[]>(word.synonyms || []);
  const [antonyms, setAntonyms] = useState<string[]>(word.antonyms || []);
  const [newSynonym, setNewSynonym] = useState("");
  const [newAntonym, setNewAntonym] = useState("");

  const router = useRouter();
  const supabase = createClient();

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

  const handleSave = async () => {
    if (!englishWord.trim() || !banglaMeaning.trim()) {
      toast.error("English word and Bangla meaning are required.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("words")
        .update({
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
          difficulty,
        })
        .eq("id", word.id);

      if (error) throw error;

      toast.success("Word updated.");
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error updating word:", error);
      toast.error("Could not update the word.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase.from("words").delete().eq("id", word.id);
      if (error) throw error;

      toast.success("Word deleted.");
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error deleting word:", error);
      toast.error("Could not delete the word.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="border-yellow-500/30 hover:bg-yellow-500/10">
            <Pencil className="mr-1 h-4 w-4" />
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto border-white/10 bg-background/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-yellow-400" />
            Edit word
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>English word</Label>
              <Input value={englishWord} onChange={(event) => setEnglishWord(event.target.value)} className="border-white/10 bg-background/50" />
            </div>
            <div className="space-y-2">
              <Label>Bangla meaning</Label>
              <Input value={banglaMeaning} onChange={(event) => setBanglaMeaning(event.target.value)} className="border-white/10 bg-background/50" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Part of speech</Label>
              <select
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
              <Label>Sub-type</Label>
              <select
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
                      className="h-9 border-white/10 bg-background/50 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Example sentence</Label>
              <textarea value={exampleSentence} onChange={(event) => setExampleSentence(event.target.value)} className="min-h-28 w-full rounded-[1.25rem] border border-white/10 bg-background/50 px-4 py-3 text-sm text-foreground outline-none transition focus:border-ring focus:ring-[3px] focus:ring-ring/40" />
            </div>
            <div className="space-y-2">
              <Label>Bangla translation</Label>
              <textarea value={exampleSentenceBn} onChange={(event) => setExampleSentenceBn(event.target.value)} className="min-h-28 w-full rounded-[1.25rem] border border-white/10 bg-background/50 px-4 py-3 text-sm text-foreground outline-none transition focus:border-ring focus:ring-[3px] focus:ring-ring/40" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Pronunciation</Label>
            <Input value={pronunciation} onChange={(event) => setPronunciation(event.target.value)} className="border-white/10 bg-background/50" />
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
                  className="border-white/10 bg-background/50"
                />
                <Button type="button" variant="outline" size="icon" onClick={addSynonym} className="rounded-2xl">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {synonyms.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-2">
                  {synonyms.map((synonym, index) => (
                    <Badge key={`${synonym}-${index}`} variant="outline" className="flex items-center gap-1 border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
                      {synonym}
                      <button type="button" onClick={() => setSynonyms(synonyms.filter((_, itemIndex) => itemIndex !== index))}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : null}
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
                  className="border-white/10 bg-background/50"
                />
                <Button type="button" variant="outline" size="icon" onClick={addAntonym} className="rounded-2xl">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {antonyms.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-2">
                  {antonyms.map((antonym, index) => (
                    <Badge key={`${antonym}-${index}`} variant="outline" className="flex items-center gap-1 border-rose-400/20 bg-rose-400/10 text-rose-300">
                      {antonym}
                      <button type="button" onClick={() => setAntonyms(antonyms.filter((_, itemIndex) => itemIndex !== index))}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Difficulty</Label>
            <div className="flex gap-2">
              {(["easy", "medium", "hard"] as const).map((value) => (
                <Badge
                  key={value}
                  variant="outline"
                  className={`cursor-pointer ${
                    difficulty === value
                      ? value === "easy"
                        ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                        : value === "hard"
                          ? "border-rose-400/20 bg-rose-400/10 text-rose-300"
                          : "border-amber-400/20 bg-amber-400/10 text-amber-300"
                      : "border-white/10 text-muted-foreground"
                  }`}
                  onClick={() => setDifficulty(value)}
                >
                  {value}
                </Badge>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-rose-400/15 bg-rose-400/5 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Delete this word</p>
                <p className="mt-1 text-sm text-muted-foreground">This removes the word from the library. Use carefully.</p>
              </div>
              {!showDeleteConfirm ? (
                <Button type="button" variant="outline" onClick={() => setShowDeleteConfirm(true)} className="rounded-2xl border-rose-400/25 bg-rose-400/10 text-rose-300 hover:bg-rose-400/15">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Reveal delete action
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowDeleteConfirm(false)} className="rounded-2xl">
                    Cancel
                  </Button>
                  <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleting || loading} className="rounded-2xl">
                    {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                    Delete word
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="rounded-2xl">
              Close
            </Button>
            <Button onClick={handleSave} disabled={loading || deleting} className="rounded-2xl">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
