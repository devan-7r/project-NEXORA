import React, { useState, useEffect } from "react";
import { User, ArrowRight } from "lucide-react";
import SplashScreen from "./components/SplashScreen";
import Login from "./components/Login";
import Onboarding from "./components/Onboarding";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DashboardView from "./components/DashboardView";
import InvoicesView from "./components/InvoicesView";
import InvoiceDetailPanel from "./components/InvoiceDetailPanel";
import ChatBot from "./components/ChatBot";
import VoiceAssistantView from "./components/VoiceAssistantView";
import AnalyticsView from "./components/AnalyticsView";
import AuditLogsView from "./components/AuditLogsView";
import VendorDatabaseView from "./components/VendorDatabaseView";
import SettingsView from "./components/SettingsView";
import HelpView from "./components/HelpView";
import AdminView from "./components/AdminView";

import { 
  INITIAL_INVOICES, 
  INITIAL_VENDORS, 
  INITIAL_AUDIT_LOGS 
} from "./utils/demoData";

export default function App() {
  // App navigation state: 'splash' | 'login' | 'app'
  const [appStep, setAppStep] = useState("splash");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [showPersonalizationModal, setShowPersonalizationModal] = useState(false);
  
  // Search & Drawer
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoiceNumber, setSelectedInvoiceNumber] = useState(null);

  // Database States
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);
  const [vendors, setVendors] = useState(INITIAL_VENDORS);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);
  
  // Settings & Accessibility
  const [voiceSettings, setVoiceSettings] = useState({ enabled: true, volume: 1.0, pitch: 1.0, rate: 1.0 });
  const [accessibility, setAccessibility] = useState({ highContrast: false, fontSize: "default", logoutTimer: "Never" });
  
  // Current session user details
  const [currentUser, setCurrentUser] = useState({ name: "Admin", role: "Admin" });
  const [presentationMode, setPresentationMode] = useState(false);

  // Notification Feed list
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "fraud",
      title: "Invoice High Risk Alert",
      message: "INV-2026-002: Bank details mismatch & amount 420% above average.",
      time: "5m",
      read: false,
      invoiceNumber: "INV-2026-002"
    },
    {
      id: 2,
      type: "duplicate",
      title: "Duplicate PO Draw Detected",
      message: "INV-2026-005 shares identical specifications with INV-2026-001.",
      time: "20m",
      read: false,
      invoiceNumber: "INV-2026-005"
    }
  ]);

  // Check onboarding completion on app launch
  const handleLoginSuccess = (name) => {
    if (name) {
      setCurrentUser(prev => ({ ...prev, name }));
    }
    setAppStep("app");
    setShowPersonalizationModal(true);
    const completed = localStorage.getItem("fraudshield_onboarding_completed");
    if (!completed) {
      setShowOnboarding(true);
    }
  };

  // Centralized toggle presentation mode handler
  const togglePresentationMode = () => {
    setPresentationMode(prev => {
      const nextMode = !prev;
      if (nextMode) {
        document.body.classList.add("presentation-mode");
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      } else {
        document.body.classList.remove("presentation-mode");
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      }
      return nextMode;
    });
  };

  // Keyboard Shortcuts (Hotkeys) for Dashboard
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 1. Ctrl + S: Focus Global Search input
      if (e.ctrlKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder="Global smart search..."]');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }

      // 2. Ctrl + U: Switch to Invoices tab and open file selection dialog
      if (e.ctrlKey && e.key.toLowerCase() === "u") {
        e.preventDefault();
        setActiveTab("invoices");
        setTimeout(() => {
          const fileInput = document.querySelector('input[type="file"]');
          if (fileInput) {
            fileInput.click();
          }
        }, 100);
      }

      // 3. Esc: Close active drawer
      if (e.key === "Escape") {
        setSelectedInvoiceNumber(null);
      }

      // 4. Ctrl + D: Toggle Presentation Mode
      if (e.ctrlKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        togglePresentationMode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Find active invoice object
  const activeInvoice = invoices.find(i => i.invoiceNumber === selectedInvoiceNumber);

  // Handler: Update validation decision
  const handleUpdateInvoiceStatus = (invoiceNumber, newStatus) => {
    // 1. Update invoice status
    setInvoices(prev => 
      prev.map(inv => 
        inv.invoiceNumber === invoiceNumber 
          ? { 
              ...inv, 
              status: newStatus,
              history: [
                {
                  timestamp: new Date().toISOString(),
                  action: `Status Updated to ${newStatus}`,
                  user: `${currentUser.name} (${currentUser.role})`
                },
                ...inv.history
              ]
            } 
          : inv
      )
    );

    // 2. Log in compliance audits
    const logEntry = {
      timestamp: new Date().toISOString(),
      user: currentUser.name,
      action: `Approved Invoice: ${invoiceNumber}`,
      status: "Success",
      ipAddress: "192.168.1.50",
      device: "Windows 11 PC / Chrome",
      location: "Mumbai, India",
      invoiceNumber: invoiceNumber,
      result: `Invoice updated to: ${newStatus}`
    };
    setAuditLogs(prev => [logEntry, ...prev]);

    // 3. Post to notification alerts
    const newNotif = {
      id: Date.now(),
      type: newStatus === "Approved" ? "approved" : "fraud",
      title: `Invoice audit: ${newStatus}`,
      message: `${invoiceNumber} has been updated by ${currentUser.name}.`,
      time: "1s",
      read: false,
      invoiceNumber: invoiceNumber
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Handler: Blacklist Vendor
  const handleBlacklistVendor = (vendorId, vendorName) => {
    // 1. Change status in vendors DB
    setVendors(prev => 
      prev.map(v => 
        v.id === vendorId 
          ? { ...v, status: "Suspicious", trustScore: 10, activeStatus: "Inactive" } 
          : v
      )
    );

    // 2. Add audit entry
    const logEntry = {
      timestamp: new Date().toISOString(),
      user: currentUser.name,
      action: `Blacklisted Vendor: ${vendorName} (${vendorId})`,
      status: "Warning",
      ipAddress: "192.168.1.50",
      device: "Windows 11 PC / Chrome",
      location: "Mumbai, India",
      invoiceNumber: "N/A",
      result: "Vendor registry disabled due to high fraud risk factors."
    };
    setAuditLogs(prev => [logEntry, ...prev]);

    // 3. Create toast notifications
    const newNotif = {
      id: Date.now(),
      type: "fraud",
      title: "Vendor Blacklisted",
      message: `${vendorName} registry blocked from standard payment processing.`,
      time: "1s",
      read: false,
      invoiceNumber: "N/A"
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  return (
    <div className="min-h-screen flex text-white relative">
      {/* 1. Splash Screen Loader */}
      {appStep === "splash" && (
        <SplashScreen onComplete={() => setAppStep("login")} />
      )}

      {/* 2. Split Screen Login Panel */}
      {appStep === "login" && (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}

      {/* 3. Main Application Workspace Frame */}
      {appStep === "app" && (
        <div className="flex w-full overflow-hidden">
          
          {/* Sidebar Left Navigation */}
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            collapsed={collapsed}
            setCollapsed={setCollapsed}
          />

          {/* Core Shell Body Wrapper */}
          <div className="flex-1 flex flex-col min-h-screen bg-[#060709] overflow-hidden relative">
            
            {/* Top Header controls */}
            <Header 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              notifications={notifications}
              setNotifications={setNotifications}
              presentationMode={presentationMode}
              togglePresentationMode={togglePresentationMode}
              currentUser={currentUser}
              setActiveTab={setActiveTab}
              onOpenInvoice={(num) => setSelectedInvoiceNumber(num)}
            />

            {/* Content view tabs switcher */}
            <main className="flex-1 overflow-y-auto p-6 relative">
              {activeTab === "dashboard" && (
                <DashboardView 
                  invoices={invoices} 
                  vendors={vendors} 
                  auditLogs={auditLogs}
                  onOpenInvoice={(num) => setSelectedInvoiceNumber(num)}
                  currentUser={currentUser}
                />
              )}
              {/* Invoices tab (previously 'search') */}
              {(activeTab === "invoices" || activeTab === "search") && (
                <InvoicesView 
                  invoices={invoices}
                  setInvoices={setInvoices}
                  onOpenInvoice={(num) => setSelectedInvoiceNumber(num)}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  mode="search"
                  vendors={vendors}
                />
              )}
              {/* History kept for backward compat */}
              {activeTab === "history" && (
                <InvoicesView 
                  invoices={invoices}
                  setInvoices={setInvoices}
                  onOpenInvoice={(num) => setSelectedInvoiceNumber(num)}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  mode="history"
                  vendors={vendors}
                />
              )}
              {/* Fraud Reports: filter InvoicesView to high-risk only */}
              {activeTab === "fraud-reports" && (
                <InvoicesView 
                  invoices={invoices}
                  setInvoices={setInvoices}
                  onOpenInvoice={(num) => setSelectedInvoiceNumber(num)}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  mode="fraud"
                  vendors={vendors}
                />
              )}
              {activeTab === "vendor-database" && (
                <VendorDatabaseView 
                  vendors={vendors}
                  setVendors={setVendors}
                  invoices={invoices}
                />
              )}
              {activeTab === "analytics" && (
                <AnalyticsView 
                  invoices={invoices}
                  vendors={vendors}
                />
              )}
              {activeTab === "audit-logs" && (
                <AuditLogsView 
                  auditLogs={auditLogs}
                  currentUser={currentUser}
                />
              )}
              {activeTab === "chatbot" && (
                <ChatBot 
                  invoices={invoices}
                  vendors={vendors}
                  setActiveTab={setActiveTab}
                  onOpenInvoice={(num) => setSelectedInvoiceNumber(num)}
                  voiceSettings={voiceSettings}
                  fullScreen={true}
                />
              )}
              {activeTab === "voice-assistant" && (
                <VoiceAssistantView 
                  invoices={invoices}
                  voiceSettings={voiceSettings}
                />
              )}
              {activeTab === "settings" && (
                <SettingsView 
                  voiceSettings={voiceSettings}
                  setVoiceSettings={setVoiceSettings}
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                />
              )}
              {activeTab === "help" && (
                <HelpView />
              )}
              {activeTab === "admin" && (
                <AdminView 
                  invoices={invoices}
                  vendors={vendors}
                  setVendors={setVendors}
                  setInvoices={setInvoices}
                  auditLogs={auditLogs}
                  currentUser={currentUser}
                />
              )}
            </main>

            {/* Chatbot Voice & Text Assistant */}
            {activeTab !== "chatbot" && (
              <ChatBot 
                invoices={invoices}
                vendors={vendors}
                setActiveTab={setActiveTab}
                onOpenInvoice={(num) => setSelectedInvoiceNumber(num)}
                voiceSettings={voiceSettings}
              />
            )}

            {/* Onboarding walk-through modal */}
            {showOnboarding && (
              <Onboarding onClose={() => setShowOnboarding(false)} />
            )}

            {/* Personalization name prompt modal */}
            {showPersonalizationModal && (
              <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[1000] p-4 animate-fade-in">
                <div className="glass-panel w-full max-w-md p-8 relative flex flex-col items-center text-center shadow-[0_0_50px_rgba(59,130,246,0.15)] border border-white/10 animate-scale">
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-full mb-6">
                    <User className="w-8 h-8 text-blue-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">Auditor Profile Activation</h2>
                  <p className="text-gray-400 text-xs mb-6 leading-relaxed">
                    Please confirm or enter your name to personalize your dashboard greetings and ledger audit logs.
                  </p>
                  <div className="w-full space-y-4">
                    <input 
                      type="text"
                      value={currentUser.name}
                      onChange={(e) => setCurrentUser(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Auditor Name"
                      className="input-premium w-full text-center text-sm bg-black/40 border-white/5 focus:border-blue-500/50"
                      required
                    />
                    <button
                      onClick={() => {
                        if (currentUser.name.trim()) {
                          setShowPersonalizationModal(false);
                        }
                      }}
                      className="btn-premium btn-primary w-full py-3 text-xs justify-center rounded-lg font-bold uppercase tracking-wider mt-4 gap-2 shadow-[0_4px_20px_rgba(37,99,235,0.2)]"
                    >
                      Initialize Workspace
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Sliding detailed invoice drawer */}
            {activeInvoice && (
              <InvoiceDetailPanel 
                invoice={activeInvoice}
                invoices={invoices}
                vendors={vendors}
                onClose={() => setSelectedInvoiceNumber(null)}
                onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
                onBlacklistVendor={handleBlacklistVendor}
              />
            )}

          </div>
        </div>
      )}
    </div>
  );
}
