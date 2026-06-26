import type { UserRole, BookingStatus, InspectionStatus, ChecklistItemCondition, NavItem } from '@/lib/types';
import {
  LayoutDashboard,
  Car,
  CalendarCheck,
  ClipboardCheck,
  FileText,
  Receipt,
  Bell,
  Users,
  Settings,
  Star,
  Gift,
  Newspaper,
  BarChart3,
  Shield,
  PenTool,
  History,
  FileArchive,
  Calendar,
  UserCircle,
  Wrench,
  Tag,
  DollarSign,
} from 'lucide-react';

// ---- APP CONSTANTS ----

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'PreCar Inspect';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
export const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || 'PreCar Inspect';

// ---- ROLE LABELS ----

export const ROLE_LABELS: Record<UserRole, string> = {
  customer: 'Customer',
  inspector: 'Inspector',
  admin: 'Admin',
};

export const ROLE_COLORS: Record<UserRole, string> = {
  customer: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  inspector: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  admin: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
};

// ---- STATUS LABELS & COLORS ----

export const BOOKING_STATUS_CONFIG: Record<BookingStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  assigned: { label: 'Assigned', color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
  in_progress: { label: 'In Progress', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  completed: { label: 'Completed', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
  refunded: { label: 'Refunded', color: 'bg-gray-500/10 text-gray-500 border-gray-500/20' },
};

export const INSPECTION_STATUS_CONFIG: Record<InspectionStatus, { label: string; color: string }> = {
  not_started: { label: 'Not Started', color: 'bg-gray-500/10 text-gray-500 border-gray-500/20' },
  in_progress: { label: 'In Progress', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  draft: { label: 'Draft', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  submitted: { label: 'Submitted', color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
  reviewed: { label: 'Reviewed', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  approved: { label: 'Approved', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
  rejected: { label: 'Rejected', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
};

export const CONDITION_CONFIG: Record<ChecklistItemCondition, { label: string; color: string; score: number }> = {
  excellent: { label: 'Excellent', color: 'bg-green-500/10 text-green-500 border-green-500/20', score: 100 },
  good: { label: 'Good', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', score: 80 },
  fair: { label: 'Fair', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', score: 60 },
  poor: { label: 'Poor', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20', score: 30 },
  critical: { label: 'Critical', color: 'bg-red-500/10 text-red-500 border-red-500/20', score: 0 },
  not_applicable: { label: 'N/A', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20', score: -1 },
};

// ---- CATEGORY WEIGHTS FOR SCORE CALCULATION ----

export const CATEGORY_WEIGHTS: Record<string, number> = {
  'Exterior': 0.15,
  'Interior': 0.10,
  'Engine & Mechanical': 0.25,
  'Transmission & Drivetrain': 0.15,
  'Brakes & Suspension': 0.15,
  'Electrical & Electronics': 0.10,
  'Tyres & Wheels': 0.05,
  'Documents & Compliance': 0.05,
};

// ---- VEHICLE OPTIONS ----

export const FUEL_TYPES = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid', 'LPG'] as const;
export const TRANSMISSION_TYPES = ['Manual', 'Automatic', 'CVT', 'DCT', 'AMT'] as const;
export const BODY_TYPES = ['Sedan', 'Hatchback', 'SUV', 'MUV', 'Coupe', 'Convertible', 'Pickup', 'Van'] as const;

// ---- POPULAR CAR MAKES ----

export const CAR_MAKES = [
  'Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra', 'Kia',
  'Toyota', 'Honda', 'Volkswagen', 'Skoda', 'MG',
  'Renault', 'Nissan', 'Ford', 'Jeep', 'Citroen',
  'BMW', 'Mercedes-Benz', 'Audi', 'Volvo', 'Lexus',
] as const;

// ---- SIDEBAR NAVIGATION ----

export const CUSTOMER_NAV: NavItem[] = [
  { title: 'Dashboard', href: '/customer', icon: LayoutDashboard },
  { title: 'My Vehicles', href: '/customer/vehicles', icon: Car },
  { title: 'Bookings', href: '/customer/bookings', icon: CalendarCheck },
  { title: 'Reports', href: '/customer/reports', icon: FileText },
  { title: 'Invoices', href: '/customer/invoices', icon: Receipt },
  { title: 'Notifications', href: '/customer/notifications', icon: Bell },
  { title: 'Referrals', href: '/customer/referrals', icon: Gift },
  { title: 'Reviews', href: '/customer/reviews', icon: Star },
  { title: 'Profile', href: '/customer/profile', icon: UserCircle },
];

export const INSPECTOR_NAV: NavItem[] = [
  { title: 'Dashboard', href: '/inspector', icon: LayoutDashboard },
  { title: 'My Jobs', href: '/inspector/jobs', icon: ClipboardCheck },
  { title: 'Schedule', href: '/inspector/schedule', icon: Calendar },
  { title: 'History', href: '/inspector/history', icon: History },
  { title: 'Drafts', href: '/inspector/drafts', icon: FileArchive },
  { title: 'Profile', href: '/inspector/profile', icon: UserCircle },
];

export const ADMIN_NAV: NavItem[] = [
  { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { title: 'Users', href: '/admin/users', icon: Users },
  { title: 'Bookings', href: '/admin/bookings', icon: CalendarCheck },
  { title: 'Inspectors', href: '/admin/inspectors', icon: Wrench },
  { title: 'Reports', href: '/admin/reports', icon: FileText },
  { title: 'Invoices', href: '/admin/invoices', icon: Receipt },
  { title: 'Templates', href: '/admin/templates', icon: PenTool },
  { title: 'Pricing', href: '/admin/pricing', icon: DollarSign },
  { title: 'Coupons', href: '/admin/coupons', icon: Tag },
  { title: 'Blog', href: '/admin/blog', icon: Newspaper },
  { title: 'Notifications', href: '/admin/notifications', icon: Bell },
  { title: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { title: 'Audit Logs', href: '/admin/audit-logs', icon: Shield },
  { title: 'Settings', href: '/admin/settings', icon: Settings },
];

// ---- PAGINATION DEFAULTS ----

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// ---- FILE UPLOAD LIMITS ----

export const MAX_IMAGE_SIZE = 500 * 1024; // 500KB (after compression)
export const MAX_VIDEO_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_AUDIO_SIZE = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
export const ACCEPTED_AUDIO_TYPES = ['audio/webm', 'audio/mp4'];
