/**
 * WebSocket Client
 * 
 * This module handles WebSocket communication with WhatsApp Web servers.
 * Implemented in pure JavaScript for maximum compatibility, including Termux.
 */

import { EventEmitter } from 'events';
import * as WebSocket from 'ws';
import { CryptoManager } from '../crypto';

// WebSocket connection states
export enum ConnectionState {
  CLOSED = 'CLOSED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  AUTHENTICATING = 'AUTHENTICATING',
  AUTHENTICATED = 'AUTHENTICATED',
  READY = 'READY'
}

// WebSocket client options
export interface WebSocketClientOptions {
  url?: string;
  userAgent?: string;
  origin?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  keepAliveInterval?: number;
}

/**
 * WebSocket client for WhatsApp Web
 */
export class WebSocketClient extends EventEmitter {
  private options: WebSocketClientOptions;
  private ws: WebSocket | null = null;
  private state: ConnectionState = ConnectionState.CLOSED;
  private reconnectAttempts: number = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private keepAliveTimer: NodeJS.Timeout | null = null;
  private credentials: any = {};
  
  /**
   * Create a new WebSocket client
   * @param {WebSocketClientOptions} options WebSocket client options
   */
  constructor(options: WebSocketClientOptions = {}) {
    super();
    
    // Set default options
    this.options = {
      url: options.url || 'wss://web.whatsapp.com/ws',
      userAgent: options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
      origin: options.origin || 'https://web.whatsapp.com',
      reconnectInterval: options.reconnectInterval || 5000,
      maxReconnectAttempts: options.maxReconnectAttempts || 10,
      keepAliveInterval: options.keepAliveInterval || 30000
    };
  }
  
  /**
   * Connect to the WebSocket server
   * @param {Object} credentials Authentication credentials
   * @returns {Promise<void>}
   */
  async connect(credentials: any = {}): Promise<void> {
    // Set credentials
    this.credentials = credentials;
    
    // Reset reconnect attempts
    this.reconnectAttempts = 0;
    
    return this._connect();
  }
  
  /**
   * Internal connection method
   * @returns {Promise<void>}
   * @private
   */
  private _connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this._setState(ConnectionState.CONNECTING);
      
      // Clear any existing timers
      this._clearTimers();
      
      // Close existing connection if any
      if (this.ws) {
        this.ws.terminate();
        this.ws = null;
      }
      
      // Create new WebSocket connection
      this.ws = new WebSocket(this.options.url!, {
        headers: {
          'User-Agent': this.options.userAgent!,
          'Origin': this.options.origin!
        }
      } as WebSocket.ClientOptions);
      
      // Set up event handlers
      this.ws.on('open', () => {
        this._setState(ConnectionState.CONNECTED);
        this._startKeepAlive();
        
        if (this.credentials && Object.keys(this.credentials).length > 0) {
          this._authenticate();
        }
        
        resolve();
      });
      
      this.ws.on('message', (data) => {
        this._handleMessage(data);
      });
      
      this.ws.on('error', (error) => {
        this.emit('error', error);
        
        if (this.state === ConnectionState.CONNECTING) {
          reject(error);
        }
      });
      
