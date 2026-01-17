import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const WORD_GENERATION_PROMPT = `You are an expert vocabulary assistant for a Bengali vocabulary learning app.

When given an English word, generate:
1. Corrected spelling (if wrong)
2. Simple Bangla meaning (student-friendly, avoid difficult words)
3. One short, easy example sentence
4. Pronunciation in readable phonetic form (e.g., ser-uhn-DIP-i-tee)
5. 3-5 simple synonyms
6. 2-3 relevant antonyms

IMPORTANT: Return ONLY valid JSON, no markdown, no explanation.

Format:
{
  "word": "corrected word",
  "meaning_bn": "simple Bangla meaning",
  "example": "short example sentence",
  "pronunciation": "phonetic pronunciation",
  "synonyms": ["syn1", "syn2", "syn3"],
  "antonyms": ["ant1", "ant2"]
}

If the word doesn't exist or is invalid, return:
{"error": "Invalid word"}`

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
        maxOutputTokens: 500,
      }
    })

    const prompt = `${WORD_GENERATION_PROMPT}\n\nWord: "${word.trim()}"`
    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    let wordData
    try {
      const cleanJson = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      
      wordData = JSON.parse(cleanJson)
    } catch {
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
