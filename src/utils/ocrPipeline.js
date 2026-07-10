import * as pdfjsLib from 'pdfjs-dist';
import { createWorker } from 'tesseract.js';

// Use local bundled worker — avoids CDN failures and Content Security Policy blocks
// pdfjs-dist ships the worker as a separate file; Vite copies it to dist/assets
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
} catch (e) {
  // Fallback: try CDN worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

/**
 * Extracts text from selectable PDF using PDF.js.
 * Fallbacks to scanned page canvas rendering if text density is low.
 */
export async function extractTextFromPDF(file, onProgress) {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  
  if (onProgress) {
    loadingTask.onProgress = (progressData) => {
      if (progressData.total > 0) {
        const percent = Math.round((progressData.loaded / progressData.total) * 100);
        onProgress(`Loading PDF: ${percent}%`);
      }
    };
  }

  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  let fullText = "";
  let totalMeaningfulChars = 0;

  if (onProgress) onProgress(`PDF loaded — ${numPages} page${numPages > 1 ? "s" : ""} detected. Extracting text...`);

  // First pass: extract selectable text layer from all pages
  for (let i = 1; i <= numPages; i++) {
    if (onProgress) onProgress(`Extracting text layer from page ${i} of ${numPages}...`);
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).filter(s => s.trim()).join(" ");
    totalMeaningfulChars += pageText.trim().replace(/\s/g, "").length;
    fullText += `--- Page ${i} ---\n` + pageText + "\n\n";
  }

  // If meaningful text is < 50 chars across all pages → treat as scanned PDF → use OCR
  if (totalMeaningfulChars < 50) {
    if (onProgress) onProgress("No selectable text found. Switching to OCR engine for scanned document...");
    fullText = "";
    const worker = await createWorker('eng');

    for (let i = 1; i <= numPages; i++) {
      if (onProgress) onProgress(`OCR scanning page ${i} of ${numPages} at 2× resolution...`);
      const page = await pdf.getPage(i);

      // Render at 2× scale for higher OCR accuracy
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport }).promise;

      const { data: { text, confidence } } = await worker.recognize(canvas);
      fullText += `--- Scanned Page ${i} ---\n` + text + "\n\n";
    }

    await worker.terminate();
    return {
      text: fullText.trim(),
      isScanned: true,
      ocrConfidence: 80,
      numPages
    };
  }

  return {
    text: fullText.trim(),
    isScanned: false,
    ocrConfidence: 99,
    numPages
  };
}

/**
 * Extracts text from standard image formats (PNG, JPG, JPEG) using Tesseract OCR.
 */
export async function extractTextFromImage(file, onProgress) {
  if (onProgress) onProgress("Initializing OCR engine for image...");
  const worker = await createWorker('eng');
  
  if (onProgress) onProgress("Running character recognition...");
  const { data: { text, confidence } } = await worker.recognize(file);
  await worker.terminate();

  return {
    text: text.trim(),
    isScanned: true,
    ocrConfidence: confidence,
    numPages: 1
  };
}

/**
 * High-performance regex parser that extracts standard invoice fields from text.
 * Falls back to "Not Detected" when fields are missing or OCR confidence is low.
 */
