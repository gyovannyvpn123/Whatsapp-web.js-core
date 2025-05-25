/**
 * QR Authentication Module
 * 
 * This module handles QR code authentication for WhatsApp Web.
 * Implemented using pure JavaScript for maximum compatibility, including Termux.
 */

import { EventEmitter } from 'events';
import * as qrcode from 'qrcode-terminal';
import { randomBytes } from 'crypto';
import { CryptoManager } from '../crypto';

/**
 * QR code authenticator for WhatsApp Web
 */
export class QRAuthenticator extends EventEmitter {
  private clientId: string;
  private keypair: { privateKey: string; publicKey: string };
  private qrTimeout: number;
  private qrRefreshInterval: number;
  private qrTimer: NodeJS.Timeout | null = null;
  private qrRefreshTimer: NodeJS.Timeout | null = null;
  private qrData: string | null = null;

  /**
   * Create a new QR authenticator
   * @param {Object} options Authentication options
   */
  constructor(options: { 
    clientId?: string; 
    qrTimeout?: number; 
    qrRefreshInterval?: number;
  } = {}) {
    super();
    
    // Generate client ID if not provided
    this.clientId = options.clientId || randomBytes(16).toString('hex');
    
    // Generate keypair for encryption
    this.keypair = CryptoManager.generateKeyPair();
    
    // Set timeouts and intervals
    this.qrTimeout = options.qrTimeout || 60000; // 60 seconds
    this.qrRefreshInterval = options.qrRefreshInterval || 20000; // 20 seconds
  }

  /**
   * Generate a QR code for authentication
   * @returns {Promise<string>} QR code data
   */
  async generateQR(): Promise<string> {
    // Clear any existing timers
    this.clearTimers();
    
    // Generate random ref
    const ref = randomBytes(16).toString('base64');
    
    // Create QR data
    this.qrData = `${ref},${this.clientId},${this.keypair.publicKey}`;
    
    // Set timeout for QR expiration
    this.qrTimer = setTimeout(() => {
      this.emit('qr_expired');
      this.qrData = null;
    }, this.qrTimeout);
    
    // Set interval for QR refresh
    this.qrRefreshTimer = setInterval(() => {
      this.emit('qr_refresh_needed');
    }, this.qrRefreshInterval);
    
    // Emit QR event
    this.emit('qr', this.qrData);
    
    return this.qrData;
  }

  /**
   * Display QR code in terminal
   * @param {String} qrData QR code data
   * @param {Boolean} small Whether to use small QR code
   */
  displayQR(qrData: string = this.qrData || '', small: boolean = true): void {
    if (!qrData) {
      throw new Error('No QR data available. Call generateQR() first.');
    }
    
    // Generate and display QR code
    qrcode.generate(qrData, { small });
  }

  /**
   * Get authentication credentials
   * @returns {Object} Authentication credentials
   */
  getCredentials(): { 
    clientId: string; 
    privateKey: string; 
    publicKey: string; 
  } {
    return {
      clientId: this.clientId,
      privateKey: this.keypair.privateKey,
      publicKey: this.keypair.publicKey
    };
  }

  /**
   * Clear QR timers
   */
  clearTimers(): void {
    if (this.qrTimer) {
      clearTimeout(this.qrTimer);
      this.qrTimer = null;
    }
    
    if (this.qrRefreshTimer) {
      clearInterval(this.qrRefreshTimer);
      this.qrRefreshTimer = null;
    }
  }

  /**
   * Reset QR authenticator
   */
  reset(): void {
    this.clearTimers();
    this.qrData = null;
  }
}