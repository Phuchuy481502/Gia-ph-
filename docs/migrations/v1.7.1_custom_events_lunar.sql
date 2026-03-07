-- Migration: Add lunar_month and lunar_day to custom_events
-- Version: v1.7.1
-- Apply this in your Supabase SQL Editor

-- Add lunar date columns
ALTER TABLE public.custom_events
  ADD COLUMN IF NOT EXISTS lunar_month SMALLINT CHECK (lunar_month BETWEEN 1 AND 12),
  ADD COLUMN IF NOT EXISTS lunar_day SMALLINT CHECK (lunar_day BETWEEN 1 AND 30);

-- Make event_date optional (for lunar-only recurring events)
ALTER TABLE public.custom_events
  ALTER COLUMN event_date DROP NOT NULL;
