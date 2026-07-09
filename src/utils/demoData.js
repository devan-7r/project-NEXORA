// Realistic mock database for FraudShield AI

export const INITIAL_INVOICES = [
  {
    invoiceNumber: "INV-2026-001",
    vendorName: "Alpha Systems Ltd.",
    vendorId: "VEND-001",
    poNumber: "PO-99210",
    invoiceDate: "2026-07-01",
    dueDate: "2026-07-31",
    timestamp: "2026-07-01T10:14:00Z",
    currency: "INR",
    amount: 45000,
    taxAmount: 8100, // 18% GST
    gstNumber: "27AAAAA1111A1Z1",
    panNumber: "AAAAA1111A",
    bankAccount: "918273645012",
    ifscCode: "HDFC0000102",
    paymentTerms: "Net 30",
    buyerName: "Enterprise Corp India",
    buyerAddress: "Plot 12, BKC, Bandra East, Mumbai 400051",
    vendorAddress: "401, Tech Park, Sector 62, Noida 201301",
    email: "billing@alphasystems.com",
    phoneNumber: "+91 98765 43210",
    products: [
      { description: "Enterprise Cloud Hosting Subscription", quantity: 1, unitPrice: 35000, total: 35000 },
      { description: "Dedicated IP and Core Infrastructure Security Check", quantity: 1, unitPrice: 10000, total: 10000 }
    ],
    discount: 0,
    shippingCost: 0,
    grandTotal: 53100,
    status: "Approved",
    fraudScore: 8,
    riskLevel: "SAFE",
    aiConfidence: 98,
    confidenceStatus: "Very High Confidence",
    confidenceFactors: {
      vendorVerification: 100,
      gstValidation: 100,
      paymentVerification: 100,
      historicalMatch: 95,
      duplicateDetection: 100,
      timestampVerification: 95,
      completeness: 100
    },
    aiExplanation: "The vendor exists in the verified registry. Both GST and PAN credentials matched perfectly. Bank account is linked to previous valid invoices. No duplicates detected, and timestamp fits standard business hours.",
    aiRecommendations: [
      "Process payment automatically according to scheduling terms.",
      "Archived to general ledger."
    ],
    reviewer: "Auditor Rajeev Kumar",
    history: [
      { timestamp: "2026-07-01T10:14:00Z", action: "Invoice Uploaded", user: "Finance System" },
      { timestamp: "2026-07-01T10:14:05Z", action: "OCR Processing Completed", user: "OCR Engine" },
      { timestamp: "2026-07-01T10:14:12Z", action: "AI Validation Passed (Score: 8%)", user: "FraudShield AI Engine" },
      { timestamp: "2026-07-01T14:30:00Z", action: "Invoice Approved", user: "Auditor Rajeev Kumar" }
    ]
  },
  {
    invoiceNumber: "INV-2026-002",
    vendorName: "NeoTech Solutions",
    vendorId: "VEND-009",
    poNumber: "PO-88127",
    invoiceDate: "2026-07-09",
    dueDate: "2026-07-10", // Urgent due date!
    timestamp: "2026-07-09T03:15:22Z", // Submitted at 3:15 AM
    currency: "INR",
    amount: 2400000, // 420% higher than average!
    taxAmount: 432000,
    gstNumber: "27BBBBB2222B2Z2",
    panNumber: "BBBBB2222B",
    bankAccount: "50201088491223", // Changed bank account!
    ifscCode: "ICIC0000210",
    paymentTerms: "Immediate", // Urgent payment requested!
    buyerName: "Enterprise Corp India",
    buyerAddress: "Plot 12, BKC, Bandra East, Mumbai 400051",
    vendorAddress: "G-12, Cyber Heights, Sector 4, Bangalore 560001",
    email: "billing@neotechsolutions-sec.com", // Typo in domain!
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
    aiConfidence: 96,
    confidenceStatus: "Very High Confidence",
    confidenceFactors: {
      vendorVerification: 40, // Inactive / Suspicious
      gstValidation: 95,
      paymentVerification: 30, // Mismatched account
      historicalMatch: 20, // Huge deviation
      duplicateDetection: 98, // Close duplicate
      timestampVerification: 15, // Out of hours
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
      { timestamp: "2026-07-09T03:15:22Z", action: "Invoice Uploaded", user: "Guest User" },
      { timestamp: "2026-07-09T03:15:25Z", action: "OCR Processing Completed", user: "OCR Engine" },
      { timestamp: "2026-07-09T03:15:32Z", action: "AI Validation Run (Score: 87% - FRAUD)", user: "FraudShield AI Engine" },
      { timestamp: "2026-07-09T03:16:00Z", action: "Automatic Payment Hold Imposed", user: "System Guard" }
    ]
  },
  {
    invoiceNumber: "INV-2026-003",
    vendorName: "Swift Logistics",
    vendorId: "VEND-004",
    poNumber: "PO-77491",
    invoiceDate: "2026-07-05", // Holiday / Sunday
    dueDate: "2026-07-20",
    timestamp: "2026-07-05T18:45:00Z",
    currency: "INR",
    amount: 180000, // Deviation check: normal is 120,000
    taxAmount: 32400,
    gstNumber: "27CCCCC3333C3Z3",
    panNumber: "CCCCC3333C",
    bankAccount: "110229384756",
    ifscCode: "BARB0SECTOR",
    paymentTerms: "Net 15",
    buyerName: "Enterprise Corp India",
    buyerAddress: "Plot 12, BKC, Bandra East, Mumbai 400051",
    vendorAddress: "Warehouse 4B, JNPT Port, Nhava Sheva, Navi Mumbai 400707",
    email: "operations@swift-logistics.co.in",
    phoneNumber: "+91 22 5556 7788",
    products: [
      { description: "Freight Forwarding & Customs Clearance Charges", quantity: 1, unitPrice: 180000, total: 180000 }
    ],
    discount: 0,
    shippingCost: 0,
    grandTotal: 212400,
    status: "Pending",
    fraudScore: 45,
    riskLevel: "REVIEW",
    aiConfidence: 82,
    confidenceStatus: "High Confidence",
    confidenceFactors: {
      vendorVerification: 85,
      gstValidation: 95,
      paymentVerification: 90,
      historicalMatch: 65, // Slight deviation
      duplicateDetection: 90,
      timestampVerification: 40, // Sunday upload
      completeness: 95
    },
    aiExplanation: "The invoice date (July 5, 2026) falls on a Sunday. The invoice amount (₹1,80,000) represents a 50% increase over this vendor's typical monthly invoice value (₹1,20,000). The payment term is set to Net 15 instead of the contractual Net 30 agreement.",
    aiRecommendations: [
      "Verify with the Operations Department whether supplementary services were authorized.",
      "Check freight weight slips to confirm cargo volumes justify the elevated cost.",
      "Review the service contract regarding standard payment terms."
    ],
    reviewer: "Finance Mgr. Sanya Sen",
    history: [
      { timestamp: "2026-07-05T18:45:00Z", action: "Invoice Uploaded", user: "Swift Logistics API Integration" },
      { timestamp: "2026-07-05T18:45:04Z", action: "OCR Processing Completed", user: "OCR Engine" },
      { timestamp: "2026-07-05T18:45:10Z", action: "AI Validation Run (Score: 45% - REVIEW)", user: "FraudShield AI Engine" },
      { timestamp: "2026-07-06T09:00:00Z", action: "Assigned to Manual Review Queue", user: "System Administrator" }
    ]
  },
  {
    invoiceNumber: "INV-2026-004",
    vendorName: "Apex Marketing Group",
    vendorId: "VEND-002",
    poNumber: "PO-99104",
    invoiceDate: "2026-06-28",
    dueDate: "2026-07-28",
    timestamp: "2026-06-28T14:10:00Z",
    currency: "INR",
    amount: 95000,
    taxAmount: 17100,
    gstNumber: "27DDDDD4444D4Z4",
    panNumber: "DDDDD4444D",
    bankAccount: "10029384756",
    ifscCode: "SBIN0000301",
    paymentTerms: "Net 30",
    buyerName: "Enterprise Corp India",
    buyerAddress: "Plot 12, BKC, Bandra East, Mumbai 400051",
    vendorAddress: "802, Signature Towers, Gurgaon 122002",
    email: "accounts@apexmarketing.com",
    phoneNumber: "+91 124 4920 110",
    products: [
      { description: "Monthly Digital Campaign Retention & Management Fee", quantity: 1, unitPrice: 95000, total: 95000 }
    ],
    discount: 0,
    shippingCost: 0,
    grandTotal: 112100,
    status: "Approved",
    fraudScore: 12,
    riskLevel: "SAFE",
    aiConfidence: 97,
    confidenceStatus: "Very High Confidence",
    confidenceFactors: {
      vendorVerification: 100,
      gstValidation: 100,
      paymentVerification: 100,
      historicalMatch: 98,
      duplicateDetection: 100,
      timestampVerification: 95,
      completeness: 100
    },
    aiExplanation: "All credentials verified. Vendor registration active, GST returns filed up to date. Invoice template matches the historical format exactly, and the amount matches the contractual flat rate.",
    aiRecommendations: [
      "Approve for routing to payment system."
    ],
    reviewer: "Auditor Rajeev Kumar",
    history: [
      { timestamp: "2026-06-28T14:10:00Z", action: "Invoice Uploaded", user: "Finance System" },
      { timestamp: "2026-06-28T14:10:04Z", action: "OCR Processing Completed", user: "OCR Engine" },
      { timestamp: "2026-06-28T14:10:09Z", action: "AI Validation Passed (Score: 12%)", user: "FraudShield AI Engine" },
      { timestamp: "2026-06-29T10:15:00Z", action: "Invoice Approved", user: "Auditor Rajeev Kumar" }
    ]
  },
  {
    invoiceNumber: "INV-2026-005",
    vendorName: "Delta Tech Materials",
    vendorId: "VEND-012",
    poNumber: "PO-99210", // Same PO number as INV-2026-001!
    invoiceDate: "2026-07-08",
    dueDate: "2026-07-15",
    timestamp: "2026-07-08T17:30:10Z",
    currency: "INR",
    amount: 45000, // Same amount!
    taxAmount: 8100,
    gstNumber: "27EEEEE5555E5Z5",
    panNumber: "EEEEE5555E",
    bankAccount: "90029384751", // Mismatched vendor bank account for this PO!
    ifscCode: "KKBK0000958",
    paymentTerms: "Immediate",
    buyerName: "Enterprise Corp India",
    buyerAddress: "Plot 12, BKC, Bandra East, Mumbai 400051",
    vendorAddress: "31, Industrial Area Phase II, Okhla, New Delhi 110020",
    email: "billing@deltatechmaterials.org", // Unverified domain name
    phoneNumber: "+91 11 4455 6677",
    products: [
      { description: "Enterprise Cloud Hosting Subscription", quantity: 1, unitPrice: 35000, total: 35000 },
      { description: "Dedicated IP and Core Infrastructure Security Check", quantity: 1, unitPrice: 10000, total: 10000 }
    ], // Exactly identical items to INV-2026-001!
    discount: 0,
    shippingCost: 0,
    grandTotal: 53100,
    status: "Fraud",
    fraudScore: 92,
    riskLevel: "HIGH RISK",
    aiConfidence: 94,
    confidenceStatus: "High Confidence",
    confidenceFactors: {
      vendorVerification: 70,
      gstValidation: 85,
      paymentVerification: 30,
      historicalMatch: 40,
      duplicateDetection: 15, // Extremely high probability of duplication!
      timestampVerification: 90,
      completeness: 100
    },
    aiExplanation: "Extremely high risk of invoice double-billing or identity spoofing. The product list, item quantities, prices, and net amount are an exact character-by-character duplicate of INV-2026-001 from a different vendor (Alpha Systems Ltd.). The PO-99210 referenced belongs contractually to Alpha Systems, not Delta Tech Materials.",
    aiRecommendations: [
      "BLOCK TRANSACTION IMMEDIATELY.",
      "Reject invoice and check for credential phishing attempts.",
      "Mark PO-99210 as locked to avoid duplicate draws."
    ],
    reviewer: "None",
    history: [
      { timestamp: "2026-07-08T17:30:10Z", action: "Invoice Uploaded", user: "Finance Upload Portal" },
      { timestamp: "2026-07-08T17:30:14Z", action: "OCR Processing Completed", user: "OCR Engine" },
      { timestamp: "2026-07-08T17:30:20Z", action: "AI Validation Run (Score: 92% - FRAUD)", user: "FraudShield AI Engine" },
      { timestamp: "2026-07-08T17:31:00Z", action: "Blocked & Flagged for Duplicate Phishing", user: "System Guard" }
    ]
  },
  {
    invoiceNumber: "INV-2026-006",
    vendorName: "Prestige Electrical Works",
    vendorId: "VEND-015",
    poNumber: "PO-44812",
    invoiceDate: "2026-07-07",
    dueDate: "2026-07-22",
    timestamp: "2026-07-07T11:30:00Z",
    currency: "INR",
    amount: 68500,
    taxAmount: 12330,
    gstNumber: "27FFFFF6666F6Z6",
    panNumber: "FFFFF6666F",
    bankAccount: "20029348756",
    ifscCode: "PUNB0112300",
    paymentTerms: "Net 30",
    buyerName: "Enterprise Corp India",
    buyerAddress: "Plot 12, BKC, Bandra East, Mumbai 400051",
    vendorAddress: "7B, Andheri Industrial Estate, Mumbai 400058",
    email: "accounts@prestigeelec.com",
    phoneNumber: "+91 22 4477 8899",
    products: [
      { description: "Annual Electrical Maintenance Contract Q3 2026", quantity: 1, unitPrice: 50000, total: 50000 },
      { description: "Emergency Switchboard Repair — Building B", quantity: 1, unitPrice: 18500, total: 18500 }
    ],
    discount: 0,
    shippingCost: 0,
    grandTotal: 80830,
    status: "Approved",
    fraudScore: 9,
    riskLevel: "SAFE",
    aiConfidence: 97,
    confidenceStatus: "Very High Confidence",
    confidenceFactors: {
      vendorVerification: 100,
      gstValidation: 100,
      paymentVerification: 100,
      historicalMatch: 96,
      duplicateDetection: 100,
      timestampVerification: 98,
      completeness: 100
    },
    aiExplanation: "All credentials verified. Vendor is registered and active. GST and PAN matched. Invoice amount consistent with prior quarters. Payment terms align with contract (Net 30). Bank account matches verified registry.",
    aiRecommendations: ["Process payment on schedule."],
    reviewer: "Finance Mgr. Sanya Sen",
    history: [
      { timestamp: "2026-07-07T11:30:00Z", action: "Invoice Uploaded", user: "Finance System" },
      { timestamp: "2026-07-07T11:30:05Z", action: "OCR Processing Completed", user: "OCR Engine" },
      { timestamp: "2026-07-07T11:30:11Z", action: "AI Validation Passed (Score: 9%)", user: "FraudShield AI Engine" },
      { timestamp: "2026-07-07T13:00:00Z", action: "Invoice Approved", user: "Finance Mgr. Sanya Sen" }
    ]
  },
  {
    invoiceNumber: "INV-2026-007",
    vendorName: "GreenTech Renewables",
    vendorId: "VEND-021",
    poNumber: "PO-30192",
    invoiceDate: "2026-07-08",
    dueDate: "2026-07-23",
    timestamp: "2026-07-08T09:15:00Z",
    currency: "INR",
    amount: 350000,
    taxAmount: 63000,
    gstNumber: "07GGGGG7777G7Z7",
    panNumber: "GGGGG7777G",
    bankAccount: "30044928756",
    ifscCode: "CITI0000001",
    paymentTerms: "Net 30",
    buyerName: "Enterprise Corp India",
    buyerAddress: "Plot 12, BKC, Bandra East, Mumbai 400051",
    vendorAddress: "Unit 6, Eco Park, Whitefield, Bangalore 560066",
    email: "billing@greentechrenewables.in",
    phoneNumber: "+91 80 4412 9933",
    products: [
      { description: "Rooftop Solar Panel Installation — Phase 1", quantity: 1, unitPrice: 350000, total: 350000 }
    ],
    discount: 0,
    shippingCost: 0,
    grandTotal: 413000,
    status: "Pending",
    fraudScore: 38,
    riskLevel: "REVIEW",
    aiConfidence: 79,
    confidenceStatus: "Moderate Confidence",
    confidenceFactors: {
      vendorVerification: 80,
      gstValidation: 55,
      paymentVerification: 85,
      historicalMatch: 70,
      duplicateDetection: 100,
      timestampVerification: 90,
      completeness: 95
    },
    aiExplanation: "Moderate risk flag: The vendor's GSTIN prefix (07) indicates Delhi state registration, but the provided vendor address is in Bangalore. This geographic GSTIN mismatch requires verification. Invoice amount (₹3,50,000) is within acceptable range for new large projects but no prior transactions exist to benchmark against.",
    aiRecommendations: [
      "Request physical GSTIN certificate to verify state of registration.",
      "Cross-check vendor address with GST portal records.",
      "Collect work order or site inspection approval before release."
    ],
    reviewer: "Auditor Rajeev Kumar",
    history: [
      { timestamp: "2026-07-08T09:15:00Z", action: "Invoice Uploaded", user: "Vendor Portal" },
      { timestamp: "2026-07-08T09:15:06Z", action: "OCR Processing Completed", user: "OCR Engine" },
      { timestamp: "2026-07-08T09:15:13Z", action: "AI Validation Run (Score: 38% - REVIEW)", user: "FraudShield AI Engine" },
      { timestamp: "2026-07-08T10:00:00Z", action: "Assigned to Auditor for GST Verification", user: "System Administrator" }
    ]
  }
];

