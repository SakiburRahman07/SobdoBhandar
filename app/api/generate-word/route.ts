import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const WORD_GENERATION_PROMPT = `You are an expert vocabulary assistant for a Bengali vocabulary learning app.

When given an English word, generate all of the following:
1. Corrected spelling if needed
2. part_of_speech: one of noun, verb, adjective, adverb, preposition, conjunction, interjection, pronoun
3. sub_type: required and appropriate for the part of speech
4. meaning_bn: a simple Bangla meaning
5. example: one short example sentence
6. example_bn: the Bangla translation of the example sentence
7. pronunciation: a simple phonetic pronunciation string
8. synonyms: 3 to 5 synonyms
9. antonyms: 2 to 3 antonyms
10. verb_forms only for verbs with present, past, past_participle, and present_participle

Return only valid JSON in this shape:
{
  "word": "corrected word",
  "part_of_speech": "verb",
  "sub_type": "transitive",
  "meaning_bn": "simple Bangla meaning",
  "example": "example sentence",
  "example_bn": "Bangla translation",
  "pronunciation": "phonetic",
  "synonyms": ["syn1", "syn2"],
  "antonyms": ["ant1", "ant2"],
  "verb_forms": {
    "present": "work",
    "past": "worked",
    "past_participle": "worked",
    "present_participle": "working"
  }
}

If the word is invalid, return only:
{"error": "Invalid word"}`;

export async function POST(request: NextRequest) {
  try {
    const { word } = await request.json();

    if (!word || typeof word !== "string") {
      return NextResponse.json({ error: "Word is required" }, { status: 400 });
    }

    const apiKey = process.env.AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        word,
        meaning_bn: "",
        example: "",
        pronunciation: "",
        synonyms: [],
        antonyms: [],
        ai_generated: false,
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1000,
      },
    });

    const prompt = `${WORD_GENERATION_PROMPT}\n\nWord: "${word.trim()}"`;
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let wordData;
    try {
      let cleanJson = responseText.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
      const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanJson = jsonMatch[0];
      }

      wordData = JSON.parse(cleanJson);
    } catch {
      console.error("Failed to parse AI response:", responseText);
      return NextResponse.json({
        word,
        meaning_bn: "",
        example: "",
        pronunciation: "",
        synonyms: [],
        antonyms: [],
        ai_generated: false,
        parse_error: true,
      });
    }

    if (wordData.error) {
      return NextResponse.json({
        word,
        error: wordData.error,
        ai_generated: false,
      });
    }

    return NextResponse.json({
      ...wordData,
      ai_generated: true,
    });
  } catch (error: unknown) {
    console.error("Word generation error:", error);

    if (error && typeof error === "object" && "status" in error) {
      const statusError = error as { status: number };
      if (statusError.status === 429) {
        return NextResponse.json(
          {
            error: "The AI service is currently busy. Please try again in a moment.",
            rate_limited: true,
          },
          { status: 429 },
        );
      }
    }

    return NextResponse.json({ error: "Failed to generate word data" }, { status: 500 });
  }
}
