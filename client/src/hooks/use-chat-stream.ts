import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Message {
  id: number;
  role: "user" | "assistant" | "model"; // 'model' is mapped to 'assistant' for UI
  content: string;
}

export function useChatStream() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const queryClient = useQueryClient();

  // Create a conversation on mount if not exists (simplified logic)
  const createConversation = useMutation({
    mutationFn: async (title: string) => {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Failed to create conversation");
      return await res.json();
    },
    onSuccess: (data) => {
      setCurrentConversationId(data.id);
    }
  });

  useEffect(() => {
    if (!currentConversationId) {
      createConversation.mutate("Fraud Help Chat");
    }
  }, []);

  const sendMessage = async (content: string) => {
    if (!content.trim() || !currentConversationId) return;

    // Optimistic UI update
    const userMsg: Message = { id: Date.now(), role: "user", content };
    setMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);

    const assistantMsgId = Date.now() + 1;
    setMessages((prev) => [...prev, { id: assistantMsgId, role: "assistant", content: "" }]);

    try {
      abortControllerRef.current = new AbortController();
      
      const res = await fetch(`/api/conversations/${currentConversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) throw new Error("Failed to send message");
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantResponse = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.done) {
                break; 
              }
              if (data.content) {
                assistantResponse += data.content;
                setMessages((prev) => 
                  prev.map((msg) => 
                    msg.id === assistantMsgId 
                      ? { ...msg, content: assistantResponse } 
                      : msg
                  )
                );
              }
            } catch (e) {
              console.error("Error parsing SSE JSON", e);
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error("Stream error:", error);
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMsgId ? { ...msg, content: "Error: Could not get response." } : msg
        ));
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  return { messages, sendMessage, isStreaming };
}
