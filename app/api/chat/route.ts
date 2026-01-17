import { NextRequest, NextResponse } from 'next/server'
import { chat } from '@/lib/ai'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    // Get AI response
    const response = await chat(messages)

    // Save chat history if user is logged in
    if (user && messages.length > 0) {
      const lastUserMessage = messages[messages.length - 1]
      if (lastUserMessage.role === 'user') {
        await supabase.from('chat_messages').insert([
          { user_id: user.id, message: lastUserMessage.content, role: 'user' },
          { user_id: user.id, message: response, role: 'assistant' },
        ])
      }
    }

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Chat API Error:', error)
    return NextResponse.json(
      { error: 'Failed to get AI response' },
      { status: 500 }
    )
  }
}
