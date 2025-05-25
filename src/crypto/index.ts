/**
 * Crypto Module
 * 
 * This module provides cryptographic functions for WhatsApp Web communication.
 * The implementation uses tweetnacl (pure JS) to ensure compatibility with Termux
 * and other environments where native modules might fail.
 */

// Export all functions from the TweetNaCl implementation
export * from './tweetnacl-impl';

// Re-export in a named class for compatibility with existing code
import * as cryptoFuncs from './tweetnacl-impl';

export class CryptoManager {
  /**
   * Generate a new keypair for encryption
   * @returns {Object} Public and private keys
   */
  static generateKeyPair() {
    return cryptoFuncs.generateKeyPair();
  }

  /**
   * Create a shared secret using our private key and their public key
   * @param {String} privateKey Base64 encoded private key
   * @param {String} publicKey Base64 encoded public key
   * @returns {Uint8Array} Shared secret
   */
  static createSharedSecret(privateKey: string, publicKey: string) {
    return cryptoFuncs.createSharedSecret(privateKey, publicKey);
  }

  /**
   * Encrypt a message using the shared secret
   * @param {Object|String} message Message to encrypt
   * @param {String} privateKey Our private key
   * @param {String} publicKey Their public key (optional)
   * @returns {String} Encrypted message as base64
   */
  static encrypt(message: object | string, privateKey: string, publicKey: string | null = null) {
    return cryptoFuncs.encrypt(message, privateKey, publicKey);
  }

  /**
   * Decrypt a message using the shared secret
   * @param {String} encryptedB64 Base64 encoded encrypted message
   * @param {String} privateKey Our private key
   * @param {String} publicKey Their public key (optional)
   * @returns {Object|String} Decrypted message
   */
  static decrypt(encryptedB64: string, privateKey: string, publicKey: string | null = null) {
    return cryptoFuncs.decrypt(encryptedB64, privateKey, publicKey);
  }

  /**
   * Create a signature for a message
   * @param {String} message Message to sign
   * @param {String} privateKey Private key to sign with
   * @returns {String} Base64 encoded signature
   */
  static sign(message: string, privateKey: string) {
    return cryptoFuncs.sign(message, privateKey);
  }

  /**
   * Verify a signature
   * @param {String} message Original message
   * @param {String} signature Base64 encoded signature
   * @param {String} publicKey Public key to verify with
   * @returns {Boolean} Whether signature is valid
   */
  static verify(message: string, signature: string, publicKey: string) {
    return cryptoFuncs.verify(message, signature, publicKey);
  }

  /**
   * Generate HMAC for authentication
   * @param {String} message Message to authenticate
   * @param {String} key Key for HMAC
   * @returns {String} Base64 encoded HMAC
   */
  static hmac(message: string, key: string) {
    return cryptoFuncs.hmac(message, key);
  }

  /**
   * Create authentication information for connection
   * @param {Object} credentials Authentication credentials
   * @returns {Object} Authentication info ready to send
   */
  static getAuthInfo(credentials: any) {
    return cryptoFuncs.getAuthInfo(credentials);
  }
}