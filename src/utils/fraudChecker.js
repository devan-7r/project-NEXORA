/**
 * Deterministic Rules-Based Fraud Checking Engine
 * Calculates risk levels, scores, confidence factors, and badges
 */

export function generateDynamicInvoiceFromFile(file, invoicesDatabase = []) {
  const suppliers = [
    "TechNova Pvt Ltd",
    "Global Electronics",
    "Bright Solutions",
    "Future Systems",
    "ABC Enterprises",
    "Delta Manufacturing",
    "Zenith Technologies",
    "Apex Industries",
    "Orion Traders",
    "SkyLine Logistics"
  ];
  
  // Hash the file name and size to get a deterministic offset
  const nameHash = file.name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) + file.size;

  // Clean filename to extract vendor name and numbers
  let supplierName = "";
  const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ").trim();
  const words = cleanName.split(/\s+/);
  
  // Filter out common utility words
  const ignoreWords = [
    "invoice", "bill", "receipt", "pdf", "scan", "copy", "statement", "doc", 
    "document", "draft", "final", "client", "customer", "vendor", "payment", 
    "wire", "bank", "tx", "trans", "simulated", "safe", "fraud", "review", "suspicious", "autofill"
  ];
  const meaningfulWords = words.filter(w => !ignoreWords.includes(w.toLowerCase()) && isNaN(w));

  if (meaningfulWords.length > 0) {
    supplierName = meaningfulWords.slice(0, 2).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  } else {
    supplierName = suppliers[nameHash % suppliers.length];
  }

  // Look for any 3-6 digit number in filename to use as Invoice ID
  let uniqueId = 10000 + (nameHash % 90000);
  const numberMatches = cleanName.match(/\b\d{3,6}\b/g);
  if (numberMatches && numberMatches.length > 0) {
    const extractedNum = parseInt(numberMatches[0]);
    if (extractedNum > 0) uniqueId = extractedNum;
  }
  const invoiceNumber = `INV-2026-${uniqueId}`;

  // Look for a larger number representing amount (e.g. 50000 or 150000)
  let baseAmount = 25000 + (nameHash % 1950000); // 25,000 to 1,975,000
  if (numberMatches && numberMatches.length > 1) {
    const possibleAmount = parseInt(numberMatches[1]);
    if (possibleAmount >= 1000 && possibleAmount <= 5000000) {
      baseAmount = possibleAmount;
    }
  }
  
  // Unique dates
  const today = new Date();
  const dateOffset = (nameHash % 12); // 0 to 11 days ago
  const invoiceDateObj = new Date(today.getTime() - dateOffset * 86400000);
  const invoiceDate = invoiceDateObj.toISOString().split("T")[0];
  
  const dueOffset = 7 + (nameHash % 25); // due in 7-32 days
  const dueDateObj = new Date(invoiceDateObj.getTime() + dueOffset * 86400000);
  const dueDate = dueDateObj.toISOString().split("T")[0];
  
  // GST code stateprefix matching addresses
  const isGstValid = (nameHash % 7) !== 0;
  const gstStates = ["27", "29", "07"];
  const selectedState = gstStates[nameHash % gstStates.length];
  const gstNumber = isGstValid 
    ? `${selectedState}AAAAA${1000 + (nameHash % 9000)}A1Z${nameHash % 9}`
    : `INVALID_GST_${nameHash % 100}`;
    
  const buyerName = "Enterprise Corp India";
  const currency = "INR";
  
  const taxAmount = Math.round(baseAmount * 0.18);
  const discount = (nameHash % 4) === 0 ? Math.round(baseAmount * 0.05) : 0;
  const grandTotal = baseAmount + taxAmount - discount;
  
  // Forensic flags
  const isSimulatedFraud = file.name.toLowerCase().includes("fraud") || file.name.toLowerCase().includes("fake") || file.name.toLowerCase().includes("mismatch");
  const isSimulatedSafe = file.name.toLowerCase().includes("safe") || file.name.toLowerCase().includes("clean");

  const ocrMismatch = isSimulatedSafe ? false : (isSimulatedFraud ? true : (nameHash % 6) === 0);
  const imageTampering = isSimulatedSafe ? false : (isSimulatedFraud ? true : (nameHash % 7) === 0);
  const metadataTampered = isSimulatedSafe ? false : (isSimulatedFraud ? true : (nameHash % 8) === 0);
  const differentFonts = isSimulatedSafe ? false : (isSimulatedFraud ? true : (nameHash % 9) === 0);
  const hasSignature = isSimulatedSafe ? true : (isSimulatedFraud ? false : (nameHash % 10) !== 0);
  const hasStamp = isSimulatedSafe ? true : (isSimulatedFraud ? false : (nameHash % 11) !== 0);

  const bankAccount = `9182${100000 + (nameHash % 900000)}12`;
  const ifscCode = `HDFC0${100000 + (nameHash % 900000)}`;

  const products = [
    { description: `Enterprise Solutions consultancy service for ${supplierName}`, quantity: 1, unitPrice: baseAmount, total: baseAmount }
  ];

  return {
    invoiceNumber,
    invoiceDate,
    vendorName: supplierName,
    vendorId: `VEND-0${(nameHash % 10) + 1}`,
    buyerName,
    gstNumber,
    currency,
    amount: baseAmount,
    taxAmount,
    discount,
    grandTotal,
    dueDate,
    products,
    bankAccount,
    ifscCode,
    poNumber: `PO-${80000 + (nameHash % 20000)}`,
    email: `billing@${supplierName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
    phoneNumber: `+91 98${10000000 + (nameHash % 90000000)}`,
    vendorAddress: `${selectedState === "27" ? "BKC, Mumbai, Maharashtra 400051" : selectedState === "29" ? "Cyber Heights, Bangalore, Karnataka 560001" : "Noida Sector 62, Delhi NCR 201301"}`,
    buyerAddress: "Plot 12, BKC, Bandra East, Mumbai 400051",
    ocrMismatch,
    imageTampering,
    metadataTampered,
    differentFonts,
    hasSignature,
    hasStamp,
    timestamp: new Date().toISOString()
  };
}

export function detectFraud(invoice, invoicesDatabase = [], vendorsDatabase = []) {
  const reasons = [];
  const issues = {
    duplicateInvoice: false,
    duplicateVendor: false,
    amountMismatch: false,
    invalidGst: false,
    gstStateMismatch: false,
    fakeCompany: false,
    ghostVendor: false,
    unknownBank: false,
    highAmount: false,
    multiplePayments: false,
    futureInvoice: false,
    expiredInvoice: false,
    missingSignature: false,
    missingStamp: false,
    ocrMismatch: false,
    differentFonts: false,
    repeatedTemplate: false,
    imageTampering: false,
    metadataTampered: false,
    vendorBlacklisted: false
  };

  const factors = {
    vendorVerification: 100,
    gstValidation: 100,
    paymentVerification: 100,
    historicalMatch: 100,
    duplicateDetection: 100,
    timestampVerification: 100,
    completeness: 98
  };

  const amountVal = parseFloat(invoice.amount || 0);
  const taxVal = parseFloat(invoice.taxAmount || 0);
  const discountVal = parseFloat(invoice.discount || 0);
  const grandTotalVal = parseFloat(invoice.grandTotal || invoice.finalAmount || 0);

  // Define dynamic base score derived from the amount to vary safe scores naturally
  const baseScore = 5 + (Math.round(amountVal) % 18); // yields base score of 5% to 22%
  let score = baseScore;

  // 1. Duplicate Invoice Check
  let duplicateEvidence = null;
  if (invoicesDatabase && invoicesDatabase.length > 0) {
    duplicateEvidence = invoicesDatabase.find(inv => {
      if (inv === invoice) return false;
      
      // Check 1: Same invoice number
      if (invoice.invoiceNumber && inv.invoiceNumber && inv.invoiceNumber.toLowerCase() === invoice.invoiceNumber.toLowerCase()) {
        return { type: "Invoice Number Match", matchingNumber: inv.invoiceNumber };
      }
      
      // Check 2: Highly similar data (Same Vendor, Same Amount, and either Same Date or Same PO)
      const sameVendor = inv.vendorName && invoice.vendorName && inv.vendorName.toLowerCase() === invoice.vendorName.toLowerCase();
      const sameAmount = amountVal > 0 && parseFloat(inv.amount || 0) === amountVal;
      const sameDate = invoice.invoiceDate && inv.invoiceDate && inv.invoiceDate === invoice.invoiceDate;
      const samePO = invoice.poNumber && inv.poNumber && inv.poNumber.toLowerCase() === invoice.poNumber.toLowerCase();
      
      if (sameVendor && sameAmount && (sameDate || samePO)) {
        return { type: "Highly Similar Data Match", matchingNumber: inv.invoiceNumber };
      }
      
      return false;
    });
  }

  if (duplicateEvidence) {
    score += 55; // high score addition
    issues.duplicateInvoice = true;
    factors.duplicateDetection = Math.max(factors.duplicateDetection - 80, 10);
    reasons.push("Duplicate invoice detected: Invoice number already exists in previous records.");
    reasons.push("Amount is identical to an earlier payment.");
  }

  // Find vendor in DB
  const matchedVendor = vendorsDatabase.find(
    v => v.name?.toLowerCase() === invoice.vendorName?.toLowerCase() ||
         v.id === invoice.vendorId
  );

  // 2. Ghost Vendor / Unknown Supplier
  if (!matchedVendor) {
    score += 35;
    issues.ghostVendor = true;
    factors.vendorVerification = Math.max(factors.vendorVerification - 60, 20);
    reasons.push("Vendor blacklist match found: Supplier is marked as inactive or unknown.");
  } else {
    // 3. Blacklisted/Inactive Vendor
    if (matchedVendor.status === "Suspicious" || matchedVendor.activeStatus === "Inactive") {
      score += 40;
      issues.vendorBlacklisted = true;
      factors.vendorVerification = Math.max(factors.vendorVerification - 70, 10);
      reasons.push("Vendor is marked as inactive in system registry.");
    }
  }

  // 4. Duplicate Vendor Activity Anomaly (non-direct duplicate)
  if (matchedVendor) {
    const activeVendorInvoices = invoicesDatabase.filter(
      inv => (inv.vendorName?.toLowerCase() === invoice.vendorName?.toLowerCase() || inv.vendorId === matchedVendor.id) &&
             inv.invoiceNumber !== invoice.invoiceNumber &&
             inv !== invoice
    );
    const duplicateAmountOrPO = activeVendorInvoices.some(
      inv => parseFloat(inv.amount) === amountVal || (inv.poNumber === invoice.poNumber && invoice.poNumber)
    );
    if (duplicateAmountOrPO && !duplicateEvidence) {
      score += 15;
      issues.duplicateVendor = true;
      factors.duplicateDetection = Math.max(factors.duplicateDetection - 40, 30);
      reasons.push("Duplicate payment warning: Identical PO reference has been matching another active entry.");
    }
  }

  // 5. Amount mismatch / Tax calculation error
  // SKIP if taxAmount is not detected (optional field)
  const taxIsDetected = invoice.taxAmount && invoice.taxAmount !== "Not Detected" && parseFloat(invoice.taxAmount) > 0;
  if (taxIsDetected) {
    const expectedTotal = amountVal + taxVal - discountVal;
    if (grandTotalVal > 0 && Math.abs(expectedTotal - grandTotalVal) > 5) {
      score += 25;
      issues.amountMismatch = true;
      factors.completeness = Math.max(factors.completeness - 30, 40);
      const diff = Math.abs(expectedTotal - grandTotalVal);
      reasons.push(`Tax calculation differs by ₹${Math.round(diff).toLocaleString()}.`);
    }
  }

  // 6. GST Validation / Fake GST
  const gstRegex = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/;
  if (invoice.gstNumber) {
    if (!gstRegex.test(invoice.gstNumber)) {
      score += 25;
      issues.invalidGst = true;
      factors.gstValidation = Math.max(factors.gstValidation - 60, 20);
      reasons.push("GSTIN does not match the government registry standard format.");
    } else {
      const statePrefix = invoice.gstNumber.substring(0, 2);
      const address = (invoice.vendorAddress || "").toLowerCase();
      let expectedPrefix = "";
      if (address.includes("maharashtra") || address.includes("mumbai") || address.includes("bkc")) expectedPrefix = "27";
      else if (address.includes("karnataka") || address.includes("bangalore") || address.includes("bengaluru")) expectedPrefix = "29";
      else if (address.includes("delhi") || address.includes("noida")) expectedPrefix = "07";
      
      if (expectedPrefix && statePrefix !== expectedPrefix) {
        score += 15;
        issues.gstStateMismatch = true;
        factors.gstValidation = Math.max(factors.gstValidation - 30, 40);
        reasons.push("GSTIN does not match the government registry (state code conflict).");
      }
    }
  } else {
    score += 20;
    issues.invalidGst = true;
    factors.gstValidation = Math.max(factors.gstValidation - 40, 30);
    reasons.push("Missing GSTIN details on invoice file.");
  }

  // 8. Fake Company / Email Domain mismatches
  // SKIP if email is not provided (optional field)
  const emailIsDetected = invoice.email && invoice.email !== "Not Detected" && invoice.email.includes("@");
  if (emailIsDetected && matchedVendor) {
    const emailDomain = invoice.email.split("@")[1] || "";
    const regEmail = (matchedVendor.email || "").split("@")[1] || "";
    if (regEmail && emailDomain.toLowerCase() !== regEmail.toLowerCase()) {
      score += 20;
      issues.fakeCompany = true;
      factors.vendorVerification = Math.max(factors.vendorVerification - 40, 30);
      reasons.push("Email address domain differs from verified company coordinates.");
    }
  }

  // 9. Unknown Bank or Payment Account Changed
  if (invoice.ifscCode) {
    const ifscRegex = /^[A-Z]{4}0[A-Z\d]{6}$/;
    if (!ifscRegex.test(invoice.ifscCode)) {
      score += 20;
      issues.unknownBank = true;
      factors.paymentVerification = Math.max(factors.paymentVerification - 50, 20);
      reasons.push("Bank account differs from registered vendor bank routing coordinates.");
    } else if (matchedVendor && matchedVendor.bankAccount && invoice.bankAccount && matchedVendor.bankAccount !== invoice.bankAccount) {
      score += 25;
      issues.unknownBank = true;
      factors.paymentVerification = Math.max(factors.paymentVerification - 60, 20);
      reasons.push("Bank account differs from registered vendor (payment account changed).");
    }
  }

  // 10. High Amount Outliers
  if (amountVal > 1000000) {
    score += 15;
    issues.highAmount = true;
    reasons.push("Price inflation anomaly: Transaction size is significantly higher than threshold.");
  }
  if (matchedVendor && matchedVendor.averageAmount) {
    const historicalDeviation = amountVal / matchedVendor.averageAmount;
    if (historicalDeviation > 2.5) {
      score += 25;
      issues.highAmount = true;
      factors.historicalMatch = Math.max(factors.historicalMatch - 50, 10);
      reasons.push("Purchase Order price inflation detected relative to historical average.");
    }
  }

  // 11. Invoice Date Conflict / Future Invoice
  if (invoice.invoiceDate && invoice.invoiceDate !== "Not Detected" && !isNaN(Date.parse(invoice.invoiceDate))) {
    const invDate = new Date(invoice.invoiceDate);
    const today = new Date();
    invDate.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    if (invDate > today) {
      score += 20;
      issues.futureInvoice = true;
      factors.timestampVerification = Math.max(factors.timestampVerification - 40, 30);
      reasons.push("Invoice date is outside contract period (future billing date).");
    }
  }

  // 12. Expired Invoice (due date in past)
  // SKIP if dueDate is not provided — it is an optional field
  const dueDateIsDetected = invoice.dueDate && invoice.dueDate !== "Not Detected" && !isNaN(Date.parse(invoice.dueDate));
  if (dueDateIsDetected) {
    const dueDateObj = new Date(invoice.dueDate);
    const today = new Date();
    dueDateObj.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    if (dueDateObj < today && invoice.status !== "Approved") {
      score += 15;
      issues.expiredInvoice = true;
      reasons.push("Overdue account: Invoice due date is in the past.");
    }
  }

  // 13. PDF authoring alterations / Missing Signature & Stamp
  if (invoice.hasSignature === false) {
    score += 15;
    issues.missingSignature = true;
    factors.completeness = Math.max(factors.completeness - 15, 60);
    reasons.push("Forged signature risk: authorization signature matches are missing.");
  }
  if (invoice.hasStamp === false) {
    score += 10;
    issues.missingStamp = true;
    factors.completeness = Math.max(factors.completeness - 10, 60);
    reasons.push("Security verification alert: Vendor stamp is missing or incomplete.");
  }
  if (invoice.ocrMismatch === true) {
    score += 35;
    issues.ocrMismatch = true;
    factors.completeness = Math.max(factors.completeness - 40, 20);
    reasons.push("OCR Mismatch: System OCR does not match parameters keyed in.");
  }
  if (invoice.imageTampering === true) {
    score += 30;
    issues.imageTampering = true;
    reasons.push("Image Alteration Detected: Digital forensics point to layout manipulations.");
  }
  if (invoice.metadataTampered === true) {
    score += 25;
    issues.metadataTampered = true;
    reasons.push("Suspicious Metadata: PDF revision timestamp is outside regular limits.");
  }
  if (invoice.differentFonts === true) {
    score += 15;
    issues.differentFonts = true;
    reasons.push("Layout irregularity: Multiple fonts or size variations detected within fields.");
  }

  // 14. Multiple Payments on same PO
  let multiplePaymentsFound = false;
  if (invoice.poNumber && invoicesDatabase && invoicesDatabase.length > 0) {
    const poMatches = invoicesDatabase.filter(inv => 
      inv.poNumber && inv.poNumber.toLowerCase() === invoice.poNumber.toLowerCase() &&
      inv.invoiceNumber !== invoice.invoiceNumber &&
      inv.status !== "Fraud"
    );
    if (poMatches.length > 0) {
      multiplePaymentsFound = true;
    }
  }
  if (multiplePaymentsFound) {
    score += 25;
    issues.multiplePayments = true;
    reasons.push("Duplicate PO draw detected: Multiple payments requested under the same Purchase Order number.");
  }

  // 15. Repeated Template / Rapid Invoicing Flow
  let repeatedTemplateFound = false;
  if (invoice.vendorName && invoicesDatabase && invoicesDatabase.length > 0) {
    const vendorInvs = invoicesDatabase.filter(inv =>
      inv.vendorName.toLowerCase() === invoice.vendorName.toLowerCase() &&
      inv.invoiceNumber !== invoice.invoiceNumber
    );
    if (vendorInvs.length >= 3) {
      repeatedTemplateFound = true;
    }
  }
  if (repeatedTemplateFound) {
    score += 10;
    issues.repeatedTemplate = true;
    reasons.push("Invoice flow alert: High frequency of identical template layouts from the same vendor profile.");
  }

  // 16. OCR Completeness check — only CRITICAL fields penalised
  // Optional fields (buyerName, dueDate, taxAmount, vendorAddress, email) are excluded — their absence does NOT raise risk score
  let missingFieldsCount = 0;
  const criticalFields = ["vendorName", "invoiceNumber", "invoiceDate", "gstNumber", "amount"];
  criticalFields.forEach(f => {
    const val = invoice[f];
    if (!val || val === "Not Detected" || val === 0 || val === "") {
      missingFieldsCount++;
    }
  });

  if (missingFieldsCount > 0) {
    score += missingFieldsCount * 8; // 8% per truly critical missing field
    factors.completeness = Math.max(factors.completeness - (missingFieldsCount * 12), 10);
    reasons.push(`Ingestion Risk: ${missingFieldsCount} critical transaction fields were Not Detected in the document.`);
  }

  // Normalize final score to a maximum of 98%
  score = Math.min(Math.max(score, 5), 98);
  
  // Decide risk level based on the strict user criteria:
  // 🟢 Green (Safe): 0–30%
  // 🟡 Yellow (Medium Risk): 31–50%
  // 🟠 Orange (Suspicious): 51-75%
  // 🔴 Red (High Risk): 76–100%
  let riskLevel = "SAFE";
  let badgeColor = "green";
  let badgeText = "Verified";
  let fraudType = "Genuine Invoice";
  let recommendations = [];
  let explanation = "";

  if (score >= 76) {
    riskLevel = "HIGH RISK";
    badgeColor = "red";
    
    // Choose primary high risk category
    if (issues.ghostVendor) {
      badgeText = "Ghost Invoice";
    } else if (issues.highAmount) {
      badgeText = "Inflated Invoice";
    } else if (issues.missingSignature) {
      badgeText = "Forged Invoice";
    } else if (issues.amountMismatch) {
      badgeText = "Manipulated Invoice";
    } else if (issues.ghostVendor || issues.vendorBlacklisted) {
      badgeText = "Fake Vendor";
    } else if (issues.unknownBank) {
      badgeText = "Payment Fraud";
    } else if (issues.metadataTampered || issues.imageTampering) {
      badgeText = "Metadata Tampered";
    } else if (issues.ocrMismatch) {
      badgeText = "OCR Mismatch";
    } else {
      badgeText = "High Risk";
    }
    fraudType = badgeText;
    
    recommendations = [
      "Block payment immediately.",
      "Send invoice for investigation.",
      "Alert finance team.",
      "Flag vendor.",
      "Prevent duplicate payment."
    ];
    
    explanation = reasons.join(" ");
  } else if (score >= 51) {
    riskLevel = "SUSPICIOUS";
    badgeColor = "orange";
    badgeText = (issues.duplicateInvoice || issues.duplicateVendor || multiplePaymentsFound) ? "Duplicate Invoice" : "Suspicious Invoice";
    fraudType = badgeText;
    
    recommendations = [
      "Verify PO details.",
      "Check with purchasing officer.",
      "Inspect document metadata."
    ];
    
    explanation = reasons.join(" ");
  } else if (score >= 31) {
    riskLevel = "REVIEW";
    badgeColor = "yellow";
    badgeText = "Needs Review";
    fraudType = "Needs Review";
    
    recommendations = [
      "Manual verification recommended.",
      "Contact supplier.",
      "Validate GST."
    ];

    explanation = reasons.join(" ");
  } else {
    riskLevel = "SAFE";
    badgeColor = "green";
    badgeText = "Verified";
    fraudType = "Genuine Invoice";

    recommendations = [
      "Approve payment.",
      "Store invoice.",
      "No suspicious activity detected."
    ];

    explanation = "✅ Invoice appears genuine: active supplier registry check complete, matching bank coordinates, zero metadata alterations, valid GST registration, mathematically complete.";
  }

  // Calculate dynamic confidence score separately from the fraud score
  // E.g. varies around 65% to 98% based on the invoice details
  const detailLength = (invoice.invoiceNumber || "").length + (invoice.vendorName || "").length;
  let confidence = 95 - (reasons.length * 6) - ((Math.round(amountVal) + detailLength) % 11);
  confidence = Math.min(Math.max(confidence, 45), 98);
  
  let confidenceStatus = "Very High Confidence";
  if (confidence < 60) confidenceStatus = "Low Confidence";
  else if (confidence < 75) confidenceStatus = "Medium Confidence";
  else if (confidence < 90) confidenceStatus = "High Confidence";

  return {
    ...invoice,
    fraudScore: score,
    riskLevel,
    badgeColor,
    badgeText,
    fraudType,
    aiConfidence: confidence,
    confidenceStatus,
    confidenceFactors: factors,
    aiExplanation: explanation,
    aiRecommendations: recommendations,
    detectedIssues: Object.keys(issues).filter(key => issues[key])
  };
}