export const INITIAL_VENDORS = [
  {
    id: "VEND-001",
    name: "Alpha Systems Ltd.",
    status: "Verified",
    registrationDate: "2018-04-12",
    gst: "27AAAAA1111A1Z1",
    pan: "AAAAA1111A",
    address: "401, Tech Park, Sector 62, Noida 201301",
    email: "billing@alphasystems.com",
    phone: "+91 98765 43210",
    trustScore: 98,
    averageAmount: 45000,
    invoicesProcessed: 38,
    activeStatus: "Active"
  },
  {
    id: "VEND-002",
    name: "Apex Marketing Group",
    status: "Verified",
    registrationDate: "2020-09-18",
    gst: "27DDDDD4444D4Z4",
    pan: "DDDDD4444D",
    address: "802, Signature Towers, Gurgaon 122002",
    email: "accounts@apexmarketing.com",
    phone: "+91 124 4920 110",
    trustScore: 96,
    averageAmount: 95000,
    invoicesProcessed: 22,
    activeStatus: "Active"
  },
  {
    id: "VEND-004",
    name: "Swift Logistics",
    status: "Verified",
    registrationDate: "2021-11-05",
    gst: "27CCCCC3333C3Z3",
    pan: "CCCCC3333C",
    address: "Warehouse 4B, JNPT Port, Nhava Sheva, Navi Mumbai 400707",
    email: "operations@swift-logistics.co.in",
    phone: "+91 22 5556 7788",
    trustScore: 88,
    averageAmount: 120000,
    invoicesProcessed: 14,
    activeStatus: "Active"
  },
  {
    id: "VEND-009",
    name: "NeoTech Solutions",
    status: "Suspicious",
    registrationDate: "2019-01-20",
    gst: "27BBBBB2222B2Z2",
    pan: "BBBBB2222B",
    address: "G-12, Cyber Heights, Sector 4, Bangalore 560001",
    email: "billing@neotechsolutions.com",
    phone: "+91 80123 45678",
    trustScore: 42,
    averageAmount: 450000,
    invoicesProcessed: 5,
    activeStatus: "Inactive" // Has been inactive for 18 months
  },
  {
    id: "VEND-012",
    name: "Delta Tech Materials",
    status: "Suspicious",
    registrationDate: "2025-05-15",
    gst: "27EEEEE5555E5Z5",
    pan: "EEEEE5555E",
    address: "31, Industrial Area Phase II, Okhla, New Delhi 110020",
    email: "billing@deltatechmaterials.org",
    phone: "+91 11 4455 6677",
    trustScore: 35,
    averageAmount: 18000,
    invoicesProcessed: 2,
    activeStatus: "Active"
  },
  {
    id: "VEND-015",
    name: "Prestige Electrical Works",
    status: "Verified",
    registrationDate: "2019-08-22",
    gst: "27FFFFF6666F6Z6",
    pan: "FFFFF6666F",
    address: "7B, Andheri Industrial Estate, Mumbai 400058",
    email: "accounts@prestigeelec.com",
    phone: "+91 22 4477 8899",
    trustScore: 94,
    averageAmount: 65000,
    invoicesProcessed: 31,
    activeStatus: "Active"
  },
  {
    id: "VEND-021",
    name: "GreenTech Renewables",
    status: "Unverified",
    registrationDate: "2024-11-10",
    gst: "07GGGGG7777G7Z7",
    pan: "GGGGG7777G",
    address: "Unit 6, Eco Park, Whitefield, Bangalore 560066",
    email: "billing@greentechrenewables.in",
    phone: "+91 80 4412 9933",
    trustScore: 62,
    averageAmount: 350000,
    invoicesProcessed: 1,
    activeStatus: "Active"
  }
];

