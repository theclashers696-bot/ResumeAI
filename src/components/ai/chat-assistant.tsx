"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User as UserIcon, Sparkles, RefreshCw, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const PROMPT_SUGGESTIONS = [
  "How do I describe a career gap on my resume?",
  "Write me 5 strong bullet points for a Product Manager role",
  "What salary should I negotiate for a Software Engineer in the US?",
  "How should I tailor my resume for FAANG companies?",
  "What are the most important ATS keywords for a Data Scientist?",
  "Help me prepare for a behavioral interview at Google",
];

function genSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function TypingIndicator() {
  return (
    <div className="flex gap-2.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white">
        <Bot className="h-4 w-4" />
      </div>
      <div className="flex items-center gap-1 rounded-2xl bg-muted px-4 py-2.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-2 w-2 rounded-full bg-muted-foreground/60"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, delay: i * 0.1, repeat: Infinity }}
          />
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ message, isLast, streaming }: { message: ChatMessage; isLast: boolean; streaming: boolean }) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2.5 ${isUser ? "justify-end" : ""}`}
    >
      {!isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white">
          <Bot className="h-4 w-4" />
        </div>
      )}
      <div
        className={`max-w-[82%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm ${
          isUser
            ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white"
            : "bg-muted text-foreground"
        }`}
      >
        {message.content || (streaming && isLast ? "" : "")}
        {streaming && isLast && !isUser && message.content === "" && null}
      </div>
      {isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
          <UserIcon className="h-4 w-4" />
        </div>
      )}
    </motion.div>
  );
}

export function ChatAssistant({ onGenerated }: { onGenerated?: () => void }) {
  const [sessionId] = useState(genSessionId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  async function handleSend() {
    const message = input.trim();
    if (!message || streaming) return;

    setInput("");
    setError(null);
    const history = messages;
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setStreaming(true);

    const abortController = new AbortController();
    abortRef.current = abortController;

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message, history }),
        signal: abortController.signal,
      });

      if (!res.ok || !res.body) {
        const json = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(json.error ?? "The assistant is unavailable right now.");
      }

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: "assistant", content: acc };
          return next;
        });
      }
      onGenerated?.();
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  function handleStop() {
    abortRef.current?.abort();
  }

  function handleReset() {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
    setInput("");
    setStreaming(false);
  }

  function handleSuggestion(suggestion: string) {
    setInput(suggestion);
  }

  return (
    <Card className="flex h-[680px] flex-col border-purple-200/50 bg-gradient-to-b from-card to-purple-50/10 dark:border-purple-900/30 dark:to-purple-950/5">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base">AI Career Assistant</CardTitle>
            <CardDescription className="text-xs">Resume expert · Interview coach · Career advisor</CardDescription>
          </div>
        </div>
        {messages.length > 0 && (
          <Button size="sm" variant="ghost" onClick={handleReset} className="gap-1.5 text-muted-foreground">
            <RefreshCw className="h-3.5 w-3.5" />
            New chat
          </Button>
        )}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3 overflow-hidden">
        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600/20 to-pink-600/20">
                  <Sparkles className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold">Your AI Career Assistant</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">Ask me anything about resumes, interviews, or career growth.</p>
                </div>
              </div>

              <div>
                <p className="mb-2.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Lightbulb className="h-3.5 w-3.5" /> Suggested questions
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {PROMPT_SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSuggestion(s)}
                      className="rounded-xl border border-border bg-card px-3 py-2.5 text-left text-xs text-muted-foreground transition-colors hover:border-purple-300 hover:bg-purple-50/50 hover:text-foreground dark:hover:border-purple-700 dark:hover:bg-purple-950/20"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {messages.map((m, i) => (
              <MessageBubble key={i} message={m} isLast={i === messages.length - 1} streaming={streaming} />
            ))}
          </AnimatePresence>

          {streaming && messages[messages.length - 1]?.role !== "assistant" && <TypingIndicator />}
          {streaming && messages[messages.length - 1]?.content === "" && <TypingIndicator />}

          <div ref={bottomRef} />
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive"
          >
            {error}
          </motion.p>
        )}

        <div className="flex gap-2">
          <Textarea
            placeholder="Ask about resumes, interviews, salary, career advice…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={streaming}
            rows={2}
            className="min-h-0 resize-none"
          />
          {streaming ? (
            <Button onClick={handleStop} size="icon" variant="outline" aria-label="Stop generation" className="shrink-0">
              <div className="h-3 w-3 rounded-sm bg-foreground" />
            </Button>
          ) : (
            <Button
              onClick={handleSend}
              disabled={!input.trim()}
              size="icon"
              aria-label="Send message"
              className="shrink-0 bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
