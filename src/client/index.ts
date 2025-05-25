/**
 * WhatsApp Web Client
 * 
 * Main client module for WhatsApp Web API that connects all components together.
 * Designed for maximum compatibility, including Termux environments.
 */

import { EventEmitter } from 'events';
import { QRAuthenticator } from '../auth/qr';
import { PairingCodeAuthenticator } from '../auth/pairing-code';
import { CryptoManager } from '../crypto';
import { isTermux } from '../utils/helpers';

// Define client states
export enum ClientState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  AUTHENTICATING = 'AUTHENTICATING',
  AUTHENTICATED = 'AUTHENTICATED',
  READY = 'READY',
  LOGGING_OUT = 'LOGGING_OUT'
}

// Define client options
export interface ClientOptions {
  // Authentication options
  clientId?: string;
  qrTimeout?: number;
  qrRefreshInterval?: number;
  pairingTimeout?: number;
  
  // Connection options
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  
  // Session options
  sessionDir?: string;
  sessionId?: string;
  
  // Debug options
  debug?: boolean;
  
  // Browser options for QR code scanning
  browser?: {
    headless?: boolean;
    args?: string[];
  };
  
  // User agent
  userAgent?: string;
}

/**
 * WhatsApp Web Client
 */
export class WhatsAppClient extends EventEmitter {
  private options: ClientOptions;
  private state: ClientState = ClientState.DISCONNECTED;
  private qrAuth: QRAuthenticator;
  private pairingAuth: PairingCodeAuthenticator;
  private credentials: any = {};
  private reconnectAttempts: number = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  
  /**
   * Create a new WhatsApp client
   * @param {ClientOptions} options Client options
   */
  constructor(options: ClientOptions = {}) {
    super();
    
    // Set default options
    this.options = {
      clientId: options.clientId,
      qrTimeout: options.qrTimeout || 60000,
      qrRefreshInterval: options.qrRefreshInterval || 20000,
      pairingTimeout: options.pairingTimeout || 60000,
      reconnectInterval: options.reconnectInterval || 5000,
      maxReconnectAttempts: options.maxReconnectAttempts || 10,
      sessionDir: options.sessionDir || './sessions',
      sessionId: options.sessionId || 'default-session',
      debug: options.debug || false,
      browser: {
        headless: options.browser?.headless || true,
        args: options.browser?.args || [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      },
      userAgent: options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36'
    };
    
    // Detect Termux and adjust options if needed
    if (isTermux()) {
      console.log('Termux environment detected. Using Termux-compatible settings.');
      
      // Additional Termux-specific browser arguments
      if (this.options.browser && this.options.browser.args) {
        this.options.browser.args.push(
          '--no-default-browser-check',
          '--ignore-certificate-errors',
          '--ignore-ssl-errors'
        );
      }
    }
    
    // Initialize authenticators
    this.qrAuth = new QRAuthenticator({
      clientId: this.options.clientId,
      qrTimeout: this.options.qrTimeout,
      qrRefreshInterval: this.options.qrRefreshInterval
    });
    
    this.pairingAuth = new PairingCodeAuthenticator({
      clientId: this.options.clientId,
      pairingTimeout: this.options.pairingTimeout
    });
    
    // Forward authenticator events
    this._setupAuthenticatorEvents();
  }
  
  /**
   * Initialize the client
   * @returns {Promise<void>}
   */
  async initialize(): Promise<void> {
    this._setState(ClientState.CONNECTING);
    
    try {
      // Try to load session
      const sessionLoaded = await this._loadSession();
      
      if (sessionLoaded) {
        this._setState(ClientState.AUTHENTICATING);
        
        // Use loaded session to authenticate
        this._setState(ClientState.AUTHENTICATED);
        this._setState(ClientState.READY);
      } else {
        // No session, wait for QR scan or pairing code
        this._setState(ClientState.AUTHENTICATING);
        
        // Generate QR code
        await this.qrAuth.generateQR();
      }
    } catch (error) {
      this.emit('error', error);
      this._setState(ClientState.DISCONNECTED);
      throw error;
    }
  }
  
  /**
   * Request a pairing code for authentication
   * @param {String} phoneNumber Phone number in international format
   * @returns {Promise<void>}
   */
  async requestPairingCode(phoneNumber: string): Promise<void> {
    if (this.state !== ClientState.AUTHENTICATING) {
      throw new Error('Client must be in AUTHENTICATING state to request a pairing code');
    }
    
    try {
      await this.pairingAuth.requestPairingCode(phoneNumber);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }
  
  /**
   * Log out and clear session
   * @returns {Promise<void>}
   */
  async logout(): Promise<void> {
    this._setState(ClientState.LOGGING_OUT);
    
    // Clear session
    await this._clearSession();
    
    // Reset authenticators
    this.qrAuth.reset();
    this.pairingAuth.reset();
    
    this._setState(ClientState.DISCONNECTED);
    this.emit('logout');
  }
  
  /**
   * Get current state
   * @returns {ClientState} Current state
   */
  getState(): ClientState {
    return this.state;
  }
  
  /**
   * Check if client is authenticated
   * @returns {Boolean} Whether client is authenticated
   */
  isAuthenticated(): boolean {
    return [
      ClientState.AUTHENTICATED,
      ClientState.READY
    ].includes(this.state);
  }
  
  /**
   * Load session
   * @returns {Promise<boolean>} Whether session was loaded
   * @private
   */
  private async _loadSession(): Promise<boolean> {
    // This would typically load the session from a file
    // For now, we just return false to simulate no session
    return false;
  }
  
  /**
   * Save session
   * @returns {Promise<void>}
   * @private
   */
  private async _saveSession(): Promise<void> {
    // This would typically save the session to a file
  }
  
  /**
   * Clear session
   * @returns {Promise<void>}
   * @private
   */
  private async _clearSession(): Promise<void> {
    // This would typically delete the session file
    this.credentials = {};
  }
  
  /**
   * Set client state
   * @param {ClientState} newState New state
   * @private
   */
  private _setState(newState: ClientState): void {
    const oldState = this.state;
    this.state = newState;
    
    if (oldState !== newState) {
      this.emit('state_change', { from: oldState, to: newState });
    }
  }
  
  /**
   * Setup authenticator events
   * @private
   */
  private _setupAuthenticatorEvents(): void {
    // QR authenticator events
    this.qrAuth.on('qr', (qrData) => {
      this.emit('qr', qrData);
    });
    
    this.qrAuth.on('qr_expired', () => {
      this.emit('qr_expired');
    });
    
    this.qrAuth.on('qr_refresh_needed', () => {
      this.emit('qr_refresh_needed');
    });
    
    // Pairing authenticator events
    this.pairingAuth.on('pairing_requested', (data) => {
      this.emit('pairing_requested', data);
    });
    
    this.pairingAuth.on('pairing_code', (code) => {
      this.emit('pairing_code', code);
    });
    
    this.pairingAuth.on('pairing_expired', () => {
      this.emit('pairing_expired');
    });
  }
}

// Export default client class
export default WhatsAppClient;