import { GoogleGenerativeAI } from '@google/generative-ai'

// Lazy initialization of Gemini client
let geminiClient: GoogleGenerativeAI | null = null

function getGeminiClient() {
  if (!geminiClient) {
    const apiKey = process.env.AI_API_KEY
    if (!apiKey) {
      throw new Error('AI_API_KEY is not set in environment variables')
    }
    geminiClient = new GoogleGenerativeAI(apiKey)
  }
  return geminiClient
}

const SYSTEM_PROMPT = `You are a helpful AI assistant for শব্দভাণ্ডার (Shabdabhandar), a Bengali vocabulary learning website. You help users learn English to Bangla vocabulary.

## Website Features:
- /dashboard - Main dashboard with stats, due words, streak
- /learn - Flashcard learning session with spaced repetition
- /words - View all saved vocabulary words
- /words/add - Add new vocabulary words
- /progress - Progress charts and statistics
- /profile - User profile and settings
- /leaderboard - Rankings and competition
- /suggest - Submit suggestions for the website

## Your Capabilities:
1. Answer questions about how to use the website
2. Explain vocabulary learning methods (spaced repetition, active recall)
3. Help understand English words and their meanings
4. Navigate users to different pages when asked
5. Provide encouragement and motivation

## Navigation Commands:
When the user wants to go somewhere, respond with a JSON object at the end of your message:
{"navigate": "/route"}

Examples:
- "dashboard এ যাও" → Include {"navigate": "/dashboard"}
- "নতুন শব্দ যোগ করতে চাই" → Include {"navigate": "/words/add"}
- "আমার progress দেখাও" → Include {"navigate": "/progress"}

## Language:
- Respond primarily in Bangla (Bengali)
- Use English for technical terms and vocabulary words
- Be friendly and encouraging

## Important:
- Keep responses concise
- Use emojis sparingly for friendliness
- Always be helpful and patient`

export async function chat(messages: { role: 'user' | 'assistant'; content: string }[]) {
  try {
    const genAI = getGeminiClient()
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // Convert messages to Gemini format
    const history = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }))

    const lastMessage = messages[messages.length - 1]

    const chat = model.startChat({
      history: history.length > 0 ? history : undefined,
      systemInstruction: SYSTEM_PROMPT,
    })

    const result = await chat.sendMessage(lastMessage.content)
    const response = result.response.text()

    return response || 'দুঃখিত, উত্তর দিতে পারছি না।'
  } catch (error) {
    console.error('AI Chat Error:', error)
    throw error
  }
}

export function extractNavigation(response: string): string | null {
  const match = response.match(/\{"navigate":\s*"([^"]+)"\}/)
  return match ? match[1] : null
}

export function cleanResponse(response: string): string {
  return response.replace(/\{"navigate":\s*"[^"]+"\}/g, '').trim()
}