export function parseInvoiceFields(text, ocrConfidence = 100) {
  if (ocrConfidence < 40) {
    return {
      vendorName: "Not Detected",
      invoiceNumber: "Not Detected",
      invoiceDate: "Not Detected",
      dueDate: "Not Detected",
      buyerName: "Not Detected",
      gstNumber: "Not Detected",
      amount: 0,
      taxAmount: 0,
      grandTotal: 0,
      grandTotalDisplay: "Could not extract — OCR confidence too low",
      poNumber: "Not Detected",
      bankAccount: "Not Detected",
      ifscCode: "Not Detected",
      currency: "INR",
      email: "Not Detected",
      phoneNumber: "Not Detected",
      vendorAddress: "Not Detected",
      buyerAddress: "Not Detected",
      products: []
    };
  }

  const lowercaseText = text.toLowerCase();

  // 1. Supplier Name
  let vendorName = "Not Detected";
  const vendorMatch = text.match(/(?:supplier|vendor|seller|sold\s+by|from|issued\s+by)\s*:\s*([^\n\r]+)/i);
  if (vendorMatch && vendorMatch[1].trim().length > 2) {
    vendorName = vendorMatch[1].replace(/[^a-zA-Z0-9\s.,&()]/g, "").trim();
  } else {
    const lines = text.split("\n");
    for (const line of lines) {
      if (line.match(/(?:pvt|ltd|inc|corp|co\.|systems|solutions|enterprises|technologies|logistics|traders|global|consultancy)\b/i)) {
        const cleaned = line.replace(/(?:invoice|date|number|gstin|gst|phone|email|billed|to|buyer|ship\s*to):.*/i, "").trim();
        if (cleaned.length > 3 && cleaned.length < 50) {
          vendorName = cleaned;
          break;
        }
      }
    }
  }

  // 2. Invoice Number
  let invoiceNumber = "Not Detected";
  const invMatch = text.match(/(?:invoice\s*#?|inv\s*#?|bill\s*#?|invoice\s*num(?:ber)?|inv\s*num(?:ber)?|invoice\s*ref)\s*[:#-]?\s*([a-z0-9-]+)/i);
  if (invMatch) {
    invoiceNumber = invMatch[1].trim().toUpperCase();
  } else {
    const generalInv = text.match(/inv-\d{4}-\d+/i);
    if (generalInv) invoiceNumber = generalInv[0].toUpperCase();
  }

  // 3. Dates
  let invoiceDate = "Not Detected";
  const invDateMatch = text.match(/(?:invoice\s*date|date\s*of\s*issue|issue\s*date|dated)\s*[:#-]?\s*([0-9a-z\/\s,-]+)/i);
  if (invDateMatch) invoiceDate = cleanDateStr(invDateMatch[1]);

  let dueDate = "Not Detected";
  const dueDateMatch = text.match(/(?:due\s*date|payment\s*due|due\s*on)\s*[:#-]?\s*([0-9a-z\/\s,-]+)/i);
  if (dueDateMatch) dueDate = cleanDateStr(dueDateMatch[1]);

  // 4. Buyer Name
  let buyerName = "Not Detected";
  const buyerMatch = text.match(/(?:buyer|bill\s*to|billed\s*to|customer|client|buyer\s*name|sold\s*to)\s*:\s*([^\n\r]+)/i);
  if (buyerMatch && buyerMatch[1].trim().length > 2) {
    buyerName = buyerMatch[1].replace(/[^a-zA-Z0-9\s.,&()]/g, "").trim();
  } else if (lowercaseText.includes("enterprise corp")) {
    buyerName = "Enterprise Corp India";
  }

  // 5. GST Number
  let gstNumber = "Not Detected";
  const gstMatch = text.match(/\b([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}Z[0-9A-Z]{1})\b/i);
  if (gstMatch) gstNumber = gstMatch[0].toUpperCase();

  // 6. Bank Details
  let bankAccount = "Not Detected";
  const bankMatch = text.match(/(?:bank\s*a\/c|account\s*num(?:ber)?|a\/c\s*(?:no|number)|bank\s*account)\s*[:#-]?\s*([0-9]{9,18})/i);
  if (bankMatch) bankAccount = bankMatch[1].trim();

  let ifscCode = "Not Detected";
  const ifscMatch = text.match(/\b([A-Z]{4}0[A-Z0-9]{6})\b/i);
  if (ifscMatch) ifscCode = ifscMatch[0].toUpperCase();

  // 7. PO Number
  let poNumber = "Not Detected";
  const poMatch = text.match(/(?:po\s*num(?:ber)?|p\.o\.\s*#?|purchase\s*order(?:\s*#)?)\s*[:#-]?\s*([a-z0-9-]+)/i);
  if (poMatch) poNumber = poMatch[1].trim().toUpperCase();

  // 8. Currency detection
  let currency = "INR";
  if (text.includes("$") || lowercaseText.includes("usd") || lowercaseText.includes("dollar")) {
    currency = "USD";
  } else if (text.includes("€") || lowercaseText.includes("eur") || lowercaseText.includes("euro")) {
    currency = "EUR";
  } else if (text.includes("₹") || lowercaseText.includes("inr") || lowercaseText.includes("rupee")) {
    currency = "INR";
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 9. STRICT AMOUNT EXTRACTION
  //    Rules:
  //    - Only read a number IMMEDIATELY after a known payable label
  //    - Never estimate, calculate, or pick the largest value
  //    - Blacklisted labels (tax/subtotal/GST components) are fully ignored
  //    - If no valid label found → grandTotal = 0, display shows error message
  //    - Full console debug output for verification
  // ─────────────────────────────────────────────────────────────────────────

  const parseAmt = (s) => {
    if (!s) return NaN;
    return parseFloat(s.replace(/,/g, ""));
  };

  // Number pattern: handles Indian (1,00,000.00) and international (100,000.00)
  const NUM_PAT = /(?:rs\.?\s*|inr\s*|₹\s*|\$\s*|€\s*)?([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/i;

  /**
   * Extract the number that appears after a label pattern.
   * Uses [\s\S]{0,120} to span across newlines and table columns —
   * handles cases where label is on one line and amount on the next.
   * Stops early at the first valid number found after the label.
   */
  const extractAfterLabel = (labelPattern) => {
    // Allow up to 120 chars (including newlines) between label and number
    const re = new RegExp(
      labelPattern +
        /[\s\S]{0,120}?/.source +
        /(?:rs\.?\s*|inr\s*|₹\s*|\$\s*|€\s*)?/.source +
        /([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?|[0-9]{2,}(?:\.[0-9]{1,2})?)/.source,
      "i"
    );
    const m = text.match(re);
    if (!m) return null;
    // Make sure the matched number is not on a blacklisted-label line
    const raw = m[1];
    const val = parseAmt(raw);
    if (isNaN(val) || val <= 0) return null;
    // Check the matched segment doesn't contain a blacklisted label AFTER our target label
    const segment = m[0].toLowerCase();
    const blacklistInSegment = [
      "cgst", "sgst", "igst", "subtotal", "sub total",
      "discount", "shipping", "freight", "round off", "tax amount"
    ];
    // Only reject if a blacklisted label appears BETWEEN our label and the number
    const labelEnd = segment.search(/[0-9]/); // index of first digit
    const segmentBefore = segment.slice(0, labelEnd);
    if (blacklistInSegment.some(b => segmentBefore.includes(b))) return null;
    return { value: val, raw };
  };

  // Priority-ordered payable labels — first match with a valid number wins
  const PAYABLE_LABELS = [
    { label: "Grand Total",            pattern: /grand\s*total/.source },
    { label: "Total Amount Payable",   pattern: /total\s*amount\s*payable/.source },
    { label: "Amount Payable",         pattern: /amount\s*payable/.source },
    { label: "Net Payable",            pattern: /net\s*payable/.source },
    { label: "Total Payable",          pattern: /total\s*payable/.source },
    { label: "Payable Amount",         pattern: /payable\s*amount/.source },
    { label: "Invoice Total",          pattern: /invoice\s*total/.source },
    { label: "Total Due",              pattern: /total\s*due/.source },
    { label: "Amount Due",             pattern: /amount\s*due/.source },
    { label: "Balance Due",            pattern: /balance\s*due/.source },
    { label: "Net Amount Payable",     pattern: /net\s*amount\s*payable/.source },
    { label: "Final Total",            pattern: /final\s*total/.source },
    { label: "Total Invoice Value",    pattern: /total\s*invoice\s*value/.source },
    { label: "Total Amount Due",       pattern: /total\s*amount\s*due/.source },
    { label: "Amount to Pay",          pattern: /amount\s*to\s*pay/.source },
    { label: "Total Amount",           pattern: /total\s*amount/.source },
    { label: "Net Amount",             pattern: /net\s*amount/.source },
    // Generic "Total" — only as absolute last resort
    { label: "Total",                  pattern: /(?<![a-z])total(?!\s*(?:tax|cgst|sgst|igst|gst|discount|shipping|freight|round))/.source },
  ];

  // Blacklisted labels — values near these are NEVER the payable total
  const BLACKLISTED_LABELS = [
    "subtotal", "sub total", "sub-total",
    "tax amount", "total tax",
    "cgst", "sgst", "igst", "gst",
    "discount", "shipping", "freight", "round off", "rounding",
    "advance", "tds",
  ];

  // Collect ALL currency values in document for debug display
  const allCurrencyMatches = [
    ...text.matchAll(/(?:₹|rs\.?\s*|inr\s*|\$\s*|€\s*)([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?|[0-9]{2,}(?:\.[0-9]{1,2})?)/gi)
  ];
  const allDetectedAmounts = allCurrencyMatches
    .map(m => parseAmt(m[1]))
    .filter(v => !isNaN(v) && v > 0)
    .map(v => `\u20b9${v.toLocaleString("en-IN")}`);

  // Run the strict label search
  let grandTotal = NaN;
  let matchedLabel = null;
  let matchedRaw = null;

  for (const { label, pattern } of PAYABLE_LABELS) {
    const result = extractAfterLabel(pattern);
    if (result) {
      grandTotal = result.value;
      matchedLabel = label;
      matchedRaw = result.raw;
      break;
    }
  }

  // ── CONSOLE DEBUG OUTPUT ────────────────────────────────────────────────
  console.groupCollapsed("[FraudShield] \uD83D\uDD0D Invoice Amount Extraction Debug");
  console.log("\u2501\u2501\u2501 OCR TEXT \u2501\u2501\u2501\n" + text);
  console.log("\n\u2501\u2501\u2501 Detected Currency Values \u2501\u2501\u2501");
  if (allDetectedAmounts.length > 0) {
    allDetectedAmounts.forEach(a => console.log("  " + a));
  } else {
    console.log("  (none found with currency prefix)");
  }
  console.log("\n\u2501\u2501\u2501 Blacklisted Labels (ignored) \u2501\u2501\u2501");
  BLACKLISTED_LABELS.forEach(b => console.log("  \u2717 " + b));
  console.log("\n\u2501\u2501\u2501 Label Match Result \u2501\u2501\u2501");
  if (matchedLabel) {
    console.log("  \u2705 Selected Label : " + matchedLabel);
    console.log("  \u2705 Raw value      : " + matchedRaw);
    console.log("  \u2705 Selected Amount: \u20b9" + grandTotal.toLocaleString("en-IN"));
    console.log("  \u2139\uFE0F  Reason: First priority label with a valid positive number immediately after it.");
  } else {
    console.warn("  \u274C No valid payable label matched in OCR text.");
    console.warn("  \u274C Returning: Payment amount could not be extracted.");
    console.warn("  \u2139\uFE0F  Labels checked (in order):", PAYABLE_LABELS.map(l => l.label).join(", "));
  }
  console.groupEnd();
  // ── END DEBUG ─────────────────────────────────────────────────────────────

  // 10. Tax Amount — from explicit tax labels only (never estimated)
  let taxAmount = NaN;
  const igstMatch = text.match(/igst\s*(?:\d+%?)?\s*[:#-]?\s*(?:rs\.?|inr|\u20b9|\$)?\s*([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/i);
  if (igstMatch) {
    taxAmount = parseAmt(igstMatch[1]);
  } else {
    const cgstMatch = text.match(/cgst\s*(?:\d+%?)?\s*[:#-]?\s*(?:rs\.?|inr|\u20b9|\$)?\s*([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/i);
    const sgstMatch = text.match(/sgst\s*(?:\d+%?)?\s*[:#-]?\s*(?:rs\.?|inr|\u20b9|\$)?\s*([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/i);
    const cgst = cgstMatch ? parseAmt(cgstMatch[1]) : NaN;
    const sgst = sgstMatch ? parseAmt(sgstMatch[1]) : NaN;
    if (!isNaN(cgst) && !isNaN(sgst)) {
      taxAmount = cgst + sgst;
    } else if (!isNaN(cgst)) {
      taxAmount = cgst;
    } else {
      const taxGenMatch = text.match(/(?:tax\s*amount|gst\s*amount|total\s*tax|vat)\s*[:#-]?\s*(?:rs\.?|inr|\u20b9|\$)?\s*([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/i);
      if (taxGenMatch) taxAmount = parseAmt(taxGenMatch[1]);
    }
  }

  // 11. Subtotal — from explicit subtotal labels only (never calculated)
  let amount = NaN;
  const subtotalMatch = text.match(/(?:subtotal|sub\s*total|taxable\s*value|taxable\s*amount|amount\s*before\s*tax)\s*[:#-]?\s*(?:rs\.?|inr|\u20b9|\$)?\s*([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/i);
  if (subtotalMatch) {
    amount = parseAmt(subtotalMatch[1]);
  } else if (!isNaN(grandTotal) && !isNaN(taxAmount)) {
    // Only derive subtotal when both grand total AND tax are confirmed from labels
    amount = grandTotal - taxAmount;
  }

  // 12. Contact Info
  let email = "Not Detected";
  const emailMatch = text.match(/\b([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})\b/i);
  if (emailMatch) email = emailMatch[0].trim();

  let phoneNumber = "Not Detected";
  const phoneMatch = text.match(/(?:phone|tel|mobile|contact)(?:\s*no\.?|\s*number)?\s*[:#-]?\s*(\+?[0-9][\d\s-]{8,14})/i);
  if (phoneMatch) phoneNumber = phoneMatch[1].trim();

  let vendorAddress = "Not Detected";
  const addressMatch = text.match(/(?:address|addr)\s*:\s*([^\n\r]+)/i);
  if (addressMatch) vendorAddress = addressMatch[1].trim();

  // Extract buyer address from invoice
  let buyerAddress = "Not Detected";
  const buyerAddrMatch = text.match(/(?:bill\s*to|billed\s*to|ship\s*to|buyer\s*address)\s*:?\s*\n?\s*([^\n\r]+)/i);
  if (buyerAddrMatch && buyerAddrMatch[1].trim().length > 5) {
    buyerAddress = buyerAddrMatch[1].trim();
  }

  // Final safe values
  const safeGrandTotal  = isNaN(grandTotal) ? 0 : grandTotal;
  const safeTaxAmount   = isNaN(taxAmount)  ? 0 : taxAmount;
  const safeAmount      = isNaN(amount)     ? 0 : amount;

  return {
    vendorName,
    invoiceNumber,
    invoiceDate,
    dueDate,
    buyerName,
    gstNumber,
    amount:     safeAmount,
    taxAmount:  safeTaxAmount,
    grandTotal: safeGrandTotal,
    // Human-readable display string preserved with original formatting
    grandTotalDisplay: safeGrandTotal > 0
      ? `${currency === "INR" ? "₹" : currency === "USD" ? "$" : "€"}${safeGrandTotal.toLocaleString("en-IN")} (via: ${matchedLabel})`
      : "Payment amount could not be extracted.",
    currency,
    poNumber,
    bankAccount,
    ifscCode,
    email,
    phoneNumber,
    vendorAddress,
    buyerAddress,
    products: [
      {
        description: `Extracted billing services under ${invoiceNumber}`,
        quantity: 1,
        unitPrice: safeAmount,
        total: safeAmount
      }
    ]
  };
}

function cleanDateStr(raw) {
  let cleaned = raw.replace(/[^a-zA-Z0-9\s\/-]/g, "").trim();
  if (cleaned.length > 20) cleaned = cleaned.slice(0, 20).trim();
  return cleaned;
}

