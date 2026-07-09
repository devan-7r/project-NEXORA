import React, { useState } from "react";
import { 
  ShieldCheck, ShieldAlert, Users, Activity, HardDrive, Cpu, 
  Lock, Check, Server, RefreshCw, Key
} from "lucide-react";
import { SYSTEM_HEALTH, SECURITY_CHECKS } from "../utils/demoData";

export default function AdminView({ currentUser, setCurrentUser }) {
  const [health, setHealth] = useState(SYSTEM_HEALTH);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const rolesList = [
    { role: "Admin", desc: "Full administrative controls and compliance override authorization." },
    { role: "Finance Manager", desc: "Authorize high-value releases and review flagged anomalies." },
    { role: "Reviewer", desc: "Verify basic vendor registrations and OCR anomalies." },
    { role: "Auditor", desc: "Inspect compliance audit trails and export financial logs." },
    { role: "Guest", desc: "Read-only access to standard dashboards and invoice list." }
  ];

  const handleRoleChange = (roleName) => {
    setCurrentUser(prev => ({
      ...prev,
      role: roleName
    }));
  };

  const handleRefreshDiagnostics = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      // Simulate minor variance in latencies and loads
      setHealth(prev => ({
        ...prev,
        aiEngine: { ...prev.aiEngine, load: `${Math.floor(Math.random() * 10) + 10}%`, latency: `${Math.floor(Math.random() * 30) + 130}ms` },
        ocrEngine: { ...prev.ocrEngine, load: `${Math.floor(Math.random() * 5) + 5}%`, latency: `${Math.floor(Math.random() * 50) + 360}ms` },
        database: { ...prev.database, load: `${Math.floor(Math.random() * 4) + 3}%`, latency: `${Math.floor(Math.random() * 5) + 10}ms` }
      }));
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      
      {/* ROW 1: USER ROLE MANAGEMENT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* User Identity Panel */}
        <div className="glass-panel p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Operator Session Profile</h3>
            
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="w-12 h-12 rounded bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-xl font-bold">
                {currentUser.name.charAt(0)}
              </div>
              <div>
                <span className="font-bold text-white block text-sm">{currentUser.name}</span>
                <span className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider block mt-0.5">{currentUser.role}</span>
                <span className="text-[9px] text-gray-500 block font-mono mt-1">IP Address: 192.168.1.50</span>
              </div>
            </div>
          </div>

          <div className="text-[9px] text-gray-500 tracking-wider mt-6 pt-3 border-t border-white/5 uppercase">
            Encrypted session token active
          </div>
        </div>

        {/* Roles Selector (Center & Right 2 columns) */}
        <div className="glass-panel p-5 md:col-span-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Role-Based Access Control Privileges</h3>
          
          <div className="space-y-2">
            {rolesList.map((r) => {
              const isActive = currentUser.role === r.role;
              return (
                <div 
                  key={r.role}
                  onClick={() => handleRoleChange(r.role)}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between gap-4 ${
                    isActive 
                      ? "bg-blue-600/15 border-blue-500/40 text-white shadow-[0_0_15px_rgba(59,130,246,0.1)]" 
                      : "bg-transparent border-white/5 text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div>
                    <span className="font-bold text-xs block">{r.role}</span>
                    <span className="text-[10px] text-gray-500 mt-0.5 block leading-normal">{r.desc}</span>
                  </div>

                  {isActive ? (
                    <div className="w-5 h-5 rounded-full bg-blue-600 border border-blue-400 flex items-center justify-center text-white flex-shrink-0 animate-scale">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-white/10 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ROW 2: SYSTEM HEALTH DIAGNOSTICS & CYBERSECURITY CENTER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Diagnostics (Left 2 columns) */}
        <div className="glass-panel p-5 md:col-span-2 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-gray-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">System Diagnostics</h3>
            </div>
            
            <button 
              onClick={handleRefreshDiagnostics}
              className={`p-1.5 rounded border border-white/5 hover:text-white transition-all text-gray-500 ${isRefreshing ? "animate-spin text-white" : ""}`}
              title="Refresh Diagnostics"
              disabled={isRefreshing}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Diagnostics rows */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* AI Engine */}
            <div className="p-3 bg-black/40 border border-white/5 rounded-lg text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-blue-400" /> AI Neural Engine</span>
                <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-1.5 py-0.5 rounded">{health.aiEngine.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-400">
                <span>Load: <strong className="text-white font-mono">{health.aiEngine.load}</strong></span>
                <span>Latency: <strong className="text-white font-mono">{health.aiEngine.latency}</strong></span>
                <span className="col-span-2">Memory: <strong className="text-white font-mono">{health.aiEngine.memory}</strong></span>
              </div>
            </div>

            {/* OCR Engine */}
            <div className="p-3 bg-black/40 border border-white/5 rounded-lg text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-indigo-400" /> OCR Document Parser</span>
                <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-1.5 py-0.5 rounded">{health.ocrEngine.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-400">
                <span>Load: <strong className="text-white font-mono">{health.ocrEngine.load}</strong></span>
                <span>Latency: <strong className="text-white font-mono">{health.ocrEngine.latency}</strong></span>
                <span className="col-span-2">Uptime: <strong className="text-white font-mono">{health.ocrEngine.uptime}</strong></span>
              </div>
            </div>

            {/* DB */}
            <div className="p-3 bg-black/40 border border-white/5 rounded-lg text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white flex items-center gap-1.5"><HardDrive className="w-3.5 h-3.5 text-emerald-400" /> Ledger Database</span>
                <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-1.5 py-0.5 rounded">{health.database.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-400">
                <span>Load: <strong className="text-white font-mono">{health.database.load}</strong></span>
                <span>Latency: <strong className="text-white font-mono">{health.database.latency}</strong></span>
                <span className="col-span-2">Memory: <strong className="text-white font-mono">{health.database.memory}</strong></span>
              </div>
            </div>

            {/* Secure Shield Gate */}
            <div className="p-3 bg-black/40 border border-white/5 rounded-lg text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-red-400" /> Secure Gateway</span>
                <span className="text-[9px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/25 px-1.5 py-0.5 rounded">{health.securityGateway.statusLabel}</span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-400">
                <span>Status: <strong className="text-white">{health.securityGateway.status}</strong></span>
                <span>Rules: <strong className="text-white font-mono">{health.securityGateway.activeRules}</strong></span>
                <span className="col-span-2">Mitigated: <strong className="text-white font-mono">{health.securityGateway.blockedToday}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Center Checklist (Right 1 column) */}
        <div className="glass-panel p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Compliance Shield</h3>
            </div>
            
            <div className="space-y-3.5 text-xs">
              {SECURITY_CHECKS.map((check, idx) => (
                <div key={idx} className="flex justify-between items-center text-gray-300">
                  <span className="font-medium">{check.name}</span>
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.15)]">
                    <Check className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[10px] text-gray-500 tracking-wider mt-6 pt-3 border-t border-white/5">
            SSL SHA-256 CIPHER VERIFIED
          </div>
        </div>

      </div>

    </div>
  );
}
