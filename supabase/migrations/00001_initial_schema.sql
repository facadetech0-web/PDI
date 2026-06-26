-- ============================================================
-- PRE-OWNED CAR INSPECTION PLATFORM
-- Migration 00001: Initial Schema
-- ============================================================

-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE user_role AS ENUM ('customer', 'inspector', 'admin');
CREATE TYPE booking_status AS ENUM (
  'pending', 'confirmed', 'assigned', 'in_progress',
  'completed', 'cancelled', 'refunded'
);
CREATE TYPE inspection_status AS ENUM (
  'not_started', 'in_progress', 'draft', 'submitted',
  'reviewed', 'approved', 'rejected'
);
CREATE TYPE payment_status AS ENUM (
  'pending', 'paid', 'failed', 'refunded', 'waived'
);
CREATE TYPE notification_type AS ENUM (
  'booking_created', 'booking_confirmed', 'booking_assigned',
  'inspection_started', 'inspection_completed', 'report_ready',
  'invoice_generated', 'payment_received', 'review_received',
  'coupon_applied', 'referral_earned', 'system_broadcast'
);
CREATE TYPE blog_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE checklist_item_condition AS ENUM (
  'excellent', 'good', 'fair', 'poor', 'critical', 'not_applicable'
);
CREATE TYPE coupon_type AS ENUM ('percentage', 'fixed');
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role          user_role NOT NULL DEFAULT 'customer',
  full_name     TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT,
  avatar_url    TEXT,
  address       JSONB DEFAULT '{}',
  is_active     BOOLEAN DEFAULT TRUE,
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INSPECTOR PROFILES
-- ============================================================
CREATE TABLE public.inspector_profiles (
  id              UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  license_number  TEXT,
  certifications  JSONB DEFAULT '[]',
  service_areas   TEXT[] DEFAULT '{}',
  specializations TEXT[] DEFAULT '{}',
  availability    JSONB DEFAULT '{}',
  max_daily_jobs  INTEGER DEFAULT 5,
  rating_avg      NUMERIC(3,2) DEFAULT 0,
  rating_count    INTEGER DEFAULT 0,
  is_available    BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- VEHICLES
-- ============================================================
CREATE TABLE public.vehicles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  make            TEXT NOT NULL,
  model           TEXT NOT NULL,
  year            INTEGER NOT NULL CHECK (year >= 1900 AND year <= 2100),
  vin             TEXT UNIQUE,
  license_plate   TEXT,
  color           TEXT,
  mileage         INTEGER,
  fuel_type       TEXT,
  transmission    TEXT,
  body_type       TEXT,
  engine_size     TEXT,
  photos          TEXT[] DEFAULT '{}',
  metadata        JSONB DEFAULT '{}',
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PRICING PLANS
-- ============================================================
CREATE TABLE public.pricing_plans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT,
  price           NUMERIC(10,2) NOT NULL,
  currency        TEXT DEFAULT 'INR',
  features        JSONB DEFAULT '[]',
  inspection_type TEXT NOT NULL,
  is_active       BOOLEAN DEFAULT TRUE,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BOOKINGS
-- ============================================================
CREATE TABLE public.bookings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number    TEXT NOT NULL UNIQUE,
  customer_id       UUID NOT NULL REFERENCES public.profiles(id),
  vehicle_id        UUID NOT NULL REFERENCES public.vehicles(id),
  pricing_plan_id   UUID REFERENCES public.pricing_plans(id),
  inspector_id      UUID REFERENCES public.profiles(id),
  status            booking_status DEFAULT 'pending',
  scheduled_date    DATE NOT NULL,
  scheduled_time    TIME NOT NULL,
  location_address  TEXT NOT NULL,
  location_lat      NUMERIC(10,7),
  location_lng      NUMERIC(10,7),
  notes             TEXT,
  subtotal          NUMERIC(10,2),
  discount_amount   NUMERIC(10,2) DEFAULT 0,
  tax_amount        NUMERIC(10,2) DEFAULT 0,
  total_amount      NUMERIC(10,2),
  coupon_id         UUID,
  referral_code     TEXT,
  payment_status    payment_status DEFAULT 'pending',
  cancelled_reason  TEXT,
  cancelled_at      TIMESTAMPTZ,
  confirmed_at      TIMESTAMPTZ,
  assigned_at       TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INSPECTION TEMPLATES
-- ============================================================
CREATE TABLE public.inspection_templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  description     TEXT,
  version         INTEGER DEFAULT 1,
  inspection_type TEXT NOT NULL,
  categories      JSONB NOT NULL,
  is_active       BOOLEAN DEFAULT TRUE,
  created_by      UUID REFERENCES public.profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INSPECTIONS
-- ============================================================
CREATE TABLE public.inspections (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id          UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  inspector_id        UUID NOT NULL REFERENCES public.profiles(id),
  template_id         UUID REFERENCES public.inspection_templates(id),
  status              inspection_status DEFAULT 'not_started',
  started_at          TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ,
  submitted_at        TIMESTAMPTZ,
  start_location      JSONB,
  end_location        JSONB,
  checklist_data      JSONB DEFAULT '{}',
  overall_score       NUMERIC(5,2),
  category_scores     JSONB DEFAULT '{}',
  summary             TEXT,
  recommendations     TEXT[] DEFAULT '{}',
  critical_issues     JSONB DEFAULT '[]',
  inspector_signature TEXT,
  customer_signature  TEXT,
  voice_notes         TEXT[] DEFAULT '{}',
  draft_data          JSONB,
  draft_saved_at      TIMESTAMPTZ,
  is_draft            BOOLEAN DEFAULT FALSE,
  metadata            JSONB DEFAULT '{}',
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INSPECTION MEDIA
-- ============================================================
CREATE TABLE public.inspection_media (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id   UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
  category        TEXT NOT NULL,
  item            TEXT,
  file_url        TEXT NOT NULL,
  file_type       TEXT NOT NULL,
  file_size       INTEGER,
  caption         TEXT,
  sort_order      INTEGER DEFAULT 0,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- REPORTS
-- ============================================================
CREATE TABLE public.reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id   UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
  booking_id      UUID NOT NULL REFERENCES public.bookings(id),
  report_number   TEXT NOT NULL UNIQUE,
  share_token     TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  pdf_url         TEXT,
  overall_score   NUMERIC(5,2),
  summary         TEXT,
  is_published    BOOLEAN DEFAULT FALSE,
  published_at    TIMESTAMPTZ,
  qr_code_data    TEXT,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INVOICES
-- ============================================================
CREATE TABLE public.invoices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number  TEXT NOT NULL UNIQUE,
  booking_id      UUID NOT NULL REFERENCES public.bookings(id),
  customer_id     UUID NOT NULL REFERENCES public.profiles(id),
  status          invoice_status DEFAULT 'draft',
  subtotal        NUMERIC(10,2) NOT NULL,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  tax_rate        NUMERIC(5,2) DEFAULT 18.00,
  tax_amount      NUMERIC(10,2) DEFAULT 0,
  total_amount    NUMERIC(10,2) NOT NULL,
  currency        TEXT DEFAULT 'INR',
  line_items      JSONB NOT NULL,
  pdf_url         TEXT,
  paid_at         TIMESTAMPTZ,
  due_date        DATE,
  notes           TEXT,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- COUPONS
-- ============================================================
CREATE TABLE public.coupons (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            TEXT NOT NULL UNIQUE,
  description     TEXT,
  coupon_type     coupon_type NOT NULL,
  value           NUMERIC(10,2) NOT NULL,
  min_order       NUMERIC(10,2) DEFAULT 0,
  max_discount    NUMERIC(10,2),
  usage_limit     INTEGER,
  usage_count     INTEGER DEFAULT 0,
  per_user_limit  INTEGER DEFAULT 1,
  valid_from      TIMESTAMPTZ NOT NULL,
  valid_until     TIMESTAMPTZ NOT NULL,
  is_active       BOOLEAN DEFAULT TRUE,
  applicable_plans TEXT[] DEFAULT '{}',
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- REFERRALS
-- ============================================================
CREATE TABLE public.referrals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id     UUID NOT NULL REFERENCES public.profiles(id),
  referral_code   TEXT NOT NULL UNIQUE,
  reward_amount   NUMERIC(10,2) DEFAULT 0,
  total_referrals INTEGER DEFAULT 0,
  total_earned    NUMERIC(10,2) DEFAULT 0,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.referral_uses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id     UUID NOT NULL REFERENCES public.referrals(id),
  referred_id     UUID NOT NULL REFERENCES public.profiles(id),
  booking_id      UUID REFERENCES public.bookings(id),
  reward_earned   NUMERIC(10,2) DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(referral_id, referred_id)
);

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE public.reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      UUID NOT NULL REFERENCES public.bookings(id),
  customer_id     UUID NOT NULL REFERENCES public.profiles(id),
  inspector_id    UUID NOT NULL REFERENCES public.profiles(id),
  rating          INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title           TEXT,
  comment         TEXT,
  is_published    BOOLEAN DEFAULT TRUE,
  admin_response  TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(booking_id, customer_id)
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE public.notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type            notification_type NOT NULL,
  title           TEXT NOT NULL,
  message         TEXT NOT NULL,
  data            JSONB DEFAULT '{}',
  is_read         BOOLEAN DEFAULT FALSE,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BLOG POSTS
-- ============================================================
CREATE TABLE public.blog_posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  excerpt         TEXT,
  content         TEXT NOT NULL,
  cover_image     TEXT,
  author_id       UUID NOT NULL REFERENCES public.profiles(id),
  status          blog_status DEFAULT 'draft',
  tags            TEXT[] DEFAULT '{}',
  seo_title       TEXT,
  seo_description TEXT,
  published_at    TIMESTAMPTZ,
  view_count      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE public.audit_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES public.profiles(id),
  action          TEXT NOT NULL,
  entity_type     TEXT NOT NULL,
  entity_id       UUID,
  old_data        JSONB,
  new_data        JSONB,
  ip_address      INET,
  user_agent      TEXT,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SYSTEM SETTINGS
-- ============================================================
CREATE TABLE public.system_settings (
  key             TEXT PRIMARY KEY,
  value           JSONB NOT NULL,
  description     TEXT,
  updated_by      UUID REFERENCES public.profiles(id),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_vehicles_owner ON public.vehicles(owner_id);
CREATE INDEX idx_vehicles_vin ON public.vehicles(vin);
CREATE INDEX idx_bookings_customer ON public.bookings(customer_id);
CREATE INDEX idx_bookings_inspector ON public.bookings(inspector_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_date ON public.bookings(scheduled_date);
CREATE INDEX idx_bookings_number ON public.bookings(booking_number);
CREATE INDEX idx_inspections_booking ON public.inspections(booking_id);
CREATE INDEX idx_inspections_inspector ON public.inspections(inspector_id);
CREATE INDEX idx_inspections_status ON public.inspections(status);
CREATE INDEX idx_inspection_media_inspection ON public.inspection_media(inspection_id);
CREATE INDEX idx_reports_inspection ON public.reports(inspection_id);
CREATE INDEX idx_reports_share_token ON public.reports(share_token);
CREATE INDEX idx_invoices_booking ON public.invoices(booking_id);
CREATE INDEX idx_invoices_customer ON public.invoices(customer_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read) WHERE NOT is_read;
CREATE INDEX idx_coupons_code ON public.coupons(code);
CREATE INDEX idx_referrals_code ON public.referrals(referral_code);
CREATE INDEX idx_reviews_inspector ON public.reviews(inspector_id);
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at DESC);
