import React, { useState, useEffect } from "react";
import { Shield, Mail, Lock, CheckCircle2, ArrowRight, Server, Terminal, Network, ShieldCheck } from "lucide-react";

export default function Login({ onLoginSuccess }) {
  // Login animation state: 'idle' | 'loading' | 'scanning' | 'success'
  const [loginState, setLoginState] = useState("idle");
  const [email, setEmail] = useState("admin@fraudshield.ai");
  const [password, setPassword] = useState("password123");
  const [rememberMe, setRememberMe] = useState(true);

  // Live telemetry metrics
  const [cyberHash, setCyberHash] = useState("0x7f4e912b48ac");
  const [activePort, setActivePort] = useState(5173);

  // Live SVG Stats
  const [stats, setStats] = useState({
    checked: 14820,
    prevented: 324,
    saved: 42100000,
    accuracy: 99.8
  });

  // Invoice scan animation state
  const [activeScanDoc, setActiveScanDoc] = useState({
    id: 1,
    type: "neutral", // 'neutral' | 'scanning' | 'passed' | 'review' | 'failed'
    yPos: -20,
    xPos: 35
  });

  // Cyber Handshake Steps
  const [handshakeSteps, setHandshakeSteps] = useState([
    { id: 1, label: "DNS Resolve & SSL Handshake", status: "pending" },
    { id: 2, label: "Decrypting Credentials (AES-256)", status: "pending" },
    { id: 3, label: "Synchronizing GSTIN Registries", status: "pending" },
    { id: 4, label: "Initializing Admin Dashboard", status: "pending" }
  ]);

  // Telemetry updates
  useEffect(() => {
    const hashInterval = setInterval(() => {
      const chars = "0123456789abcdef";
      let hash = "0x";
      for (let i = 0; i < 12; i++) hash += chars[Math.floor(Math.random() * 16)];
      setCyberHash(hash);
      setActivePort(Math.floor(Math.random() * 200) + 5000);
    }, 1500);
    return () => clearInterval(hashInterval);
  }, []);

  // Simulate floating invoices and scanning
  useEffect(() => {
    let docId = 1;
    const interval = setInterval(() => {
      // Step 1: Document enters
      setActiveScanDoc({
        id: docId++,
        type: "neutral",
        yPos: -10,
        xPos: 35
      });

      // Step 2: Moves to laser line
      setTimeout(() => {
        setActiveScanDoc(prev => ({ ...prev, type: "scanning", yPos: 40 }));
      }, 800);

      // Step 3: Decides color & routes to bin
      setTimeout(() => {
        const rand = Math.random();
        let resultType = "passed";
        let targetX = 11; // Left (Approved)
        
        if (rand < 0.2) {
          resultType = "failed";
          targetX = 79; // Right (Fraud)
          
          setStats(prev => ({
            ...prev,
            checked: prev.checked + 1,
            prevented: prev.prevented + 1,
            saved: prev.saved + Math.floor(Math.random() * 50000) + 15000
          }));
        } else if (rand < 0.35) {
          resultType = "review";
          targetX = 45; // Center (Review)
          
          setStats(prev => ({
            ...prev,
            checked: prev.checked + 1
          }));
        } else {
          setStats(prev => ({
            ...prev,
            checked: prev.checked + 1
          }));
        }

        setActiveScanDoc(prev => ({
          ...prev,
          type: resultType,
          yPos: 80,
          xPos: targetX
        }));
      }, 1600);

    }, 3200);

    return () => clearInterval(interval);
  }, []);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;

    triggerHandshakeSequence();
  };

  const handleGuestAccess = () => {
    triggerHandshakeSequence();
  };

  const triggerHandshakeSequence = () => {
    setLoginState("loading");
    setHandshakeSteps([
      { id: 1, label: "DNS Resolve & SSL Handshake", status: "active" },
      { id: 2, label: "Decrypting Credentials (AES-256)", status: "pending" },
      { id: 3, label: "Synchronizing GSTIN Registries", status: "pending" },
      { id: 4, label: "Initializing Admin Dashboard", status: "pending" }
    ]);

    // Step 1 Complete -> Step 2 Active
    setTimeout(() => {
      setHandshakeSteps(prev => 
        prev.map(s => s.id === 1 ? { ...s, status: "success" } : s.id === 2 ? { ...s, status: "active" } : s)
      );
      setLoginState("scanning");
    }, 1000);

    // Step 2 Complete -> Step 3 Active
    setTimeout(() => {
      setHandshakeSteps(prev => 
        prev.map(s => s.id === 2 ? { ...s, status: "success" } : s.id === 3 ? { ...s, status: "active" } : s)
      );
    }, 2000);

    // Step 3 Complete -> Step 4 Active
    setTimeout(() => {
      setHandshakeSteps(prev => 
        prev.map(s => s.id === 3 ? { ...s, status: "success" } : s.id === 4 ? { ...s, status: "active" } : s)
      );
      setLoginState("success");
    }, 2800);

    // Sequence Success -> Callback
    setTimeout(() => {
      setHandshakeSteps(prev => prev.map(s => ({ ...s, status: "success" })));
      onLoginSuccess();
    }, 3600);
  };

  return (
    <div className="min-h-screen w-full bg-[#060709] flex flex-col md:flex-row text-white overflow-hidden relative">
      
      {/* LEFT SIDE: CREATIVE SCANNING SIMULATION */}
      <div 
        className="w-full md:w-1/2 flex flex-col justify-between p-8 md:p-12 bg-slate-950/40 border-r border-white/5 relative z-10"
        style={{
          backgroundImage: "radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.05) 0%, transparent 60%)"
        }}
      >
        {/* Header Branding */}
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.15)] animate-pulse">
            <Shield className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-wider bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">FRAUDSHIELD AI</span>
            <span className="block text-[10px] text-gray-500 font-semibold tracking-widest uppercase">FINANCE INTELLIGENCE</span>
          </div>
        </div>

        {/* Live Vector SVG Office scan animation */}
        <div className="my-8 flex flex-col items-center justify-center relative flex-1">
          <div className="relative w-full max-w-sm h-64 border border-white/5 rounded-2xl bg-black/50 overflow-hidden flex items-center justify-center shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            
            {/* Background grids */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
            
            {/* Corner Bracket Bracing */}
            <div className="absolute top-3 left-3 w-3.5 h-3.5 border-t border-l border-blue-500/40" />
            <div className="absolute top-3 right-3 w-3.5 h-3.5 border-t border-r border-blue-500/40" />
            <div className="absolute bottom-3 left-3 w-3.5 h-3.5 border-b border-l border-blue-500/40" />
            <div className="absolute bottom-3 right-3 w-3.5 h-3.5 border-b border-r border-blue-500/40" />

            {/* Rotating Tech HUD Rings */}
            <div className="absolute w-44 h-44 rounded-full border border-dashed border-blue-500/5 animate-[spin_40s_linear_infinite] pointer-events-none" />
            <div className="absolute w-32 h-32 rounded-full border border-dashed border-cyan-500/10 animate-[spin_20s_linear_infinite_reverse] pointer-events-none" />
            <div className="absolute w-20 h-20 rounded-full border border-dotted border-blue-500/15 animate-[spin_10s_linear_infinite] pointer-events-none" />

            {/* Target Tracking Lock Box */}
            <div 
              className="absolute w-12 h-14 border border-cyan-400/25 rounded pointer-events-none transition-all duration-700 flex items-center justify-center"
              style={{
                left: `${activeScanDoc.xPos}%`,
                top: `${activeScanDoc.yPos}%`,
                transform: 'translate(-5px, -5px)',
                opacity: activeScanDoc.yPos > 70 ? 0.15 : 0.8
              }}
            >
              {/* Internal scanner dot */}
              <div className="w-1 h-1 rounded-full bg-cyan-400 animate-ping" />
              
              {/* Targeting brackets */}
              <div className="absolute -top-0.5 -left-0.5 w-1.5 h-1.5 border-t border-l border-cyan-400" />
              <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 border-t border-r border-cyan-400" />
              <div className="absolute -bottom-0.5 -left-0.5 w-1.5 h-1.5 border-b border-l border-cyan-400" />
              <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 border-b border-r border-cyan-400" />
            </div>

            {/* Laser Line */}
            <div 
              className="absolute left-0 right-0 h-[2px] bg-cyan-400 z-20 pointer-events-none shadow-[0_0_15px_#22d3ee]"
              style={{
                top: "40%",
                opacity: activeScanDoc.type === "scanning" ? 1 : 0.3,
                transition: "opacity 0.2s ease"
              }}
            />
            
            {/* SVG Elements */}
            <svg className="w-full h-full relative z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Category Bins */}
              {/* Approved (Green) */}
              <rect x="5" y="80" width="22" height="15" rx="3" fill="rgba(16, 185, 129, 0.03)" stroke="rgba(16, 185, 129, 0.15)" strokeWidth="0.6" />
              <text x="16" y="89" fontSize="2.8" fill="#10b981" textAnchor="middle" fontWeight="black" letterSpacing="0.1">APPROVED</text>
              
              {/* Review (Yellow) */}
              <rect x="39" y="80" width="22" height="15" rx="3" fill="rgba(245, 158, 11, 0.03)" stroke="rgba(245, 158, 11, 0.15)" strokeWidth="0.6" />
              <text x="50" y="89" fontSize="2.8" fill="#f59e0b" textAnchor="middle" fontWeight="black" letterSpacing="0.1">REVIEW</text>

              {/* Fraud (Red) */}
              <rect x="73" y="80" width="22" height="15" rx="3" fill="rgba(239, 68, 68, 0.03)" stroke="rgba(239, 68, 68, 0.15)" strokeWidth="0.6" />
              <text x="84" y="89" fontSize="2.8" fill="#ef4444" textAnchor="middle" fontWeight="black" letterSpacing="0.1">FRAUD</text>

              {/* Floating Document */}
              <g 
                style={{
                  transform: `translate(${activeScanDoc.xPos}px, ${activeScanDoc.yPos}px)`,
                  transition: "transform 0.8s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.3s ease",
                  opacity: activeScanDoc.yPos > 76 ? 0.2 : 1
                }}
              >
                {/* Paper sheet */}
                <rect 
                  x="0" y="0" width="10" height="13" rx="1.5" 
                  fill={
                    activeScanDoc.type === "passed" ? "rgba(16, 185, 129, 0.15)" :
                    activeScanDoc.type === "review" ? "rgba(245, 158, 11, 0.15)" :
                    activeScanDoc.type === "failed" ? "rgba(239, 68, 68, 0.15)" :
                    activeScanDoc.type === "scanning" ? "rgba(34, 211, 238, 0.15)" :
                    "rgba(255, 255, 255, 0.05)"
                  }
                  stroke={
                    activeScanDoc.type === "passed" ? "#10b981" :
                    activeScanDoc.type === "review" ? "#f59e0b" :
                    activeScanDoc.type === "failed" ? "#ef4444" :
                    activeScanDoc.type === "scanning" ? "#22d3ee" :
                    "rgba(255,255,255,0.15)"
                  } 
                  strokeWidth="0.5" 
                  className={activeScanDoc.type === "scanning" ? "animate-pulse-glow" : ""}
                />
                {/* Dummy lines inside doc */}
                <line x1="2" y1="3" x2="8" y2="3" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" />
                <line x1="2" y1="5" x2="6" y2="5" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" />
                <line x1="2" y1="7" x2="7" y2="7" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" />
                <line x1="2" y1="9" x2="5" y2="9" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" />
              </g>
            </svg>
            
            {/* Overlay status helper */}
            <div className="absolute top-3.5 left-4 text-[9px] font-bold tracking-widest text-blue-500/60 font-mono">
              NEURAL GATEWAY // CORE SYSTEM
            </div>
            
            <div className="absolute top-3.5 right-4 flex items-center gap-1.5 bg-emerald-950/20 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[8px] tracking-widest text-emerald-400 font-black uppercase font-mono">FEED ACTIVE</span>
            </div>

            {/* Simulated Live Readouts */}
            <div className="absolute bottom-3 left-4 font-mono text-[7px] text-cyan-400/50 space-y-0.5 leading-none">
              <div>INGEST PORT: :{activePort}</div>
              <div>HASH NODE: {cyberHash}</div>
            </div>
          </div>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 backdrop-blur-md">
            <span className="block text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1.5">Invoices Audited</span>
            <span className="text-xl font-bold font-mono text-white tracking-wide">
              {stats.checked.toLocaleString()}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 backdrop-blur-md">
            <span className="block text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1.5">Anomalies Intercepted</span>
            <span className="text-xl font-bold font-mono text-amber-500 tracking-wide">
              {stats.prevented.toLocaleString()}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 backdrop-blur-md col-span-2">
            <div className="flex justify-between items-center">
              <div>
                <span className="block text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1.5">Financial Loss Averted</span>
                <span className="text-2xl font-black font-mono text-emerald-400">
                  ₹{(stats.saved / 100000).toFixed(2)} L
                </span>
              </div>
              <div className="text-right">
                <span className="block text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1.5">Mitigation Precision</span>
                <span className="text-lg font-bold font-mono text-blue-400">{stats.accuracy}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: GLASSMORPHIC CREDENTIAL CARD */}
      <div 
        className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12 relative z-10"
        style={{
          backgroundImage: "radial-gradient(circle at 90% 80%, rgba(16, 185, 129, 0.04) 0%, transparent 60%)"
        }}
      >
        {/* Soft floating background orb */}
        <div className="absolute top-1/4 right-1/4 w-72 h-72 rounded-full bg-blue-500/10 blur-[80px] pointer-events-none" />

        {/* The Card */}
        <div className="glass-panel w-full max-w-md p-8 md:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.6)] border border-white/10 relative overflow-hidden">
          
          {/* Futuristic glowing corner decors */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-blue-500/30" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-blue-500/30" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-blue-500/30" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-blue-500/30" />

          {/* Main sequence controller */}
          {loginState === "idle" && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold tracking-tight mb-2 text-white">Access Secure Terminal</h2>
              <p className="text-gray-400 text-xs mb-8 leading-relaxed">
                Connect your business ledger API or input organization credentials.
              </p>

              <form onSubmit={handleLoginSubmit} className="space-y-5">
                {/* Email field */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest" htmlFor="email-input">
                    Institutional Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      id="email-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. auditor@organization.com"
                      className="input-premium w-full pl-11 text-sm bg-black/40 border-white/5 focus:border-blue-500/50"
                      required
                    />
                  </div>
                </div>

                {/* Password field */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest" htmlFor="password-input">
                      Secure Access Key
                    </label>
                    <a href="#forgot" className="text-[10px] text-blue-400 hover:underline tracking-wide font-semibold">Forgot Key?</a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      id="password-input"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="input-premium w-full pl-11 text-sm bg-black/40 border-white/5 focus:border-blue-500/50"
                      required
                    />
                  </div>
                </div>

                {/* Checkbox Options */}
                <div className="flex items-center justify-between pt-1">
                  <label className="checkbox-container">
                    <input 
                      type="checkbox" 
                      checked={rememberMe} 
                      onChange={(e) => setRememberMe(e.target.checked)} 
                    />
                    <div className="checkbox-custom">
                      {rememberMe && <div className="w-2 h-2 rounded bg-blue-500" />}
                    </div>
                    <span className="text-xs text-gray-400 select-none">Remember terminal session</span>
                  </label>
                </div>

                {/* Login Button */}
                <button 
                  type="submit" 
                  className="btn-premium btn-primary w-full py-3 text-xs justify-center rounded-lg font-bold uppercase tracking-wider mt-6 gap-2 shadow-[0_4px_20px_rgba(37,99,235,0.2)]"
                >
                  Authorize Connection
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center my-6">
                <div className="flex-1 h-[1px] bg-white/5" />
                <span className="text-[9px] uppercase font-bold tracking-widest text-gray-500 mx-4">OR BYPASS</span>
                <div className="flex-1 h-[1px] bg-white/5" />
              </div>

              {/* Guest Bypassing */}
              <div className="text-center">
                <button 
                  onClick={handleGuestAccess}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Enter Sandbox (Guest)
                </button>
                <p className="text-[10px] text-gray-500 mt-2">
                  Access standard mock environment. No ledger authorization required.
                </p>
              </div>
            </div>
          )}

          {/* Loading verification animations */}
          {loginState !== "idle" && (
            <div className="flex flex-col py-6 text-left">
              
              {/* Handshake Telemetry HUD */}
              <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
                <div className="p-2 bg-blue-500/10 border border-blue-500/25 rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-blue-400 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Neural Handshake Session</h4>
                  <span className="text-[8px] font-mono text-cyan-400/60 block">SECURE CONNECTION SEC-TLSv1.3</span>
                </div>
              </div>

              {/* Steps progression */}
              <div className="space-y-4 mb-8">
                {handshakeSteps.map((step) => (
                  <div key={step.id} className="flex items-start gap-3 text-xs">
                    <div className="mt-0.5 flex-shrink-0">
                      {step.status === "success" && (
                        <div className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold font-mono text-[8px]">✓</div>
                      )}
                      {step.status === "active" && (
                        <div className="w-4 h-4 rounded-full bg-blue-500/10 border border-blue-500/40 flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                        </div>
                      )}
                      {step.status === "pending" && (
                        <div className="w-4 h-4 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center font-mono text-[8px] text-gray-600">•</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <span className={`font-semibold ${step.status === "success" ? "text-gray-300" : step.status === "active" ? "text-blue-400" : "text-gray-500"}`}>
                        {step.label}
                      </span>
                      {step.status === "active" && (
                        <span className="block text-[8px] font-mono text-cyan-400/50 mt-0.5 animate-pulse">Processing node requests...</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Status Loader Bar */}
              <div className="w-full bg-slate-950 border border-white/5 h-2 rounded-full overflow-hidden relative">
                <div 
                  className={`h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-700 ${
                    loginState === "scanning" ? "w-2/3" : loginState === "success" ? "w-full" : "w-1/3"
                  }`} 
                />
              </div>

              <div className="mt-4 text-center">
                <span className="text-[9px] font-mono uppercase tracking-widest text-gray-500">
                  {loginState === "loading" && "Resolving credentials..."}
                  {loginState === "scanning" && "Verifying security nodes..."}
                  {loginState === "success" && "Access Granted!"}
                </span>
              </div>

            </div>
          )}

        </div>
      </div>
      
      {/* Background soft grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.005)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.005)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
    </div>
  );
}
