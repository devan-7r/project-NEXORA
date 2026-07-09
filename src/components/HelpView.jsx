import React from "react";
import { HelpCircle, BookOpen, KeyRound, PlayCircle, MessageSquare } from "lucide-react";

export default function HelpView() {
  const faqs = [
    { q: "How does the AI compute the Fraud Risk Score?", a: "FraudShield AI runs a multi-agent validation audit. It inspects duplicate invoice records, validates GSTIN databases, analyzes bank routing details, and correlates transaction values against historical vendor baselines." },
    { q: "What is the difference between Fraud Score and AI Confidence?", a: "Fraud Score measures the likelihood of transaction risk (0% being perfectly safe, 100% being confirmed fraud). AI Confidence measures the statistical certainty of the AI algorithm regarding its decision based on available data." },
    { q: "How can I resolve flagged payments?", a: "Open the audit details panel for the flagged invoice. Review the explainable AI insights, double check vendor details, and select 'Approve Release' or 'Flag Fraud' to complete the audit." }
  ];

  const shortcuts = [
    { keys: "Ctrl + S", action: "Trigger Global Search Focus" },
    { keys: "Ctrl + U", action: "Ingest Invoice Upload" },
    { keys: "Esc", action: "Close Active Drawer / Modals" },
    { keys: "Ctrl + D", action: "Toggle Presentation Mode" }
  ];

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* FAQ SECTION (Left 2 columns) */}
        <div className="glass-panel p-5 md:col-span-2 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <HelpCircle className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Frequently Asked Questions</h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-3 bg-white/5 border border-white/5 rounded-lg text-xs space-y-1">
                <strong className="text-white block">{faq.q}</strong>
                <p className="text-gray-400 leading-relaxed mt-1">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* KEYBOARD SHORTCUTS & SUPPORT (Right 1 column) */}
        <div className="glass-panel p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-4">
              <KeyRound className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Keyboard Hotkeys</h3>
            </div>

            <div className="space-y-3.5 text-xs">
              {shortcuts.map((sh, idx) => (
                <div key={idx} className="flex justify-between items-center text-gray-300">
                  <span>{sh.action}</span>
                  <kbd className="px-2 py-1 bg-slate-900 border border-white/10 rounded font-mono text-[10px] text-white">
                    {sh.keys}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Quick contact support */}
          <div className="mt-6 pt-4 border-t border-white/5">
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-2">Technical Assistance</span>
            <div className="flex items-center gap-2 text-xs text-blue-400">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <span>Contact support: security@fraudshield.ai</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