export const INITIAL_AUDIT_LOGS = [
  {
    timestamp: "2026-07-09T12:05:00Z",
    user: "System Admin (Super)",
    action: "Database backup created",
    status: "Success",
    ipAddress: "192.168.1.50",
    device: "Windows 11 PC / Chrome",
    location: "Mumbai, India",
    invoiceNumber: "N/A",
    result: "Backup Verified Secure"
  },
  {
    timestamp: "2026-07-09T10:14:00Z",
    user: "Finance System Core",
    action: "GSTIN Registry Synchronized",
    status: "Success",
    ipAddress: "10.0.4.15",
    device: "API Service Node 02",
    location: "AWS ap-south-1",
    invoiceNumber: "N/A",
    result: "52,490 vendors updated"
  },
  {
    timestamp: "2026-07-09T03:15:32Z",
    user: "FraudShield Engine",
    action: "Fraud Score Raised (87%)",
    status: "Warning",
    ipAddress: "10.0.12.8",
    device: "AI Inference Instance 01",
    location: "AWS ap-south-1",
    invoiceNumber: "INV-2026-002",
    result: "Payment Hold Triggered"
  },
  {
    timestamp: "2026-07-09T03:15:22Z",
    user: "Secure API Portal",
    action: "Invoice File Received",
    status: "Success",
    ipAddress: "203.0.113.88",
    device: "Web Browser Client",
    location: "Bangalore, India",
    invoiceNumber: "INV-2026-002",
    result: "File: INV_2026_002_NEOTECH.pdf"
  },
  {
    timestamp: "2026-07-08T17:30:20Z",
    user: "FraudShield Engine",
    action: "Fraud Score Raised (92%)",
    status: "Warning",
    ipAddress: "10.0.12.8",
    device: "AI Inference Instance 01",
    location: "AWS ap-south-1",
    invoiceNumber: "INV-2026-005",
    result: "Duplicate Alert Generated"
  }
];

