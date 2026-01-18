import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const WORD_GENERATION_PROMPT = `You are an expert vocabulary assistant for a Bengali vocabulary learning app.

When given an English word, you MUST generate ALL of the following:
1. Corrected spelling (if wrong)
2. Part of speech: ONE of (noun, verb, adjective, adverb, preposition, conjunction, interjection, pronoun)
3. Sub-type: REQUIRED based on part of speech:
   - If noun: ONE of (proper_noun, common_noun, concrete_noun, abstract_noun, collective_noun, countable_noun, uncountable_noun)
   - If verb: ONE of (transitive, intransitive, linking, auxiliary, modal, phrasal, regular, irregular) - typically use "transitive" or "intransitive"
   - If adjective: ONE of (descriptive, comparative, superlative, possessive, demonstrative, proper, compound) - typically "descriptive"
   - If adverb: ONE of (manner, place, time, frequency, degree)
   - For other parts of speech, use the most appropriate sub-type or leave as empty string
4. Simple Bangla meaning (student-friendly)
5. One short example sentence
6. Bengali translation of the example sentence
7. Pronunciation in phonetic form
8. 3-5 synonyms
9. 2-3 antonyms
10. For VERB: include verb_forms with present, past, past_participle, present_participle

CRITICAL: sub_type is REQUIRED. Always include it.

Examples:
- "work" (verb) → sub_type: "intransitive" 
- "run" (verb) → sub_type: "intransitive"
- "eat" (verb) → sub_type: "transitive"
- "book" (noun) → sub_type: "countable_noun"
- "water" (noun) → sub_type: "uncountable_noun"
- "beautiful" (adjective) → sub_type: "descriptive"
- "quickly" (adverb) → sub_type: "manner"

Return ONLY valid JSON:
{
  "word": "corrected word",
  "part_of_speech": "verb",
  "sub_type": "transitive",
  "meaning_bn": "বাংলা অর্থ",
  "example": "example sentence",
  "example_bn": "বাংলা অনুবাদ",
  "pronunciation": "phonetic",
  "synonyms": ["syn1", "syn2"],
  "antonyms": ["ant1", "ant2"],
  "verb_forms": {"present": "work", "past": "worked", "past_participle": "worked", "present_participle": "working"}
}

Include verb_forms ONLY for verbs. sub_type is ALWAYS required.

If invalid word: {"error": "Invalid word"}`

export async function POST(request: NextRequest) {
  try {
    const { word } = await request.json()

    if (!word || typeof word !== 'string') {
      return NextResponse.json(
        { error: 'Word is required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.AI_API_KEY
    
    if (!apiKey) {
      return NextResponse.json({
        word: word,
        meaning_bn: '',
        example: '',
        pronunciation: '',
        synonyms: [],
        antonyms: [],
        ai_generated: false
      })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1000,
      }
    })

    const prompt = `${WORD_GENERATION_PROMPT}\n\nWord: "${word.trim()}"`
    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    let wordData
    try {
      // Remove markdown code blocks and clean the response
      let cleanJson = responseText
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/gi, '')
        .trim()
      
      // Try to extract JSON object if there's extra text
      const jsonMatch = cleanJson.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        cleanJson = jsonMatch[0]
      }
      
      wordData = JSON.parse(cleanJson)
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText)
      return NextResponse.json({
        word: word,
        meaning_bn: '',
        example: '',
        pronunciation: '',
        synonyms: [],
        antonyms: [],
        ai_generated: false,
        parse_error: true
      })
    }

    if (wordData.error) {
      return NextResponse.json({
        word: word,
        error: wordData.error,
        ai_generated: false
      })
    }

    return NextResponse.json({
      ...wordData,
      ai_generated: true
    })

  } catch (error: unknown) {
    console.error('Word generation error:', error)
    
    if (error && typeof error === 'object' && 'status' in error) {
      const statusError = error as { status: number }
      if (statusError.status === 429) {
        return NextResponse.json({
          error: 'AI সার্ভার ব্যস্ত। কিছুক্ষণ পর চেষ্টা করুন।',
          rate_limited: true
        }, { status: 429 })
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate word data' },
      { status: 500 }
    )
  }
}
