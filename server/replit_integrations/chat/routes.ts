import type { Express, Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";
import { chatStorage } from "./storage";

// === CONFIGURATION ===
// Using 'gemini-1.5-flash' for the best free tier experience (15 RPM)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export function registerChatRoutes(app: Express): void {
  // Get all conversations
  app.get("/api/conversations", async (req: Request, res: Response) => {
    try {
      const conversations = await chatStorage.getAllConversations();
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  // Get single conversation with messages
  app.get("/api/conversations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const conversation = await chatStorage.getConversation(id);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      const messages = await chatStorage.getMessagesByConversation(id);
      res.json({ ...conversation, messages });
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  // Create new conversation
  app.post("/api/conversations", async (req: Request, res: Response) => {
    try {
      const { title } = req.body;
      const conversation = await chatStorage.createConversation(title || "New Chat");
      res.status(201).json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  // Delete conversation
  app.delete("/api/conversations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await chatStorage.deleteConversation(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ error: "Failed to delete conversation" });
    }
  });

  // Send message and get AI response (streaming)
  app.post("/api/conversations/:id/messages", async (req: Request, res: Response) => {
    try {
      const conversationId = parseInt(req.params.id);
      const { content } = req.body;

      // 1. Save user message to DB
      await chatStorage.createMessage(conversationId, "user", content);

      // 2. Get conversation history for context
      const messages = await chatStorage.getMessagesByConversation(conversationId);
      
      const systemInstruction = "You are an AI bot which is in a cyber crime prevention website, you must only include data related to online fraud, bank fraud, cyber bullying, cyber fraud, deepfakes, etc. and only tell information about it.";
      
      // 3. Format messages for Gemini API
      const chatMessages = messages.map((m, index) => {
        let text = m.content;
        if (m.role === "user" && index === messages.length - 1) {
          text = `${systemInstruction}\n\nUser Query: ${text}`;
        }
        return {
          role: m.role === "user" ? "user" : "model",
          parts: [{ text }],
        };
      });

      // 4. Set up Server-Sent Events (SSE) for streaming
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      // 5. Stream response from Gemini
      const stream = await ai.models.generateContentStream({
        model: "gemini-3-flash-preview",
        contents: chatMessages,
      });

      let fullResponse = "";

      for await (const chunk of stream) {
        // FIX: Check 'chunk.text' as a property OR 'candidates' array.
        // Do NOT call .text() as a function.
        const content = chunk.text || chunk.candidates?.[0]?.content?.parts?.[0]?.text || "";
        
        if (content) {
          fullResponse += content;
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      // 6. Save assistant message to DB
      await chatStorage.createMessage(conversationId, "assistant", fullResponse);

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Error sending message:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "Failed to send message" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "Failed to send message" });
      }
    }
  });
}