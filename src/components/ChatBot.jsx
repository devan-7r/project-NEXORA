import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Mic, Send, X, Bot, User, Volume2, Sparkles } from "lucide-react";
import { processChatQuery } from "../utils/demoData";

export default function ChatBot({ 
  invoices, 
  vendors, 
  setActiveTab, 
  onOpenInvoice, 
  voiceSettings 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Welcome back. I found two invoices flagged as high risk today. I can explain any fraud score or vendor rating. How can I assist you?",
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Set up browser speech recognition if supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-IN";

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setQuery(text);
        handleSend(text);
      };

      rec.onerror = () => {
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const handleVoiceListen = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleSend = (textToSend = query) => {
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: textToSend,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setQuery("");
    setIsTyping(true);

    // Simulate AI response logic
    setTimeout(() => {
      const response = processChatQuery(textToSend, invoices, vendors);
      
      const botMsg = {
        id: Date.now() + 1,
        sender: "bot",
        text: response.text,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);

      // Perform speech synthesis feedback if voice is enabled in Settings
      if (voiceSettings.enabled) {
        speakResponse(response.text);
      }

      // Execute copilot command hooks (e.g. routing active tabs or opening invoice panels)
      if (response.action) {
        setTimeout(() => {
          executeAssistantAction(response.action);
        }, 1200);
      }
    }, 1500);
  };

  const speakResponse = (text) => {
    if (!window.speechSynthesis) return;

    // Clean markdown characters for cleaner speech output
    const cleanText = text.replace(/[*#_]/g, "");
    
    // Stop any currently playing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.volume = parseFloat(voiceSettings.volume) || 1.0;
    utterance.pitch = parseFloat(voiceSettings.pitch) || 1.0;
    utterance.rate = parseFloat(voiceSettings.rate) || 1.0;
    
    window.speechSynthesis.speak(utterance);
  };

  const executeAssistantAction = (action) => {
    switch (action.type) {
      case "VIEW_INVOICE":
        onOpenInvoice(action.invoiceNumber);
        break;
      case "GO_TO_TAB":
        setActiveTab(action.tab);
        break;
      case "FILTER_RISK":
        setActiveTab("invoices");
        // We will pass down filter cues if needed, handled globally
        break;
      case "FILTER_STATUS":
        setActiveTab("invoices");
        break;
      default:
        break;
    }
  };

  const quickQuestions = [
    "Why is invoice INV-2026-002 risky?",
    "Show pending review queue",
    "Show today's fraud report",
    "Why is the AI confident?"
  ];

  return (
    <>
      {/* Floating Assist Trigger Button (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-[90]">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-4 rounded-full border shadow-[0_4px_30px_rgba(59,130,246,0.3)] flex items-center justify-center transition-all duration-300 relative group ${
            isOpen 
              ? "bg-red-500 border-red-400 hover:rotate-90 text-white" 
              : "bg-blue-600 border-blue-500 text-white hover:scale-105"
          }`}
          title="Ask FraudShield AI"
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6 animate-pulse" />}
          
          {/* Pulse ring indicator */}
          {!isOpen && (
            <span className="absolute inset-0 rounded-full border-2 border-blue-500/40 animate-ping pointer-events-none" />
          )}

          {/* Hover Tooltip */}
          {!isOpen && (
            <div className="absolute right-14 bg-slate-900 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
              Ask FraudShield AI
            </div>
          )}
        </button>
      </div>

      {/* Main chat slide panel drawer */}
      {isOpen && (
        <div 
          className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-32px)] h-[500px] glass-panel shadow-[0_15px_50px_rgba(0,0,0,0.7)] border border-white/10 flex flex-col z-[90] overflow-hidden animate-slide-in-toast"
          style={{
            background: "rgba(10, 11, 13, 0.95)"
          }}
        >
          {/* Header */}
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-400" />
              <div>
                <span className="font-bold text-sm text-white">FraudShield AI Copilot</span>
                <span className="block text-[8px] text-emerald-400 font-semibold tracking-wider uppercase">Secure Link Active</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m) => (
              <div 
                key={m.id}
                className={`flex gap-3 max-w-[85%] ${m.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                  m.sender === "user" 
                    ? "bg-slate-700 text-white" 
                    : "bg-blue-600/20 border border-blue-500/30 text-blue-400"
                }`}>
                  {m.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div>
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    m.sender === "user" 
                      ? "bg-blue-600 text-white rounded-tr-none" 
                      : "bg-white/5 border border-white/5 text-gray-200 rounded-tl-none"
                  }`}>
                    {/* Convert markdown lines back to visual bullets simply */}
                    {m.text.split("\n").map((line, idx) => (
                      <p key={idx} className={idx > 0 ? "mt-1.5" : ""}>
                        {line.replace(/\*\*(.*?)\*\*/g, "$1")}
                      </p>
                    ))}
                  </div>
                  
                  {/* TTS speak button for bot replies */}
                  {m.sender === "bot" && window.speechSynthesis && (
                    <button 
                      onClick={() => speakResponse(m.text)} 
                      className="p-1.5 text-gray-500 hover:text-white transition-colors mt-1"
                      title="Speak Response"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-7 h-7 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white/5 border border-white/5 p-3 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick recommendations */}
          {messages.length === 1 && (
            <div className="px-4 pb-2">
              <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider block mb-1.5">Suggested Queries</span>
              <div className="flex flex-wrap gap-1.5">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    className="text-[10px] bg-slate-900 border border-white/5 hover:border-white/20 text-gray-400 hover:text-white px-2 py-1.5 rounded-lg text-left"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Listening Overlay Waveform */}
          {isListening && (
            <div className="bg-slate-950/90 border-t border-white/5 p-3 flex items-center justify-between">
              <span className="text-xs text-blue-400 font-semibold animate-pulse tracking-wide">Listening via voice...</span>
              
              {/* Waveform graphic */}
              <div className="waveform-container" style={{ height: "25px" }}>
                <span className="waveform-bar" style={{ width: "2px" }} />
                <span className="waveform-bar" style={{ width: "2px" }} />
                <span className="waveform-bar" style={{ width: "2px" }} />
                <span className="waveform-bar" style={{ width: "2px" }} />
                <span className="waveform-bar" style={{ width: "2px" }} />
              </div>

              <button 
                onClick={handleVoiceListen}
                className="text-xs px-2 py-1 bg-red-600 rounded text-white"
              >
                Stop
              </button>
            </div>
          )}

          {/* Input Panel */}
          <div className="p-3 border-t border-white/5 bg-white/5 flex gap-2">
            {/* Voice microphone button */}
            <button
              onClick={handleVoiceListen}
              className={`p-2 rounded-lg border flex items-center justify-center transition-all ${
                isListening 
                  ? "bg-red-600 border-red-500 text-white" 
                  : "border-white/5 text-gray-400 hover:text-white hover:bg-white/5"
              }`}
              title="Speak voice query"
            >
              <Mic className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about invoices, vendors, or reports..."
              className="input-premium flex-1 py-1.5 text-xs bg-black/40 border-white/5"
            />
            
            <button
              onClick={() => handleSend()}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
