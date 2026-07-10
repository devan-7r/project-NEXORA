/**
 * supabaseClient.js
 * 
 * Supabase client initialization. Uses VITE_ prefixed env vars (required by Vite).
 * Never import or use the Service Role Key here — only the anon/public key.
 * 
 * Required Vercel / .env.local variables:
 *   VITE_SUPABASE_URL      = https://<project-ref>.supabase.co
 *   VITE_SUPABASE_ANON_KEY = eyJ...  (anon / public key ONLY)
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug: log configuration status (never logs the actual key value)
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "[FraudShield] ⚠️  Supabase env vars missing.\n" +
    "  VITE_SUPABASE_URL     : " + (supabaseUrl ? "✅ set" : "❌ missing") + "\n" +
    "  VITE_SUPABASE_ANON_KEY: " + (supabaseAnonKey ? "✅ set" : "❌ missing") + "\n" +
    "  Add them to your .env.local file and Vercel project settings."
  );
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Get the currently authenticated Supabase user.
 * Returns null if no session or Supabase is not configured.
 */
export async function getCurrentUser() {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.warn("[FraudShield] getUser() error:", error.message);
    return null;
  }
  return data?.user ?? null;
}

/**
 * Save an analyzed invoice to the `invoices` Supabase table.
 * 
 * @param {object} invoiceData  - The analyzed invoice object from detectFraud()
 * @param {string|null} userId  - The authenticated user's UUID (from supabase.auth.getUser())
 * @returns {{ success: boolean, error: string|null }}
 */
export async function saveInvoiceToSupabase(invoiceData, userId) {
  // 1. Guard: Supabase not configured
  if (!supabase) {
    const msg = "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local and Vercel settings.";
    console.error("[FraudShield] Save failed:", msg);
    return { success: false, error: msg };
  }

  // 2. Guard: user_id must be present for RLS to work
  if (!userId) {
    const msg = "user_id is null — user must be authenticated via Supabase Auth to save invoices. Sign in with supabase.auth.signIn().";
    console.error("[FraudShield] Save failed:", msg);
    return { success: false, error: msg };
  }

  // 3. Build the record — map only columns that exist in the DB schema
  const record = {
    user_id:           userId,
    invoice_number:    invoiceData.invoiceNumber    ?? null,
    vendor_name:       invoiceData.vendorName        ?? null,
    vendor_id:         invoiceData.vendorId          ?? null,
    invoice_date:      invoiceData.invoiceDate       ?? null,
    due_date:          invoiceData.dueDate           ?? null,
    amount:            typeof invoiceData.amount === "number" ? invoiceData.amount : parseFloat(invoiceData.amount) || 0,
    tax_amount:        typeof invoiceData.taxAmount === "number" ? invoiceData.taxAmount : parseFloat(invoiceData.taxAmount) || 0,
    grand_total:       typeof invoiceData.grandTotal === "number" ? invoiceData.grandTotal : parseFloat(invoiceData.grandTotal) || 0,
    currency:          invoiceData.currency          ?? "INR",
    gst_number:        invoiceData.gstNumber         ?? null,
    pan_number:        invoiceData.panNumber         ?? null,
    bank_account:      invoiceData.bankAccount       ?? null,
    ifsc_code:         invoiceData.ifscCode          ?? null,
    buyer_name:        invoiceData.buyerName         ?? null,
    buyer_address:     invoiceData.buyerAddress      ?? null,
    vendor_address:    invoiceData.vendorAddress     ?? null,
    email:             invoiceData.email             ?? null,
    phone_number:      invoiceData.phoneNumber       ?? null,
    po_number:         invoiceData.poNumber          ?? null,
    status:            invoiceData.status            ?? "Pending",
    fraud_score:       invoiceData.fraudScore        ?? 0,
    risk_level:        invoiceData.riskLevel         ?? null,
    ai_confidence:     invoiceData.aiConfidence      ?? null,
    fraud_type:        invoiceData.fraudType         ?? null,
    ai_explanation:    invoiceData.aiExplanation     ?? null,
    badge_text:        invoiceData.badgeText         ?? null,
    badge_color:       invoiceData.badgeColor        ?? null,
    products:          JSON.stringify(invoiceData.products ?? []),
    ai_recommendations: JSON.stringify(invoiceData.aiRecommendations ?? []),
    ocr_mismatch:      invoiceData.ocrMismatch       ?? false,
    image_tampering:   invoiceData.imageTampering    ?? false,
    metadata_tampered: invoiceData.metadataTampered  ?? false,
    different_fonts:   invoiceData.differentFonts    ?? false,
    has_signature:     invoiceData.hasSignature      ?? true,
    has_stamp:         invoiceData.hasStamp          ?? true,
    uploaded_at:       new Date().toISOString(),
  };

  console.log("[FraudShield] Saving invoice to Supabase:", record.invoice_number, "for user:", userId);

  // 4. Perform the insert
  const { data, error } = await supabase
    .from("invoices")
    .insert([record])
    .select();

  if (error) {
    console.error("[FraudShield] ❌ Supabase insert error:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });

    // Format a detailed, actionable error message
    let userMsg = error.message;
    const lowerMsg = (error.message || "").toLowerCase();

    if (error.code === "42501" || lowerMsg.includes("row-level security") || lowerMsg.includes("permission denied")) {
      userMsg = `RLS Policy blocked insert (code 42501): ${error.message}. Fix: Add INSERT policy on 'invoices' table → "auth.uid() = user_id".`;
    } else if (lowerMsg.includes("null value") || lowerMsg.includes("violates not-null")) {
      userMsg = `Required column is NULL: ${error.message}. Check that all required fields are present.`;
    } else if (error.code === "42703") {
      userMsg = `Column does not exist (code 42703): ${error.message}. The insert contains a column not in your Supabase table.`;
    } else if (lowerMsg.includes("jwt") || error.code === "PGRST301") {
      userMsg = `Invalid JWT / not authenticated: ${error.message}. Ensure user is logged in via Supabase Auth.`;
    } else if (error.code === "23505") {
      userMsg = `Duplicate key (code 23505): ${error.message}. An invoice with this number may already exist for this user.`;
    }

    return { success: false, error: userMsg };
  }

  console.log("[FraudShield] ✅ Invoice saved successfully:", data);
  return { success: true, error: null };
}
