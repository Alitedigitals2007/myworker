"use strict";
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

/**
 * Merges multiple Tailwind CSS class values with conflict resolution
 * @param inputs Class values to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats numeric value as Nigerian Naira currency
 * @param value Numeric value to format (float)
 * @param decimals Number of decimal places (default: 2)
 * @returns Formatted currency string (₦1,000.00)
 */
export function formatCurrency(value: number, decimals?: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    currencyDisplay: "symbol",
    minimumFractionDigits: decimals ?? 2,
    maximumFractionDigits: decimals ?? 2
  }).format(value).replace(/₦/, "₦");
}

/**
 * Formats a date to Nigerian date/time format
 * @param date Date to format
 * @param formatType Format type: 'date', 'time', 'datetime' or custom date-fns format
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | number,
  formatType: string = 'date'
): string {
  const dateObj = typeof date === "string" || typeof date === "number" 
    ? new Date(date)
    : date;
  
  if (formatType === 'date') {
    return format(dateObj, 'd MMMM, yyyy');
  } else if (formatType === 'time') {
    return format(dateObj, 'h:mm a');
  } else if (formatType === 'datetime') {
    return format(dateObj, 'd MMMM, yyyy h:mm a');
  } else {
    return format(dateObj, formatType);
  }
}

/**
 * Extracts initials from user name for avatar fallback
 * @param name Full name (e.g., "John David Doe")
 * @returns Initials (e.g., "JD")
 */
export function getInitials(name: string): string {
  if (!name) return "";
  const nameParts = name.trim().split(" ").filter(Boolean);
  let initials = nameParts[0][0].toUpperCase();
  if (nameParts.length > 1) {
    initials += nameParts[nameParts.length - 1][0].toUpperCase();
  }
  return initials;
}

/**
 * Generates unique worker ID
 * Format: MW-XXXXXXXX (MW-\d{8})
 * @returns Generated worker ID
 */
export function generateWorkerId(): string {
  const chars = '0123456789';
  let result = 'MW-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generates unique SKU
 * Format: PD-XXXX-XXXX (PD-XXXX-XXXX, uppercase alphanumeric)
 * @param productCategory Optional category prefix
 * @returns Generated SKU
 */
export function generateSku(productCategory?: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = productCategory ? `${productCategory.substring(0, 2).toUpperCase()}-` : "PD-";
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  result += "-";
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}