import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import {
  sendAiChatMessage,
  type AiChatMessage,
} from '@/features/ai/api/ai-api';
import {
  Bot,
  Send,
  HelpCircle,
  RotateCcw,
  User,
  ArrowLeft,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';

export const AiChatPage: React.FC = () => {
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of message list on new message or loading change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    // Append user message immediately
    const userMsg: AiChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Call POST /api/ai/chat
      // Omit conversationId on first message of a session, reuse returned afterward
      const response = await sendAiChatMessage(text, conversationId);

      // Store conversationId for subsequent messages in this session
      if (response.conversationId) {
        setConversationId(response.conversationId);
      }

      // Append assistant reply
      const botMsg: AiChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'assistant',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errText =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Unable to reach AI assistant. Please try again.';
      setErrorMessage(errText);
    } finally {
      setIsLoading(false);
      // Re-focus input
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetSession = () => {
    setMessages([]);
    setConversationId(undefined);
    setErrorMessage(null);
    setInputText('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Quick suggestion prompts
  const samplePrompts = [
    'What are post-donation care tips for first-time donors?',
    'What are universal donor and plasma compatibility rules?',
    'How do hydration and ferritin levels influence donor recovery?',
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-140px)] min-h-[580px] max-w-4xl mx-auto space-y-4">
        {/* Chat Header Bar */}
        <div className="bg-white rounded-2xl border border-line-soft px-5 py-4 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <Link
              to="/hospital/dashboard"
              className="p-2 rounded-xl text-ink-soft hover:text-ink hover:bg-paper transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2]" />
            </Link>

            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-crimson to-crimson-dark flex items-center justify-center text-white shadow-xs">
                <Bot className="w-5 h-5 stroke-[2]" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-serif font-bold text-ink leading-none">
                  AI Health & Wellness Assistant
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </span>
              </div>
              <p className="text-xs font-sans text-ink-soft mt-1">
                Clinical blood compatibility & donor health recovery guidance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                type="button"
                onClick={handleResetSession}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-line-soft text-xs font-sans font-semibold text-ink-soft hover:text-ink hover:bg-paper transition-colors cursor-pointer"
                title="Start a new conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Session</span>
              </button>
            )}
          </div>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 bg-white rounded-2xl border border-line-soft shadow-xs p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Empty State / Health Assistant Disclaimer */}
          {messages.length === 0 && (
            <div
              id="ai-chat-empty-state"
              className="h-full flex flex-col items-center justify-center text-center p-4 max-w-xl mx-auto space-y-5 animate-in fade-in duration-300"
            >
              <div className="w-16 h-16 rounded-3xl bg-crimson/10 border border-crimson/20 flex items-center justify-center text-crimson shadow-xs">
                <Bot className="w-8 h-8 stroke-[2]" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-ink">
                  Welcome to Legash Health Assistant
                </h2>
                <p className="text-xs sm:text-sm font-sans text-ink-soft leading-relaxed">
                  Ask questions about general health, donor nutrition, post-donation recovery timelines, and blood compatibility protocols.
                </p>
              </div>

              {/* Dedicated Help Center Disclaimer Notice Box (Required) */}
              <div className="w-full text-left p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-950 space-y-2 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Scope Notice & System Support</span>
                </div>
                <p className="text-xs font-sans leading-relaxed text-amber-900/90">
                  This AI assistant covers <strong>general health and wellness topics</strong>, not system how-to questions.
                </p>
                <div className="pt-1 flex items-center justify-between text-xs">
                  <span className="text-amber-800 font-medium">Need platform or portal help?</span>
                  <Link
                    to="/help"
                    className="inline-flex items-center gap-1 font-sans font-bold text-crimson hover:underline"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Help Center (Part 7) &rarr;</span>
                  </Link>
                </div>
              </div>

              {/* Quick Starter Suggestions */}
              <div className="w-full pt-2 space-y-2">
                <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-ink-soft uppercase tracking-wider">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>Suggested Prompts</span>
                </div>
                <div className="flex flex-col sm:flex-row flex-wrap gap-2 justify-center">
                  {samplePrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(prompt)}
                      className="text-left text-xs font-sans p-2.5 rounded-xl border border-line-soft bg-paper hover:bg-paper-dim text-ink hover:text-crimson hover:border-crimson/30 transition-all cursor-pointer shadow-2xs"
                    >
                      &ldquo;{prompt}&rdquo;
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Rendered Messages */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-crimson/10 border border-crimson/20 flex items-center justify-center text-crimson shrink-0 mt-1">
                  <Bot className="w-4 h-4 stroke-[2]" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 space-y-1.5 shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-crimson text-white rounded-tr-xs'
                    : 'bg-paper/70 border border-line-soft text-ink rounded-tl-xs'
                }`}
              >
                <div className="text-xs sm:text-sm font-sans leading-relaxed whitespace-pre-wrap break-words">
                  {msg.text}
                </div>
                <div
                  className={`text-[10px] font-mono text-right ${
                    msg.sender === 'user' ? 'text-red-200' : 'text-ink-soft/60'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-ink text-white flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4 stroke-[2]" />
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 justify-start animate-in fade-in duration-200">
              <div className="w-8 h-8 rounded-xl bg-crimson/10 border border-crimson/20 flex items-center justify-center text-crimson shrink-0 mt-1">
                <Bot className="w-4 h-4 stroke-[2]" />
              </div>
              <div className="p-4 rounded-2xl rounded-tl-xs bg-paper border border-line-soft flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-crimson animate-bounce" />
                <span
                  className="w-2 h-2 rounded-full bg-crimson animate-bounce"
                  style={{ animationDelay: '0.15s' }}
                />
                <span
                  className="w-2 h-2 rounded-full bg-crimson animate-bounce"
                  style={{ animationDelay: '0.3s' }}
                />
                <span className="text-xs font-mono text-ink-soft ml-1">
                  Assistant is typing...
                </span>
              </div>
            </div>
          )}

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-crimson/20 text-crimson text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-[11px] font-mono underline hover:text-crimson-dark"
              >
                Dismiss
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <div className="bg-white rounded-2xl border border-line-soft p-3 shadow-xs">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2"
          >
            <textarea
              ref={inputRef}
              id="ai-chat-input"
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="Ask a health, donor recovery, or blood compatibility question..."
              className="flex-1 max-h-32 min-h-[44px] py-2.5 px-3.5 text-xs sm:text-sm font-sans bg-paper/50 hover:bg-paper focus:bg-white rounded-xl border border-line-soft focus:outline-hidden focus:ring-2 focus:ring-crimson/30 resize-none transition-all"
            />

            <button
              id="ai-chat-send-btn"
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="h-[44px] px-4 rounded-xl bg-crimson hover:bg-crimson-dark active:scale-95 text-white font-sans font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
              aria-label="Send Message"
            >
              <Send className="w-4 h-4 stroke-[2]" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>

          <div className="mt-2 px-1 flex items-center justify-between text-[11px] font-sans text-ink-soft/70">
            <span>Press Enter to send, Shift + Enter for new line</span>
            <span className="hidden sm:inline">
              For system technical issues, use the{' '}
              <Link to="/help" className="text-crimson hover:underline">
                Help Center
              </Link>
            </span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AiChatPage;
