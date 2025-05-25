/**
 * Simplified WebSocket Client for WhatsApp Web
 * 
 * This module provides a simplified WebSocket client for WhatsApp Web that works
 * on all platforms including Termux. It uses the ws package for WebSocket communication.
 */

import { EventEmitter } from 'events';
import * as WebSocket from 'ws';
import { randomBytes } from 'crypto';
import { CryptoManager } from '../crypto';

export class WebSocketClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private url: string;
  private options: any;
  private reconnectAttempts: number = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private keepAliveTimer: NodeJS.Timeout | null = null;
  
  constructor(url: string = 'wss://web.whatsapp.com/ws', options: any = {}) {
    super();
    this.url = url;
    this.options = {
      headers: {
        'User-Agent': options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
        'Origin': options.origin || 'https://web.whatsapp.com'
      },
      ...options
    };
  }
  
  /**
   * Connect to the WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws) {
        this.ws.terminate();
      }
      
      this.ws = new WebSocket(this.url, this.options);
      
      this.ws.on('open', () => {
        this.startKeepAlive();
        this.emit('open');
        resolve();
      });
      
      this.ws.on('message', (data: Buffer | ArrayBuffer | Buffer[]) => {
        this.emit('message', data);
      });
      
      this.ws.on('error', (error: Error) => {
        this.emit('error', error);
        reject(error);
      });
      
      this.ws.on('close', (code: number, reason: string) => {
        this.clearTimers();
        this.emit('close', { code, reason });
        
        // Try to reconnect if not closed intentionally
        if (code !== 1000 && this.options.autoReconnect !== false) {
          this.reconnect();
        }
      });
    });
  }
  
  /**
   * Send data through the WebSocket
   */
  send(data: string | Buffer): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.ws) {
        reject(new Error('WebSocket is not connected'));
        return;
      }
      
      this.ws.send(data, (error?: Error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }
  
  /**
   * Close the WebSocket connection
   */
  close(code: number = 1000, reason: string = 'Normal closure'): void {
    this.clearTimers();
    
    if (this.ws) {
      this.ws.close(code, reason);
      this.ws = null;
    }
  }
  
  /**
   * Try to reconnect to the server
   */
  private reconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    const maxAttempts = this.options.maxReconnectAttempts || 10;
    
    if (this.reconnectAttempts >= maxAttempts) {
      this.emit('reconnect_failed');
      return;
    }
    
    this.reconnectAttempts++;
    
    const delay = this.options.reconnectInterval || 5000;
    
    this.emit('reconnecting', this.reconnectAttempts);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(() => {
        // Error will be emitted through the 'error' event
      });
    }, delay);
  }
  
  /**
   * Start keep-alive timer
   */
  private startKeepAlive(): void {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
    }
    
    const interval = this.options.keepAliveInterval || 30000;
    
    this.keepAliveTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send(JSON.stringify({ type: 'ping' })).catch((error) => {
          this.emit('error', error);
        });
      }
    }, interval);
  }
  
  /**
   * Clear all timers
   */
  private clearTimers(): void {
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
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}