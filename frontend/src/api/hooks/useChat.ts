import { useState, useCallback } from "react";
import { assistantClient } from "../client";
import { ChatMessage, ChatMessageCreate } from "@/api/types";

interface UseChatReturn {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  fetchMessages: (projectId: number) => Promise<void>;
  sendMessage: (projectId: number, message: string) => Promise<ChatMessage>;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async (projectId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await assistantClient.get<ChatMessage[]>(`/projects/${projectId}/chat/`);
      setMessages(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (projectId: number, message: string): Promise<ChatMessage> => {
    setLoading(true);
    setError(null);
    try {
      const response = await assistantClient.post<ChatMessage>(`/projects/${projectId}/chat/`, { message } as ChatMessageCreate);
      setMessages((prev) => [...prev, response.data]);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to send message");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    messages,
    loading,
    error,
    fetchMessages,
    sendMessage,
  };
}
