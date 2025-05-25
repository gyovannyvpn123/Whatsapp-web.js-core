/**
 * WhatsApp Web Core - Termux Compatible
 * 
 * Pure JavaScript implementation of WhatsApp Web API, optimized for
 * compatibility with Termux and other restricted environments.
 * 
 * This library replaces native cryptographic dependencies with TweetNaCl
 * (pure JavaScript) to ensure it works on all platforms.
 */

// Export client
export { WhatsAppClient, ClientState, ClientOptions } from './client';

// Export WebSocket client
export { WebSocketClient } from './client/websocket-simplified';

// Export authenticators
export { QRAuthenticator } from './auth/qr';
export { PairingCodeAuthenticator } from './auth/pairing-code';

// Export cryptography
export { CryptoManager } from './crypto';

// Export events
export { WhatsAppEvents } from './websocket/events';

// Export utilities
export { isTermux, generateId, formatPhoneNumber, validateJid, phoneNumberToJid } from './utils/helpers';

/**
 * Library version
 */
export const VERSION = '1.0.0-termux';

/**
 * Default configuration
 */
export const DEFAULT_CONFIG = {
  version: [2, 2323, 4],
  browser: 'WhatsApp Web',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  reconnectInterval: 5000,
  maxReconnectAttempts: 10,
  qrTimeout: 60000,
  keepAliveInterval: 30000
};

/**
 * Create a new WhatsApp client with default options
 * @param {Object} options Client options
 * @returns {WhatsAppClient} WhatsApp client
 */
export function createClient(options = {}) {
  const { WhatsAppClient } = require('./client');
  return new WhatsAppClient(options);
}

// Export createClient as default
export default createClient;