// ============================================================
// Core TypeScript Types for Pre-Owned Car Inspection Platform
// ============================================================

// ---- ENUMS (matching database) ----

export type UserRole = 'customer' | 'inspector' | 'admin';

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'refunded';

export type InspectionStatus =
  | 'not_started'
  | 'in_progress'
  | 'draft'
  | 'submitted'
  | 'reviewed'
  | 'approved'
  | 'rejected';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'waived';

export type NotificationType =
  | 'booking_created'
  | 'booking_confirmed'
  | 'booking_assigned'
  | 'inspection_started'
  | 'inspection_completed'
  | 'report_ready'
  | 'invoice_generated'
  | 'payment_received'
  | 'review_received'
  | 'coupon_applied'
  | 'referral_earned'
  | 'system_broadcast';

export type BlogStatus = 'draft' | 'published' | 'archived';

export type ChecklistItemCondition =
  | 'excellent'
  | 'good'
  | 'fair'
  | 'poor'
  | 'critical'
  | 'not_applicable';

export type CouponType = 'percentage' | 'fixed';

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

// ---- ROW TYPES ----

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  address: Address | null;
  is_active: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Address {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface InspectorProfile {
  id: string;
  license_number: string | null;
  certifications: Certification[];
  service_areas: string[];
  specializations: string[];
  availability: Record<string, { start: string; end: string }>;
  max_daily_jobs: number;
  rating_avg: number;
  rating_count: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Certification {
  name: string;
  issuer: string;
  expiry: string;
}

export interface Vehicle {
  id: string;
  owner_id: string;
  make: string;
  model: string;
  year: number;
  vin: string | null;
  license_plate: string | null;
  color: string | null;
  mileage: number | null;
  fuel_type: string | null;
  transmission: string | null;
  body_type: string | null;
  engine_size: string | null;
  photos: string[];
  metadata: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  features: string[];
  inspection_type: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  booking_number: string;
  customer_id: string;
  vehicle_id: string;
  pricing_plan_id: string | null;
  inspector_id: string | null;
  status: BookingStatus;
  scheduled_date: string;
  scheduled_time: string;
  location_address: string;
  location_lat: number | null;
  location_lng: number | null;
  notes: string | null;
  subtotal: number | null;
  discount_amount: number;
  tax_amount: number;
  total_amount: number | null;
  coupon_id: string | null;
  referral_code: string | null;
  payment_status: PaymentStatus;
  cancelled_reason: string | null;
  cancelled_at: string | null;
  confirmed_at: string | null;
  assigned_at: string | null;
  completed_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Joined relations
  vehicle?: Vehicle;
  customer?: Profile;
  inspector?: Profile;
  pricing_plan?: PricingPlan;
}

export interface InspectionTemplate {
  id: string;
  name: string;
  description: string | null;
  version: number;
  inspection_type: string;
  categories: TemplateCategory[];
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface TemplateCategory {
  name: string;
  sort_order: number;
  items: TemplateItem[];
}

export interface TemplateItem {
  label: string;
  type: 'condition';
  required: boolean;
  description?: string;
  options?: string[];
}

export interface Inspection {
  id: string;
  booking_id: string;
  inspector_id: string;
  template_id: string | null;
  status: InspectionStatus;
  started_at: string | null;
  completed_at: string | null;
  submitted_at: string | null;
  start_location: GeoLocation | null;
  end_location: GeoLocation | null;
  checklist_data: Record<string, Record<string, ChecklistItemData>>;
  overall_score: number | null;
  category_scores: Record<string, number>;
  summary: string | null;
  recommendations: string[];
  critical_issues: CriticalIssue[];
  inspector_signature: string | null;
  customer_signature: string | null;
  voice_notes: string[];
  draft_data: Record<string, unknown> | null;
  draft_saved_at: string | null;
  is_draft: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Joined relations
  booking?: Booking;
  inspector?: Profile;
  media?: InspectionMedia[];
  template?: InspectionTemplate;
}

export interface GeoLocation {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: string;
}

export interface ChecklistItemData {
  condition: ChecklistItemCondition;
  notes?: string;
  photos?: string[];
}

export interface CriticalIssue {
  category: string;
  item: string;
  severity: 'high' | 'critical';
  description: string;
}

export interface InspectionMedia {
  id: string;
  inspection_id: string;
  category: string;
  item: string | null;
  file_url: string;
  file_type: 'image' | 'video' | 'audio';
  file_size: number | null;
  caption: string | null;
  sort_order: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Report {
  id: string;
  inspection_id: string;
  booking_id: string;
  report_number: string;
  share_token: string;
  pdf_url: string | null;
  overall_score: number | null;
  summary: string | null;
  is_published: boolean;
  published_at: string | null;
  qr_code_data: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Joined
  inspection?: Inspection;
  booking?: Booking;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  booking_id: string;
  customer_id: string;
  status: InvoiceStatus;
  subtotal: number;
  discount_amount: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  line_items: LineItem[];
  pdf_url: string | null;
  paid_at: string | null;
  due_date: string | null;
  notes: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Joined
  booking?: Booking;
  customer?: Profile;
}

export interface LineItem {
  description: string;
  qty: number;
  unit_price: number;
  total: number;
}

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  coupon_type: CouponType;
  value: number;
  min_order: number;
  max_discount: number | null;
  usage_limit: number | null;
  usage_count: number;
  per_user_limit: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  applicable_plans: string[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referral_code: string;
  reward_amount: number;
  total_referrals: number;
  total_earned: number;
  is_active: boolean;
  created_at: string;
}

export interface ReferralUse {
  id: string;
  referral_id: string;
  referred_id: string;
  booking_id: string | null;
  reward_earned: number;
  created_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  customer_id: string;
  inspector_id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  is_published: boolean;
  admin_response: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  customer?: Profile;
  inspector?: Profile;
  booking?: Booking;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown>;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  author_id: string;
  status: BlogStatus;
  tags: string[];
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
  // Joined
  author?: Profile;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface SystemSetting {
  key: string;
  value: Record<string, unknown>;
  description: string | null;
  updated_by: string | null;
  updated_at: string;
}

// ---- API TYPES ----

export interface ApiResponse<T = unknown> {
  data: T | null;
  error: string | null;
  status: number;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface PaginationParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface BookingFilters extends PaginationParams {
  status?: BookingStatus;
  customer_id?: string;
  inspector_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface InspectionFilters extends PaginationParams {
  status?: InspectionStatus;
  inspector_id?: string;
  booking_id?: string;
}

export interface UserFilters extends PaginationParams {
  role?: UserRole;
  is_active?: boolean;
  search?: string;
}

// ---- OFFLINE TYPES ----

export interface OfflineAction {
  id: string;
  type: 'create' | 'update' | 'upload';
  endpoint: string;
  method: 'POST' | 'PATCH' | 'PUT';
  body: Record<string, unknown>;
  files?: OfflineFile[];
  created_at: string;
  retries: number;
}

export interface OfflineFile {
  fieldName: string;
  fileName: string;
  mimeType: string;
  blob: Blob;
}

// ---- COMPONENT PROP TYPES ----

export interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: NavItem[];
  roles?: UserRole[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}
