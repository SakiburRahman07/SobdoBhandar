'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { 
  MessageCircle, 
  X, 
  Send, 
  Loader2, 
  Bot,
  User,
  Sparkles
} from 'lucide-react'

// Helper functions (inline to avoid module-level import issues)
function extractNavigation(response: string): string | null {
  const match = response.match(/\{"navigate":\s*"([^"]+)"\}/)
  return match ? match[1] : null
}

function cleanResponse(response: string): string {
  return response.replace(/\{"navigate":\s*"[^"]+"\}/g, '').trim()
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'আসসালামু আলাইকুম! 👋 আমি শব্দভাণ্ডারের AI সহকারী। আপনাকে কিভাবে সাহায্য করতে পারি?'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      // Only send messages that are actual conversations (exclude initial welcome)
      const conversationMessages = messages.filter((_, index) => index > 0)
      const allMessages = [...conversationMessages, { role: 'user' as const, content: userMessage }]
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages
        }),
      })

      const data = await response.json()
      
      if (data.response) {
        // Check for navigation command
        const navRoute = extractNavigation(data.response)
        const cleanedResponse = cleanResponse(data.response)
        
        setMessages(prev => [...prev, { role: 'assistant', content: cleanedResponse }])
        
        // Navigate if route detected
        if (navRoute) {
          setTimeout(() => {
            router.push(navRoute)
            setIsOpen(false)
          }, 1000)
        }
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'দুঃখিত, একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।' 
        }])
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'নেটওয়ার্ক সমস্যা হয়েছে। ইন্টারনেট সংযোগ চেক করুন।' 
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <Button
          size="lg"
          onClick={() => setIsOpen(!isOpen)}
          className={`rounded-full w-14 h-14 shadow-lg ${
            isOpen 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'
          }`}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                className="relative"
              >
                <MessageCircle className="w-6 h-6" />
                <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-24 right-6 z-50 w-[350px] sm:w-[400px]"
          >
            <Card className="glass-card border-white/10 overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">AI সহকারী</h3>
                    <p className="text-xs text-white/70">সবসময় সাহায্যের জন্য প্রস্তুত</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="h-[350px] overflow-y-auto p-4 space-y-4 bg-background/50">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start gap-2 max-w-[85%] ${
                      message.role === 'user' ? 'flex-row-reverse' : ''
                    }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        message.role === 'user' 
                          ? 'bg-indigo-500/20' 
                          : 'bg-purple-500/20'
                      }`}>
                        {message.role === 'user' 
                          ? <User className="w-4 h-4 text-indigo-400" />
                          : <Bot className="w-4 h-4 text-purple-400" />
                        }
                      </div>
                      <div className={`rounded-2xl px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-indigo-500 text-white rounded-tr-sm'
                          : 'bg-white/10 text-foreground rounded-tl-sm'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white/10 rounded-2xl px-4 py-3 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                      <span className="text-sm text-muted-foreground">টাইপ করছে...</span>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-background/80">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="আপনার প্রশ্ন লিখুন..."
                    className="bg-white/5 border-white/10 focus:border-indigo-500"
                    disabled={loading}
                  />
                  <Button 
                    type="submit" 
                    size="icon"
                    disabled={loading || !input.trim()}
                    className="bg-indigo-500 hover:bg-indigo-600"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  &quot;dashboard এ যাও&quot; বলে navigate করুন
                </p>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
