import React, { useState, useEffect } from "react";
import SplashScreen from "./components/SplashScreen";
import Login from "./components/Login";
import Onboarding from "./components/Onboarding";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DashboardView from "./components/DashboardView";
import InvoicesView from "./components/InvoicesView";
import VendorDatabaseView from "./components/VendorDatabaseView";
import AnalyticsView from "./components/AnalyticsView";
import AuditLogsView from "./components/AuditLogsView";
import AdminView from "./components/AdminView";
import SettingsView from "./components/SettingsView";
import HelpView from "./components/HelpView";
import InvoiceDetailPanel from "./components/InvoiceDetailPanel";
import ChatBot from "./components/ChatBot";

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
  const [currentUser, setCurrentUser] = useState({ name: "Devan Malhotra", role: "Admin" });
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
  const handleLoginSuccess = () => {
    setAppStep("app");
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
                />
              )}
              {activeTab === "invoices" && (
                <InvoicesView 
                  invoices={invoices}
                  setInvoices={setInvoices}
                  onOpenInvoice={(num) => setSelectedInvoiceNumber(num)}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />
              )}
              {activeTab === "vendors" && (
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
                  onOpenInvoice={(num) => setSelectedInvoiceNumber(num)}
                />
              )}
              {activeTab === "admin" && (
                <AdminView 
                  currentUser={currentUser} 
                  setCurrentUser={setCurrentUser}
                />
              )}
              {activeTab === "settings" && (
                <SettingsView 
                  voiceSettings={voiceSettings}
                  setVoiceSettings={setVoiceSettings}
                  accessibility={accessibility}
                  setAccessibility={setAccessibility}
                />
              )}
              {activeTab === "help" && <HelpView />}
            </main>

            {/* Chatbot Voice & Text Assistant */}
            <ChatBot 
              invoices={invoices}
              vendors={vendors}
              setActiveTab={setActiveTab}
              onOpenInvoice={(num) => setSelectedInvoiceNumber(num)}
              voiceSettings={voiceSettings}
            />

            {/* Onboarding walk-through modal */}
            {showOnboarding && (
              <Onboarding onClose={() => setShowOnboarding(false)} />
            )}

            {/* Sliding detailed invoice drawer */}
            {activeInvoice && (
              <InvoiceDetailPanel 
                invoice={activeInvoice}
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
