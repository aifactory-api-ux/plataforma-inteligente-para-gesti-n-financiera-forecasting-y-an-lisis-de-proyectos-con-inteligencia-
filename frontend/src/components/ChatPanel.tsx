import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/api/types";
import { classNames } from "@/utils/formatters";
import { formatRelativeTime } from "@/utils/formatters";

interface ChatPanelProps {
  messages: ChatMessage[];
  onSend: (msg: string) => void;
  loading: boolean;
}

export default function ChatPanel({ messages, onSend, loading }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      onSend(input.trim());
      setInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="card flex flex-col h-[500px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-neutral-900">FinSight Assistant</h3>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-semantic-success rounded-full"></span>
          <span className="text-xs text-neutral-500">Online</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="p-4 bg-primary-blue/10 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-primary-blue"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <p className="text-neutral-600 font-medium">Start a conversation</p>
            <p className="text-neutral-500 text-sm mt-1">
              Ask about budgets, forecasts, risks, or recommendations
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={classNames(
                "flex",
                msg.sender === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={classNames(
                  "max-w-[80%] rounded-lg p-3",
                  msg.sender === "user"
                    ? "bg-primary-blue text-white"
                    : "bg-neutral-100 text-neutral-900"
                )}
              >
                <p className="text-sm">{msg.message}</p>
                <p
                  className={classNames(
                    "text-xs mt-1",
                    msg.sender === "user" ? "text-white/70" : "text-neutral-500"
                  )}
                >
                  {formatRelativeTime(msg.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-neutral-100 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-neutral-200 pt-4">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 resize-none border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
            rows={2}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="btn-primary self-end"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
