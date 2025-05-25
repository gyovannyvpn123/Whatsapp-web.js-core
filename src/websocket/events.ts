/**
 * WhatsApp Events
 * 
 * This module defines the events emitted by the WhatsApp client.
 */

export enum WhatsAppEvents {
  // Connection events
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting',
  RECONNECT_FAILED = 'reconnect_failed',
  
  // Authentication events
  QR = 'qr',
  QR_EXPIRED = 'qr_expired',
  QR_REFRESH_NEEDED = 'qr_refresh_needed',
  PAIRING_REQUESTED = 'pairing_requested',
  PAIRING_CODE = 'pairing_code',
  PAIRING_EXPIRED = 'pairing_expired',
  AUTHENTICATED = 'authenticated',
  AUTH_FAILURE = 'auth_failure',
  LOGOUT = 'logout',
  
  // Message events
  MESSAGE = 'message',
  MESSAGE_ACK = 'message_ack',
  MESSAGE_REVOKE = 'message_revoke',
  
  // Chat events
  CHAT_OPENED = 'chat_opened',
  CHAT_CLOSED = 'chat_closed',
  CHAT_ARCHIVED = 'chat_archived',
  CHAT_UNARCHIVED = 'chat_unarchived',
  
  // State events
  STATE_CHANGE = 'state_change',
  READY = 'ready',
  
  // Error events
  ERROR = 'error'
}