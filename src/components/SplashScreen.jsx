import React, { useState, useEffect } from "react";
import { Shield } from "lucide-react";

export default function SplashScreen({ onComplete }) {
  const [statusIndex, setStatusIndex] = useState(0);
  const [fadeClass, setFadeClass] = useState("opacity-100");

  const loadStates = [
    "Initializing FraudShield AI Core...",
    "Loading Advanced Neural Fraud Engine...",
    "Verifying Encrypted Ledger Access...",
    "Caching Trusted Vendor Registries...",
    "Connecting Cloud Secure Services...",
    "Bootstrapping Voice Synthesis Engine...",
    "System Diagnostics: 100% SECURE.",
    "Redirecting..."
  ];

  useEffect(() => {
    // Speed up status change to keep the loading feel dynamic but fast enough for demos
    const timer = setInterval(() => {
      setStatusIndex((prev) => {
        if (prev < loadStates.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          return prev;
        }
      });
    }, 450);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (statusIndex === loadStates.length - 1) {
      const fadeTimer = setTimeout(() => {
        setFadeClass("opacity-0 transition-opacity duration-700 ease-out");
        const completeTimer = setTimeout(() => {
          onComplete();
        }, 700);
        return () => clearTimeout(completeTimer);
      }, 300);
      return () => clearTimeout(fadeTimer);
    }
  }, [statusIndex, onComplete]);

  return (
    <div 
      className={`fixed inset-0 bg-[#060709] flex flex-col items-center justify-center z-[9999] ${fadeClass}`}
      style={{
        backgroundImage: "radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.08) 0%, transparent 70%)"
      }}
    >
      {/* Laser Scanner Wrapper */}
      <div className="relative mb-8 p-6 animate-float flex items-center justify-center">
        {/* Glowing Circle */}
        <div className="absolute inset-0 rounded-full border border-dashed border-blue-500/20 animate-spin" style={{ animationDuration: "12s" }} />
        <div className="absolute inset-2 rounded-full border border-emerald-500/10 animate-spin" style={{ animationDuration: "8s", animationDirection: "reverse" }} />
        
        {/* Shield Icon */}
        <div className="relative p-6 bg-slate-900/60 rounded-full border border-white/10 backdrop-blur shadow-[0_0_50px_rgba(59,130,246,0.15)]">
          <Shield className="w-16 h-16 text-blue-400 animate-pulse" />
          
          {/* Laser Scanner Line */}
          <div className="absolute left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_12px_#3b82f6] animate-bounce" style={{ top: "10%", animationDuration: "2s" }} />
        </div>
      </div>

      {/* Brand Text */}
      <h1 className="text-3xl font-extrabold tracking-wider text-white mb-2" style={{ textShadow: "0 0 15px rgba(255,255,255,0.1)" }}>
        FRAUDSHIELD AI
      </h1>
      <p className="text-xs tracking-[0.2em] uppercase text-blue-400/70 font-semibold mb-12">
        Enterprise Finance Security Suite
      </p>

      {/* Loading Status Indicator */}
      <div className="w-64">
        {/* Progress bar */}
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-3 relative">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 transition-all duration-300 ease-out" 
            style={{ width: `${((statusIndex + 1) / loadStates.length) * 100}%` }}
          />
        </div>
        
        {/* Dynamic status text */}
        <div className="h-5 overflow-hidden text-center">
          <p className="text-xs text-gray-400 font-medium tracking-wide animate-pulse">
            {loadStates[statusIndex]}
          </p>
        </div>
      </div>
      
      {/* Background soft grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
    </div>
  );
}
