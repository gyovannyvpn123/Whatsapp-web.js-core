/**
 * Pairing Code Authentication Module
 * 
 * This module handles pairing code authentication for WhatsApp Web.
 * This is an alternative to QR code authentication.
 */

import { EventEmitter } from 'events';
import { randomBytes } from 'crypto';
import { CryptoManager } from '../crypto';

/**
 * Pairing code authenticator for WhatsApp Web
 */
export class PairingCodeAuthenticator extends EventEmitter {
  private clientId: string;
  private keypair: { privateKey: string; publicKey: string };
  private pairingTimeout: number;
  private phoneNumber: string | null = null;
  private pairingTimer: NodeJS.Timeout | null = null;

  /**
   * Create a new pairing code authenticator
   * @param {Object} options Authentication options
   */
  constructor(options: { 
    clientId?: string; 
    pairingTimeout?: number;
  } = {}) {
    super();
    
    // Generate client ID if not provided
    this.clientId = options.clientId || randomBytes(16).toString('hex');
    
    // Generate keypair for encryption
    this.keypair = CryptoManager.generateKeyPair();
    
    // Set timeouts
    this.pairingTimeout = options.pairingTimeout || 60000; // 60 seconds
  }

  /**
   * Request a pairing code for authentication
   * @param {String} phoneNumber Phone number in international format (e.g. +1234567890)
   * @returns {Promise<void>}
   */
  async requestPairingCode(phoneNumber: string): Promise<void> {
    // Validate phone number
    if (!phoneNumber || !phoneNumber.match(/^\+?[0-9]{10,15}$/)) {
      throw new Error('Invalid phone number format. Use international format (e.g. +1234567890)');
    }
    
    // Clean up phone number
    this.phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
    
    // Clear any existing timers
    this.clearTimers();
    
    // Set timeout for pairing code expiration
    this.pairingTimer = setTimeout(() => {
      this.emit('pairing_expired');
    }, this.pairingTimeout);
    
    // Emit event to request pairing code from server
    this.emit('pairing_requested', {
      clientId: this.clientId,
      publicKey: this.keypair.publicKey,
      phoneNumber: this.phoneNumber
    });
    
    // Note: The actual pairing code will be received from the server
    // and emitted through the 'pairing_code' event by the client implementation
  }

  /**
   * Set pairing code (usually called by the client when received from server)
   * @param {String} pairingCode The pairing code from the server
   */
  setPairingCode(pairingCode: string): void {
    if (!this.phoneNumber) {
      throw new Error('No phone number set. Call requestPairingCode() first.');
    }
    
    this.emit('pairing_code', pairingCode);
  }

  /**
   * Get authentication credentials
   * @returns {Object} Authentication credentials
   */
  getCredentials(): { 
    clientId: string; 
    privateKey: string; 
    publicKey: string; 
    phoneNumber: string | null;
  } {
    return {
      clientId: this.clientId,
      privateKey: this.keypair.privateKey,
      publicKey: this.keypair.publicKey,
      phoneNumber: this.phoneNumber
    };
  }

  /**
   * Clear pairing timers
   */
  clearTimers(): void {
    if (this.pairingTimer) {
      clearTimeout(this.pairingTimer);
      this.pairingTimer = null;
    }
  }

  /**
   * Reset pairing authenticator
   */
  reset(): void {
    this.clearTimers();
    this.phoneNumber = null;
  }
}