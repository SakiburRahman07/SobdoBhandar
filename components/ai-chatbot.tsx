"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Loader2, Send, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function extractNavigation(response: string): string | null {
  const match = response.match(/\{"navigate":\s*"([^"]+)"\}/);
  return match ? match[1] : null;
}

function cleanResponse(response: string): string {
  return response.replace(/\{"navigate":\s*"[^"]+"\}/g, "").trim();
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi, I am the SobdoBhandar assistant. Ask where to go, what a page does, or how to use a feature.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const conversationMessages = messages.filter((_, index) => index > 0);
      const allMessages = [...conversationMessages, { role: "user" as const, content: userMessage }];

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: allMessages }),
      });

      const data = await response.json();

      if (data.response) {
        const navRoute = extractNavigation(data.response);
        const cleanedResponse = cleanResponse(data.response);

        setMessages((prev) => [...prev, { role: "assistant", content: cleanedResponse }]);

        if (navRoute) {
          setTimeout(() => {
            router.push(navRoute);
            setIsOpen(false);
          }, 900);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "I could not answer that just now. Please try again in a moment.",
          },
        ]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "The assistant could not reach the server. Check your connection and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          size="lg"
          onClick={() => setIsOpen((open) => !open)}
          className={`h-16 w-16 overflow-hidden rounded-full p-0 shadow-lg shadow-indigo-500/30 ${
            isOpen ? "bg-red-500 hover:bg-red-600" : "border-2 border-indigo-500/50 bg-transparent hover:border-indigo-400"
          }`}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                <X className="h-6 w-6" />
              </motion.div>
            ) : (
              <motion.div key="chat" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} className="h-full w-full">
                <Image src="/chatbot-icon.png" alt="AI assistant" width={64} height={64} className="h-full w-full object-cover" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-24 right-6 z-50 w-[350px] sm:w-[400px]"
          >
            <Card className="glass-card overflow-hidden border-white/10 shadow-2xl">
              <div className="bg-gradient-to-r from-indigo-500 to-cyan-500 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">AI assistant</h3>
                    <p className="text-xs text-white/70">Quick help, navigation, and product guidance</p>
                  </div>
                </div>
              </div>

              <div className="h-[350px] space-y-4 overflow-y-auto bg-background/50 p-4">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex max-w-[85%] items-start gap-2 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${message.role === "user" ? "bg-indigo-500/20" : "bg-cyan-500/20"}`}>
                        {message.role === "user" ? <User className="h-4 w-4 text-indigo-400" /> : <Bot className="h-4 w-4 text-cyan-300" />}
                      </div>
                      <div className={`rounded-2xl px-4 py-2 ${message.role === "user" ? "rounded-tr-sm bg-indigo-500 text-white" : "rounded-tl-sm bg-white/10 text-foreground"}`}>
                        <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {loading ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3">
                      <Loader2 className="h-4 w-4 animate-spin text-cyan-300" />
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </motion.div>
                ) : null}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSubmit} className="border-t border-white/10 bg-background/80 p-4">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Ask for help or say where you want to go"
                    className="border-white/10 bg-white/5 focus:border-indigo-500"
                    disabled={loading}
                  />
                  <Button type="submit" size="icon" disabled={loading || !input.trim()} className="bg-indigo-500 hover:bg-indigo-600">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Try: &ldquo;take me to dashboard&rdquo; or &ldquo;how do I add a word?&rdquo;
                </p>
              </form>
            </Card>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

