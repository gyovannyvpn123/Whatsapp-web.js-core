/**
 * @ourorg/whatsapp-core - Production-ready WhatsApp Web library
 * 
 * Main entry point for the WhatsApp Web library implementing reverse-engineered protocols
 * from sigalor/whatsapp-web-reveng
 */

export { WhatsAppClient } from './client/whatsapp';
export { MessageHandler } from './client/messaging';
export { QRAuthenticator } from './auth/qr';
export { SessionManager } from './auth/session';
export { WebSocketClient } from './websocket/client';
export { ProtocolSerializer } from './protocol/serializer';
export { CryptoManager } from './crypto/index';

// Export types
export * from './types/index';

// Export events
export { WhatsAppEvents } from './websocket/events';

// Export utilities
export { Logger } from './utils/logger';
export { generateId, formatPhoneNumber, validateJid } from './utils/helpers';

/**
 * Library version
 */
export const VERSION = '1.0.0-alpha';

/**
 * Default configuration for WhatsApp client
 */
export const DEFAULT_CONFIG = {
  version: [2, 2323, 4],
  browser: 'WhatsApp Web',
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  reconnectInterval: 5000,
  maxReconnectAttempts: 10,
  qrTimeout: 60000,
  keepAliveInterval: 30000
};
