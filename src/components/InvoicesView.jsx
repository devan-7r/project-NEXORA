import React, { useState, useEffect, useRef } from "react";
import { 
  Upload, FileText, Search, Filter, ShieldCheck, ShieldAlert, AlertTriangle,
  Play, Plus, ArrowRight, Eye, ChevronDown, Check, X, Info,
  ArrowUpDown, ArrowUp, ArrowDown
} from "lucide-react";
import confetti from "canvas-confetti";

export default function InvoicesView({ 
  invoices, 
  setInvoices, 
  onOpenInvoice, 
  searchQuery, 
  setSearchQuery 
}) {
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestProgress, setIngestProgress] = useState(0);
  const [ingestStep, setIngestStep] = useState(0);
  
  // Advanced filters state
  const [showFilters, setShowFilters] = useState(false);
  const [filterRisk, setFilterRisk] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterMinAmount, setFilterMinAmount] = useState("");
  const [filterMaxAmount, setFilterMaxAmount] = useState("");

  // Sorting state
  const [sortField, setSortField] = useState("invoiceDate");
  const [sortDir, setSortDir] = useState("desc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fileInputRef = useRef(null);

  // Upload Overlay Alert state
  const [uploadAlert, setUploadAlert] = useState(null);

  const stepsList = [
    "Reading Uploaded Document Structure...",
    "Extracting OCR Digital Text Blocks...",
    "Correlating Vendor Registry Status...",
    "Verifying Invoice Reference Serial...",
    "Cross-Checking Duplicate Payments...",
    "Validating GSTIN Ledger Registration...",
    "Analyzing Payment Account Route...",
    "Validating Submission Timestamp...",
    "Calculating ML Pattern Anomalies...",
    "Generating Final Anomaly Risk Score..."
  ];

  // Trigger confetti for Safe uploads
  useEffect(() => {
    if (uploadAlert && uploadAlert.status === "safe") {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [uploadAlert]);

  // Run the 10-step simulation
  const runVerificationPipeline = (invoiceData) => {
    setIsIngesting(true);
    setIngestProgress(0);
    setIngestStep(0);

    const stepInterval = 350; // time per step
    
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      setIngestStep(currentStep);
      setIngestProgress(Math.floor((currentStep / stepsList.length) * 100));

      if (currentStep >= stepsList.length) {
        clearInterval(interval);
        setTimeout(() => {
          setIsIngesting(false);
          
          // Add invoice to active database state
          const exists = invoices.some(i => i.invoiceNumber === invoiceData.invoiceNumber);
          if (!exists) {
            setInvoices(prev => [invoiceData, ...prev]);
          }

          // Trigger Decision Overlay Alert modal instead of immediate drawer
          setUploadAlert({
            status: invoiceData.riskLevel === "HIGH RISK" ? "fraud" : invoiceData.riskLevel === "REVIEW" ? "review" : "safe",
            invoiceNumber: invoiceData.invoiceNumber,
            vendorName: invoiceData.vendorName,
            amount: invoiceData.amount,
            fraudScore: invoiceData.fraudScore,
            aiExplanation: invoiceData.aiExplanation
          });

        }, 300);
      }
    }, stepInterval);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    triggerScenario("fraud");
  };

  // Preset Scenario simulations (Safe, Review, Fraud)
  const triggerScenario = (type = "fraud") => {
    let mockInvoice = {};

    if (type === "fraud") {
      mockInvoice = {
        invoiceNumber: "INV-2026-002",
        vendorName: "NeoTech Solutions",
        vendorId: "VEND-009",
        poNumber: "PO-88127",
        invoiceDate: "2026-07-09",
        dueDate: "2026-07-10",
        timestamp: new Date().toISOString(),
        currency: "INR",
        amount: 2400000,
        taxAmount: 432000,
        gstNumber: "27BBBBB2222B2Z2",
        panNumber: "BBBBB2222B",
        bankAccount: "50201088491223",
        ifscCode: "ICIC0000210",
        paymentTerms: "Immediate",
        buyerName: "Enterprise Corp India",
        buyerAddress: "Plot 12, BKC, Bandra East, Mumbai 400051",
        vendorAddress: "G-12, Cyber Heights, Sector 4, Bangalore 560001",
        email: "billing@neotechsolutions-sec.com",
        phoneNumber: "+91 80123 45678",
        products: [
          { description: "Critical AI Security Architecture Consultancy Fees", quantity: 1, unitPrice: 2400000, total: 2400000 }
        ],
        discount: 0,
        shippingCost: 0,
        grandTotal: 2832000,
        status: "Fraud",
        fraudScore: 87,
        riskLevel: "HIGH RISK",
        aiConfidence: 56,
        confidenceStatus: "Low Confidence",
        confidenceFactors: {
          vendorVerification: 40,
          gstValidation: 95,
          paymentVerification: 30,
          historicalMatch: 20,
          duplicateDetection: 98,
          timestampVerification: 15,
          completeness: 95
        },
        aiExplanation: "Mismatched beneficiary details: The vendor changed their bank account number. The invoice amount (₹24,00,000) is 420% higher than the historical average (₹4,50,000) for this vendor. Invoice was uploaded at 3:15 AM on a Sunday. Vendor registration has been inactive for 18 months. Email domain 'neotechsolutions-sec.com' does not match the registered domain 'neotechsolutions.com'. Payment is requested immediately.",
        aiRecommendations: [
          "HOLD PAYMENT IMMEDIATELY.",
          "Initiate verbal verification using the registered offline telephone number.",
          "Alert the Chief Financial Officer (CFO) and the cybersecurity response team.",
          "Check vendor domain registration age (domain was registered 2 days ago)."
        ],
        reviewer: "None",
        history: [
          { timestamp: new Date().toISOString(), action: "Invoice Uploaded", user: "Guest User" }
        ]
      };
    } else if (type === "review") {
      mockInvoice = {
        invoiceNumber: `INV-2026-0${Math.floor(Math.random() * 900) + 100}`,
        vendorName: "Swift Logistics",
        vendorId: "VEND-004",
        poNumber: "PO-99210",
        invoiceDate: "2026-07-08",
        dueDate: "2026-07-15",
        timestamp: new Date().toISOString(),
        currency: "INR",
        amount: 180000,
        taxAmount: 32400,
        gstNumber: "27AAAAA1111A1Z1",
        panNumber: "AAAAA1111A",
        bankAccount: "90029384751992",
        ifscCode: "KKBK0000958",
        paymentTerms: "Net-15",
        buyerName: "Enterprise Corp India",
        buyerAddress: "Plot 12, BKC, Bandra East, Mumbai 400051",
        vendorAddress: "Level 4, Logistic Hub, Sector 62, Noida 201301",
        email: "billing@swiftlogistics.com",
        phoneNumber: "+91 120 4567 890",
        products: [
          { description: "Freight Transport Services & Warehouse Handling Fee", quantity: 1, unitPrice: 180000, total: 180000 }
        ],
        discount: 0,
        shippingCost: 0,
        grandTotal: 212400,
        status: "Pending",
        fraudScore: 50,
        riskLevel: "REVIEW",
        aiConfidence: 74,
        confidenceStatus: "Medium Confidence",
        confidenceFactors: {
          vendorVerification: 80,
          gstValidation: 85,
          paymentVerification: 90,
          historicalMatch: 60,
          duplicateDetection: 95,
          timestampVerification: 80,
          completeness: 98
        },
        aiExplanation: "GST registration prefix mismatch: Delhi state prefix used but registered address points to Bangalore. The amount (₹1,80,000) is 35% above the monthly rolling average contract pricing.",
        aiRecommendations: [
          "Verify state code details in the GST portal ledger.",
          "Check contract documents to see if Q3 rates allow variance."
        ],
        reviewer: "None",
        history: [
          { timestamp: new Date().toISOString(), action: "Invoice Uploaded", user: "Guest User" }
        ]
      };
    } else {
      // safe
      mockInvoice = {
        invoiceNumber: `INV-2026-0${Math.floor(Math.random() * 900) + 100}`,
        vendorName: "Alpha Systems Ltd.",
        vendorId: "VEND-001",
        poNumber: "PO-77312",
        invoiceDate: "2026-07-01",
        dueDate: "2026-07-31",
        timestamp: new Date().toISOString(),
        currency: "INR",
        amount: 320000,
        taxAmount: 57600,
        gstNumber: "27AAAAA1111A1Z1",
        panNumber: "AAAAA1111A",
        bankAccount: "90029384751992",
        ifscCode: "KKBK0000958",
        paymentTerms: "Net-30",
        buyerName: "Enterprise Corp India",
        buyerAddress: "Plot 12, BKC, Bandra East, Mumbai 400051",
        vendorAddress: "Alpha Towers, Sector 18, Gurugram 122001",
        email: "billing@alphasystems.com",
        phoneNumber: "+91 124 999 8888",
        products: [
          { description: "Managed Devops Cloud Engineering Services - Monthly Retainer", quantity: 1, unitPrice: 320000, total: 320000 }
        ],
        discount: 0,
        shippingCost: 0,
        grandTotal: 377600,
        status: "Approved",
        fraudScore: 12,
        riskLevel: "SAFE",
        aiConfidence: 97,
        confidenceStatus: "Very High Confidence",
        confidenceFactors: {
          vendorVerification: 98,
          gstValidation: 95,
          paymentVerification: 96,
          historicalMatch: 92,
          duplicateDetection: 98,
          timestampVerification: 95,
          completeness: 98
        },
        aiExplanation: "All checks successfully compiled. Vendor active in registry, GST matched, bank destination verified. Zero anomalies identified.",
        aiRecommendations: [
          "Straight-through automated payment release approved."
        ],
        reviewer: "System Gatekeeper",
        history: [
          { timestamp: new Date().toISOString(), action: "Invoice Uploaded", user: "Finance System" }
        ]
      };
    }

    runVerificationPipeline(mockInvoice);
  };

  // Custom PDF/file uploads dynamic outcomes
  const handleFileUpload = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      const rand = Math.random();
      
      let type = "safe";
      if (rand < 0.35) type = "fraud";
      else if (rand < 0.7) type = "review";

      triggerScenario(type);
    }
  };

  // Sort toggle handler
  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-30" />;
    return sortDir === "asc" ? <ArrowUp className="w-3 h-3 text-blue-400" /> : <ArrowDown className="w-3 h-3 text-blue-400" />;
  };

  // Invoices Filter & Search logic
  const filteredInvoices = invoices
    .filter((inv) => {
      const matchesSearch = 
        inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.riskLevel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.status.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRisk = filterRisk === "ALL" || inv.riskLevel === filterRisk;
      const matchesStatus = filterStatus === "ALL" || inv.status === filterStatus;
      
      const amount = inv.amount;
      const matchesMinAmount = !filterMinAmount || amount >= parseFloat(filterMinAmount);
      const matchesMaxAmount = !filterMaxAmount || amount <= parseFloat(filterMaxAmount);

      return matchesSearch && matchesRisk && matchesStatus && matchesMinAmount && matchesMaxAmount;
    })
    .sort((a, b) => {
      let va = a[sortField], vb = b[sortField];
      if (sortField === "amount" || sortField === "fraudScore") { va = Number(va); vb = Number(vb); }
      if (typeof va === "string") va = va.toLowerCase();
      if (typeof vb === "string") vb = vb.toLowerCase();
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  // Pagination calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInvoices = filteredInvoices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  return (
    <div className="space-y-6">
      
      {/* 10-Step AI Ingestion Pipeline Overlay */}
      {isIngesting && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center z-[100] p-6 text-center animate-fade-in">
          <div className="w-full max-w-md bg-slate-950/80 border border-white/10 rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative">
            {/* Spinning decorative background rings */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_70%)] pointer-events-none" />

            <div className="w-16 h-16 rounded-full border border-dashed border-blue-500/40 animate-spin flex items-center justify-center mx-auto mb-6">
              <Upload className="w-6 h-6 text-blue-400 animate-pulse" />
            </div>

            <h3 className="text-sm font-black uppercase tracking-wider text-white mb-2">Ingesting Invoice Ledger Data</h3>
            
            {/* Steps list progression */}
            <div className="bg-black/40 border border-white/5 p-4 rounded-xl space-y-2 mb-6 text-left text-xs max-h-48 overflow-y-auto">
              {stepsList.map((step, idx) => (
                <div key={idx} className="flex gap-2.5 items-center">
                  <div className="flex-shrink-0">
                    {ingestStep > idx ? (
                      <span className="text-emerald-400 font-bold font-mono">✓</span>
                    ) : ingestStep === idx ? (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                      </span>
                    ) : (
                      <span className="text-gray-600 font-mono text-[9px]">•</span>
                    )}
                  </div>
                  <span className={`font-mono text-[10px] ${ingestStep > idx ? "text-gray-500" : ingestStep === idx ? "text-blue-400 font-bold" : "text-gray-600"}`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>

            {/* Circular or linear progress bar */}
            <div className="w-full bg-white/5 border border-white/5 h-2.5 rounded-full overflow-hidden relative">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-300"
                style={{ width: `${ingestProgress}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 mt-2">
              <span>PIPELINE RUNNING</span>
              <span>{ingestProgress}% COMPLETE</span>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD & JUDGE SCENARIO PRESETS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Upload Zone (Left 2 columns) */}
        <div 
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="glass-panel p-8 md:col-span-2 border-2 border-dashed border-white/10 hover:border-blue-500/30 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 group"
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".pdf,.png,.jpg,.jpeg,.csv,.xls,.xlsx,.docx,.xml,.json,.zip,.rar"
          />

          <div className="p-4 bg-slate-900/60 rounded-full border border-white/5 group-hover:border-blue-500/30 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all mb-4">
            <Upload className="w-8 h-8 text-gray-400 group-hover:text-blue-400 transition-colors animate-pulse" />
          </div>

          <h3 className="text-sm font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">Drag & Drop Invoice Here</h3>
          <p className="text-xs text-gray-500 mb-4">or click to browse local folders</p>
          
          <div className="flex flex-wrap justify-center gap-1.5 max-w-sm">
            {["PDF", "PNG", "JPEG", "CSV", "XML", "JSON", "ZIP"].map((fmt) => (
              <span key={fmt} className="text-[9px] font-bold bg-white/5 border border-white/5 text-gray-400 px-2.5 py-1 rounded font-mono">
                {fmt}
              </span>
            ))}
          </div>
        </div>

        {/* Dedicated Judge Scenario Presets (Right 1 column) */}
        <div className="glass-panel p-5 border border-blue-500/20 bg-blue-950/5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-xl pointer-events-none" />
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-blue-400" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400">Judges Sandbox</span>
            </div>
            <h3 className="text-sm font-bold text-white mb-2">Simulation Presets</h3>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              Select an invoice scenario preset to immediately ingest and trigger the 10-step neural audit:
            </p>
          </div>

          <div className="space-y-2 pt-2">
            {/* Safe Preset */}
            <button 
              onClick={() => triggerScenario("safe")}
              className="btn-premium border-emerald-500/20 bg-emerald-950/5 hover:bg-emerald-900/10 text-emerald-400 text-xs w-full py-2.5 justify-center font-bold uppercase tracking-wider gap-2 transition-all hover:shadow-[0_0_15px_rgba(16,185,129,0.15)]"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Simulate Safe (Green)
            </button>

            {/* Review Preset */}
            <button 
              onClick={() => triggerScenario("review")}
              className="btn-premium border-amber-500/20 bg-amber-950/5 hover:bg-amber-900/10 text-amber-400 text-xs w-full py-2.5 justify-center font-bold uppercase tracking-wider gap-2 transition-all hover:shadow-[0_0_15px_rgba(245,158,11,0.15)]"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Simulate Review (Yellow)
            </button>

            {/* Fraud Preset */}
            <button 
              onClick={() => triggerScenario("fraud")}
              className="btn-premium border-red-500/20 bg-red-950/5 hover:bg-red-900/10 text-red-400 text-xs w-full py-2.5 justify-center font-bold uppercase tracking-wider gap-2 transition-all hover:shadow-[0_0_15px_rgba(239,68,68,0.15)]"
            >
              <ShieldAlert className="w-4 h-4 text-red-400" />
              Simulate Fraud (Red)
            </button>
          </div>
        </div>

      </div>

      {/* SEARCH, FILTERS & DATATABLE */}
      <div className="glass-panel p-5">
        
        {/* Table header filter options */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Invoices Database</h3>
            <span className="text-[10px] bg-white/5 border border-white/5 text-gray-400 px-2.5 py-0.5 rounded font-mono">
              {filteredInvoices.length} entries
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Filters toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg border text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors ${
                showFilters 
                  ? "bg-blue-600/20 border-blue-500/40 text-blue-400" 
                  : "border-white/5 text-gray-450 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              Advanced Filters
            </button>
          </div>
        </div>

        {/* Expandable filters block */}
        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl border border-white/5 bg-slate-900/20 mb-5 animate-scale text-xs">
            {/* Risk filter */}
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Risk Index</label>
              <select 
                value={filterRisk} 
                onChange={(e) => { setFilterRisk(e.target.value); setCurrentPage(1); }}
                className="input-premium w-full bg-black/40 border-white/5 text-xs"
              >
                <option value="ALL">ALL LEVELS</option>
                <option value="SAFE">SAFE ONLY</option>
                <option value="REVIEW">PENDING REVIEW</option>
                <option value="HIGH RISK">HIGH RISK</option>
              </select>
            </div>

            {/* Status filter */}
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Ledger Status</label>
              <select 
                value={filterStatus} 
                onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                className="input-premium w-full bg-black/40 border-white/5 text-xs"
              >
                <option value="ALL">ALL STATUSES</option>
                <option value="Approved">APPROVED RELEASE</option>
                <option value="Pending">PENDING AUDIT</option>
                <option value="Fraud">FLAGGED FRAUD</option>
              </select>
            </div>

            {/* Min cost */}
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Min Amount (₹)</label>
              <input 
                type="number"
                placeholder="e.g. 50000"
                value={filterMinAmount}
                onChange={(e) => { setFilterMinAmount(e.target.value); setCurrentPage(1); }}
                className="input-premium w-full bg-black/40 border-white/5 text-xs"
              />
            </div>

            {/* Max cost */}
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Max Amount (₹)</label>
              <input 
                type="number"
                placeholder="e.g. 2000000"
                value={filterMaxAmount}
                onChange={(e) => { setFilterMaxAmount(e.target.value); setCurrentPage(1); }}
                className="input-premium w-full bg-black/40 border-white/5 text-xs"
              />
            </div>
          </div>
        )}

        {/* Main datatable */}
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-xs text-left">
            <thead>
              <tr className="border-b border-white/5 text-gray-500 select-none">
                <th className="p-3 font-semibold cursor-pointer hover:text-white" onClick={() => handleSort("invoiceNumber")}>
                  <div className="flex items-center gap-1.5">Invoice # <SortIcon field="invoiceNumber" /></div>
                </th>
                <th className="p-3 font-semibold cursor-pointer hover:text-white" onClick={() => handleSort("vendorName")}>
                  <div className="flex items-center gap-1.5">Vendor Legal Name <SortIcon field="vendorName" /></div>
                </th>
                <th className="p-3 font-semibold cursor-pointer hover:text-white" onClick={() => handleSort("invoiceDate")}>
                  <div className="flex items-center gap-1.5">Date <SortIcon field="invoiceDate" /></div>
                </th>
                <th className="p-3 font-semibold cursor-pointer hover:text-white text-right" onClick={() => handleSort("amount")}>
                  <div className="flex items-center justify-end gap-1.5">Amount (₹) <SortIcon field="amount" /></div>
                </th>
                <th className="p-3 font-semibold cursor-pointer hover:text-white text-center" onClick={() => handleSort("fraudScore")}>
                  <div className="flex items-center justify-center gap-1.5">Risk Score <SortIcon field="fraudScore" /></div>
                </th>
                <th className="p-3 font-semibold">Risk Level</th>
                <th className="p-3 font-semibold">Ledger Status</th>
                <th className="p-3 font-semibold text-center">Audit Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentInvoices.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-500 font-mono">
                    No matching invoices found in current index files.
                  </td>
                </tr>
              ) : (
                currentInvoices.map((inv) => (
                  <tr key={inv.invoiceNumber} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    {/* Invoice Ref */}
                    <td className="p-3">
                      <span className="font-bold text-white block">{inv.invoiceNumber}</span>
                      <span className="text-[9px] text-gray-600 block mt-0.5 font-mono">PO: {inv.poNumber}</span>
                    </td>
                    
                    {/* Vendor Name */}
                    <td className="p-3">
                      <span className="font-semibold text-gray-250 block">{inv.vendorName}</span>
                      <span className="text-[9px] text-gray-600 block mt-0.5 font-mono">ID: {inv.vendorId}</span>
                    </td>

                    {/* Billing Date */}
                    <td className="p-3 text-gray-400">
                      {new Date(inv.invoiceDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>

                    {/* Amount */}
                    <td className="p-3 text-right font-bold font-mono text-gray-200">
                      ₹{inv.amount.toLocaleString()}
                    </td>

                    {/* Risk score */}
                    <td className="p-3 text-center">
                      <div className="inline-flex items-center justify-center font-mono font-bold px-2 py-0.5 rounded border border-white/5 bg-slate-900/60"
                        style={{
                          color: inv.fraudScore >= 70 ? "#ef4444" : inv.fraudScore >= 35 ? "#f59e0b" : "#10b981"
                        }}
                      >
                        {inv.fraudScore}%
                      </div>
                    </td>

                    {/* Risk Badge */}
                    <td className="p-3">
                      <span className={`badge-risk ${
                        inv.riskLevel === "SAFE" 
                          ? "badge-risk-safe" 
                          : inv.riskLevel === "REVIEW" 
                          ? "badge-risk-review" 
                          : "badge-risk-high"
                      }`}>
                        {inv.riskLevel === "SAFE" && <ShieldCheck className="w-3 h-3 inline" />}
                        {inv.riskLevel === "REVIEW" && <AlertTriangle className="w-3 h-3 inline" />}
                        {inv.riskLevel === "HIGH RISK" && <ShieldAlert className="w-3 h-3 inline" />}
                        <span className="ml-1 leading-none">{inv.riskLevel}</span>
                      </span>
                    </td>

                    {/* Ledger Status */}
                    <td className="p-3">
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border border-white/5 ${
                        inv.status === "Approved" 
                          ? "bg-emerald-500/10 text-emerald-400" 
                          : inv.status === "Pending" 
                          ? "bg-amber-500/10 text-amber-400" 
                          : "bg-red-500/10 text-red-400"
                      }`}>
                        {inv.status}
                      </span>
                    </td>

                    {/* Actions button */}
                    <td className="p-3 text-center">
                      <button 
                        onClick={() => onOpenInvoice(inv.invoiceNumber)}
                        className="btn-premium px-3 py-1.5 text-[10px]"
                      >
                        <Eye className="w-3 h-3" />
                        Audit Analysis
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-5 pt-4 border-t border-white/5">
            <span className="text-xs text-gray-500">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredInvoices.length)} of {filteredInvoices.length} invoices
            </span>

            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="btn-premium px-3 py-1.5 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-xs font-semibold text-white px-3 py-1.5 flex items-center">
                Page {currentPage} of {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="btn-premium px-3 py-1.5 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Dynamic Colored Decision Overlay Alert Modal */}
      {uploadAlert && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] animate-fade-in p-4">
          <div 
            className={`w-full max-w-md glass-panel p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border relative text-center overflow-hidden animate-scale ${
              uploadAlert.status === "fraud" 
                ? "border-red-500/40 shadow-red-500/10" 
                : uploadAlert.status === "review"
                ? "border-amber-500/40 shadow-amber-500/10"
                : "border-emerald-500/40 shadow-emerald-500/10"
            }`}
          >
            {/* Glowing orb in bg */}
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none -translate-y-1/2 ${
              uploadAlert.status === "fraud" ? "bg-red-500" : uploadAlert.status === "review" ? "bg-amber-500" : "bg-emerald-500"
            }`} />

            {/* Alert Indicator Header with icons */}
            <div className="flex flex-col items-center justify-center text-center mt-4">
              <div className={`p-4 rounded-full border mb-4 animate-bounce ${
                uploadAlert.status === "fraud"
                  ? "bg-red-950/20 border-red-500/40 text-red-400"
                  : uploadAlert.status === "review"
                  ? "bg-amber-950/20 border-amber-500/40 text-amber-400"
                  : "bg-emerald-950/20 border-emerald-500/40 text-emerald-400"
              }`}>
                {uploadAlert.status === "fraud" && <ShieldAlert className="w-12 h-12 text-red-400" />}
                {uploadAlert.status === "review" && <AlertTriangle className="w-12 h-12 text-amber-400" />}
                {uploadAlert.status === "safe" && <ShieldCheck className="w-12 h-12 text-emerald-400" />}
              </div>

              <h2 className={`text-lg font-black uppercase tracking-wider ${
                uploadAlert.status === "fraud"
                  ? "text-red-400"
                  : uploadAlert.status === "review"
                  ? "text-amber-400"
                  : "text-emerald-400"
              }`}>
                {uploadAlert.status === "fraud" && "🚨 High Risk Fraud Detected"}
                {uploadAlert.status === "review" && "⚠️ Verification Review Required"}
                {uploadAlert.status === "safe" && "🛡️ Invoice Verified Authentic"}
              </h2>

              <span className="text-[10px] text-gray-500 font-mono tracking-widest mt-1 block uppercase">
                AI ANALYSIS SCAN COMPLETE // {uploadAlert.invoiceNumber}
              </span>
            </div>

            {/* Content Details */}
            <div className="my-6 space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Vendor Entity</span>
                  <span className="font-bold text-white">{uploadAlert.vendorName}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Total Invoice Cost</span>
                  <span className="font-bold text-white">₹{uploadAlert.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs pt-1.5 border-t border-white/5">
                  <span className="text-gray-400">AI Risk Assessment</span>
                  <span className={`font-black font-mono ${
                    uploadAlert.status === "fraud"
                      ? "text-red-400"
                      : uploadAlert.status === "review"
                      ? "text-amber-400"
                      : "text-emerald-400"
                  }`}>
                    {uploadAlert.fraudScore}% {uploadAlert.status === "safe" ? "SAFE" : uploadAlert.status === "review" ? "REVIEW" : "FRAUD"}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-gray-450 leading-relaxed px-2">
                {uploadAlert.aiExplanation}
              </p>
            </div>

            {/* Actions footer */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setUploadAlert(null);
                  onOpenInvoice(uploadAlert.invoiceNumber);
                }}
                className="btn-premium px-5 py-2 text-xs font-semibold hover:border-white/20"
              >
                Inspect Ledger Details
              </button>
              <button
                onClick={() => setUploadAlert(null)}
                className={`btn-premium px-5 py-2 text-xs font-semibold ${
                  uploadAlert.status === "fraud"
                    ? "border-red-500/20 bg-red-950/20 hover:bg-red-900/30 text-red-200"
                    : uploadAlert.status === "review"
                    ? "border-amber-500/20 bg-amber-950/20 hover:bg-amber-900/30 text-amber-200"
                    : "btn-emerald"
                }`}
              >
                Dismiss Alert
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
