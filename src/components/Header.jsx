import React, { useState } from "react";
import { Search, Bell, Monitor, User, ShieldCheck, ShieldAlert, FileWarning, HelpCircle } from "lucide-react";

export default function Header({ 
  searchQuery, 
  setSearchQuery, 
  notifications, 
  setNotifications, 
  presentationMode, 
  togglePresentationMode, 
  currentUser,
  setActiveTab,
  onOpenInvoice
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (n) => {
    // Mark as read
    setNotifications(prev => 
      prev.map(item => item.id === n.id ? { ...item, read: true } : item)
    );
    setShowNotifications(false);
    
    // Action routing
    if (n.invoiceNumber && n.invoiceNumber !== "N/A") {
      onOpenInvoice(n.invoiceNumber);
    }
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(item => ({ ...item, read: true })));
  };

  return (
    <header className="glass-panel border-b border-white/5 h-16 w-full flex items-center justify-between px-6 relative z-30" style={{ borderRadius: "0px", background: "rgba(10, 11, 13, 0.7)" }}>
      {/* Global Search Bar */}
      <div className="relative w-64 max-w-xs hide-presentation">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Global smart search..."
          className="input-premium w-full pl-10 py-1.5 text-xs bg-black/40 border-white/5 text-gray-200"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery("")} 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs"
          >
            Clear
          </button>
        )}
      </div>

      {/* Presentation Label (Only visible in Presentation Mode) */}
      {presentationMode ? (
        <div className="flex items-center gap-2 text-blue-400 font-bold uppercase tracking-wider text-xs animate-pulse">
          <Monitor className="w-4 h-4" />
          <span>Demo Presentation Mode Active</span>
        </div>
      ) : (
        <div className="hidden md:flex items-center gap-1.5 text-[11px] text-gray-500 font-semibold tracking-wider uppercase">
          Secured by <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 inline" /> FraudShield Core
        </div>
      )}

      {/* Control Actions */}
      <div className="flex items-center gap-3">
        {/* Presentation Toggle */}
        <button
          onClick={togglePresentationMode}
          className={`p-2 rounded-lg border transition-all ${
            presentationMode 
              ? "bg-blue-600/20 border-blue-500/50 text-blue-400" 
              : "border-white/5 text-gray-400 hover:text-white hover:bg-white/5"
          }`}
          title="Toggle Presentation Mode (Larger fonts & fullscreen)"
        >
          <Monitor className="w-4 h-4" />
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
            }}
            className={`p-2 rounded-lg border border-white/5 text-gray-400 hover:text-white hover:bg-white/5 relative transition-all ${
              showNotifications ? "bg-white/5 text-white" : ""
            }`}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-[9px] font-bold text-white rounded-full flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 glass-panel shadow-[0_10px_35px_rgba(0,0,0,0.6)] border border-white/10 p-4 rounded-xl overflow-hidden animate-slide-in-toast">
              <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">Security Alerts</h4>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllRead} 
                    className="text-[10px] text-blue-400 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <div className="text-center py-6 text-xs text-gray-500">No new alerts.</div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                        n.read 
                          ? "bg-transparent border-white/5 text-gray-400" 
                          : "bg-white/5 border-blue-500/25 text-white"
                      } hover:bg-white/10`}
                    >
                      <div className="flex gap-2 items-start">
                        {n.type === "fraud" && <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />}
                        {n.type === "duplicate" && <FileWarning className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />}
                        {n.type === "approved" && <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />}
                        {!["fraud", "duplicate", "approved"].includes(n.type) && <HelpCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />}
                        
                        <div>
                          <p className="text-xs font-semibold leading-snug">{n.title}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">{n.message}</p>
                          <span className="text-[9px] text-gray-600 block mt-1">{n.time} ago</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
            className={`flex items-center gap-2 p-1.5 pr-2.5 rounded-lg border border-white/5 bg-slate-900/40 text-gray-400 hover:text-white transition-all ${
              showProfile ? "bg-white/5 text-white" : ""
            }`}
          >
            <div className="w-6 h-6 rounded bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
              {currentUser.name.charAt(0)}
            </div>
            <span className="text-xs font-semibold hidden md:inline">{currentUser.name}</span>
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-3 w-56 glass-panel shadow-[0_10px_35px_rgba(0,0,0,0.6)] border border-white/10 p-2.5 rounded-xl animate-scale">
              <div className="p-2 border-b border-white/5 mb-2">
                <span className="block text-xs font-bold text-white leading-tight">{currentUser.name}</span>
                <span className="block text-[10px] text-blue-400 font-medium uppercase mt-0.5">{currentUser.role}</span>
              </div>
              
              <button 
                onClick={() => { setShowProfile(false); setActiveTab("settings"); }}
                className="w-full text-left text-xs p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                Profile Settings
              </button>
              <button 
                onClick={() => { setShowProfile(false); setActiveTab("admin"); }}
                className="w-full text-left text-xs p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                Auditor Workspace
              </button>
              
              <div className="border-t border-white/5 my-1.5" />
              
              <button 
                onClick={() => window.location.reload()}
                className="w-full text-left text-xs p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                Lock Terminal
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
