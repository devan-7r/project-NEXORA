import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, Sparkles } from "lucide-react";

export default function VoiceAssistantView({ invoices = [], voiceSettings = {} }) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [voiceLogs, setVoiceLogs] = useState([
    { time: new Date().toLocaleTimeString(), text: "Voice Assistant initialized. Ready for commands." }
  ]);

  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = "en-IN";

      rec.onstart = () => {
        setIsListening(true);
        addLog("Microphone streaming active. Listening for commands...");
      };

      rec.onresult = (event) => {
        const text = event.results[event.results.length - 1][0].transcript.trim();
        setVoiceText(text);
        addLog(`Recognized: "${text}"`);
        handleVoiceCommand(text);
      };

      rec.onerror = (e) => {
        addLog(`Speech recognition error: ${e.error}`);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
        addLog("Speech recognition deactivated.");
      };

      recognitionRef.current = rec;
    }
  }, [invoices]);

  const addLog = (text) => {
    setVoiceLogs(prev => [
      { time: new Date().toLocaleTimeString(), text },
      ...prev
    ]);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      synthRef.current.cancel();
      setIsSpeaking(false);
      recognitionRef.current.start();
    }
  };

  const handleVoiceCommand = (command) => {
    const cmd = command.toLowerCase();
    
    // Check if command specifies a specific invoice number
    const invoiceMatch = cmd.match(/inv-2026-\d+/);
    if (invoiceMatch) {
      const invNum = invoiceMatch[0].toUpperCase();
      const invoice = invoices.find(i => i.invoiceNumber === invNum);
      if (invoice) {
        speakReport(invoice);
        return;
      } else {
        speakText(`Invoice ${invNum} was not found in the records.`);
        return;
      }
    }
    
    if (cmd.includes("read report") || cmd.includes("explain fraud") || cmd.includes("analyze")) {
      // Find the first high risk or suspicious invoice
      const alertInvoice = invoices.find(inv => inv.riskLevel === "HIGH RISK" || inv.riskLevel === "SUSPICIOUS") || invoices[0];
      if (alertInvoice) {
        speakReport(alertInvoice);
      } else {
        speakText("No invoices found in database to analyze.");
      }
    } else if (cmd.includes("hello") || cmd.includes("hi assistant")) {
      speakText("Hello! I am your FraudShield voice auditor. Speak 'read report' to analyze flagged invoices.");
    } else if (cmd.includes("stop") || cmd.includes("cancel")) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      speakText("Speech synthesis aborted.");
    } else {
      speakText(`Command not recognized: ${command}. Try saying: read report.`);
    }
  };

  const speakText = (text) => {
    if (!synthRef.current || !voiceSettings.enabled) return;
    
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = voiceSettings.volume ?? 1.0;
    utterance.pitch = voiceSettings.pitch ?? 1.0;
    utterance.rate = voiceSettings.rate ?? 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
    addLog(`Auditory playback: "${text}"`);
  };

  const speakReport = (invoice) => {
    const text = `Analyzing Invoice ${invoice.invoiceNumber} from ${invoice.vendorName}. Risk assessment level is ${invoice.riskLevel} with a fraud risk score of ${invoice.fraudScore} percent. Key anomalies identified: ${invoice.aiExplanation || "None"}. Recommended auditor action: ${invoice.aiRecommendations?.[0] || "None"}`;
    speakText(text);
  };

  // Cleanup synthesis on unmount
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="glass-panel p-6 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-blue-500/10 to-transparent blur-3xl pointer-events-none" />
        
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
            Neural Voice Assistant Workspace
          </h2>
          <p className="text-gray-400 text-xs mt-1 max-w-xl">
            Interactive audit telemetry control via WebSpeech channels. Speak keywords to fetch reports and trigger ledger diagnostics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left assistant controls card */}
        <div className="glass-panel p-6 flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden min-h-[350px]">
          
          {/* Animated soundwaves when speaking or listening */}
          {(isListening || isSpeaking) ? (
            <div className="flex items-end justify-center gap-1.5 h-16 w-full">
              {[...Array(9)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1 rounded-full bg-gradient-to-t ${isListening ? "from-blue-600 to-cyan-400" : "from-emerald-600 to-teal-400"}`}
                  style={{
                    height: '20px',
                    animation: `soundwave 0.8s ease-in-out infinite alternate`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: `${0.4 + Math.random() * 0.8}s`
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full border border-white/5 bg-slate-950/80 flex items-center justify-center text-gray-500">
              <Mic className="w-6 h-6 opacity-30" />
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-md font-bold text-white uppercase tracking-wider">
              {isListening ? "Listening Stream Active" : isSpeaking ? "Auditory Playback Active" : "Voice Gateway Idle"}
            </h3>
            <p className="text-xs text-gray-400 max-w-[200px] mx-auto leading-relaxed">
              {isListening ? "Speak a command clearly..." : isSpeaking ? "Reading report details aloud..." : "Click authorization button to start streaming."}
            </p>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={toggleListening}
              className={`p-4 rounded-full border transition-all duration-300 ${
                isListening 
                  ? "bg-red-500/20 border-red-500/40 text-red-400 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.25)]" 
                  : "bg-blue-600/10 border-blue-500/30 hover:border-blue-500/60 text-blue-400 hover:bg-blue-600/20"
              }`}
              title={isListening ? "Mute Microphone" : "Activate Microphone"}
            >
              {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            <button 
              onClick={() => {
                const alertInvoice = invoices.find(inv => inv.riskLevel === "HIGH RISK" || inv.riskLevel === "SUSPICIOUS") || invoices[0];
                if (alertInvoice) speakReport(alertInvoice);
              }}
              className="p-4 rounded-full bg-emerald-600/10 border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-400 hover:bg-emerald-600/20 transition-all"
              title="Speak Report"
              disabled={isListening}
            >
              <Volume2 className="w-6 h-6" />
            </button>
          </div>

          {/* Quick instructions inline */}
          <div className="text-[10px] text-gray-500 font-mono">
            {isListening && voiceText && (
              <div className="bg-black/40 border border-white/5 px-3 py-1.5 rounded-lg text-blue-400">
                "{voiceText}"
              </div>
            )}
          </div>
        </div>

        {/* Right list command instructions */}
        <div className="glass-panel p-6 md:col-span-2 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Supported Voice Directives</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl border border-white/5 bg-slate-950/30 space-y-1">
                <span className="font-bold text-gray-200 block">"Read Report"</span>
                <span className="text-[10px] text-gray-400">Locates the highest flagged threat invoice in the dashboard ledger and explains its AI risk factors.</span>
              </div>

              <div className="p-3.5 rounded-xl border border-white/5 bg-slate-950/30 space-y-1">
                <span className="font-bold text-gray-200 block">"Hello"</span>
                <span className="text-[10px] text-gray-400">Triggers simple handshake response to test synthesis volume and status settings.</span>
              </div>

              <div className="p-3.5 rounded-xl border border-white/5 bg-slate-950/30 space-y-1">
                <span className="font-bold text-gray-200 block">"Stop" / "Cancel"</span>
                <span className="text-[10px] text-gray-400">Instantly cancels any running speech synthesis utterances and frees the synthesizer.</span>
              </div>

              <div className="p-3.5 rounded-xl border border-white/5 bg-slate-950/30 space-y-1">
                <span className="font-bold text-gray-200 block">"Explain Fraud"</span>
                <span className="text-[10px] text-gray-400">Gives structured auditor reasons regarding why the invoice was flagged.</span>
              </div>
            </div>
          </div>

          {/* Voice logs */}
          <div className="space-y-2 pt-4 border-t border-white/5">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Live Voice Logs</h4>
            <div className="bg-black/50 border border-white/5 rounded-xl p-3.5 h-32 overflow-y-auto font-mono text-[10px] text-gray-400 space-y-2">
              {voiceLogs.map((log, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-gray-600">[{log.time}]</span>
                  <span className={log.text.startsWith("Recognized") ? "text-blue-400" : log.text.startsWith("Auditory") ? "text-emerald-400" : "text-gray-400"}>
                    {log.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Styled soundwave keyframes */}
      <style>{`
        @keyframes soundwave {
          0% { height: 8px; }
          100% { height: 55px; }
        }
      `}</style>

    </div>
  );
}
