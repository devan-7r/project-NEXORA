import React, { useState, useEffect } from "react";
import { 
  X, ShieldCheck, ShieldAlert, AlertTriangle, Download, Printer, 
  Check, Ban, ArrowUpRight, ChevronDown, ChevronUp, Clock, Info
} from "lucide-react";
import { exportInvoiceToPDF, exportToCSV, exportToJSON, exportToExcel } from "../utils/exportHelper";
import confetti from "canvas-confetti";
import { detectFraud } from "../utils/fraudChecker";

export default function InvoiceDetailPanel({ invoice, invoices = [], vendors = [], onClose, onUpdateInvoiceStatus, onBlacklistVendor }) {
  const [collapsedCards, setCollapsedCards] = useState({
    vendorInfo: false,
    invoiceInfo: false,
    auditTrail: false
  });

  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'factors'

  // Threat simulation sandbox states
  const [sandboxAmount, setSandboxAmount] = useState(invoice.amount);
  const [sandboxGstActive, setSandboxGstActive] = useState(true);
  const [sandboxBankMatch, setSandboxBankMatch] = useState(true);
  const [sandboxUploadHour, setSandboxUploadHour] = useState(10);
  const [sandboxDomainMatch, setSandboxDomainMatch] = useState(true);

  // Sync state when prop invoice changes
  useEffect(() => {
    setSandboxAmount(invoice.amount);
    
    // Determine defaults from the current invoice
    const isHighRisk = invoice.fraudScore >= 70;
    setSandboxGstActive(isHighRisk ? false : true);
    setSandboxBankMatch(isHighRisk ? false : true);
    
    const date = new Date(invoice.timestamp);
    const dateHour = date.getHours();
    setSandboxUploadHour(isNaN(dateHour) ? 10 : dateHour);
    
    setSandboxDomainMatch(isHighRisk ? false : true);
  }, [invoice]);

  // Recalculates risk indicators based on sandbox controls using the rules engine
  const recalculateAIAnalysis = (amount, gstActive, bankMatch, uploadHour, domainMatch) => {
    const mock = {
      ...invoice,
      amount: parseFloat(amount),
      taxAmount: Math.round(parseFloat(amount) * 0.18),
      grandTotal: Math.round(parseFloat(amount) * 1.18),
      gstNumber: gstActive ? invoice.gstNumber : "INVALID_GST_ANOMALY",
      bankAccount: bankMatch ? invoice.bankAccount : "99999999999_MISMATCH",
      timestamp: new Date(new Date(invoice.timestamp || Date.now()).setHours(uploadHour)).toISOString(),
      email: domainMatch ? invoice.email : "spoofed@domain-sec.org",
      ocrMismatch: !bankMatch || !gstActive,
      hasSignature: invoice.hasSignature !== undefined ? invoice.hasSignature : true,
      hasStamp: invoice.hasStamp !== undefined ? invoice.hasStamp : true
    };
    
    return detectFraud(mock, invoices, vendors);
  };

  const simulatedInvoice = recalculateAIAnalysis(
    sandboxAmount,
    sandboxGstActive,
    sandboxBankMatch,
    sandboxUploadHour,
    sandboxDomainMatch
  );

  // Trigger confetti for Safe Approvals
  const handleApprove = () => {
    onUpdateInvoiceStatus(invoice.invoiceNumber, "Approved");
    if (simulatedInvoice.riskLevel === "SAFE") {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleReject = () => {
    onUpdateInvoiceStatus(invoice.invoiceNumber, "Fraud");
  };

  const handleBlacklist = () => {
    onBlacklistVendor(invoice.vendorId, invoice.vendorName);
  };

  const toggleCard = (card) => {
    setCollapsedCards(prev => ({ ...prev, [card]: !prev[card] }));
  };

  // Speedometer Needle rotation calculation (0 to 180 degrees map to 0 to 100%)
  const needleRotation = (simulatedInvoice.fraudScore / 100) * 180 - 90; // map center relative

  // Circle gauge stroke dashboard calculation for Confidence
  const radius = 35;
  const strokeDash = 2 * Math.PI * radius; // 219.9
  const strokeOffset = strokeDash - (simulatedInvoice.aiConfidence / 100) * strokeDash;

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-4xl bg-[#0d0f14] border-l border-white/10 z-[80] shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-slide-in-toast">
      
      {/* HEADER SECTION */}
      <div className="p-4 bg-slate-950/80 border-b border-white/5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-white">Invoice System Audit</span>
            <span className="text-[10px] bg-blue-600/20 border border-blue-500/30 text-blue-400 font-bold px-2 py-0.5 rounded">
              {invoice.invoiceNumber}
            </span>
          </div>
          <span className="text-[10px] text-gray-500 font-medium mt-0.5 block">
             ingested {new Date(invoice.timestamp).toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Print Button */}
          <button 
            onClick={() => exportInvoiceToPDF(simulatedInvoice)}
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-gray-400 hover:text-white"
            title="Print Report / Export PDF"
          >
            <Printer className="w-4 h-4" />
          </button>
          
          {/* Close Panel Button */}
          <button 
            onClick={onClose}
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* BODY CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* ROW 1: SPEEDOMETER RISK DIAL & AI CONFIDENCE METERS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* LEFT CARD: RISK SPEEDOMETER */}
          <div className="glass-panel p-5 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 absolute top-4 left-4">Fraud Risk Audit</h3>
            
            {/* The speed dial */}
            <div className="speedometer mt-6">
              {/* Fill colored track (Safe Green -> Review Yellow -> High Red) */}
              <div className="speedometer-track" />
              <div 
                className={`speedometer-fill`} 
                style={{ 
                  transform: `rotate(${needleRotation}deg)`,
                  borderTopColor: simulatedInvoice.riskLevel === "SAFE" ? "#10b981" : simulatedInvoice.riskLevel === "REVIEW" ? "#f59e0b" : simulatedInvoice.riskLevel === "SUSPICIOUS" ? "#f97316" : "#ef4444"
                }} 
              />
              <div className="speedometer-needle" style={{ transform: `rotate(${needleRotation}deg)` }} />
              <div className="speedometer-center" />
            </div>

            {/* Score label info */}
            <div className="mt-2">
              <span className="block text-3xl font-black font-mono text-white leading-none">{simulatedInvoice.fraudScore}%</span>
              <span className={`badge-risk mt-2 ${
                simulatedInvoice.riskLevel === "SAFE" 
                  ? "badge-risk-safe" 
                  : simulatedInvoice.riskLevel === "REVIEW" 
                  ? "badge-risk-review" 
                  : simulatedInvoice.riskLevel === "SUSPICIOUS" 
                  ? "badge-risk-suspicious" 
                  : "badge-risk-high"
              }`}>
                {simulatedInvoice.badgeText || simulatedInvoice.riskLevel}
              </span>
            </div>

            {/* Indicator four-light strip */}
            <div className="flex gap-3 mt-4 border border-white/5 bg-black/40 px-3.5 py-2 rounded-full">
              <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400">
                <span className={`w-2 h-2 rounded-full ${simulatedInvoice.riskLevel === "SAFE" ? "bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" : "bg-emerald-950"}`} />
                <span>VERIFIED</span>
              </div>
              <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400">
                <span className={`w-2 h-2 rounded-full ${simulatedInvoice.riskLevel === "REVIEW" ? "bg-yellow-500 shadow-[0_0_8px_#f59e0b] animate-pulse" : "bg-yellow-950"}`} />
                <span>REVIEW</span>
              </div>
              <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400">
                <span className={`w-2 h-2 rounded-full ${simulatedInvoice.riskLevel === "SUSPICIOUS" ? "bg-orange-500 shadow-[0_0_8px_#f97316] animate-pulse" : "bg-orange-950"}`} />
                <span>SUSPICIOUS</span>
              </div>
              <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400">
                <span className={`w-2 h-2 rounded-full ${simulatedInvoice.riskLevel === "HIGH RISK" ? "bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse" : "bg-red-950"}`} />
                <span>HIGH RISK</span>
              </div>
            </div>
          </div>

          {/* RIGHT CARD: AI CONFIDENCE PROGRESS RING */}
          <div className="glass-panel p-5 relative overflow-hidden">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">AI Confidence Meter</h3>

            <div className="flex items-center gap-6">
              {/* Circular Gauge */}
              <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r={radius} fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="5" />
                  <circle 
                    cx="40" cy="40" r={radius} 
                    fill="transparent" 
                    stroke={simulatedInvoice.aiConfidence >= 95 ? "#10b981" : simulatedInvoice.aiConfidence >= 80 ? "#3b82f6" : simulatedInvoice.aiConfidence >= 60 ? "#f59e0b" : "#ef4444"} 
                    strokeWidth="5" 
                    strokeDasharray={strokeDash}
                    strokeDashoffset={strokeOffset}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="block text-lg font-bold font-mono text-white">{simulatedInvoice.aiConfidence}%</span>
                  <span className="text-[7px] text-gray-500 uppercase tracking-widest leading-none">Certitude</span>
                </div>
              </div>

              {/* Status Explanation text */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-white block">{simulatedInvoice.confidenceStatus}</span>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  {simulatedInvoice.aiConfidence >= 95 && "AI is highly confident in this assessment. All key registry details align perfectly."}
                  {simulatedInvoice.aiConfidence >= 80 && simulatedInvoice.aiConfidence < 95 && "Strong evidence supports this result. Core credentials verified."}
                  {simulatedInvoice.aiConfidence >= 60 && simulatedInvoice.aiConfidence < 80 && "Medium certainty index. Additional audit checks recommended."}
                  {simulatedInvoice.aiConfidence < 60 && "Insufficient registry evidence. Manual operator review mandated."}
                </p>
              </div>
            </div>

            {/* Configurable tab factors */}
            <div className="mt-4 border-t border-white/5 pt-3">
              <div className="flex gap-2 border-b border-white/5 pb-2 mb-2 text-[10px] font-bold uppercase tracking-wider">
                <button 
                  onClick={() => setActiveTab("overview")} 
                  className={`pb-1 ${activeTab === "overview" ? "text-blue-400 border-b border-blue-400" : "text-gray-500"}`}
                >
                  Confidence Reasons
                </button>
                <button 
                  onClick={() => setActiveTab("factors")} 
                  className={`pb-1 ${activeTab === "factors" ? "text-blue-400 border-b border-blue-400" : "text-gray-500"}`}
                >
                  Contribution Weights
                </button>
              </div>

              {activeTab === "overview" ? (
                <div className="space-y-1.5 text-[10px] text-gray-300">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Why This Score?</span>
                    <span className="font-semibold">{simulatedInvoice.aiConfidence >= 90 ? "High registry validation coverage" : "High metadata deviation"}</span>
                  </div>
                  <div className="text-[10px] text-gray-400 bg-white/5 p-2 rounded leading-normal">
                    {simulatedInvoice.aiConfidence >= 95 
                      ? "Vendor matched, GST registration verified active, correct PO references, correct bank IFSC nodes."
                      : "Mismatched bank accounts, unverified GST statuses, or lack of historical invoice baselines reduce verification confidence."}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 text-[9px] text-gray-400">
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span>Vendor registry check</span>
                    <span className="font-bold text-white font-mono">{simulatedInvoice.confidenceFactors.vendorVerification}%</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span>GST registry verification</span>
                    <span className="font-bold text-white font-mono">{simulatedInvoice.confidenceFactors.gstValidation}%</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span>Duplicate checks</span>
                    <span className="font-bold text-white font-mono">{simulatedInvoice.confidenceFactors.duplicateDetection}%</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span>Bank account match</span>
                    <span className="font-bold text-white font-mono">{simulatedInvoice.confidenceFactors.paymentVerification}%</span>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* INNOVATIVE WHAT-IF SANDBOX CONTROLS */}
        <div className="glass-panel p-5 border border-blue-500/20 bg-blue-950/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2 text-white">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <h3 className="text-xs font-black uppercase tracking-wider text-blue-400">
                🔬 Live Neural Threat Simulation Sandbox (What-If Analysis)
              </h3>
            </div>
            <button 
              onClick={() => {
                setSandboxAmount(invoice.amount);
                const isHighRisk = invoice.fraudScore >= 70;
                setSandboxGstActive(isHighRisk ? false : true);
                setSandboxBankMatch(isHighRisk ? false : true);
                const dateHour = new Date(invoice.timestamp).getHours();
                setSandboxUploadHour(isNaN(dateHour) ? 10 : dateHour);
                setSandboxDomainMatch(isHighRisk ? false : true);
              }}
              className="text-[10px] text-gray-500 hover:text-white uppercase tracking-wider border border-white/5 px-2.5 py-1 rounded hover:bg-white/5 transition-colors"
            >
              Reset to Original
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {/* Amount Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-400">Simulate Invoice Amount</span>
                <span className="font-bold text-white font-mono">₹{sandboxAmount.toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min="10000" 
                max="3000000" 
                step="10000"
                value={sandboxAmount}
                onChange={(e) => setSandboxAmount(Number(e.target.value))}
                className="w-full accent-blue-500 bg-slate-950 h-1 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-[9px] text-gray-500 flex justify-between font-mono">
                <span>₹10,000</span>
                <span>₹3,000,000</span>
              </div>
            </div>

            {/* Upload Hour Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-400">Simulate Ingest Hour</span>
                <span className="font-bold text-white font-mono">{sandboxUploadHour === 0 ? '12' : sandboxUploadHour > 12 ? sandboxUploadHour - 12 : sandboxUploadHour}:00 {sandboxUploadHour >= 12 ? 'PM' : 'AM'}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="23" 
                step="1"
                value={sandboxUploadHour}
                onChange={(e) => setSandboxUploadHour(Number(e.target.value))}
                className="w-full accent-blue-500 bg-slate-950 h-1 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-[9px] text-gray-500 flex justify-between font-mono">
                <span>12 AM (Midnight)</span>
                <span>12 PM</span>
                <span>11 PM</span>
              </div>
            </div>

            {/* Checkbox Options Grid */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer p-2.5 rounded bg-black/40 border border-white/5 hover:border-white/10 select-none">
                <input 
                  type="checkbox" 
                  checked={sandboxGstActive}
                  onChange={(e) => setSandboxGstActive(e.target.checked)}
                  className="accent-blue-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-[11px] text-gray-300">GSTIN Registration Active</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer p-2.5 rounded bg-black/40 border border-white/5 hover:border-white/10 select-none">
                <input 
                  type="checkbox" 
                  checked={sandboxBankMatch}
                  onChange={(e) => setSandboxBankMatch(e.target.checked)}
                  className="accent-blue-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-[11px] text-gray-300">Bank Destination Confirmed</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer p-2.5 rounded bg-black/40 border border-white/5 hover:border-white/10 select-none">
                <input 
                  type="checkbox" 
                  checked={sandboxDomainMatch}
                  onChange={(e) => setSandboxDomainMatch(e.target.checked)}
                  className="accent-blue-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-[11px] text-gray-300">Sender Email Domain Verified</span>
              </label>
            </div>
          </div>
        </div>

        {/* ROW 2: AI EXPLANATION & ACTIONABLE RECOMMENDATIONS */}
        <div className="glass-panel p-5 border-l-2 border-l-amber-500 space-y-4">
          <div className="flex items-center gap-2 text-white">
            <Info className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Explainable AI Audit Log</h3>
          </div>
          
          <div className="text-xs leading-relaxed text-gray-300">
            <strong>Diagnostic Report:</strong> {simulatedInvoice.aiExplanation}
          </div>

          <div className="space-y-2 mt-4 pt-3 border-t border-white/5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500 block">AI Resolution Action Guidelines</span>
            <ul className="list-disc pl-4 text-xs text-gray-400 space-y-1">
              {simulatedInvoice.aiRecommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* ROW 3: VENDOR AND INVOICE DATA CARDS (COLLAPSIBLE DUAL COLUMN) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* VENDOR INFORMATION CARD */}
          <div className="glass-panel overflow-hidden">
            <button 
              onClick={() => toggleCard("vendorInfo")}
              className="w-full p-4 flex justify-between items-center text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
            >
              <span>Vendor Credentials</span>
              {collapsedCards.vendorInfo ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>

            {!collapsedCards.vendorInfo && (
              <div className="p-4 border-t border-white/5 space-y-3.5 text-xs animate-scale">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Legal Entity</span>
                  <span className="font-bold text-white">{invoice.vendorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Vendor ID Code</span>
                  <span className="font-mono text-gray-300">{invoice.vendorId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">GST Registration</span>
                  <span className="font-mono text-gray-300">{invoice.gstNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">PAN ID Registry</span>
                  <span className="font-mono text-gray-300">{invoice.panNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Registered Email</span>
                  <span className="text-gray-300">{invoice.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Bank Destination</span>
                  <span className="font-mono text-gray-300">A/C: {invoice.bankAccount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">IFSC Node Code</span>
                  <span className="font-mono text-gray-300">{invoice.ifscCode}</span>
                </div>
              </div>
            )}
          </div>

          {/* INVOICE DETAILS CARD */}
          <div className="glass-panel overflow-hidden">
            <button 
              onClick={() => toggleCard("invoiceInfo")}
              className="w-full p-4 flex justify-between items-center text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
            >
              <span>Document Metadata</span>
              {collapsedCards.invoiceInfo ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>

            {!collapsedCards.invoiceInfo && (
              <div className="p-4 border-t border-white/5 space-y-3.5 text-xs animate-scale">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Invoice Reference</span>
                  <span className="font-bold text-white">{invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Purchase Order</span>
                  <span className="font-mono text-gray-300">{invoice.poNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Billing Date</span>
                  <span className="text-gray-300">{invoice.invoiceDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Audit Due Limit</span>
                  <span className="text-gray-300">{invoice.dueDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Net Terms</span>
                  <span className="text-gray-300">{invoice.paymentTerms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Taxable Subtotal</span>
                  <span className="font-bold text-gray-200">₹{simulatedInvoice.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Levied GST (18%)</span>
                  <span className="font-bold text-gray-200">₹{simulatedInvoice.taxAmount.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* SERVICE ITEMS TABLE */}
        <div className="glass-panel p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-3 block">OCR Extracted Line Items</span>
          <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 text-left">
                  <th className="p-2 font-semibold">Description</th>
                  <th className="p-2 font-semibold text-right">Qty</th>
                  <th className="p-2 font-semibold text-right">Rate (₹)</th>
                  <th className="p-2 font-semibold text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                {simulatedInvoice.products.map((p, idx) => (
                  <tr key={idx} className="border-b border-white/5 text-gray-300">
                    <td className="p-2">{p.description}</td>
                    <td className="p-2 text-right">{p.quantity}</td>
                    <td className="p-2 text-right">₹{p.unitPrice.toLocaleString()}</td>
                    <td className="p-2 text-right font-bold text-white">₹{p.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* LOCAL HISTORICAL AUDIT TRAILS */}
        <div className="glass-panel overflow-hidden">
          <button 
            onClick={() => toggleCard("auditTrail")}
            className="w-full p-4 flex justify-between items-center text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
          >
            <span>Compliance History Trails</span>
            {collapsedCards.auditTrail ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>

          {!collapsedCards.auditTrail && (
            <div className="p-4 border-t border-white/5 space-y-3.5 animate-scale">
              <div className="space-y-3">
                {invoice.history.map((hist, idx) => (
                  <div key={idx} className="flex gap-3 text-xs leading-relaxed">
                    <div className="flex flex-col items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500/80 mt-1 shadow-[0_0_6px_#3b82f6]" />
                      {idx < invoice.history.length - 1 && <div className="w-[1.5px] bg-white/10 flex-1 my-1" />}
                    </div>
                    <div>
                      <div className="text-gray-500 font-mono text-[10px]">
                        {new Date(hist.timestamp).toLocaleString()}
                      </div>
                      <span className="font-semibold text-white">{hist.action}</span>
                      <span className="text-gray-400 font-medium"> by {hist.user}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* EXPORT DRAWER FOOTER PANEL */}
      <div className="p-4 bg-slate-950/80 border-t border-white/5 flex flex-wrap gap-3 items-center justify-between">
        
        {/* Export options */}
        <div className="flex items-center gap-1.5 hide-presentation">
          <span className="text-[10px] uppercase font-bold text-gray-500 mr-2">Download:</span>
          
          <button 
            onClick={() => exportInvoiceToPDF(simulatedInvoice)}
            className="btn-premium px-2.5 py-1 text-[10px]"
            title="Download PDF report"
          >
            <Download className="w-3.5 h-3.5 text-red-400" />
            PDF
          </button>

          <button 
            onClick={() => exportToCSV([simulatedInvoice])}
            className="btn-premium px-2.5 py-1 text-[10px]"
            title="Download CSV"
          >
            CSV
          </button>

          <button 
            onClick={() => exportToExcel([simulatedInvoice])}
            className="btn-premium px-2.5 py-1 text-[10px]"
            title="Download Excel"
          >
            Excel
          </button>

          <button 
            onClick={() => exportToJSON([simulatedInvoice])}
            className="btn-premium px-2.5 py-1 text-[10px]"
            title="Download JSON"
          >
            JSON
          </button>
        </div>

        {/* Verification Decisions */}
        <div className="flex gap-2 flex-1 md:flex-initial justify-end">
          {/* Blacklist Vendor */}
          {simulatedInvoice.riskLevel === "HIGH RISK" && (
            <button 
              onClick={handleBlacklist}
              className="btn-premium border-red-500/20 bg-red-950/5 hover:bg-red-900/10 text-red-400 text-xs px-4 py-2"
            >
              <Ban className="w-4 h-4" />
              Blacklist Vendor
            </button>
          )}

          {/* Reject */}
          {invoice.status === "Pending" && (
            <button 
              onClick={handleReject}
              className="btn-premium border-amber-500/20 bg-amber-950/5 hover:bg-amber-900/10 text-amber-500 text-xs px-4 py-2"
            >
              Flag Fraud
            </button>
          )}

          {/* Approve */}
          {invoice.status !== "Approved" ? (
            <button 
              onClick={handleApprove}
              className="btn-premium btn-emerald text-xs px-5 py-2 font-semibold shadow-[0_4px_15px_rgba(16,185,129,0.25)]"
            >
              <Check className="w-4 h-4" />
              Approve Release
            </button>
          ) : (
            <div className="flex items-center gap-1 text-emerald-400 font-bold uppercase tracking-wider text-xs px-4 py-2 border border-emerald-500/20 bg-emerald-500/10 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
              Released Approved
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
