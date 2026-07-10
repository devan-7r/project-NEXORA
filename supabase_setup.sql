-- ============================================================
-- FraudShield AI — Supabase Setup Script
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Create the invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_number     TEXT,
  vendor_name        TEXT,
  vendor_id          TEXT,
  invoice_date       TEXT,
  due_date           TEXT,
  amount             NUMERIC DEFAULT 0,
  tax_amount         NUMERIC DEFAULT 0,
  grand_total        NUMERIC DEFAULT 0,
  currency           TEXT DEFAULT 'INR',
  gst_number         TEXT,
  pan_number         TEXT,
  bank_account       TEXT,
  ifsc_code          TEXT,
  buyer_name         TEXT,
  buyer_address      TEXT,
  vendor_address     TEXT,
  email              TEXT,
  phone_number       TEXT,
  po_number          TEXT,
  status             TEXT DEFAULT 'Pending',
  fraud_score        NUMERIC DEFAULT 0,
  risk_level         TEXT,
  ai_confidence      NUMERIC,
  fraud_type         TEXT,
  ai_explanation     TEXT,
  badge_text         TEXT,
  badge_color        TEXT,
  products           JSONB DEFAULT '[]',
  ai_recommendations JSONB DEFAULT '[]',
  ocr_mismatch       BOOLEAN DEFAULT false,
  image_tampering    BOOLEAN DEFAULT false,
  metadata_tampered  BOOLEAN DEFAULT false,
  different_fonts    BOOLEAN DEFAULT false,
  has_signature      BOOLEAN DEFAULT true,
  has_stamp          BOOLEAN DEFAULT true,
  uploaded_at        TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies — users can only see/insert/update/delete their OWN records
CREATE POLICY "Users can insert their own invoices"
  ON public.invoices FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select their own invoices"
  ON public.invoices FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoices"
  ON public.invoices FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoices"
  ON public.invoices FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 4. Index for fast user-specific queries
CREATE INDEX IF NOT EXISTS invoices_user_id_idx ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS invoices_uploaded_at_idx ON public.invoices(uploaded_at DESC);