      this.ws.on('close', (code, reason) => {
        this._setState(ConnectionState.CLOSED);
        this._clearTimers();
        
        this.emit('close', { code, reason });
        
        // Try to reconnect if not closed intentionally
        if (code !== 1000) {
          this._reconnect();
        }
      });
    });
  }
  
  /**
   * Authenticate with the server
   * @private
   */
  private _authenticate(): void {
    if (!this.ws || this.state !== ConnectionState.CONNECTED) {
      throw new Error('WebSocket is not connected');
    }
    
    this._setState(ConnectionState.AUTHENTICATING);
    
    // Create authentication message
    const authInfo = CryptoManager.getAuthInfo(this.credentials);
    
    // Send authentication message
    this.send({ type: 'auth', data: authInfo });
  }
  
  /**
   * Send a message to the server
   * @param {Object} data Data to send
   * @returns {Promise<void>}
   */
  async send(data: any): Promise<void> {
    if (!this.ws || this.state === ConnectionState.CLOSED) {
      throw new Error('WebSocket is not connected');
    }
    
    return new Promise((resolve, reject) => {
      try {
        // Convert data to string if it's an object
        const messageData = typeof data === 'object' ? JSON.stringify(data) : data;
        
        this.ws!.send(messageData, (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * Send an encrypted message to the server
   * @param {Object} data Data to send
   * @returns {Promise<void>}
   */
  async sendEncrypted(data: any): Promise<void> {
    if (!this.credentials.privateKey || !this.credentials.serverPublicKey) {
      throw new Error('Missing encryption keys');
    }
    
    // Encrypt data
    const encrypted = CryptoManager.encrypt(
      data,
      this.credentials.privateKey,
      this.credentials.serverPublicKey
    );
    
    // Send encrypted data
    return this.send({ type: 'encrypted', data: encrypted });
  }
  
  /**
   * Close the WebSocket connection
   * @param {Number} code Close code
   * @param {String} reason Close reason
   */
  close(code: number = 1000, reason: string = 'Normal closure'): void {
    this._clearTimers();
    
    if (this.ws) {
      this.ws.close(code, reason);
      this.ws = null;
    }
    
    this._setState(ConnectionState.CLOSED);
  }
  
  /**
   * Try to reconnect to the server
   * @private
   */
  private _reconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.reconnectAttempts >= (this.options.maxReconnectAttempts || 10)) {
      this.emit('reconnect_failed');
      return;
    }
    
    this.reconnectAttempts++;
    
    this.emit('reconnecting', this.reconnectAttempts);
    
    this.reconnectTimer = setTimeout(() => {
      this._connect().catch((error) => {
        this.emit('error', error);
      });
    }, this.options.reconnectInterval);
  }
  
  /**
   * Start keep-alive timer
   * @private
   */
  private _startKeepAlive(): void {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
    }
    
    this.keepAliveTimer = setInterval(() => {
      if (this.ws && this.state !== ConnectionState.CLOSED) {
        this.send({ type: 'ping' }).catch((error) => {
          this.emit('error', error);
        });
      }
    }, this.options.keepAliveInterval);
  }
  
  /**
   * Clear all timers
   * @private
   */
  private _clearTimers(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
  }
  
  /**
   * Handle incoming messages
   * @param {Buffer|String} data Message data
   * @private
   */
  private _handleMessage(data: Buffer | ArrayBuffer | Buffer[]): void {
    try {
      // Convert buffer to string if needed
      const messageStr = data instanceof Buffer ? data.toString() : data.toString();
      
      // Try to parse as JSON
      let message;
      try {
        message = JSON.parse(messageStr);
      } catch (e) {
        message = { type: 'binary', data: messageStr };
      }
      
      // Handle message based on type
      if (message.type === 'auth_response') {
        if (message.status === 'success') {
          this._setState(ConnectionState.AUTHENTICATED);
          
          // Store server public key if provided
          if (message.data && message.data.serverPublicKey) {
            this.credentials.serverPublicKey = message.data.serverPublicKey;
          }
          
          this.emit('authenticated', message.data);
          this._setState(ConnectionState.READY);
        } else {
          this.emit('auth_failure', message.data);
        }
      } else if (message.type === 'encrypted') {
        // Decrypt message if it's encrypted
        if (this.credentials.privateKey && this.credentials.serverPublicKey) {
          try {
            const decrypted = CryptoManager.decrypt(
              message.data,
              this.credentials.privateKey,
              this.credentials.serverPublicKey
            );
            
            this.emit('message', decrypted);
          } catch (error) {
            this.emit('error', error);
          }
        } else {
          this.emit('error', new Error('Cannot decrypt message: missing keys'));
        }
      } else if (message.type === 'pong') {
        // Keep-alive response
        this.emit('pong');
      } else {
        // Regular message
        this.emit('message', message);
      }
    } catch (error) {
      this.emit('error', error);
    }
  }
  
  /**
   * Set connection state
   * @param {ConnectionState} newState New state
   * @private
   */
  private _setState(newState: ConnectionState): void {
    const oldState = this.state;
    this.state = newState;
    
    if (oldState !== newState) {
      this.emit('state_change', { from: oldState, to: newState });
    }
  }
  
  /**
   * Get current state
   * @returns {ConnectionState} Current state
   */
  getState(): ConnectionState {
    return this.state;
  }
  
  /**
   * Check if connected
   * @returns {Boolean} Whether client is connected
   */
  isConnected(): boolean {
    return this.state !== ConnectionState.CLOSED && this.state !== ConnectionState.CONNECTING;
  }
}

// Export default class
export default WebSocketClient;