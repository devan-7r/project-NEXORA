// Export Helper for FraudShield AI

/**
 * Downloads a text file with specified content and MIME type
 */
const downloadFile = (content, filename, contentType) => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Exports detailed single invoice validation reports as PDF (using Print CSS mockup)
 */
export const exportInvoiceToPDF = (invoice) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to export PDF.");
    return;
  }

  const itemsHTML = invoice.products
    .map(
      (p) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${p.description}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${p.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${p.unitPrice.toLocaleString()}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${p.total.toLocaleString()}</td>
    </tr>
  `
    )
    .join("");

  const historyHTML = invoice.history
    .map(
      (h) => `
    <div style="margin-bottom: 8px; font-size: 13px;">
      <span style="color: #666;">[${new Date(h.timestamp).toLocaleString()}]</span>
      <strong>${h.action}</strong> by <em>${h.user}</em>
    </div>
  `
    )
    .join("");

  const recommendationsHTML = invoice.aiRecommendations
    .map((r) => `<li style="margin-bottom: 5px;">${r}</li>`)
    .join("");

  printWindow.document.write(`
    <html>
      <head>
        <title>FraudShield AI Report - ${invoice.invoiceNumber}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; padding: 30px; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f1219; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #0f1219; }
          .badge { padding: 6px 12px; border-radius: 20px; font-weight: bold; font-size: 14px; text-transform: uppercase; display: inline-block; }
          .badge-safe { background-color: #d1fae5; color: #065f46; }
          .badge-review { background-color: #fef3c7; color: #92400e; }
          .badge-high { background-color: #fee2e2; color: #991b1b; }
          .section { margin-bottom: 30px; }
          .section-title { font-size: 16px; font-weight: bold; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; margin-bottom: 15px; text-transform: uppercase; color: #4b5563; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { text-align: left; background-color: #f3f4f6; padding: 10px; font-weight: bold; border-bottom: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">FraudShield AI Verification Report</div>
            <div style="font-size: 12px; color: #666; margin-top: 5px;">Generated on: ${new Date().toLocaleString()}</div>
          </div>
          <div>
            <span class="badge ${
              invoice.riskLevel === "SAFE"
                ? "badge-safe"
                : invoice.riskLevel === "REVIEW"
                ? "badge-review"
                : "badge-high"
            }">
              ${invoice.riskLevel} (Score: ${invoice.fraudScore}%)
            </span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Validation Overview</div>
          <p><strong>AI Confidence Level:</strong> ${invoice.aiConfidence}% (${invoice.confidenceStatus})</p>
          <p><strong>Risk Explanation:</strong> ${invoice.aiExplanation}</p>
        </div>

        <div class="section">
          <div class="section-title">Required AI Recommendations</div>
          <ul>${recommendationsHTML}</ul>
        </div>

        <div class="section grid">
          <div>
            <div class="section-title">Vendor Details</div>
            <p><strong>Name:</strong> ${invoice.vendorName} (${invoice.vendorId})</p>
            <p><strong>GST Number:</strong> ${invoice.gstNumber}</p>
            <p><strong>PAN Number:</strong> ${invoice.panNumber}</p>
            <p><strong>Email / Phone:</strong> ${invoice.email} / ${invoice.phoneNumber}</p>
            <p><strong>Bank Details:</strong> A/C: ${invoice.bankAccount} (IFSC: ${invoice.ifscCode})</p>
          </div>
          <div>
            <div class="section-title">Invoice Details</div>
            <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
            <p><strong>PO Reference:</strong> ${invoice.poNumber}</p>
            <p><strong>Invoice Date / Due Date:</strong> ${invoice.invoiceDate} / ${invoice.dueDate}</p>
            <p><strong>Subtotal Amount:</strong> ₹${invoice.amount.toLocaleString()}</p>
            <p><strong>Tax Amount (GST):</strong> ₹${invoice.taxAmount.toLocaleString()}</p>
            <p><strong>Grand Total:</strong> ₹${invoice.grandTotal.toLocaleString()}</p>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Extracted Products/Services</div>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: right;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>
        </div>

        <div class="section">
          <div class="section-title">Verification Audit Logs</div>
          <div>${historyHTML}</div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

/**
 * Exports invoices list as CSV
 */
export const exportToCSV = (invoices) => {
  const headers = ["Invoice Number", "Vendor Name", "Invoice Date", "Subtotal", "GST", "Grand Total", "Status", "Fraud Score", "Risk Level"];
  const rows = invoices.map((inv) => [
    inv.invoiceNumber,
    `"${inv.vendorName}"`,
    inv.invoiceDate,
    inv.amount,
    inv.taxAmount,
    inv.grandTotal,
    inv.status,
    inv.fraudScore,
    inv.riskLevel
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  downloadFile(csvContent, `fraudshield_invoices_${Date.now()}.csv`, "text/csv;charset=utf-8;");
};

/**
 * Exports invoices list as JSON
 */
export const exportToJSON = (invoices) => {
  const jsonContent = JSON.stringify(invoices, null, 2);
  downloadFile(jsonContent, `fraudshield_invoices_${Date.now()}.json`, "application/json;charset=utf-8;");
};

/**
 * Mock download of Excel file (uses CSV formatted with tab separators for compatibility)
 */
export const exportToExcel = (invoices) => {
  const headers = ["Invoice Number\tVendor Name\tInvoice Date\tSubtotal\tGST\tGrand Total\tStatus\tFraud Score\tRisk Level"];
  const rows = invoices.map((inv) => 
    `${inv.invoiceNumber}\t${inv.vendorName}\t${inv.invoiceDate}\t${inv.amount}\t${inv.taxAmount}\t${inv.grandTotal}\t${inv.status}\t${inv.fraudScore}\t${inv.riskLevel}`
  );
  
  const excelContent = [headers, ...rows].join("\n");
  downloadFile(excelContent, `fraudshield_invoices_${Date.now()}.xls`, "application/vnd.ms-excel;charset=utf-8;");
};