export const SYSTEM_HEALTH = {
  aiEngine: { status: "Healthy", latency: "145ms", load: "14%", memory: "2.4 GB / 8.0 GB", uptime: "99.98%" },
  ocrEngine: { status: "Healthy", latency: "380ms", load: "8%", memory: "1.1 GB / 4.0 GB", uptime: "99.95%" },
  database: { status: "Healthy", latency: "12ms", load: "5%", memory: "16.4 GB / 64.0 GB", uptime: "100%" },
  cloudStorage: { status: "Healthy", latency: "55ms", load: "2%", storage: "1.2 TB / 10 TB", uptime: "100%" },
  securityGateway: { status: "Encrypted", activeRules: "256", blockedToday: "148 IPs", statusLabel: "Active Shield" },
  systemApi: { status: "Online", uptime: "99.99%", rateLimit: "1,200/min", currentRate: "35/min" }
};

export const SECURITY_CHECKS = [
  { name: "256-bit AES DB Encryption", active: true },
  { name: "TLS 1.3 Secure SSL Socket Connection", active: true },
  { name: "Cloudflare Web Application Firewall", active: true },
  { name: "API Rate Limiting Guard Enabled", active: true },
  { name: "Role-Based Access Control Active", active: true },
  { name: "Continuous Compliance Auditor Core", active: true }
];

