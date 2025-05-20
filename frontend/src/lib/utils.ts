import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date string or Date object into a readable date and time format
 * @param dateString - The date to format
 * @returns Formatted date and time string
 */
export function formatDateTime(dateString: string | Date | undefined): string {
  if (!dateString) return 'N/A';
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  // Check if date is valid
  if (isNaN(date.getTime())) return 'Invalid date';
  
  // Format: "Apr 23, 2025, 14:30"
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
