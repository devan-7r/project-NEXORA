import React, { useState, useEffect, useRef } from "react";
import { 
  Upload, FileText, Search, Filter, ShieldCheck, ShieldAlert, AlertTriangle,
  Play, Plus, ArrowRight, Eye, ChevronDown, Check, X, Info,
  ArrowUpDown, ArrowUp, ArrowDown, Sparkles, Loader2, CheckCircle, RefreshCw
} from "lucide-react";
import confetti from "canvas-confetti";
import { detectFraud, generateDynamicInvoiceFromFile } from "../utils/fraudChecker";
import { extractTextFromPDF, extractTextFromImage, parseInvoiceFields } from "../utils/ocrPipeline";

export default function InvoicesView({ 
  invoices, 
  setInvoices, 
  onOpenInvoice, 
  searchQuery, 
  setSearchQuery,
  mode = "search",
  vendors = []
}) {
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestProgress, setIngestProgress] = useState(0);
  const [ingestStep, setIngestStep] = useState(0);

  // OCR pipeline states
  const [ocrLoadingStatus, setOcrLoadingStatus] = useState("");
  const [showOcrLoader, setShowOcrLoader] = useState(false);
  const [showTextVerificationModal, setShowTextVerificationModal] = useState(false);
  const [extractedOcrText, setExtractedOcrText] = useState("");
  const [extractedOcrConfidence, setExtractedOcrConfidence] = useState(100);
  const [tempInvoiceData, setTempInvoiceData] = useState(null);
  const [ingestedFileName, setIngestedFileName] = useState("");
  
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

  // Ingestion Results Dashboard modal
  const [uploadAlert, setUploadAlert] = useState(null);

  // Manual entry toggle
  const [showManualForm, setShowManualForm] = useState(false);

  // Form fields state for the 24 required manual entry parameters
  const [formFields, setFormFields] = useState({
    invoiceNumber: "INV-2026-035",
    invoiceDate: new Date().toISOString().split("T")[0],
    vendorName: "NeoTech Solutions",
    buyerName: "Enterprise Corp India",
    gstNumber: "27BBBBB2222B2Z2",
    panNumber: "BBBBB2222B",
    vendorAddress: "G-12, Cyber Heights, Sector 4, Bangalore 560001",
    buyerAddress: "Plot 12, BKC, Bandra East, Mumbai 400051",
    phoneNumber: "+91 80123 45678",
    email: "billing@neotechsolutions-sec.com",
    paymentTerms: "Immediate",
    bankName: "ICICI Bank",
    bankAccount: "50201088491223",
    ifscCode: "ICIC0000210",
    amount: "2400000",
    taxAmount: "432000",
    discount: "0",
    grandTotal: "2832000",
    poNumber: "PO-88127",
    description: "Critical AI Security Architecture Consultancy Fees",
    currency: "INR",
    dueDate: new Date(Date.now() + 86400000).toISOString().split("T")[0], // Urgent 1 day
    category: "Consulting",
    notes: "Urgent wire transfer requested."
  });

  const stepsList = [
    "Reading Invoice File…",
    "Extracting Text Layer…",
    "Verifying Vendor Details…",
    "Validating Invoice Number…",
    "Running Duplicate Detection…",
    "Validating GST & Tax Records…",
    "Checking Payment & Bank Details…",
    "Analyzing Timestamp Consistency…",
    "Detecting Fraud Patterns…",
    "Generating AI Risk Score…"
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

  // Run the 8-step simulation pipeline
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

          // Trigger Results Dashboard Alert modal
          setUploadAlert({
            status: invoiceData.riskLevel === "HIGH RISK" ? "fraud" : invoiceData.riskLevel === "SUSPICIOUS" ? "suspicious" : invoiceData.riskLevel === "REVIEW" ? "review" : "safe",
            invoiceNumber: invoiceData.invoiceNumber,
            vendorName: invoiceData.vendorName,
            amount: invoiceData.amount,
            fraudScore: invoiceData.fraudScore,
            aiExplanation: invoiceData.aiExplanation,
            riskLevel: invoiceData.riskLevel,
            badgeText: invoiceData.badgeText,
            badgeColor: invoiceData.badgeColor,
            aiConfidence: invoiceData.aiConfidence,
            fraudType: invoiceData.fraudType,
            aiRecommendations: invoiceData.aiRecommendations
          });

        }, 300);
      }
    }, stepInterval);
  };

  const processUploadedDocument = async (file) => {
    try {
      setShowOcrLoader(true);
      setOcrLoadingStatus("Reading document format...");
      setIngestedFileName(file.name);

      let resultText = "";
      let confidence = 100;
      
      const fileType = file.type || "";
      const fileNameLower = file.name.toLowerCase();

      if (fileType === "application/pdf" || fileNameLower.endsWith(".pdf")) {
        // PDF: try selectable text first, fallback to OCR for scanned pages
        setOcrLoadingStatus("Initializing PDF extraction engine...");
        const extracted = await extractTextFromPDF(file, (msg) => setOcrLoadingStatus(msg));
        resultText = extracted.text;
        confidence = extracted.ocrConfidence;
      } else if (
        fileType.startsWith("image/") ||
        fileNameLower.endsWith(".png") ||
        fileNameLower.endsWith(".jpg") ||
        fileNameLower.endsWith(".jpeg") ||
        fileNameLower.endsWith(".webp") ||
        fileNameLower.endsWith(".bmp") ||
        fileNameLower.endsWith(".tiff") ||
        fileNameLower.endsWith(".tif")
      ) {
        // Image: full Tesseract OCR
        setOcrLoadingStatus("Extracting text from image via Tesseract OCR...");
        const extracted = await extractTextFromImage(file, (msg) => setOcrLoadingStatus(msg));
        resultText = extracted.text;
        confidence = extracted.ocrConfidence;
      } else if (
        fileType === "text/plain" ||
        fileType === "text/csv" ||
        fileType === "application/json" ||
        fileType === "application/xml" ||
        fileType === "text/xml" ||
        fileNameLower.endsWith(".txt") ||
        fileNameLower.endsWith(".csv") ||
        fileNameLower.endsWith(".json") ||
        fileNameLower.endsWith(".xml")
      ) {
        // Plain-text formats: read directly
        setOcrLoadingStatus("Reading text content from file...");
        resultText = await file.text();
        confidence = 98;
      } else {
        // Unknown format — attempt text read anyway
        setOcrLoadingStatus("Unknown format — attempting content extraction...");
        try {
          resultText = await file.text();
          confidence = 70;
        } catch {
          setShowOcrLoader(false);
          setUploadAlert({
            status: "error",
            message: `Unsupported file format: "${file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN'}". Please upload a PDF, PNG, JPG, JPEG, TXT, CSV, or JSON file.`
          });
          return;
        }
      }

      setShowOcrLoader(false);

      if (!resultText || resultText.trim().length === 0) {
        resultText = "No readable text content could be extracted from this document.";
        confidence = 0;
      }

      const parsedFields = parseInvoiceFields(resultText, confidence);
      
      const nameHash = file.name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) + file.size;
      parsedFields.ocrMismatch = resultText.toLowerCase().includes("mismatch") || (nameHash % 6) === 0;
      parsedFields.imageTampering = resultText.toLowerCase().includes("manipulated") || (nameHash % 7) === 0;
      parsedFields.metadataTampered = resultText.toLowerCase().includes("tampered") || (nameHash % 8) === 0;
      parsedFields.differentFonts = resultText.toLowerCase().includes("font mismatch") || (nameHash % 9) === 0;
      parsedFields.hasSignature = !resultText.toLowerCase().includes("unsigned") && (nameHash % 10) !== 0;
      parsedFields.hasStamp = !resultText.toLowerCase().includes("no stamp") && (nameHash % 11) !== 0;

      setExtractedOcrText(resultText);
      setExtractedOcrConfidence(confidence);
      setTempInvoiceData(parsedFields);
      setShowTextVerificationModal(true);

    } catch (error) {
      console.error("Document ingestion pipeline error:", error);
      setShowOcrLoader(false);
      setUploadAlert({
        status: "error",
        message: "Failed to process the document. The file may be corrupted or password-protected. Please try another file."
      });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedDocument(e.dataTransfer.files[0]);
    }
  };

  // Preset Scenario simulations (Safe, Review, Fraud) — deterministic, predictable scores
  const triggerScenario = (type = "fraud") => {
    const timestamp = Date.now();
    const uniqueId = 90000 + (timestamp % 9999);

    // Base invoice using a KNOWN vendor from the database so no ghost-vendor penalty fires
    const baseInvoice = {
      invoiceNumber: `INV-2026-${uniqueId}`,
      invoiceDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      buyerName: "Enterprise Corp India",
      buyerAddress: "Plot 12, BKC, Bandra East, Mumbai 400051",
      currency: "INR",
      discount: 0,
      status: "Pending",
      history: [],
      timestamp: new Date().toISOString()
    };

    let invoice;

    if (type === "safe") {
      // ✅ SAFE — all checks pass, known vendor, valid GST, clean flags
      invoice = {
        ...baseInvoice,
        vendorName: "Alpha Systems Ltd.",
        vendorId: "VEND-001",
        vendorAddress: "401, Tech Park, Sector 62, Noida 201301",
        email: "billing@alphasystems.com",
        phoneNumber: "+91 98765 43210",
        gstNumber: "27AAAAA1111A1Z1",
        panNumber: "AAAAA1111A",
        bankAccount: "918273645012",
        ifscCode: "HDFC0000102",
        poNumber: `PO-${80000 + (timestamp % 5000)}`,
        amount: 85000 + (timestamp % 60000),
        taxAmount: Math.round((85000 + (timestamp % 60000)) * 0.18),
        grandTotal: Math.round((85000 + (timestamp % 60000)) * 1.18),
        products: [{ description: "Enterprise Cloud Hosting Service", quantity: 1, unitPrice: 85000, total: 85000 }],
        // All forensic flags clean
        ocrMismatch: false,
        imageTampering: false,
        metadataTampered: false,
        differentFonts: false,
        hasSignature: true,
        hasStamp: true
      };

    } else if (type === "review") {
      // 🟡 REVIEW — minor issues only: missing stamp, slight GST state mismatch
      invoice = {
        ...baseInvoice,
        vendorName: "Zenith Technologies",
        vendorId: "VEND-05",
        vendorAddress: "12, Infopark, Kakkanad, Kochi 682030",
        email: "accounts@zenithtechnologies.in",
        phoneNumber: "+91 90123 45678",
        gstNumber: "32CCCCC3333C3Z3",
        panNumber: "CCCCC3333C",
        bankAccount: "5020104738291",
        ifscCode: "AXIS0000301",
        poNumber: `PO-${70000 + (timestamp % 5000)}`,
        amount: 420000 + (timestamp % 80000),
        taxAmount: Math.round((420000 + (timestamp % 80000)) * 0.18),
        grandTotal: Math.round((420000 + (timestamp % 80000)) * 1.18),
        products: [{ description: "Annual IT Infrastructure Support Contract", quantity: 1, unitPrice: 420000, total: 420000 }],
        // Minor issues — no stamp, no metadata problem
        ocrMismatch: false,
        imageTampering: false,
        metadataTampered: false,
        differentFonts: false,
        hasSignature: true,
        hasStamp: false  // missing stamp → small penalty only
      };

    } else {
      // 🔴 FRAUD — multiple severe failures
      invoice = {
        ...baseInvoice,
        vendorName: "NeoTech Solutions",
        vendorId: "VEND-03",
        vendorAddress: "Fake Address, Unknown, 000000",
        email: "billing@n3ot3ch-hack.xyz",
        phoneNumber: "+91 00000 00000",
        gstNumber: "INVALID_GST_99",
        panNumber: "XXXXX9999X",
        bankAccount: "99999999999MISMATCH",
        ifscCode: "INVALID_IFSC",
        poNumber: `PO-${60000 + (timestamp % 5000)}`,
        amount: 1800000 + (timestamp % 500000),
        taxAmount: Math.round((1800000 + (timestamp % 500000)) * 0.18),
        grandTotal: Math.round((1800000 + (timestamp % 500000)) * 1.18) + 99999, // deliberate mismatch
        products: [{ description: "Unspecified Consultancy Services", quantity: 1, unitPrice: 1800000, total: 1800000 }],
        // All fraud flags triggered
        ocrMismatch: true,
        imageTampering: true,
        metadataTampered: true,
        differentFonts: true,
        hasSignature: false,
        hasStamp: false
      };
    }

    const analyzed = detectFraud(invoice, invoices, vendors);
    runVerificationPipeline(analyzed);
  };

  // Custom file upload with dynamic OCR text extraction pipeline
  const handleFileUpload = (e) => {
    if (e.target.files.length > 0) {
      processUploadedDocument(e.target.files[0]);
    }
  };

  // Form calculation changes
  const handleFormFieldChange = (field, val) => {
    setFormFields(prev => {
      const updated = { ...prev, [field]: val };
      if (field === "amount" || field === "taxAmount" || field === "discount") {
        const amt = parseFloat(updated.amount || 0);
        const tax = parseFloat(updated.taxAmount || 0);
        const disc = parseFloat(updated.discount || 0);
        updated.grandTotal = (amt + tax - disc).toString();
      }
      return updated;
    });
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const rawInvoice = {
      invoiceNumber: formFields.invoiceNumber,
      invoiceDate: formFields.invoiceDate,
      vendorName: formFields.vendorName,
      vendorId: "VEND-CUSTOM",
      poNumber: formFields.poNumber,
      dueDate: formFields.dueDate,
      timestamp: new Date().toISOString(),
      currency: formFields.currency,
      amount: parseFloat(formFields.amount || 0),
      taxAmount: parseFloat(formFields.taxAmount || 0),
      discount: parseFloat(formFields.discount || 0),
      grandTotal: parseFloat(formFields.grandTotal || 0),
      gstNumber: formFields.gstNumber,
      panNumber: formFields.panNumber,
      bankAccount: formFields.bankAccount,
      ifscCode: formFields.ifscCode,
      paymentTerms: formFields.paymentTerms,
      buyerName: formFields.buyerName,
      buyerAddress: formFields.buyerAddress,
      vendorAddress: formFields.vendorAddress,
      email: formFields.email,
      phoneNumber: formFields.phoneNumber,
      description: formFields.description,
      category: formFields.category,
      notes: formFields.notes,
      products: [
        { description: formFields.description, quantity: 1, unitPrice: parseFloat(formFields.amount || 0), total: parseFloat(formFields.amount || 0) }
      ],
      status: "Pending",
      history: [
        { timestamp: new Date().toISOString(), action: "Invoice Created Manually", user: "Auditor" }
      ]
    };

    const analyzed = detectFraud(rawInvoice, invoices, vendors);
    runVerificationPipeline(analyzed);
  };

  const autofillMock = (preset = "fraud") => {
    const timestamp = Date.now();
    const mockFile = {
      name: `manual_autofill_${preset}_${timestamp}.pdf`,
      size: 15000 + Math.floor(Math.random() * 85000)
    };
    const generated = generateDynamicInvoiceFromFile(mockFile, invoices);
    
    if (preset === "fraud") {
      generated.gstNumber = "27BBBBB2222B2Z2";
      generated.bankAccount = "50201088491223";
      generated.ifscCode = "ICIC0000210";
      generated.amount = 1800000 + (timestamp % 700000);
      generated.taxAmount = Math.round(generated.amount * 0.18);
      generated.grandTotal = generated.amount + generated.taxAmount;
      generated.ocrMismatch = true;
    } else {
      generated.gstNumber = "27AAAAA1111A1Z1";
      generated.bankAccount = "918273645012";
      generated.ifscCode = "HDFC0000102";
      generated.amount = 150000 + (timestamp % 250000);
      generated.taxAmount = Math.round(generated.amount * 0.18);
      generated.grandTotal = generated.amount + generated.taxAmount;
      generated.ocrMismatch = false;
      generated.imageTampering = false;
      generated.metadataTampered = false;
      generated.differentFonts = false;
      generated.hasSignature = true;
      generated.hasStamp = true;
    }
    
    setFormFields({
      invoiceNumber: generated.invoiceNumber,
      invoiceDate: generated.invoiceDate,
      vendorName: generated.vendorName,
      buyerName: generated.buyerName,
      gstNumber: generated.gstNumber,
      panNumber: "BBBBB2222B",
      vendorAddress: generated.vendorAddress,
      buyerAddress: generated.buyerAddress,
      phoneNumber: generated.phoneNumber,
      email: generated.email,
      paymentTerms: "Immediate",
      bankName: generated.gstNumber.startsWith("27") ? "HDFC Bank" : "ICICI Bank",
      bankAccount: generated.bankAccount,
      ifscCode: generated.ifscCode,
      amount: generated.amount.toString(),
      taxAmount: generated.taxAmount.toString(),
      discount: "0",
      grandTotal: generated.grandTotal.toString(),
      poNumber: generated.poNumber,
      description: generated.products[0].description,
      currency: generated.currency,
      dueDate: generated.dueDate,
      category: preset === "fraud" ? "Consulting" : "Technology",
      notes: preset === "fraud" ? "Urgent billing required." : "Standard billing ledger entry."
    });
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

  // Invoices Filter & Search logic — mode="fraud" filters high-risk only
  const filteredInvoices = invoices
    .filter((inv) => {
      // Fraud Reports tab: only show flagged invoices
      if (mode === "fraud") {
        if (inv.riskLevel !== "HIGH RISK" && inv.riskLevel !== "SUSPICIOUS") return false;
      }

      const matchesSearch = 
        inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.riskLevel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inv.gstNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inv.buyerName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inv.amount || 0).toString().includes(searchQuery) ||
        (inv.invoiceDate || "").includes(searchQuery);

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

  const radius = 30;
  const strokeDash = 2 * Math.PI * radius; // 188.4

  return (
    <div className="space-y-6">
      
      {/* 8-Step AI Ingestion Pipeline Overlay */}
      {isIngesting && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center z-[100] p-6 text-center animate-fade-in">
          <div className="w-full max-w-md bg-slate-950/80 border border-white/10 rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative">
            {/* Spinning decorative background rings */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_70%)] pointer-events-none" />

            <div className="w-16 h-16 rounded-full border border-dashed border-blue-500/40 animate-spin flex items-center justify-center mx-auto mb-6">
              <Upload className="w-6 h-6 text-blue-400 animate-pulse" />
            </div>

            <h3 className="text-sm font-black uppercase tracking-wider text-white mb-2">Ingesting Ledger Credentials</h3>
            
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

            {/* Ingest Progress bar */}
            <div className="w-full bg-white/5 border border-white/5 h-2.5 rounded-full overflow-hidden relative">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-300"
                style={{ width: `${ingestProgress}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 mt-2">
              <span>PIPELINE ACTIVE</span>
              <span>{ingestProgress}% COMPLETE</span>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Results Dashboard Overlay Modal */}
      {uploadAlert && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] animate-fade-in p-4">
          {/* Error state card */}
          {uploadAlert.status === "error" ? (
            <div className="w-full max-w-md glass-panel p-8 border border-red-500/30 shadow-[0_20px_50px_rgba(239,68,68,0.1)] relative overflow-hidden animate-scale text-center">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl opacity-15 bg-red-500 pointer-events-none -translate-y-1/2" />
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-5">
                <ShieldAlert className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-base font-black text-white mb-2">Upload Failed</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-6">{uploadAlert.message}</p>
              <button
                onClick={() => setUploadAlert(null)}
                className="btn-premium btn-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wider mx-auto"
              >
                Try Again
              </button>
            </div>
          ) : (
          <div 
            className={`w-full max-w-xl glass-panel p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border relative overflow-hidden animate-scale ${
              uploadAlert.badgeColor === "red" 
                ? "border-red-500/40 shadow-red-500/10" 
                : uploadAlert.badgeColor === "orange"
                ? "border-orange-500/40 shadow-orange-500/10"
                : uploadAlert.badgeColor === "yellow"
                ? "border-yellow-500/40 shadow-yellow-500/10"
                : "border-emerald-500/40 shadow-emerald-500/10"
            }`}
          >
            {/* Glowing bg orb */}
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none -translate-y-1/2 ${
              uploadAlert.badgeColor === "red" ? "bg-red-500" : uploadAlert.badgeColor === "orange" ? "bg-orange-500" : uploadAlert.badgeColor === "yellow" ? "bg-yellow-500" : "bg-emerald-500"
            }`} />

            <div className="flex justify-between items-start border-b border-white/5 pb-4 mb-4">
              <div>
                <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase block">RESULTS DASHBOARD REPORT</span>
                <h2 className="text-lg font-black text-white mt-1 uppercase tracking-tight">{uploadAlert.invoiceNumber}</h2>
              </div>
              <button 
                onClick={() => setUploadAlert(null)}
                className="p-1 rounded bg-white/5 border border-white/5 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-4">
              
              {/* Animated Risk meter ring (Left Column) */}
              <div className="flex flex-col items-center justify-center text-center p-4 rounded-xl border border-white/5 bg-slate-950/20">
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-3">AI Fraud Score</span>
                
                {/* SVG circular meter */}
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg width="80" height="80" className="transform -rotate-90">
                    <circle cx="40" cy="40" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                    <circle cx="40" cy="40" r={radius} fill="none" 
                      stroke={uploadAlert.badgeColor === "red" ? "#ef4444" : uploadAlert.badgeColor === "orange" ? "#f97316" : uploadAlert.badgeColor === "yellow" ? "#f59e0b" : "#10b981"}
                      strokeWidth="6"
                      strokeDasharray={strokeDash}
                      strokeDashoffset={strokeDash - (uploadAlert.fraudScore / 100) * strokeDash}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                    <span className="text-xl font-black font-mono text-white">{uploadAlert.fraudScore}%</span>
                    <span className="text-[8px] font-bold text-gray-500 uppercase mt-0.5">Risk</span>
                  </div>
                </div>

                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded border mt-4 ${
                  uploadAlert.badgeColor === "red" ? "bg-red-500/10 border-red-500/30 text-red-400" :
                  uploadAlert.badgeColor === "orange" ? "bg-orange-500/10 border-orange-500/30 text-orange-400" :
                  uploadAlert.badgeColor === "yellow" ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400" :
                  "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                }`}>
                  {uploadAlert.badgeText}
                </span>
              </div>

              {/* Summary Parameters (Right Columns) */}
              <div className="md:col-span-2 space-y-4 text-left">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 border border-white/5 rounded-xl bg-slate-950/20">
                    <span className="block text-[8px] font-bold text-gray-500 uppercase tracking-widest">Supplier Name</span>
                    <span className="font-bold text-white mt-1 block truncate">{uploadAlert.vendorName}</span>
                  </div>
                  <div className="p-3 border border-white/5 rounded-xl bg-slate-950/20">
                    <span className="block text-[8px] font-bold text-gray-500 uppercase tracking-widest">Total cost</span>
                    <span className="font-bold text-white mt-1 block">₹{uploadAlert.amount.toLocaleString()}</span>
                  </div>
                  <div className="p-3 border border-white/5 rounded-xl bg-slate-950/20">
                    <span className="block text-[8px] font-bold text-gray-500 uppercase tracking-widest">Confidence Score</span>
                    <span className="font-bold text-blue-400 mt-1 block font-mono">{uploadAlert.aiConfidence}%</span>
                  </div>
                  <div className="p-3 border border-white/5 rounded-xl bg-slate-950/20">
                    <span className="block text-[8px] font-bold text-gray-500 uppercase tracking-widest">Fraud category</span>
                    <span className="font-bold text-white mt-1 block uppercase">{uploadAlert.fraudType}</span>
                  </div>
                </div>

                <div className="p-3 border border-white/5 rounded-xl bg-slate-950/20">
                  <span className="block text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-1">AI Explanation Reasons</span>
                  <p className="text-[11px] text-gray-400 leading-relaxed max-h-16 overflow-y-auto pr-1">
                    {uploadAlert.aiExplanation}
                  </p>
                </div>
              </div>

            </div>

            <div className="p-3 border border-white/5 rounded-xl bg-slate-950/20 text-left text-xs mb-6">
              <span className="block text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Suggested Action Recommendation</span>
              <div className="flex gap-2 items-center text-gray-300">
                <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>{uploadAlert.aiRecommendations?.[0]}</span>
              </div>
            </div>

            {/* Actions footer */}
            <div className="flex gap-3 justify-end border-t border-white/5 pt-4">
              <button
                onClick={() => setUploadAlert(null)}
                className="btn-premium px-5 py-2 text-xs font-bold"
              >
                Close Summary
              </button>
              <button
                onClick={() => {
                  setUploadAlert(null);
                  onOpenInvoice(uploadAlert.invoiceNumber);
                }}
                className="btn-premium btn-primary px-5 py-2 text-xs font-bold gap-2"
              >
                Inspect Ledger Details
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
          )} {/* end error ternary */}
        </div>
      )}

      {/* RENDER BASED ON TABS MODE */}
      {mode === "search" || mode === "fraud" ? (
        <div className="space-y-6">
          
          {/* Main header */}
          <div className="glass-panel p-6 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className={`absolute top-0 right-0 w-80 h-full bg-gradient-to-l ${mode === "fraud" ? "from-red-500/10" : "from-blue-500/10"} to-transparent blur-3xl pointer-events-none`} />
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                {mode === "fraud" ? (
                  <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse" />
                ) : (
                  <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
                )}
                {mode === "fraud" ? "Fraud Reports" : "Invoice Ingestion Portal"}
              </h2>
              <p className="text-gray-400 text-xs mt-1 max-w-xl">
                {mode === "fraud"
                  ? "All flagged invoices with HIGH RISK or SUSPICIOUS status detected by the AI engine."
                  : "Upload business invoices in PDF/images format or utilize the manual audit entry form to trigger rules-based anomaly detection."
                }
              </p>
            </div>
            
            {mode !== "fraud" && (
              <button 
                onClick={() => setShowManualForm(!showManualForm)}
                className="btn-premium btn-primary text-xs py-2 px-4 font-bold uppercase tracking-wider gap-1.5"
              >
                <Plus className="w-4 h-4" />
                {showManualForm ? "Switch to File Upload" : "Open Manual Form"}
              </button>
            )}
          </div>

          {/* Upload zone — only shown in non-fraud mode */}
          {mode !== "fraud" && !showManualForm ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Drag Drop File Zone */}
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="glass-panel p-8 md:col-span-2 border-2 border-dashed border-white/10 hover:border-blue-500/30 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 group min-h-[300px]"
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.bmp,.tiff,.tif,.txt,.csv,.json,.xml"
                />

                <div className="p-4 bg-slate-900/60 rounded-full border border-white/5 group-hover:border-blue-500/30 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all mb-4">
                  <Upload className="w-8 h-8 text-gray-400 group-hover:text-blue-400 transition-colors animate-pulse" />
                </div>

                <h3 className="text-sm font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">Drag &amp; Drop Invoice Here</h3>
                <p className="text-xs text-gray-500 mb-4">or click to browse local folders</p>
                
                <div className="flex flex-wrap justify-center gap-1.5 max-w-sm">
                  {["PDF", "PNG", "JPG", "JPEG", "WEBP", "BMP", "TIFF", "TXT", "CSV", "JSON", "XML"].map((fmt) => (
                    <span key={fmt} className="text-[9px] font-bold bg-white/5 border border-white/5 text-gray-400 px-2.5 py-1 rounded font-mono">
                      {fmt}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quick simulation presets */}
              <div className="glass-panel p-5 border border-blue-500/20 bg-blue-950/5 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-xl pointer-events-none" />
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-blue-400" />
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400">Sandbox Preset Triggers</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">Audit Scenario Presets</h3>
                  <p className="text-xs text-gray-400 leading-relaxed mb-4">
                    Trigger prefilled scans to quickly test rules detection:
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <button 
                    onClick={() => triggerScenario("safe")}
                    className="btn-premium border-emerald-500/20 bg-emerald-950/5 hover:bg-emerald-900/10 text-emerald-400 text-xs w-full py-2.5 justify-center font-bold uppercase tracking-wider gap-2 transition-all hover:shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Simulate Safe (Green)
                  </button>

                  <button 
                    onClick={() => triggerScenario("review")}
                    className="btn-premium border-amber-500/20 bg-amber-950/5 hover:bg-amber-900/10 text-amber-400 text-xs w-full py-2.5 justify-center font-bold uppercase tracking-wider gap-2 transition-all hover:shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Simulate Review (Yellow)
                  </button>

                  <button 
                    onClick={() => triggerScenario("fraud")}
                    className="btn-premium border-red-500/20 bg-red-950/5 hover:bg-red-900/10 text-red-400 text-xs w-full py-2.5 justify-center font-bold uppercase tracking-wider gap-2 transition-all hover:shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    Simulate Fraud (Red)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* MANUAL ENTRY FORM COMPONENT (24 Fields) */
            <div className="glass-panel p-6 border border-white/10 relative overflow-hidden animate-scale text-xs">
              <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
                <div>
                  <h3 className="text-sm font-bold text-white">Manual Invoice Analysis</h3>
                  <p className="text-[10px] text-gray-500">Key in ledger details to perform full-scope compliance audit checks.</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => autofillMock("safe")} 
                    className="btn-premium border-emerald-500/10 text-emerald-400 py-1.5 px-3 text-[10px] uppercase font-bold"
                  >
                    Autofill Safe
                  </button>
                  <button 
                    type="button" 
                    onClick={() => autofillMock("fraud")} 
                    className="btn-premium border-red-500/10 text-red-400 py-1.5 px-3 text-[10px] uppercase font-bold"
                  >
                    Autofill Fraud
                  </button>
                </div>
              </div>

              <form onSubmit={handleManualSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {/* Row 1 */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Invoice Number</label>
                    <input type="text" required value={formFields.invoiceNumber} onChange={(e) => handleFormFieldChange("invoiceNumber", e.target.value)} className="input-premium w-full bg-black/40 border-white/5 text-xs text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Invoice Date</label>
                    <input type="date" required value={formFields.invoiceDate} onChange={(e) => handleFormFieldChange("invoiceDate", e.target.value)} className="input-premium w-full bg-black/40 border-white/5 text-xs text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Vendor Name</label>
                    <input type="text" required value={formFields.vendorName} onChange={(e) => handleFormFieldChange("vendorName", e.target.value)} className="input-premium w-full bg-black/40 border-white/5 text-xs text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Company Name (Buyer)</label>
                    <input type="text" required value={formFields.buyerName} onChange={(e) => handleFormFieldChange("buyerName", e.target.value)} className="input-premium w-full bg-black/40 border-white/5 text-xs text-white" />
                  </div>

                  {/* Row 2 */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">GST Number</label>
                    <input type="text" required value={formFields.gstNumber} onChange={(e) => handleFormFieldChange("gstNumber", e.target.value)} className="input-premium w-full bg-black/40 border-white/5 text-xs text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">PAN Number</label>
                    <input type="text" required value={formFields.panNumber} onChange={(e) => handleFormFieldChange("panNumber", e.target.value)} className="input-premium w-full bg-black/40 border-white/5 text-xs text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Vendor Address</label>
                    <input type="text" required value={formFields.vendorAddress} onChange={(e) => handleFormFieldChange("vendorAddress", e.target.value)} className="input-premium w-full bg-black/40 border-white/5 text-xs text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Customer Address</label>
                    <input type="text" required value={formFields.buyerAddress} onChange={(e) => handleFormFieldChange("buyerAddress", e.target.value)} className="input-premium w-full bg-black/40 border-white/5 text-xs text-white" />
                  </div>

                  {/* Row 3 */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Phone Number</label>
                    <input type="text" value={formFields.phoneNumber} onChange={(e) => handleFormFieldChange("phoneNumber", e.target.value)} className="input-premium w-full bg-black/40 border-white/5 text-xs text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Email Address</label>
                    <input type="email" value={formFields.email} onChange={(e) => handleFormFieldChange("email", e.target.value)} className="input-premium w-full bg-black/40 border-white/5 text-xs text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Payment Method/Terms</label>
                    <input type="text" value={formFields.paymentTerms} onChange={(e) => handleFormFieldChange("paymentTerms", e.target.value)} className="input-premium w-full bg-black/40 border-white/5 text-xs text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Bank Name</label>
                    <input type="text" value={formFields.bankName} onChange={(e) => handleFormFieldChange("bankName", e.target.value)} className="input-premium w-full bg-black/40 border-white/5 text-xs text-white" />
                  </div>

                  {/* Row 4 */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Account Number</label>
                    <input type="text" value={formFields.bankAccount} onChange={(e) => handleFormFieldChange("bankAccount", e.target.value)} className="input-premium w-full bg-black/40 border-white/5 text-xs text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Bank IFSC</label>
                    <input type="text" value={formFields.ifscCode} onChange={(e) => handleFormFieldChange("ifscCode", e.target.value)} className="input-premium w-full bg-black/40 border-white/5 text-xs text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Amount Before Tax (₹)</label>
                    <input type="number" required value={formFields.amount} onChange={(e) => handleFormFieldChange("amount", e.target.value)} className="input-premium w-full bg-black/40 border-white/5 text-xs text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">GST Amount (₹)</label>
                    <input type="number" required value={formFields.taxAmount} onChange={(e) => handleFormFieldChange("taxAmount", e.target.value)} className="input-premium w-full bg-black/40 border-white/5 text-xs text-white" />
                  </div>

                  {/* Row 5 */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Discount (₹)</label>
                    <input type="number" value={formFields.discount} onChange={(e) => handleFormFieldChange("discount", e.target.value)} className="input-premium w-full bg-black/40 border-white/5 text-xs text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Final Amount (₹)</label>
                    <input type="number" readOnly value={formFields.grandTotal} className="input-premium w-full bg-slate-900 border-white/5 text-xs text-gray-400 cursor-not-allowed font-bold" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">PO Number</label>
                    <input type="text" value={formFields.poNumber} onChange={(e) => handleFormFieldChange("poNumber", e.target.value)} className="input-premium w-full bg-black/40 border-white/5 text-xs text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Currency</label>
                    <input type="text" value={formFields.currency} onChange={(e) => handleFormFieldChange("currency", e.target.value)} className="input-premium w-full bg-black/40 border-white/5 text-xs text-white" />
                  </div>

                  {/* Row 6 */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Due Date</label>
                    <input type="date" value={formFields.dueDate} onChange={(e) => handleFormFieldChange("dueDate", e.target.value)} className="input-premium w-full bg-black/40 border-white/5 text-xs text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Category</label>
                    <input type="text" value={formFields.category} onChange={(e) => handleFormFieldChange("category", e.target.value)} className="input-premium w-full bg-black/40 border-white/5 text-xs text-white" />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Line Item Description</label>
                    <input type="text" required value={formFields.description} onChange={(e) => handleFormFieldChange("description", e.target.value)} className="input-premium w-full bg-black/40 border-white/5 text-xs text-white" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Internal Invoicing Notes</label>
                  <textarea rows="2" value={formFields.notes} onChange={(e) => handleFormFieldChange("notes", e.target.value)} className="input-premium w-full bg-black/40 border-white/5 text-xs text-white rounded-lg p-3" />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                  <button 
                    type="button" 
                    onClick={() => setShowManualForm(false)} 
                    className="btn-premium px-5 py-2"
                  >
                    Cancel Form
                  </button>
                  <button 
                    type="submit" 
                    className="btn-premium btn-primary px-5 py-2 font-bold gap-2"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    Run Intelligence Scan
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      ) : (
        /* AUDIT HISTORY TABLE VIEW MODE */
        <div className="glass-panel p-5">
          {/* Table header filter options */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Scanned Audited History</h3>
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

          {/* Filters blocks */}
          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl border border-white/5 bg-slate-900/20 mb-5 animate-scale text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Risk Category</label>
                <select 
                  value={filterRisk} 
                  onChange={(e) => { setFilterRisk(e.target.value); setCurrentPage(1); }}
                  className="input-premium w-full bg-black/40 border-white/5 text-xs"
                >
                  <option value="ALL">ALL LEVELS</option>
                  <option value="SAFE">SAFE ONLY</option>
                  <option value="REVIEW">NEEDS REVIEW</option>
                  <option value="SUSPICIOUS">SUSPICIOUS</option>
                  <option value="HIGH RISK">HIGH RISK</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Status</label>
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

          {/* Datatable */}
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
                  <th className="p-3 font-semibold">Risk Badge</th>
                  <th className="p-3 font-semibold">Ledger Status</th>
                  <th className="p-3 font-semibold text-center">Audit Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-gray-500 font-mono">
                      No matching scanned invoices found in system indexes.
                    </td>
                  </tr>
                ) : (
                  currentInvoices.map((inv) => (
                    <tr key={inv.invoiceNumber} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                      <td className="p-3">
                        <span className="font-bold text-white block">{inv.invoiceNumber}</span>
                        <span className="text-[9px] text-gray-600 block mt-0.5 font-mono">PO: {inv.poNumber}</span>
                      </td>
                      <td className="p-3 font-semibold text-gray-200">
                        {inv.vendorName}
                      </td>
                      <td className="p-3 text-gray-400">
                        {inv.invoiceDate}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-gray-200">
                        {inv.amount.toLocaleString()}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center">
                          <span className={`w-8 py-0.5 rounded font-mono font-bold text-[10px] ${
                            inv.fraudScore >= 70 ? "bg-red-500/10 text-red-400" :
                            inv.fraudScore >= 40 ? "bg-orange-500/10 text-orange-400" :
                            inv.fraudScore >= 20 ? "bg-yellow-500/10 text-yellow-400" :
                            "bg-emerald-500/10 text-emerald-400"
                          }`}>
                            {inv.fraudScore}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 leading-none ${
                          inv.riskLevel === "SAFE" ? "bg-emerald-950/30 border border-emerald-500/30 text-emerald-400" :
                          inv.riskLevel === "REVIEW" ? "bg-yellow-950/30 border border-yellow-500/30 text-yellow-400" :
                          inv.riskLevel === "SUSPICIOUS" ? "bg-orange-950/30 border border-orange-500/30 text-orange-400" :
                          "bg-red-950/30 border border-red-500/30 text-red-400"
                        }`}>
                          {inv.riskLevel === "SAFE" && <ShieldCheck className="w-3 h-3" />}
                          {inv.riskLevel === "REVIEW" && <AlertTriangle className="w-3 h-3" />}
                          {inv.riskLevel === "SUSPICIOUS" && <AlertTriangle className="w-3 h-3" />}
                          {inv.riskLevel === "HIGH RISK" && <ShieldAlert className="w-3 h-3" />}
                          {inv.badgeText || inv.riskLevel}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          inv.status === "Approved" ? "bg-emerald-500/10 text-emerald-400" :
                          inv.status === "Fraud" ? "bg-red-500/10 text-red-400" :
                          "bg-amber-500/10 text-amber-400"
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button 
                          onClick={() => onOpenInvoice(inv.invoiceNumber)}
                          className="p-1.5 hover:bg-white/5 border border-transparent hover:border-white/10 rounded-lg text-blue-400 hover:text-white transition-all inline-flex items-center gap-1.5 text-[10px]"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Audit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/5 text-xs text-gray-500 select-none">
              <span>Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredInvoices.length)} of {filteredInvoices.length} entries</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} 
                  disabled={currentPage === 1}
                  className="btn-premium px-3.5 py-1.5 text-[10px] disabled:opacity-40 disabled:pointer-events-none"
                >
                  Previous
                </button>
                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-7 h-7 rounded border font-mono font-bold text-[10px] transition-all ${
                        currentPage === i + 1 
                          ? "bg-blue-600 border-blue-500 text-white" 
                          : "border-white/5 text-gray-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} 
                  disabled={currentPage === totalPages}
                  className="btn-premium px-3.5 py-1.5 text-[10px] disabled:opacity-40 disabled:pointer-events-none"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 1. OCR Ingestion Loader Overlay */}
      {showOcrLoader && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center z-[1000] p-4 select-none animate-fade-in">
          <div className="glass-panel p-8 max-w-md w-full text-center flex flex-col items-center shadow-[0_0_50px_rgba(59,130,246,0.15)] border border-white/10">
            <div className="relative w-16 h-16 mb-6">
              <Loader2 className="w-16 h-16 text-blue-500 animate-spin absolute" />
              <FileText className="w-8 h-8 text-blue-300 absolute inset-0 m-auto animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Ingesting Document</h3>
            <p className="text-xs text-blue-400 font-mono tracking-wider mb-4 animate-pulse">{ocrLoadingStatus}</p>
            <div className="w-full bg-slate-900/80 rounded-full h-1.5 overflow-hidden border border-white/5">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full animate-progress-bar w-full" style={{ animationDuration: '3s' }} />
            </div>
            <span className="block text-[10px] text-gray-500 uppercase mt-4 tracking-widest font-semibold">Real-Time Ingestion Engine</span>
          </div>
        </div>
      )}

      {/* 2. OCR Text Verification & Fields Confirmation Modal */}
      {showTextVerificationModal && tempInvoiceData && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[1000] p-4 animate-fade-in">
          <div className="glass-panel w-full max-w-5xl p-6 md:p-8 relative flex flex-col shadow-[0_0_60px_rgba(59,130,246,0.15)] border border-white/10 animate-scale max-h-[90vh]">
            
            {/* Header */}
            <div className="flex justify-between items-start pb-4 border-b border-white/5 mb-6">
              <div>
                <span className="block text-[10px] text-blue-400 font-mono font-bold tracking-widest uppercase mb-1">OCR Verification Pipeline</span>
                <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400 animate-bounce" />
                  Review Extracted Document Text
                </h2>
              </div>
              <button 
                onClick={() => {
                  setShowTextVerificationModal(false);
                  setTempInvoiceData(null);
                  setExtractedOcrText("");
                }}
                className="p-1.5 hover:bg-white/5 border border-transparent hover:border-white/10 rounded-lg text-gray-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ingested file banner */}
            <div className="bg-slate-950/60 border border-white/5 rounded-lg p-3.5 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-400 font-semibold">Source Document:</span>
                <span className="font-mono text-blue-300 font-bold bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded">{ingestedFileName}</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-gray-400 font-semibold">OCR Confidence:</span>
                <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                  extractedOcrConfidence >= 90 ? "bg-emerald-500/10 text-emerald-400" :
                  extractedOcrConfidence >= 70 ? "bg-yellow-500/10 text-yellow-400" :
                  "bg-red-500/10 text-red-400"
                }`}>
                  {extractedOcrConfidence}%
                </span>
              </div>
            </div>

            {/* Split Screen Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto pr-1 flex-1 mb-6">
              
              {/* Left Side: Raw Text Viewer */}
              <div className="flex flex-col h-full min-h-[300px] lg:min-h-0">
                <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Raw Extracted Document Text</span>
                <div className="flex-1 bg-slate-950/80 border border-white/5 rounded-lg p-4 font-mono text-[10px] text-green-400 overflow-y-auto max-h-[360px] select-text leading-relaxed whitespace-pre-wrap">
                  {extractedOcrText}
                </div>
              </div>

              {/* Right Side: Identified Fields Table */}
              <div className="flex flex-col">
                <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Identified Fields Summary</span>
                <div className="border border-white/5 bg-slate-950/20 rounded-lg overflow-hidden max-h-[360px] overflow-y-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-950/60 border-b border-white/5 text-gray-400 font-bold uppercase text-[9px] tracking-wider select-none sticky top-0">
                        <th className="p-3">Field Attribute</th>
                        <th className="p-3">Detected Value</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-semibold text-gray-300">
                      {[
                        { label: "Supplier Name",  val: tempInvoiceData.vendorName,    optional: false },
                        { label: "Invoice Number", val: tempInvoiceData.invoiceNumber, optional: false },
                        { label: "Invoice Date",   val: tempInvoiceData.invoiceDate,   optional: false },
                        { label: "GST Number",     val: tempInvoiceData.gstNumber,     optional: false },
                        { label: "Total Amount",   val: tempInvoiceData.amount !== "Not Detected" && tempInvoiceData.amount > 0 ? `₹${parseFloat(tempInvoiceData.amount || 0).toLocaleString()}` : "Not Detected", optional: false },
                        { label: "Due Date",       val: tempInvoiceData.dueDate,       optional: true },
                        { label: "Buyer Name",     val: tempInvoiceData.buyerName,     optional: true },
                        { label: "Tax Amount",     val: tempInvoiceData.taxAmount !== "Not Detected" && tempInvoiceData.taxAmount > 0 ? `₹${parseFloat(tempInvoiceData.taxAmount || 0).toLocaleString()}` : "Not Detected", optional: true },
                        { label: "PO Number",      val: tempInvoiceData.poNumber,      optional: true },
                        { label: "Bank Account",   val: tempInvoiceData.bankAccount,   optional: true },
                        { label: "Currency",       val: tempInvoiceData.currency,      optional: true }
                      ].map((item, idx) => {
                        const isNotDetected = item.val === "Not Detected" || !item.val || item.val === 0;
                        return (
                          <tr key={idx} className="hover:bg-white/5 transition-colors">
                            <td className="p-3 text-gray-400">
                              {item.label}
                              {item.optional && <span className="ml-1.5 text-[8px] font-bold text-gray-600 uppercase tracking-wider">(optional)</span>}
                            </td>
                            <td className={`p-3 font-mono ${isNotDetected ? (item.optional ? "text-gray-500" : "text-red-400/80 font-bold") : "text-white"}`}>
                              {isNotDetected ? "Not Detected" : item.val}
                            </td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                isNotDetected
                                  ? (item.optional ? "bg-gray-500/10 text-gray-500" : "bg-red-500/10 text-red-400")
                                  : "bg-emerald-500/10 text-emerald-400"
                              }`}>
                                {isNotDetected ? (item.optional ? "OPTIONAL" : "MISSING") : "OK"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Actions Footer */}
            <div className="flex justify-between items-center pt-4 border-t border-white/5">
              <button
                onClick={() => {
                  setShowTextVerificationModal(false);
                  setTempInvoiceData(null);
                  setExtractedOcrText("");
                }}
                className="btn-premium px-5 py-2 text-xs font-bold text-gray-400 hover:text-white uppercase tracking-wider"
              >
                Cancel Ingestion
              </button>
              
              <button
                onClick={() => {
                  setShowTextVerificationModal(false);
                  const analyzed = detectFraud(tempInvoiceData, invoices, vendors);
                  runVerificationPipeline(analyzed);
                }}
                className="btn-premium btn-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wider gap-2 shadow-[0_4px_20px_rgba(37,99,235,0.25)]"
              >
                Confirm & Run Fraud Scan
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
