import React from "react";
import { 
  Shield, LayoutDashboard, FileText, Database, 
  BarChart3, History, ShieldAlert, Settings, 
  HelpCircle, ChevronLeft, ChevronRight 
} from "lucide-react";

export default function Sidebar({ activeTab, setActiveTab, collapsed, setCollapsed }) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: "invoices", label: "Invoices", icon: <FileText className="w-5 h-5" /> },
    { id: "vendors", label: "Vendor Database", icon: <Database className="w-5 h-5" /> },
    { id: "analytics", label: "Analytics", icon: <BarChart3 className="w-5 h-5" /> },
    { id: "audit-logs", label: "Audit Logs", icon: <History className="w-5 h-5" /> },
    { id: "admin", label: "Admin Panel", icon: <ShieldAlert className="w-5 h-5" /> },
    { id: "settings", label: "Settings", icon: <Settings className="w-5 h-5" /> }
  ];

  return (
    <aside 
      className={`glass-panel border-r border-white/5 min-h-screen flex flex-col justify-between transition-all duration-300 relative z-40 ${
        collapsed ? "w-16" : "w-64"
      }`}
      style={{
        borderRadius: "0px",
        background: "rgba(10, 11, 13, 0.9)"
      }}
    >
      <div>
        {/* Logo Section */}
        <div className={`p-4 flex items-center border-b border-white/5 ${collapsed ? "justify-center" : "gap-3"}`}>
          <div className="p-1.5 bg-blue-500/10 border border-blue-500/30 rounded-lg animate-pulse-glow">
            <Shield className="w-5 h-5 text-blue-400" />
          </div>
          {!collapsed && (
            <div>
              <span className="font-extrabold text-sm tracking-wider text-white">FRAUDSHIELD</span>
              <span className="block text-[8px] text-gray-500 font-semibold tracking-widest uppercase">FINTECH SAFETY</span>
            </div>
          )}
        </div>

        {/* Navigation items */}
        <nav className="p-2 space-y-1.5 mt-4">
          {menuItems.map((item) => (
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
              <div className={`transition-transform duration-200 hover:rotate-6`}>
                {item.icon}
              </div>
              {!collapsed && <span className="font-medium tracking-wide">{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* Collapse Toggle Footer & Help Info */}
      <div className="p-2 border-t border-white/5 space-y-1">
        <button
          onClick={() => setActiveTab("help")}
          className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 border border-transparent ${
            activeTab === "help" ? "bg-blue-600/15 border border-blue-500/35 text-white" : ""
          } ${collapsed ? "justify-center" : ""}`}
          title={collapsed ? "Help Documentation" : ""}
        >
          <HelpCircle className="w-5 h-5" />
          {!collapsed && <span className="font-medium tracking-wide">Help & Docs</span>}
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm text-gray-500 hover:text-white transition-colors ${
            collapsed ? "justify-center" : "justify-end"
          }`}
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-white"><ChevronLeft className="w-4 h-4" /> Collapse</div>}
        </button>
      </div>
    </aside>
  );
}
