import React from "react";
import { 
  Shield, LayoutDashboard, FileText, Database, ShieldAlert,
  BarChart2, BookOpen, Settings, HelpCircle, MessageSquare, Mic,
  ChevronLeft, ChevronRight
} from "lucide-react";

export default function Sidebar({ activeTab, setActiveTab, collapsed, setCollapsed }) {
  const primaryItems = [
    { id: "dashboard",       label: "Dashboard",       icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: "invoices",        label: "Invoices",         icon: <FileText className="w-5 h-5" /> },
    { id: "vendor-database", label: "Vendor Database",  icon: <Database className="w-5 h-5" /> },
    { id: "fraud-reports",   label: "Fraud Reports",    icon: <ShieldAlert className="w-5 h-5" /> },
    { id: "analytics",       label: "Analytics",        icon: <BarChart2 className="w-5 h-5" /> },
    { id: "audit-logs",      label: "Audit Logs",       icon: <BookOpen className="w-5 h-5" /> },
  ];

  const secondaryItems = [
    { id: "chatbot",          label: "AI Chatbot",       icon: <MessageSquare className="w-5 h-5" /> },
    { id: "voice-assistant",  label: "Voice Assistant",  icon: <Mic className="w-5 h-5" /> },
    { id: "settings",         label: "Settings",         icon: <Settings className="w-5 h-5" /> },
    { id: "help",             label: "Help",             icon: <HelpCircle className="w-5 h-5" /> },
  ];

  const NavButton = ({ item }) => (
    <button
      key={item.id}
      onClick={() => setActiveTab(item.id)}
      className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm transition-all duration-200 ${
        activeTab === item.id
          ? "bg-blue-600/15 border border-blue-500/35 text-white shadow-[0_0_15px_rgba(59,130,246,0.1)]"
          : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
      } ${collapsed ? "justify-center" : ""}`}
      title={collapsed ? item.label : ""}
    >
      <div className="transition-transform duration-200 hover:rotate-6 flex-shrink-0">
        {item.icon}
      </div>
      {!collapsed && <span className="font-medium tracking-wide truncate">{item.label}</span>}
      {!collapsed && activeTab === item.id && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse flex-shrink-0" />
      )}
    </button>
  );

  return (
    <aside
      className={`glass-panel border-r border-white/5 min-h-screen flex flex-col justify-between transition-all duration-300 relative z-40 ${
        collapsed ? "w-16" : "w-64"
      }`}
      style={{
        borderRadius: "0px",
        background: "rgba(10, 11, 13, 0.92)"
      }}
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Logo */}
        <div className={`p-4 flex items-center border-b border-white/5 ${collapsed ? "justify-center" : "gap-3"}`}>
          <div className="p-1.5 bg-blue-500/10 border border-blue-500/30 rounded-lg animate-pulse-glow flex-shrink-0">
            <Shield className="w-5 h-5 text-blue-400" />
          </div>
          {!collapsed && (
            <div>
              <span className="font-extrabold text-sm tracking-wider text-white">FRAUDSHIELD</span>
              <span className="block text-[8px] text-gray-500 font-semibold tracking-widest uppercase">FINTECH SAFETY</span>
            </div>
          )}
        </div>

        {/* Primary Navigation */}
        <nav className="p-2 space-y-1 mt-3 flex-1 overflow-y-auto overflow-x-hidden">
          {!collapsed && (
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-600 px-3 mb-2">Main Menu</p>
          )}
          {primaryItems.map(item => <NavButton key={item.id} item={item} />)}

          <div className="my-3 border-t border-white/5" />

          {!collapsed && (
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-600 px-3 mb-2">Tools</p>
          )}
          {secondaryItems.map(item => <NavButton key={item.id} item={item} />)}
        </nav>
      </div>

      {/* Collapse Toggle */}
      <div className="p-2 border-t border-white/5">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm text-gray-500 hover:text-white transition-colors ${
            collapsed ? "justify-center" : "justify-end"
          }`}
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed
            ? <ChevronRight className="w-5 h-5" />
            : <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-white">
                <ChevronLeft className="w-4 h-4" /> Collapse
              </div>
          }
        </button>
      </div>
    </aside>
  );
}
