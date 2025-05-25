/**
 * Helper Utilities
 * 
 * This module provides helper functions for WhatsApp Web.
 */

import { randomBytes } from 'crypto';
import * as os from 'os';

/**
 * Generate a random ID
 * @param {Number} length Length of the ID
 * @returns {String} Random ID
 */
export function generateId(length: number = 16): string {
  return randomBytes(length).toString('hex');
}

/**
 * Format a phone number to WhatsApp format
 * @param {String} phoneNumber Phone number
 * @returns {String} Formatted phone number
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Remove leading zeros
  const withoutLeadingZeros = cleaned.replace(/^0+/, '');
  
  return withoutLeadingZeros;
}

/**
 * Validate a WhatsApp JID (ID)
 * @param {String} jid JID to validate
 * @returns {Boolean} Whether the JID is valid
 */
export function validateJid(jid: string): boolean {
  if (!jid) return false;
  
  // Regular JID pattern: number@s.whatsapp.net
  const regularPattern = /^[0-9]{10,15}@s\.whatsapp\.net$/;
  
  // Group JID pattern: number-number@g.us
  const groupPattern = /^[0-9]{10,15}-[0-9]+@g\.us$/;
  
  return regularPattern.test(jid) || groupPattern.test(jid);
}

/**
 * Convert a phone number to JID
 * @param {String} phoneNumber Phone number
 * @returns {String} JID
 */
export function phoneNumberToJid(phoneNumber: string): string {
  const formatted = formatPhoneNumber(phoneNumber);
  return `${formatted}@s.whatsapp.net`;
}

/**
 * Extract phone number from JID
 * @param {String} jid JID
 * @returns {String} Phone number
 */
export function extractPhoneNumber(jid: string): string {
  if (!jid) return '';
  
  // Extract number from JID
  const match = jid.match(/^([0-9]+)@/);
  return match ? match[1] : '';
}

/**
 * Detect if running in Termux environment
 * @returns {Boolean} Whether running in Termux
 */
export function isTermux(): boolean {
  // Check for Termux-specific environment variables or paths
  return (
    process.env.TERMUX_VERSION !== undefined ||
    process.env.PREFIX?.includes('/com.termux') ||
    os.platform() === 'android'
  );
}

/**
 * Delay execution
 * @param {Number} ms Milliseconds to delay
 * @returns {Promise<void>} Promise that resolves after the delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if object is empty
 * @param {Object} obj Object to check
 * @returns {Boolean} Whether the object is empty
 */
export function isEmptyObject(obj: Record<string, any>): boolean {
  return obj && Object.keys(obj).length === 0 && Object.getPrototypeOf(obj) === Object.prototype;
}