import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a numeric value strictly in Sri Lankan Rupees (LKR).
 * No currency conversion logic is included per production specification.
 */
export function formatLKR(amount: number): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  return `Rs. ${safeAmount.toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

/**
 * Returns today's date in YYYY-MM-DD local format.
 */
export function getTodayISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
