-- ============================================================
-- PRE-OWNED CAR INSPECTION PLATFORM
-- Migration 00002: RLS Policies
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspector_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_uses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- PROFILES
-- ============================================================
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT USING (public.get_user_role() = 'admin');
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE USING (public.get_user_role() = 'admin');

-- ============================================================
-- INSPECTOR PROFILES
-- ============================================================
CREATE POLICY "Inspector can view own inspector profile"
  ON public.inspector_profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Admins can manage inspector profiles"
  ON public.inspector_profiles FOR ALL USING (public.get_user_role() = 'admin');
CREATE POLICY "Inspectors can update own inspector profile"
  ON public.inspector_profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- ============================================================
-- VEHICLES
-- ============================================================
CREATE POLICY "Customers see own vehicles"
  ON public.vehicles FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "Customers create own vehicles"
  ON public.vehicles FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Customers update own vehicles"
  ON public.vehicles FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Customers delete own vehicles"
  ON public.vehicles FOR DELETE USING (owner_id = auth.uid());
CREATE POLICY "Admins manage all vehicles"
  ON public.vehicles FOR ALL USING (public.get_user_role() = 'admin');
CREATE POLICY "Inspectors view vehicles for their bookings"
  ON public.vehicles FOR SELECT USING (
    public.get_user_role() = 'inspector'
    AND id IN (SELECT vehicle_id FROM public.bookings WHERE inspector_id = auth.uid())
  );

-- ============================================================
-- PRICING PLANS
-- ============================================================
CREATE POLICY "Anyone can view active pricing plans"
  ON public.pricing_plans FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins manage pricing plans"
  ON public.pricing_plans FOR ALL USING (public.get_user_role() = 'admin');

-- ============================================================
-- BOOKINGS
-- ============================================================
CREATE POLICY "Customers see own bookings"
  ON public.bookings FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY "Customers create bookings"
  ON public.bookings FOR INSERT WITH CHECK (customer_id = auth.uid());
CREATE POLICY "Customers update own pending bookings"
  ON public.bookings FOR UPDATE USING (customer_id = auth.uid() AND status = 'pending');
CREATE POLICY "Inspectors see assigned bookings"
  ON public.bookings FOR SELECT USING (inspector_id = auth.uid());
CREATE POLICY "Inspectors update assigned bookings"
  ON public.bookings FOR UPDATE USING (inspector_id = auth.uid());
CREATE POLICY "Admins manage all bookings"
  ON public.bookings FOR ALL USING (public.get_user_role() = 'admin');

-- ============================================================
-- INSPECTION TEMPLATES
-- ============================================================
CREATE POLICY "Authenticated view active templates"
  ON public.inspection_templates FOR SELECT TO authenticated USING (is_active = TRUE);
CREATE POLICY "Admins manage templates"
  ON public.inspection_templates FOR ALL USING (public.get_user_role() = 'admin');

-- ============================================================
-- INSPECTIONS
-- ============================================================
CREATE POLICY "Inspectors manage their inspections"
  ON public.inspections FOR ALL USING (inspector_id = auth.uid());
CREATE POLICY "Customers view inspections for their bookings"
  ON public.inspections FOR SELECT USING (
    booking_id IN (SELECT id FROM public.bookings WHERE customer_id = auth.uid())
  );
CREATE POLICY "Admins manage all inspections"
  ON public.inspections FOR ALL USING (public.get_user_role() = 'admin');

-- ============================================================
-- INSPECTION MEDIA
-- ============================================================
CREATE POLICY "Inspectors manage their inspection media"
  ON public.inspection_media FOR ALL USING (
    inspection_id IN (SELECT id FROM public.inspections WHERE inspector_id = auth.uid())
  );
CREATE POLICY "Customers view media for their inspections"
  ON public.inspection_media FOR SELECT USING (
    inspection_id IN (
      SELECT id FROM public.inspections
      WHERE booking_id IN (SELECT id FROM public.bookings WHERE customer_id = auth.uid())
    )
  );
CREATE POLICY "Admins view all media"
  ON public.inspection_media FOR SELECT USING (public.get_user_role() = 'admin');

-- ============================================================
-- REPORTS
-- ============================================================
CREATE POLICY "Customers view their reports"
  ON public.reports FOR SELECT USING (
    booking_id IN (SELECT id FROM public.bookings WHERE customer_id = auth.uid())
  );
CREATE POLICY "Inspectors view their reports"
  ON public.reports FOR SELECT USING (
    inspection_id IN (SELECT id FROM public.inspections WHERE inspector_id = auth.uid())
  );
CREATE POLICY "Admins manage all reports"
  ON public.reports FOR ALL USING (public.get_user_role() = 'admin');

-- ============================================================
-- INVOICES
-- ============================================================
CREATE POLICY "Customers view own invoices"
  ON public.invoices FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY "Admins manage all invoices"
  ON public.invoices FOR ALL USING (public.get_user_role() = 'admin');

-- ============================================================
-- COUPONS
-- ============================================================
CREATE POLICY "Authenticated users view active coupons"
  ON public.coupons FOR SELECT TO authenticated USING (is_active = TRUE AND valid_until > NOW());
CREATE POLICY "Admins manage coupons"
  ON public.coupons FOR ALL USING (public.get_user_role() = 'admin');

-- ============================================================
-- REFERRALS
-- ============================================================
CREATE POLICY "Users view own referrals"
  ON public.referrals FOR SELECT USING (referrer_id = auth.uid());
CREATE POLICY "Admins manage referrals"
  ON public.referrals FOR ALL USING (public.get_user_role() = 'admin');

-- REFERRAL USES
CREATE POLICY "Users view own referral uses"
  ON public.referral_uses FOR SELECT USING (referred_id = auth.uid());
CREATE POLICY "Admins manage referral uses"
  ON public.referral_uses FOR ALL USING (public.get_user_role() = 'admin');

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE POLICY "Anyone can view published reviews"
  ON public.reviews FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Customers create reviews for their bookings"
  ON public.reviews FOR INSERT WITH CHECK (customer_id = auth.uid());
CREATE POLICY "Admins manage reviews"
  ON public.reviews FOR ALL USING (public.get_user_role() = 'admin');

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE POLICY "Users see own notifications"
  ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users update own notifications"
  ON public.notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admins manage notifications"
  ON public.notifications FOR ALL USING (public.get_user_role() = 'admin');

-- ============================================================
-- BLOG POSTS
-- ============================================================
CREATE POLICY "Anyone can view published blog posts"
  ON public.blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Admins manage blog posts"
  ON public.blog_posts FOR ALL USING (public.get_user_role() = 'admin');

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE POLICY "Admins view audit logs"
  ON public.audit_logs FOR SELECT USING (public.get_user_role() = 'admin');

-- ============================================================
-- SYSTEM SETTINGS
-- ============================================================
CREATE POLICY "Admins manage settings"
  ON public.system_settings FOR ALL USING (public.get_user_role() = 'admin');
CREATE POLICY "Authenticated read settings"
  ON public.system_settings FOR SELECT TO authenticated USING (TRUE);
