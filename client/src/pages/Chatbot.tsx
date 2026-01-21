import { Navbar } from "@/components/Navbar";
import { useChatStream } from "@/hooks/use-chat-stream";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Bot, User, Loader2, Brain } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import type { MentalEffect } from "@shared/schema";

export default function Chatbot() {
  const { messages, sendMessage, isStreaming } = useChatStream();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: mentalEffects } = useQuery<MentalEffect[]>({
    queryKey: ["/api/mental-effects"],
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <div className="min-h-screen bg-black flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 container max-w-5xl mx-auto p-4 md:p-6 pb-20">
        <div className="mb-6 text-center space-y-2">
          <h1 className="text-3xl font-bold font-heading text-white">
            AI Safety Assistant
          </h1>
          <p className="text-white/60">
            Ask about suspicious messages, safety tips, or how to report fraud.
          </p>
        </div>

        {/* Chat Interface - Fixed Height */}
        <div className="h-[70vh] min-h-[500px] mb-16 bg-black/40 backdrop-blur-xl rounded-2xl shadow-lg border border-white/10 overflow-hidden flex flex-col">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-white/20 space-y-4">
                <Bot className="h-16 w-16" />
                <p>No messages yet. Start a conversation!</p>
              </div>
            )}

            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role !== "user" && (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                )}

                <div
                  className={`
                  max-w-[80%] p-4 rounded-2xl whitespace-pre-wrap leading-relaxed
                  ${
                    msg.role === "user"
                      ? "bg-secondary text-white rounded-br-none shadow-[0_0_15px_rgba(244,41,126,0.2)]"
                      : "bg-white/10 text-white rounded-bl-none border border-white/10"
                  }
                `}
                >
                  {msg.content ||
                    (isStreaming &&
                    msg.id === messages[messages.length - 1].id ? (
                      <span className="animate-pulse">Thinking...</span>
                    ) : (
                      ""
                    ))}
                </div>

                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 border border-secondary/30">
                    <User className="h-5 w-5 text-secondary" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <div className="p-4 border-t border-white/10 bg-black/20">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question here..."
                className="flex-1 h-12 rounded-xl border-white/10 bg-white/5 text-white focus:ring-primary placeholder:text-white/20"
                disabled={isStreaming}
              />
              <Button
                type="submit"
                size="icon"
                className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 shrink-0"
                disabled={isStreaming || !input.trim()}
              >
                {isStreaming ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Mental Effects Section - Mirrored from Safety.tsx */}
        <section className="animate-in fade-in slide-in-from-bottom-10 duration-700">
          <div className="flex items-center gap-2 mb-8 justify-center">
            <Brain className="h-6 w-6 text-secondary animate-pulse" />
            <h2 className="text-3xl font-bold text-white font-heading">
              Mental Effects of Cyber Crime
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {mentalEffects?.map((effect) => (
              <Card
                key={effect.id}
                className="p-6 overflow-hidden flex flex-col bg-black/40 border-white/10 hover:border-primary/50 transition-all"
              >
                {effect.imageUrl ? (
                  <div className="h-48 w-full bg-white/5 mb-6 rounded-lg overflow-hidden">
                    <img
                      src={effect.imageUrl}
                      alt={effect.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-48 w-full bg-white/5 mb-6 rounded-lg flex items-center justify-center border-2 border-dashed border-white/10">
                    <Brain className="h-12 w-12 text-white/20" />
                  </div>
                )}
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2 text-white">
                  <span
                    className={`w-2 h-2 rounded-full ${effect.type === "psychological" ? "bg-primary" : "bg-accent"}`}
                  />
                  {effect.title}
                </h3>
                <p className="text-white/60 leading-relaxed">
                  {effect.description}
                </p>
                <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-xs uppercase tracking-wider font-bold text-white/20">
                  <span>Category</span>
                  <span
                    className={
                      effect.type === "psychological"
                        ? "text-primary"
                        : "text-accent"
                    }
                  >
                    {effect.type} Impact
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
