import React, { useState, useEffect } from "react";
import { 
  TrendingUp, TrendingDown, AlertTriangle, ShieldCheck, 
  Clock, Landmark, Users, Percent, Sparkles, Activity,
  ArrowRight, Zap, Shield
} from "lucide-react";

// Count Up animation component for stats
function CountUp({ end, prefix = "", suffix = "", decimals = 0, duration = 1000 }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16); // ~60fps
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setValue(end);
        clearInterval(timer);
      } else {
        setValue(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end, duration]);

  return (
    <span>
      {prefix}
      {decimals > 0 ? value.toFixed(decimals) : Math.floor(value).toLocaleString()}
      {suffix}
    </span>
  );
}

// Radial trust ring for dashboard vendor cards
function TrustRing({ score, size = 48, stroke = 5 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          className="trust-ring" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[9px] font-black font-mono" style={{ color }}>{score}</span>
      </div>
    </div>
  );
}

export default function DashboardView({ invoices, vendors, auditLogs, onOpenInvoice }) {
  const [selectedDuration, setSelectedDuration] = useState("Daily");
  const [pulse, setPulse] = useState(false);

  // Simulate live heartbeat pulse on activity feed
  useEffect(() => {
    const t = setInterval(() => setPulse(p => !p), 3000);
    return () => clearInterval(t);
  }, []);

  // Computations
  const totalProcessed = invoices.length;
  const approvedCount = invoices.filter(i => i.status === "Approved").length;
  const pendingCount = invoices.filter(i => i.status === "Pending").length;
  const fraudCount = invoices.filter(i => i.status === "Fraud").length;
  
  const moneyProtected = invoices
    .filter(i => i.status === "Fraud")
    .reduce((sum, current) => sum + current.amount, 0);

  const averageRisk = invoices.reduce((sum, curr) => sum + curr.fraudScore, 0) / totalProcessed;
  const averageConfidence = totalProcessed > 0
    ? invoices.reduce((sum, curr) => sum + curr.aiConfidence, 0) / totalProcessed
    : 0;
  const activeVendors = vendors.filter(v => v.activeStatus === "Active").length;
  const highRiskVendors = vendors.filter(v => v.status === "Suspicious");

  // High-risk invoices that need immediate attention
  const criticalInvoices = invoices
    .filter(i => i.fraudScore >= 70 && i.status !== "Approved")
    .sort((a, b) => b.fraudScore - a.fraudScore);

  // --- Live SVG Trend line --- auto-computed from actual invoice timestamps
  const sortedInvoices = [...invoices].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const trendPoints = sortedInvoices.map((inv, i) => {
    const x = (i / Math.max(sortedInvoices.length - 1, 1)) * 90 + 5;
    const y = 36 - (inv.fraudScore / 100) * 30;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="space-y-6">
      
      {/* Welcome AI banner */}
      <div className="glass-panel p-6 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Soft light sweeps */}
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-blue-500/10 to-transparent blur-3xl pointer-events-none" />
        
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
            FraudShield AI Command Center
          </h2>
          <p className="text-gray-400 text-xs mt-1 max-w-xl">
            Real-time neural anomaly detection active. 
            <span className="text-red-400 font-semibold"> {fraudCount} high-risk threats</span> blocked today — 
            <span className="text-emerald-400 font-semibold"> ₹{(moneyProtected / 100000).toFixed(1)} Lakhs</span> protected.
          </p>
        </div>
        
        <div className="flex gap-1.5 hide-presentation">
          {["Daily", "Weekly", "Monthly", "Yearly"].map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDuration(d)}
              className={`text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-lg border transition-all ${
                selectedDuration === d 
                  ? "bg-blue-600/20 border-blue-500/40 text-white shadow-[0_0_10px_rgba(59,130,246,0.15)]" 
                  : "border-white/5 text-gray-500 hover:text-white"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Invoices Today */}
        <div className="glass-card p-4">
          <div className="flex justify-between items-start text-gray-400 mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider">Invoices Today</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            <CountUp end={totalProcessed} />
          </div>
          <div className="flex justify-between text-[10px] text-gray-500 mt-2">
            <span>Approved: <strong className="text-emerald-400">{approvedCount}</strong></span>
            <span>Pending: <strong className="text-amber-400">{pendingCount}</strong></span>
            <span>Fraud: <strong className="text-red-400">{fraudCount}</strong></span>
          </div>
        </div>

        {/* Money Saved */}
        <div className="glass-card p-4 border-l-2 border-l-emerald-500">
          <div className="flex justify-between items-start text-gray-400 mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider">Averted Losses</span>
            <Landmark className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            <CountUp end={moneyProtected} prefix="₹" />
          </div>
          <div className="text-[10px] text-gray-500 flex items-center gap-1 mt-2">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span>+14.2% from previous cycle</span>
          </div>
        </div>

        {/* Average Risk */}
        <div className="glass-card p-4 border-l-2 border-l-amber-500">
          <div className="flex justify-between items-start text-gray-400 mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider">Mean Fraud Risk</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-500 font-mono">
            <CountUp end={averageRisk} suffix="%" decimals={1} />
          </div>
          <div className="text-[10px] text-gray-500 flex items-center gap-1 mt-2">
            <TrendingDown className="w-3 h-3 text-emerald-400" />
            <span>-8.5% mitigation curve</span>
          </div>
        </div>

        {/* System Trust Score */}
        <div className="glass-card p-4 border-l-2 border-l-blue-500">
          <div className="flex justify-between items-start text-gray-400 mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider">AI Avg Confidence</span>
            <Zap className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            <CountUp end={averageConfidence} suffix="%" decimals={1} />
          </div>
          <div className="text-[10px] text-gray-500 flex items-center gap-1 mt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Registry API Online</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics & Custom SVG Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Line Chart: Fraud Score Trend - now computed from real data */}
        <div className="glass-panel p-5 lg:col-span-2 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Risk Score Timeline</h3>
            <span className="text-[10px] text-blue-400 font-mono flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> {invoices.length} invoices plotted
            </span>
          </div>
          
          {/* Custom SVG Line Chart with real data */}
          <div className="h-44 w-full relative">
            <svg className="w-full h-full" viewBox="0 0 100 42" preserveAspectRatio="none">
              {/* Grids */}
              <line x1="0" y1="9" x2="100" y2="9" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
              <line x1="0" y1="21" x2="100" y2="21" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
              <line x1="0" y1="33" x2="100" y2="33" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
              
              {/* Area gradient fill */}
              {sortedInvoices.length > 1 && (
                <polygon
                  points={`${trendPoints} 95,40 5,40`}
                  fill="url(#dashChartGrad)"
                  opacity="0.12"
                />
              )}
              
              {/* Trend line */}
              <polyline 
                points={trendPoints}
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {sortedInvoices.map((inv, i) => {
                const x = (i / Math.max(sortedInvoices.length - 1, 1)) * 90 + 5;
                const y = 36 - (inv.fraudScore / 100) * 30;
                const color = inv.fraudScore > 60 ? "#ef4444" : inv.fraudScore > 30 ? "#f59e0b" : "#10b981";
                return (
                  <g key={inv.invoiceNumber}>
                    {inv.fraudScore > 60 && (
                      <circle cx={x} cy={y} r="3.5" fill="none" stroke={color} strokeWidth="0.5" opacity="0.4" className="animate-ping" style={{ transformOrigin: `${x}px ${y}px` }} />
                    )}
                    <circle cx={x} cy={y} r="1.8" fill={color} />
                  </g>
                );
              })}

              {/* Gradient definitions */}
              <defs>
                <linearGradient id="dashChartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Chart X Labels */}
            <div className="flex justify-between text-[8px] text-gray-500 tracking-wider mt-1 px-1">
              {sortedInvoices.map(inv => (
                <span key={inv.invoiceNumber} style={{ flex: 1 }} className="text-center">
                  {inv.invoiceNumber.replace("INV-2026-", "#")}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-4 text-[9px] text-gray-500 mt-2">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />Safe</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" />Review</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />Fraud</span>
          </div>
        </div>

        {/* Pie Chart: Risk distribution */}
        <div className="glass-panel p-5 flex flex-col justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Risk Distribution</h3>
          
          {/* Custom SVG Pie Chart - dynamic */}
          {(() => {
            const total = totalProcessed || 1;
            const approvedPct = approvedCount / total;
            const pendingPct = pendingCount / total;
            const fraudPct = fraudCount / total;
            const circ = 75.3;
            const approvedDash = approvedPct * circ;
            const pendingDash = pendingPct * circ;
            const fraudDash = fraudPct * circ;
            return (
              <div className="flex items-center justify-center relative my-4">
                <svg width="120" height="120" viewBox="0 0 32 32" className="transform -rotate-90">
                  <circle cx="16" cy="16" r="12" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="4" />
                  
                  {/* Approved segment */}
                  <circle 
                    cx="16" cy="16" r="12" 
                    fill="transparent" 
                    stroke="#10b981" 
                    strokeWidth="4.2" 
                    strokeDasharray={`${approvedDash} ${circ}`}
                    strokeDashoffset="0"
                    strokeLinecap="round"
                  />
                  
                  {/* Pending segment */}
                  <circle 
                    cx="16" cy="16" r="12" 
                    fill="transparent" 
                    stroke="#f59e0b" 
                    strokeWidth="4" 
                    strokeDasharray={`${pendingDash} ${circ}`}
                    strokeDashoffset={`-${approvedDash}`}
                  />

                  {/* Fraud segment */}
                  <circle 
                    cx="16" cy="16" r="12" 
                    fill="transparent" 
                    stroke="#ef4444" 
                    strokeWidth="4" 
                    strokeDasharray={`${fraudDash} ${circ}`}
                    strokeDashoffset={`-${approvedDash + pendingDash}`}
                  />
                </svg>

                {/* Centered label */}
                <div className="absolute text-center">
                  <span className="block text-xl font-bold font-mono text-white">{totalProcessed}</span>
                  <span className="text-[8px] text-gray-500 uppercase tracking-widest">Total</span>
                </div>
              </div>
            );
          })()}

          {/* Chart Legends */}
          <div className="space-y-1.5 text-xs mt-2">
            <div className="flex justify-between items-center text-gray-400">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />Safe Approved</span>
              <span className="font-bold text-white">{approvedCount}</span>
            </div>
            <div className="flex justify-between items-center text-gray-400">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" />Review Queue</span>
              <span className="font-bold text-white">{pendingCount}</span>
            </div>
            <div className="flex justify-between items-center text-gray-400">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" />Fraud Blocked</span>
              <span className="font-bold text-white">{fraudCount}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Row 3: AI Insights + High-Risk Alerts + Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: AI Correlation Insights */}
        <div className="glass-panel p-5 flex flex-col justify-between border-l-2 border-l-blue-500">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">AI Correlation Insights</h3>
            </div>
            
            <div className="space-y-3 text-xs mt-4">
              <div className="p-3 bg-white/5 border border-white/5 rounded-lg leading-relaxed text-gray-300">
                <strong>Anomalous Activity Alert:</strong> High risk invoices today were flagged primarily due to <strong>duplicate submission footprints</strong> and beneficiary account modifications.
              </div>
              <div className="p-3 bg-white/5 border border-white/5 rounded-lg leading-relaxed text-gray-300">
                <strong>Vendor Trust Update:</strong> Swift Logistics trust index dropped to <strong>88%</strong> due to Net terms mismatches. Close observation advised.
              </div>
              <div className="p-3 bg-amber-950/20 border border-amber-500/15 rounded-lg leading-relaxed text-gray-300">
                <strong className="text-amber-400">⚠ Pattern Alert:</strong> 2 invoices share identical PO number <strong>PO-99210</strong>. Possible double-billing exploit.
              </div>
            </div>
          </div>

          <div className="text-[10px] text-gray-500 tracking-wider mt-4">
            CORE LEARNING ITERATION // v4.2.1-SEC
          </div>
        </div>

        {/* Center: High-Risk Invoice Alerts */}
        <div className="glass-panel p-5 border-l-2 border-l-red-500">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-red-400 animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Critical Alerts</h3>
            {criticalInvoices.length > 0 && (
              <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold border border-red-500/20 animate-alert-glow">
                {criticalInvoices.length} ACTIVE
              </span>
            )}
          </div>

          {criticalInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <ShieldCheck className="w-8 h-8 text-emerald-400 mb-2" />
              <p className="text-xs text-gray-400">No active critical alerts. All flagged invoices resolved.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {criticalInvoices.map(inv => (
                <div key={inv.invoiceNumber} className="flex items-center justify-between p-2.5 rounded-lg bg-red-950/15 border border-red-500/15 gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">{inv.invoiceNumber}</div>
                    <div className="text-[9px] text-gray-400 truncate">{inv.vendorName}</div>
                    <div className="text-[9px] text-red-400 font-bold">Score: {inv.fraudScore}% · ₹{inv.amount.toLocaleString()}</div>
                  </div>
                  <button
                    onClick={() => onOpenInvoice(inv.invoiceNumber)}
                    className="flex-shrink-0 flex items-center gap-1 text-[10px] bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/20 px-2 py-1 rounded-lg transition-all font-bold"
                  >
                    Review <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Live Activity Feed */}
        <div className="glass-panel p-5 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Live Activity Feed</h3>
            <span className={`w-2 h-2 rounded-full transition-colors duration-1000 ${pulse ? "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-emerald-600"}`} />
          </div>

          {/* Activity items */}
          <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1 flex-1">
            {auditLogs.slice(0, 6).map((log, idx) => (
              <div key={idx} className="flex justify-between items-center p-2.5 rounded-lg bg-black/30 border border-white/5 text-xs gap-2">
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className="text-gray-500 font-mono text-[9px] flex-shrink-0 mt-0.5">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className="min-w-0">
                    <span className="font-semibold text-gray-200 truncate block">{log.action}</span>
                    <span className="text-gray-500 text-[9px]">{log.user}</span>
                  </div>
                </div>

                {log.invoiceNumber !== "N/A" ? (
                  <button 
                    onClick={() => onOpenInvoice(log.invoiceNumber)}
                    className="text-[10px] text-blue-400 hover:underline font-semibold flex-shrink-0"
                  >
                    View
                  </button>
                ) : (
                  <span className={`text-[10px] font-mono flex-shrink-0 ${
                    log.status === "Warning" ? "text-amber-400" : "text-emerald-400"
                  }`}>{log.status}</span>
                )}
              </div>
            ))}
          </div>

          {/* Vendor trust summary */}
          <div className="mt-4 pt-3 border-t border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-3 h-3 text-gray-400" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Top Vendor Risks</span>
            </div>
            <div className="space-y-2">
              {vendors
                .sort((a, b) => a.trustScore - b.trustScore)
                .slice(0, 2)
                .map(vendor => (
                  <div key={vendor.id} className="flex items-center gap-2">
                    <TrustRing score={vendor.trustScore} size={36} stroke={4} />
                    <div className="min-w-0">
                      <div className="text-[10px] font-semibold text-gray-200 truncate">{vendor.name}</div>
                      <div className={`text-[9px] font-bold ${vendor.status === "Suspicious" ? "text-red-400" : "text-emerald-400"}`}>
                        {vendor.status} · {vendor.activeStatus}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
