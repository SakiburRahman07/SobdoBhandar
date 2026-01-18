// Parts of Speech Classifications Data
// Based on grammar research for comprehensive vocabulary learning

export interface SubType {
  value: string
  label: string
  labelBn: string
  description: string
}

export interface PartOfSpeech {
  value: string
  label: string
  labelBn: string
  subTypes: SubType[]
}

export const PARTS_OF_SPEECH: PartOfSpeech[] = [
  {
    value: 'noun',
    label: 'Noun',
    labelBn: 'বিশেষ্য',
    subTypes: [
      { value: 'proper_noun', label: 'Proper Noun', labelBn: 'নাম বাচক', description: 'Specific names (London, Einstein)' },
      { value: 'common_noun', label: 'Common Noun', labelBn: 'জাতি বাচক', description: 'Generic items (city, book)' },
      { value: 'concrete_noun', label: 'Concrete Noun', labelBn: 'মূর্ত বিশেষ্য', description: 'Can be sensed (table, coffee)' },
      { value: 'abstract_noun', label: 'Abstract Noun', labelBn: 'ভাব বিশেষ্য', description: 'Intangible concepts (love, freedom)' },
      { value: 'collective_noun', label: 'Collective Noun', labelBn: 'সমষ্টি বাচক', description: 'Groups (team, flock)' },
      { value: 'countable_noun', label: 'Countable Noun', labelBn: 'গণনাযোগ্য', description: 'Can be counted (book, apple)' },
      { value: 'uncountable_noun', label: 'Uncountable Noun', labelBn: 'অগণনাযোগ্য', description: 'Cannot be counted (water, information)' },
      { value: 'compound_noun', label: 'Compound Noun', labelBn: 'যৌগিক বিশেষ্য', description: 'Multiple words (toothpaste)' },
    ]
  },
  {
    value: 'verb',
    label: 'Verb',
    labelBn: 'ক্রিয়া',
    subTypes: [
      { value: 'transitive', label: 'Transitive', labelBn: 'সকর্মক', description: 'Requires object (give, send)' },
      { value: 'intransitive', label: 'Intransitive', labelBn: 'অকর্মক', description: 'No object needed (sleep, arrive)' },
      { value: 'linking', label: 'Linking Verb', labelBn: 'সংযোগ ক্রিয়া', description: 'Connects subject (is, seems)' },
      { value: 'auxiliary', label: 'Auxiliary', labelBn: 'সহায়ক ক্রিয়া', description: 'Helping verb (have, do, be)' },
      { value: 'modal', label: 'Modal', labelBn: 'মোডাল ক্রিয়া', description: 'Possibility/ability (can, must)' },
      { value: 'phrasal', label: 'Phrasal Verb', labelBn: 'বাক্যাংশ ক্রিয়া', description: 'Verb + preposition (give up)' },
      { value: 'regular', label: 'Regular', labelBn: 'নিয়মিত', description: 'Standard -ed pattern (walk→walked)' },
      { value: 'irregular', label: 'Irregular', labelBn: 'অনিয়মিত', description: 'Irregular past (go→went)' },
    ]
  },
  {
    value: 'adjective',
    label: 'Adjective',
    labelBn: 'বিশেষণ',
    subTypes: [
      { value: 'descriptive', label: 'Descriptive', labelBn: 'বর্ণনামূলক', description: 'Describes qualities (big, beautiful)' },
      { value: 'comparative', label: 'Comparative', labelBn: 'তুলনামূলক', description: 'Compares two (bigger, more)' },
      { value: 'superlative', label: 'Superlative', labelBn: 'সর্বোত্তম', description: 'Extreme degree (biggest, most)' },
      { value: 'possessive', label: 'Possessive', labelBn: 'সম্বন্ধ পদ', description: 'Shows ownership (my, your)' },
      { value: 'demonstrative', label: 'Demonstrative', labelBn: 'নির্দেশক', description: 'Points out (this, that)' },
      { value: 'proper', label: 'Proper Adjective', labelBn: 'নামজাত', description: 'From proper nouns (American)' },
      { value: 'compound', label: 'Compound', labelBn: 'যৌগিক', description: 'Multiple words (well-known)' },
    ]
  },
  {
    value: 'adverb',
    label: 'Adverb',
    labelBn: 'ক্রিয়া বিশেষণ',
    subTypes: [
      { value: 'manner', label: 'Manner', labelBn: 'পদ্ধতি', description: 'How action is done (quickly)' },
      { value: 'place', label: 'Place', labelBn: 'স্থান', description: 'Where (here, outside)' },
      { value: 'time', label: 'Time', labelBn: 'সময়', description: 'When (today, soon)' },
      { value: 'frequency', label: 'Frequency', labelBn: 'পুনরাবৃত্তি', description: 'How often (always, sometimes)' },
      { value: 'degree', label: 'Degree', labelBn: 'মাত্রা', description: 'Intensity (very, extremely)' },
    ]
  },
  {
    value: 'preposition',
    label: 'Preposition',
    labelBn: 'পদান্বয়ী অব্যয়',
    subTypes: [
      { value: 'place', label: 'Place', labelBn: 'স্থান', description: 'Location (in, on, at)' },
      { value: 'time', label: 'Time', labelBn: 'সময়', description: 'Time (before, after)' },
      { value: 'direction', label: 'Direction', labelBn: 'দিক', description: 'Movement (to, from)' },
    ]
  },
  {
    value: 'conjunction',
    label: 'Conjunction',
    labelBn: 'সংযোজক অব্যয়',
    subTypes: [
      { value: 'coordinating', label: 'Coordinating', labelBn: 'সমন্বয়ক', description: 'Equal parts (and, but, or)' },
      { value: 'subordinating', label: 'Subordinating', labelBn: 'অধীনস্থ', description: 'Dependent clause (because, although)' },
      { value: 'correlative', label: 'Correlative', labelBn: 'পারস্পরিক', description: 'Pairs (either...or)' },
    ]
  },
  {
    value: 'pronoun',
    label: 'Pronoun',
    labelBn: 'সর্বনাম',
    subTypes: [
      { value: 'personal', label: 'Personal', labelBn: 'ব্যক্তিগত', description: 'I, you, he, she' },
      { value: 'possessive', label: 'Possessive', labelBn: 'সম্বন্ধ', description: 'mine, yours, his' },
      { value: 'reflexive', label: 'Reflexive', labelBn: 'আত্মবাচক', description: 'myself, yourself' },
      { value: 'relative', label: 'Relative', labelBn: 'সম্পর্কবাচক', description: 'who, which, that' },
    ]
  },
  {
    value: 'interjection',
    label: 'Interjection',
    labelBn: 'আবেগ অব্যয়',
    subTypes: [
      { value: 'emotion', label: 'Emotion', labelBn: 'আবেগ', description: 'Wow!, Ouch!' },
      { value: 'greeting', label: 'Greeting', labelBn: 'অভিবাদন', description: 'Hello!, Hi!' },
    ]
  },
]

// Helper function to get sub-types for a part of speech
export function getSubTypes(partOfSpeech: string): SubType[] {
  const pos = PARTS_OF_SPEECH.find(p => p.value === partOfSpeech)
  return pos?.subTypes || []
}

// Helper function to get label for sub-type
export function getSubTypeLabel(partOfSpeech: string, subType: string): string {
  const subTypes = getSubTypes(partOfSpeech)
  const found = subTypes.find(s => s.value === subType)
  return found ? `${found.label} (${found.labelBn})` : subType
}

// Get main part of speech label
export function getPartOfSpeechLabel(value: string): string {
  const pos = PARTS_OF_SPEECH.find(p => p.value === value)
  return pos ? `${pos.label} (${pos.labelBn})` : value
}
