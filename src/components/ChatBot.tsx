import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Loader2, User, Bot, Minimize2, Maximize2 } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: 'Hi! I am TaskAI, your intelligent assistant for this platform. I can help you find jobs, post tasks, and manage your profile. How can I assist you today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const viteKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
      const processKey = typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : undefined;
      const apiKey = viteKey || processKey;
      
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey === '') {
        throw new Error("API_KEY_MISSING");
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: input }] }],
        config: {
          systemInstruction: `You are TaskAI, a highly intelligent and friendly assistant for a professional job and task platform. 
          
          Your core capabilities include:
          1. Job Matching: Helping workers find relevant jobs based on their skills and location.
          2. Task Management: Assisting hirers in creating clear and effective job postings.
          3. Platform Navigation: Guiding users through their dashboard, profile settings, and application history.
          4. Real-time Support: Answering questions about how the platform works, including bookings, payments, and safety tips.
          
          Platform Specifics:
          - Users can be 'Hirers' (who post jobs) or 'Workers' (who apply for jobs).
          - Jobs have statuses: Open, Closed, Completed, Cancelled.
          - Hirers can 'Hire Now' to create a scheduled booking.
          - Safety is a priority: Users should meet in public and verify IDs.
          
          Be concise, professional, and always aim to provide accurate, actionable advice. If you don't know something specific about a user's private data, guide them to check their Dashboard.`,
        },
      });

      const botMessage = {
        role: 'bot',
        content: response.text || "I'm sorry, I couldn't process that request.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      console.error("ChatBot Error Detail:", error);
      let errorMessageContent = "Something went wrong. Please check your console for details.";
      
      if (error.message === "API_KEY_MISSING") {
        errorMessageContent = "MISSING API KEY: Please add 'VITE_GEMINI_API_KEY=your_key' to your .env file and RESTART your dev server.";
      } else if (error.message?.includes("API key not valid") || error.message?.includes("API_KEY_INVALID")) {
        errorMessageContent = "INVALID API KEY: The key in your .env file is not valid. Please double-check it at the Google AI Studio console.";
      } else if (error.message?.includes("fetch failed") || !navigator.onLine) {
        errorMessageContent = "CONNECTION ERROR: Please check your internet connection and ensure your API key has access to Gemini.";
      } else if (error.message) {
        // Show actual error message to help user debug
        errorMessageContent = `Chat Error: ${error.message}`;
      }
      
      const errorMessage = {
        role: 'bot',
        content: errorMessageContent,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="chatbot-container" className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="chatbot-window"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              height: isMinimized ? '64px' : '500px',
              width: '350px'
            }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden mb-4 flex flex-col"
          >
            {/* Header */}
            <div id="chatbot-header" className="bg-indigo-600 p-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <div className="bg-white/20 p-1.5 rounded-lg">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">TaskAI</h3>
                  <div className="flex items-center space-x-1">
                    <div className="h-1.5 w-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-[10px] text-indigo-100">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button 
                  id="chatbot-minimize-btn"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </button>
                <button 
                  id="chatbot-close-btn"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div id="chatbot-messages" className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                  {messages.map((msg, idx) => (
                    <motion.div
                      initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={idx}
                      className={cn(
                        "flex items-start space-x-2",
                        msg.role === 'user' ? "flex-row-reverse space-x-reverse" : "flex-row"
                      )}
                    >
                      <div className={cn(
                        "shrink-0 p-1.5 rounded-lg",
                        msg.role === 'user' ? "bg-indigo-100 text-indigo-600" : "bg-white text-gray-600 shadow-sm"
                      )}>
                        {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                      <div className={cn(
                        "max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed",
                        msg.role === 'user' 
                          ? "bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-100" 
                          : "bg-white text-gray-700 rounded-tl-none shadow-sm border border-gray-100"
                      )}>
                        {msg.content}
                        <div className={cn(
                          "text-[9px] mt-1 opacity-50",
                          msg.role === 'user' ? "text-right" : "text-left"
                        )}>
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <div id="chatbot-loading" className="flex items-start space-x-2">
                      <div className="shrink-0 p-1.5 rounded-lg bg-white text-gray-600 shadow-sm">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100">
                        <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div id="chatbot-input-container" className="p-4 bg-white border-t border-gray-100 shrink-0">
                  <form 
                    id="chatbot-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSend();
                    }}
                    className="relative"
                  >
                    <input 
                      id="chatbot-input-field"
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask me anything..."
                      className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                    />
                    <button 
                      id="chatbot-send-btn"
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-100"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div id="chatbot-toggle-container" className="flex items-center">
        {!isOpen && (
          <motion.div
            id="chatbot-label"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mr-3 bg-white px-4 py-2 rounded-xl shadow-xl border border-gray-100 text-indigo-600 font-bold text-sm"
          >
            Task AI
          </motion.div>
        )}
        <motion.button
          id="chatbot-toggle-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setIsOpen(!isOpen);
            setIsMinimized(false);
          }}
          className={cn(
            "p-4 rounded-full shadow-2xl flex items-center justify-center transition-all border-2 border-indigo-600 bg-white text-indigo-600",
            isOpen && "bg-indigo-50"
          )}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
        </motion.button>
      </div>
    </div>
  );
}
