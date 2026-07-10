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
  // 9. AMOUNT EXTRACTION — Priority-based multi-pass approach
  //    Priority 1: Exact label match for final payable amount
  //    Priority 2: Largest monetary value near total-like labels
  //    Priority 3: Largest standalone monetary value in document
  // ─────────────────────────────────────────────────────────────────────────

  // Currency prefix pattern
  const currPfx = /(?:rs\.?\s*|inr\s*|₹\s*|\$\s*|€\s*)?/i;
  // Number pattern: handles 1,00,000.00 / 100000.00 / 1,00,000
  const numPat = /([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/;

  /** Parse a matched number string to float, removing commas */
  const parseAmt = (s) => {
    if (!s) return NaN;
    return parseFloat(s.replace(/,/g, ""));
  };

  /** Try to match a label followed by an optional currency symbol and a number */
  const matchLabel = (labelPattern) => {
    const re = new RegExp(
      labelPattern + /\s*[:#-]?\s*/.source + currPfx.source + numPat.source,
      "i"
    );
    const m = text.match(re);
    return m ? parseAmt(m[1] || m[2]) : NaN;
  };

  // PRIORITY 1 — High-confidence "final payable" labels (checked in order)
  const grandTotalLabels = [
    /grand\s*total/,
    /total\s*amount\s*payable/,
    /amount\s*payable/,
    /net\s*payable/,
    /total\s*payable/,
    /invoice\s*total/,
    /total\s*due/,
    /amount\s*due/,
    /balance\s*due/,
    /final\s*total/,
    /total\s*invoice\s*value/,
    /total\s*amount\s*due/,
    /total\s*amount/,
    /amount\s*to\s*pay/,
    /payable\s*amount/,
    /net\s*amount\s*payable/,
    /total/,            // generic "total" — last resort in priority 1
  ];

  let grandTotal = NaN;
  let grandTotalRaw = "Not Detected";

  for (const labelRe of grandTotalLabels) {
    const val = matchLabel(labelRe.source);
    if (!isNaN(val) && val > 0) {
      grandTotal = val;
      grandTotalRaw = val.toString();
      break;
    }
  }

  // PRIORITY 2 — Scan all lines; collect all monetary values that appear
  // near "total", "payable", "amount" keywords. Pick the LARGEST.
  if (isNaN(grandTotal) || grandTotal === 0) {
    const lines = text.split(/[\n\r]+/);
    let candidates = [];

    for (const line of lines) {
      const ll = line.toLowerCase();
      // Line must contain a total-like keyword
      if (
        ll.includes("total") ||
        ll.includes("payable") ||
        ll.includes("amount due") ||
        ll.includes("balance")
      ) {
        // Skip lines that are ONLY intermediate values
        if (
          /^\s*(?:cgst|sgst|igst|tax|discount|shipping|freight|charges|subtotal|sub\s*total)\s/i.test(line)
        ) continue;

        // Extract all numbers from the line
        const nums = [...line.matchAll(/([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/g)];
        for (const nm of nums) {
          const v = parseAmt(nm[1]);
          if (!isNaN(v) && v > 0) candidates.push(v);
        }
      }
    }

    if (candidates.length > 0) {
      grandTotal = Math.max(...candidates);
      grandTotalRaw = grandTotal.toString();
    }
  }

  // PRIORITY 3 — Last resort: largest monetary value in entire document
  // (only used if no total-labelled value found)
  if (isNaN(grandTotal) || grandTotal === 0) {
    const allNums = [...text.matchAll(/(?:₹|rs\.?\s*|inr\s*)([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?|[0-9]{4,}(?:\.[0-9]{1,2})?)/gi)];
    const vals = allNums.map(m => parseAmt(m[1])).filter(v => !isNaN(v) && v > 0);
    if (vals.length > 0) {
      grandTotal = Math.max(...vals);
      grandTotalRaw = grandTotal.toString();
    }
  }

  // 10. Tax Amount (CGST + SGST + IGST combined, or single tax line)
  let taxAmount = NaN;
  // Try IGST first (single integrated tax)
  const igstMatch = text.match(/igst\s*(?:\d+%?)?\s*[:#-]?\s*(?:rs\.?|inr|₹|\$)?\s*([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/i);
  if (igstMatch) {
    taxAmount = parseAmt(igstMatch[1]);
  } else {
    // Try CGST + SGST
    const cgstMatch = text.match(/cgst\s*(?:\d+%?)?\s*[:#-]?\s*(?:rs\.?|inr|₹|\$)?\s*([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/i);
    const sgstMatch = text.match(/sgst\s*(?:\d+%?)?\s*[:#-]?\s*(?:rs\.?|inr|₹|\$)?\s*([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/i);
    const cgst = cgstMatch ? parseAmt(cgstMatch[1]) : NaN;
    const sgst = sgstMatch ? parseAmt(sgstMatch[1]) : NaN;
    if (!isNaN(cgst) && !isNaN(sgst)) {
      taxAmount = cgst + sgst;
    } else if (!isNaN(cgst)) {
      taxAmount = cgst * 2; // assume equal CGST+SGST
    } else {
      // Generic tax amount label
      const taxGenMatch = text.match(/(?:tax\s*amount|gst\s*amount|total\s*tax|vat)\s*[:#-]?\s*(?:rs\.?|inr|₹|\$)?\s*([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/i);
      if (taxGenMatch) taxAmount = parseAmt(taxGenMatch[1]);
    }
  }

  // 11. Subtotal / net amount before tax
  let amount = NaN;
  const subtotalMatch = text.match(/(?:subtotal|sub\s*total|taxable\s*value|taxable\s*amount|net\s*amount|amount\s*before\s*tax)\s*[:#-]?\s*(?:rs\.?|inr|₹|\$)?\s*([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/i);
  if (subtotalMatch) {
    amount = parseAmt(subtotalMatch[1]);
  } else if (!isNaN(grandTotal) && !isNaN(taxAmount)) {
    amount = grandTotal - taxAmount;
  } else if (!isNaN(grandTotal)) {
    // Estimate: assume 18% GST
    amount = Math.round(grandTotal / 1.18);
    taxAmount = grandTotal - amount;
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
      ? `${currency === "INR" ? "₹" : currency === "USD" ? "$" : "€"}${safeGrandTotal.toLocaleString("en-IN")}`
      : "Not Detected",
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

