-- ============================================================
-- PRE-OWNED CAR INSPECTION PLATFORM
-- Migration 00003: Database Functions & Triggers
-- ============================================================

-- Auto-generate booking number: BK-YYYYMMDD-XXXX
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS TRIGGER AS $$
DECLARE
  seq INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO seq
  FROM public.bookings
  WHERE DATE(created_at) = CURRENT_DATE;
  NEW.booking_number := 'BK-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(seq::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_booking_number
  BEFORE INSERT ON public.bookings
  FOR EACH ROW
  WHEN (NEW.booking_number IS NULL)
  EXECUTE FUNCTION generate_booking_number();

-- Auto-generate invoice number: INV-YYYYMMDD-XXXX
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
  seq INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO seq
  FROM public.invoices
  WHERE DATE(created_at) = CURRENT_DATE;
  NEW.invoice_number := 'INV-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(seq::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_invoice_number
  BEFORE INSERT ON public.invoices
  FOR EACH ROW
  WHEN (NEW.invoice_number IS NULL)
  EXECUTE FUNCTION generate_invoice_number();

-- Auto-generate report number: RPT-YYYYMMDD-XXXX
CREATE OR REPLACE FUNCTION generate_report_number()
RETURNS TRIGGER AS $$
DECLARE
  seq INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO seq
  FROM public.reports
  WHERE DATE(created_at) = CURRENT_DATE;
  NEW.report_number := 'RPT-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(seq::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_report_number
  BEFORE INSERT ON public.reports
  FOR EACH ROW
  WHEN (NEW.report_number IS NULL)
  EXECUTE FUNCTION generate_report_number();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Auto-generate referral code on customer profile creation
CREATE OR REPLACE FUNCTION handle_new_customer_referral()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'customer' THEN
    INSERT INTO public.referrals (referrer_id, referral_code)
    VALUES (
      NEW.id,
      'REF-' || UPPER(SUBSTRING(replace(gen_random_uuid()::text, '-', '') FROM 1 FOR 8))
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created_referral
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_customer_referral();

-- Auto-update updated_at on modify
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN
    SELECT unnest(ARRAY[
      'profiles', 'inspector_profiles', 'vehicles', 'pricing_plans',
      'bookings', 'inspection_templates', 'inspections', 'reports',
      'invoices', 'coupons', 'reviews', 'blog_posts'
    ])
  LOOP
    EXECUTE format('
      CREATE TRIGGER trg_updated_at_%s
        BEFORE UPDATE ON public.%I
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at();
    ', t, t);
  END LOOP;
END;
$$;

-- Update inspector rating on review insert/update
CREATE OR REPLACE FUNCTION update_inspector_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.inspector_profiles
  SET
    rating_avg = (
      SELECT COALESCE(AVG(rating), 0) FROM public.reviews
      WHERE inspector_id = NEW.inspector_id AND is_published = TRUE
    ),
    rating_count = (
      SELECT COUNT(*) FROM public.reviews
      WHERE inspector_id = NEW.inspector_id AND is_published = TRUE
    )
  WHERE id = NEW.inspector_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_update_inspector_rating
  AFTER INSERT OR UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_inspector_rating();

-- Increment referral stats (runs as security definer to bypass RLS for customers)
CREATE OR REPLACE FUNCTION increment_referral_stats(ref_id UUID, reward_val NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE public.referrals
  SET
    total_referrals = total_referrals + 1,
    total_earned = total_earned + reward_val
  WHERE id = ref_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
