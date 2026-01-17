import { GoogleGenerativeAI } from '@google/generative-ai'

// Lazy initialization of Gemini client
let geminiClient: GoogleGenerativeAI | null = null

function getGeminiClient() {
  if (!geminiClient) {
    const apiKey = process.env.AI_API_KEY
    if (!apiKey) {
      return null
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
    
    // If no API key configured, return a helpful fallback
    if (!genAI) {
      return getFallbackResponse(messages[messages.length - 1]?.content || '')
    }
    
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_PROMPT,
    })

    // Filter to only include actual conversation messages
    const validMessages = messages.filter(msg => msg.role === 'user' || msg.role === 'assistant')
    
    // Find the first user message
    const firstUserIndex = validMessages.findIndex(msg => msg.role === 'user')
    
    if (firstUserIndex === -1) {
      return 'আপনাকে কিভাবে সাহায্য করতে পারি?'
    }

    // Get messages starting from first user message
    const chatMessages = validMessages.slice(firstUserIndex)
    
    // Simple single message
    if (chatMessages.length === 1) {
      const result = await model.generateContent(chatMessages[0].content)
      return result.response.text() || 'দুঃখিত, উত্তর দিতে পারছি না।'
    }

    // Build history for multi-turn conversation
    const history = chatMessages.slice(0, -1).map(msg => ({
      role: msg.role === 'user' ? 'user' as const : 'model' as const,
      parts: [{ text: msg.content }]
    }))

    const lastMessage = chatMessages[chatMessages.length - 1]

    const chatSession = model.startChat({ history })
    const result = await chatSession.sendMessage(lastMessage.content)

    return result.response.text() || 'দুঃখিত, উত্তর দিতে পারছি না।'
    
  } catch (error: unknown) {
    console.error('AI Chat Error:', error)
    
    // Handle rate limit errors gracefully
    if (error && typeof error === 'object' && 'status' in error) {
      const statusError = error as { status: number }
      if (statusError.status === 429) {
        return 'দুঃখিত, এই মুহূর্তে AI সার্ভার ব্যস্ত। কিছুক্ষণ পর আবার চেষ্টা করুন। 🙏'
      }
    }
    
    // Return fallback for any error
    const lastContent = messages[messages.length - 1]?.content || ''
    return getFallbackResponse(lastContent)
  }
}

// Fallback responses when AI is unavailable
function getFallbackResponse(userMessage: string): string {
  const lowerMsg = userMessage.toLowerCase()
  
  // Navigation requests
  if (lowerMsg.includes('dashboard') || lowerMsg.includes('ড্যাশবোর্ড')) {
    return 'আপনাকে ড্যাশবোর্ডে নিয়ে যাচ্ছি! {"navigate": "/dashboard"}'
  }
  if (lowerMsg.includes('learn') || lowerMsg.includes('শিখ') || lowerMsg.includes('শেখ')) {
    return 'চলুন শেখা শুরু করি! {"navigate": "/learn"}'
  }
  if (lowerMsg.includes('word') || lowerMsg.includes('শব্দ')) {
    return 'আপনার শব্দ তালিকা দেখাচ্ছি! {"navigate": "/words"}'
  }
  if (lowerMsg.includes('progress') || lowerMsg.includes('অগ্রগতি')) {
    return 'আপনার অগ্রগতি দেখাচ্ছি! {"navigate": "/progress"}'
  }
  if (lowerMsg.includes('profile') || lowerMsg.includes('প্রোফাইল')) {
    return 'প্রোফাইল পেজে যাচ্ছি! {"navigate": "/profile"}'
  }
  if (lowerMsg.includes('leaderboard') || lowerMsg.includes('র‍্যাংক')) {
    return 'লিডারবোর্ড দেখাচ্ছি! {"navigate": "/leaderboard"}'
  }
  
  // Default helpful response
  return `আমি শব্দভাণ্ডারের সহকারী! 📚

আমি আপনাকে সাহায্য করতে পারি:
• **শিখুন** - ফ্ল্যাশকার্ড দিয়ে শব্দ শিখতে
• **শব্দ যোগ করুন** - নতুন vocabulary যোগ করতে
• **অগ্রগতি দেখুন** - আপনার progress দেখতে

কোথায় যেতে চান বলুন!`
}

export function extractNavigation(response: string): string | null {
  const match = response.match(/\{"navigate":\s*"([^"]+)"\}/)
  return match ? match[1] : null
}

export function cleanResponse(response: string): string {
  return response.replace(/\{"navigate":\s*"[^"]+"\}/g, '').trim()
}