// Simple Natural Language Processing helper for the assistant chatbot
export const processChatQuery = (query, invoices, vendors) => {
  const q = query.toLowerCase().trim();
  
  if (q.includes("inv-2026-001")) {
    const inv = invoices.find(i => i.invoiceNumber === "INV-2026-001") || invoices[0];
    return {
      text: `Invoice **INV-2026-001** from **Alpha Systems Ltd.** is **Safe**. It has an AI fraud risk score of **${inv.fraudScore}%** and our verification confidence is **${inv.aiConfidence}%**. All GST, PAN, and payment details have matched historical transactions successfully.`,
      action: { type: "VIEW_INVOICE", invoiceNumber: "INV-2026-001" }
    };
  }
  
  if (q.includes("inv-2026-002") || (q.includes("risky") && q.includes("002")) || q.includes("why is invoice risky")) {
    const inv = invoices.find(i => i.invoiceNumber === "INV-2026-002") || invoices[1];
    return {
      text: `Invoice **INV-2026-002** (NeoTech Solutions) is flagged as **HIGH RISK** with a Fraud Score of **${inv.fraudScore}%** (Confidence: **${inv.aiConfidence}%**).\n\n**Reasons for Risk Alert:**\n1. **Changed Bank Account:** Mismatched beneficiary details detected compared to historical accounts.\n2. **Amount Outlier:** The amount (₹24,00,000) is **420% higher** than this vendor's historical average of ₹4,50,000.\n3. **Anomalous Upload Time:** Uploaded at 3:15 AM on a Sunday.\n4. **Expired Vendor Registration:** Vendor has been inactive in the GST registry for 18 months.\n5. **Spoofed Email Domain:** Submitted from 'neotechsolutions-sec.com' instead of official 'neotechsolutions.com'.\n\n**Recommendation:** Hold payment immediately and conduct out-of-band vendor verification.`,
      action: { type: "VIEW_INVOICE", invoiceNumber: "INV-2026-002" }
    };
  }

  if (q.includes("inv-2026-003")) {
    const inv = invoices.find(i => i.invoiceNumber === "INV-2026-003") || invoices[2];
    return {
      text: `Invoice **INV-2026-003** from **Swift Logistics** requires manual review (Fraud Score: **${inv.fraudScore}%**, Confidence: **${inv.aiConfidence}%**).\n\n**Key Alerts:**\n- Invoice dated on a Sunday / Holiday.\n- Amount (₹1,80,000) is 50% above the average monthly billing.\n- Net-15 terms requested instead of the standard contract Net-30.`,
      action: { type: "VIEW_INVOICE", invoiceNumber: "INV-2026-003" }
    };
  }

  if (q.includes("inv-2026-005")) {
    const inv = invoices.find(i => i.invoiceNumber === "INV-2026-005") || invoices[4];
    return {
      text: `Invoice **INV-2026-005** (Delta Tech Materials) is flagged as **HIGH RISK** with a Fraud Score of **${inv.fraudScore}%**.\n\n**Alert:** This invoice is a direct duplicate of INV-2026-001 (Alpha Systems) with identical items and amounts but submitted under a different vendor identity. This is a clear double-billing or phishing signature.`,
      action: { type: "VIEW_INVOICE", invoiceNumber: "INV-2026-005" }
    };
  }

  if (q.includes("duplicate") || q.includes("find duplicates") || q.includes("double billing")) {
    return {
      text: "I identified **1 duplicate invoice attempt** under INV-2026-005 (Delta Tech Materials), which shares an identical amount (₹45,000) and product items with INV-2026-001 (Alpha Systems).",
      action: { type: "FILTER_RISK", risk: "HIGH RISK" }
    };
  }

  if (q.includes("today's fraud report") || q.includes("report") || q.includes("summary") || q.includes("today's activity")) {
    const totalCount = invoices.length;
    const fraudCount = invoices.filter(i => i.status === "Fraud").length;
    const pendingCount = invoices.filter(i => i.status === "Pending").length;
    return {
      text: `**FraudShield Summary Report:**\n- **Total Invoices Processed:** ${totalCount}\n- **High Risk / Fraud Blocked:** ${fraudCount} (₹28.85 Lakhs)\n- **In Manual Review Queue:** ${pendingCount} (₹2.12 Lakhs)\n- **Verifications Passed:** ${invoices.filter(i => i.status === "Approved").length}\n\nOur system detected anomalous activity regarding NeoTech Solutions (VEND-009) and Delta Tech (VEND-012), blocking both before any transaction occurred.`,
      action: { type: "GO_TO_TAB", tab: "dashboard" }
    };
  }

  if (q.includes("pending") || q.includes("show pending") || q.includes("review queue")) {
    const pendingInvs = invoices.filter(i => i.status === "Pending");
    const list = pendingInvs.map(i => `**${i.invoiceNumber}** (${i.vendorName}, ₹${i.amount.toLocaleString()}, Score: ${i.fraudScore}%)`).join("\n- ");
    return {
      text: `Found **${pendingInvs.length} invoice(s)** in the review queue:\n- ${list}\n\nThese require manual auditor approval before payment can be processed.`,
      action: { type: "FILTER_STATUS", status: "Pending" }
    };
  }

  if (q.includes("inv-2026-006") || q.includes("prestige") || q.includes("electrical")) {
    const inv = invoices.find(i => i.invoiceNumber === "INV-2026-006");
    if (inv) return {
      text: `Invoice **INV-2026-006** from **Prestige Electrical Works** is **Safe** (Fraud Score: **${inv.fraudScore}%**, Confidence: **${inv.aiConfidence}%**).\n\nAll vendor credentials are verified, the amount aligns with the Q3 maintenance contract, and both GST and PAN records match the registry.`,
      action: { type: "VIEW_INVOICE", invoiceNumber: "INV-2026-006" }
    };
  }

  if (q.includes("inv-2026-007") || q.includes("greentech") || q.includes("gst mismatch") || q.includes("gstin mismatch") || q.includes("solar")) {
    const inv = invoices.find(i => i.invoiceNumber === "INV-2026-007");
    if (inv) return {
      text: `Invoice **INV-2026-007** from **GreenTech Renewables** is in **Review** (Fraud Score: **${inv.fraudScore}%**, Confidence: **${inv.aiConfidence}%**).\n\n**Key Flag:** The GSTIN prefix '07' corresponds to Delhi state, but the vendor's registered address is Bangalore. This geographic mismatch requires GST portal verification before payment release.`,
      action: { type: "VIEW_INVOICE", invoiceNumber: "INV-2026-007" }
    };
  }

  if (q.includes("vendor") && (q.includes("list") || q.includes("all") || q.includes("show"))) {
    const verified = vendors.filter(v => v.status === "Verified").length;
    const suspicious = vendors.filter(v => v.status === "Suspicious").length;
    const unverified = vendors.filter(v => v.status === "Unverified").length;
    return {
      text: `Vendor Registry contains **${vendors.length} vendors** total:\n- ✅ **Verified & Active:** ${verified} vendors (Alpha Systems, Apex Marketing, Swift Logistics, Prestige Electrical)\n- ⚠️ **Suspicious / Inactive:** ${suspicious} vendors (NeoTech Solutions, Delta Tech Materials)\n- 🔍 **Unverified / New:** ${unverified} vendor (GreenTech Renewables — GST mismatch pending)`,
      action: { type: "GO_TO_TAB", tab: "vendors" }
    };
  }

  if (q.includes("duplicate") || q.includes("double billing") || q.includes("same invoice")) {
    return {
      text: `I identified **1 confirmed duplicate invoice attempt**:\n\n**INV-2026-005** (Delta Tech Materials) is a character-by-character copy of **INV-2026-001** (Alpha Systems Ltd.) — same PO number (PO-99210), identical products, and exact same amount (₹45,000). This is a textbook double-billing phishing attack.\n\n**Action Taken:** Payment automatically blocked. PO-99210 flagged as locked.`,
      action: { type: "FILTER_RISK", risk: "HIGH RISK" }
    };
  }

  if (q.includes("report") || q.includes("summary") || q.includes("today") || q.includes("dashboard")) {
    const totalCount = invoices.length;
    const fraudCount = invoices.filter(i => i.status === "Fraud").length;
    const pendingCount = invoices.filter(i => i.status === "Pending").length;
    const approvedCount = invoices.filter(i => i.status === "Approved").length;
    const moneyBlocked = invoices.filter(i => i.status === "Fraud").reduce((s, i) => s + i.amount, 0);
    return {
      text: `**📊 FraudShield Daily Report:**\n- **Total Invoices Processed:** ${totalCount}\n- **✅ Approved & Safe:** ${approvedCount}\n- **🚨 Fraud Blocked:** ${fraudCount} (₹${(moneyBlocked/100000).toFixed(2)} Lakhs protected)\n- **⏳ In Manual Review:** ${pendingCount}\n\n**Threats Mitigated Today:** NeoTech Solutions (bank mismatch + 420% amount spike) and Delta Tech Materials (duplicate billing attempt). System confidence: **96.4%**.`,
      action: { type: "GO_TO_TAB", tab: "dashboard" }
    };
  }

  if (q.includes("average risk") || q.includes("confidence") || q.includes("accuracy")) {
    const avgConf = (invoices.reduce((s, i) => s + i.aiConfidence, 0) / invoices.length).toFixed(1);
    const avgScore = (invoices.reduce((s, i) => s + i.fraudScore, 0) / invoices.length).toFixed(1);
    return {
      text: `**AI System Performance:**\n- **Average Confidence:** ${avgConf}% across all ${invoices.length} invoices\n- **Average Fraud Score:** ${avgScore}%\n- **False Positive Rate:** 0.3% (industry avg: 2–5%)\n- **Mean Verification Time:** 1.4s per invoice\n\nThe AI integrates 7 validation layers: GST registry, PAN database, bank account matching, duplicate detection, timestamp analysis, historical benchmarking, and vendor behavioral patterns.`,
      action: { type: "GO_TO_TAB", tab: "analytics" }
    };
  }

  if (q.includes("high value") || q.includes("above 1 lakh") || q.includes("large invoice") || q.includes("biggest")) {
    const sorted = [...invoices].sort((a, b) => b.amount - a.amount).slice(0, 4);
    const list = sorted.map((i, idx) => `${idx + 1}. **${i.invoiceNumber}** (${i.vendorName}): ₹${i.amount.toLocaleString()} — ${i.status}`).join("\n");
    return {
      text: `**Highest Value Invoices:**\n${list}`,
      action: { type: "FILTER_AMOUNT", minAmount: 100000 }
    };
  }

  if (q.includes("audit log") || q.includes("activity") || q.includes("history")) {
    return {
      text: `I'll open the **Audit Logs** tab where you can review all system events, including fraud detection alerts, payment holds, GSTIN sync events, and user actions with timestamps, IP addresses, and device fingerprints.`,
      action: { type: "GO_TO_TAB", tab: "audit-logs" }
    };
  }

  if (q.includes("analytics") || q.includes("chart") || q.includes("heatmap") || q.includes("trend")) {
    return {
      text: `Opening the **Analytics** dashboard. You can explore:\n- Threat category distribution (duplicate billing is 45% of all fraud)\n- Temporal heatmap showing anomalous submission windows (fraud peaks at 3 AM on weekends)\n- Fraud score trend line across all invoices\n- Vendor trust profile radial gauges`,
      action: { type: "GO_TO_TAB", tab: "analytics" }
    };
  }

  // Dynamic fallback using actual invoice/vendor counts
  const fraudCount = invoices.filter(i => i.status === "Fraud").length;
  return {
    text: `I am **FraudShield AI** — your real-time invoice fraud detection assistant.\n\nCurrently monitoring **${invoices.length} invoices** and **${vendors.length} vendor profiles**, with **${fraudCount} fraud threats** blocked today.\n\nTry asking:\n- *'Why is INV-2026-002 flagged?'*\n- *'Show all pending invoices'*\n- *'What is today's fraud summary?'*\n- *'Show me the highest value invoices'*\n- *'Explain the GST mismatch in INV-2026-007'*`,
    action: null
  };
};
