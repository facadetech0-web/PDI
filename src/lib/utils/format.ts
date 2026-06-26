import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';

// ---- DATE FORMATTING ----

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  const date = parseISO(dateString);
  if (!isValid(date)) return '—';
  return format(date, 'dd MMM yyyy');
}

export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  const date = parseISO(dateString);
  if (!isValid(date)) return '—';
  return format(date, 'dd MMM yyyy, hh:mm a');
}

export function formatTime(timeString: string | null | undefined): string {
  if (!timeString) return '—';
  // Handle both "HH:mm:ss" and ISO strings
  if (timeString.includes('T')) {
    const date = parseISO(timeString);
    if (!isValid(date)) return '—';
    return format(date, 'hh:mm a');
  }
  // Plain time string like "14:30:00"
  const [hours, minutes] = timeString.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
}

export function formatRelative(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  const date = parseISO(dateString);
  if (!isValid(date)) return '—';
  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatDateForInput(dateString: string | null | undefined): string {
  if (!dateString) return '';
  const date = parseISO(dateString);
  if (!isValid(date)) return '';
  return format(date, 'yyyy-MM-dd');
}

// ---- CURRENCY FORMATTING ----

const currencyFormatters: Record<string, Intl.NumberFormat> = {};

function getCurrencyFormatter(currency: string = 'INR'): Intl.NumberFormat {
  if (!currencyFormatters[currency]) {
    currencyFormatters[currency] = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }
  return currencyFormatters[currency];
}

export function formatCurrency(
  amount: number | null | undefined,
  currency: string = 'INR'
): string {
  if (amount == null) return '—';
  return getCurrencyFormatter(currency).format(amount);
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null) return '—';
  return new Intl.NumberFormat('en-IN').format(value);
}

export function formatPercentage(value: number | null | undefined, decimals: number = 1): string {
  if (value == null) return '—';
  return `${value.toFixed(decimals)}%`;
}

// ---- STRING FORMATTING ----

export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return '—';
  // Basic Indian phone format
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
}

export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatStatus(status: string): string {
  return status
    .split('_')
    .map((word) => capitalize(word))
    .join(' ');
}

// ---- FILE SIZE FORMATTING ----

export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes == null) return '—';
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

// ---- SCORE FORMATTING ----

export function formatScore(score: number | null | undefined): string {
  if (score == null) return '—';
  return `${Math.round(score)}/100`;
}

export function getScoreColor(score: number | null | undefined): string {
  if (score == null) return 'text-muted-foreground';
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  if (score >= 40) return 'text-orange-500';
  return 'text-red-500';
}

export function getScoreLabel(score: number | null | undefined): string {
  if (score == null) return 'N/A';
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  if (score >= 20) return 'Poor';
  return 'Critical';
}
