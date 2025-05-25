/**
 * TweetNaCl Cryptography Implementation
 * 
 * This module provides a pure JavaScript implementation of the cryptographic functions
 * needed for WhatsApp Web using TweetNaCl, which makes it compatible with Termux
 * and other restricted environments where native modules might fail.
 */

import * as nacl from 'tweetnacl';
import * as naclUtil from 'tweetnacl-util';
import { randomBytes, createHash, createHmac } from 'crypto';

/**
 * Generate a new keypair for encryption
 * @returns {Object} Public and private keys
 */
export function generateKeyPair() {
  const keypair = nacl.box.keyPair();
  return {
    privateKey: naclUtil.encodeBase64(keypair.secretKey),
    publicKey: naclUtil.encodeBase64(keypair.publicKey)
  };
}

/**
 * Create a shared secret using our private key and their public key
 * @param {String} privateKey Base64 encoded private key
 * @param {String} publicKey Base64 encoded public key
 * @returns {Uint8Array} Shared secret
 */
export function createSharedSecret(privateKey: string, publicKey: string): Uint8Array {
  const decodedPrivateKey = naclUtil.decodeBase64(privateKey);
  const decodedPublicKey = naclUtil.decodeBase64(publicKey);
  return nacl.box.before(decodedPublicKey, decodedPrivateKey);
}

/**
 * Encrypt a message using the shared secret
 * @param {Object|String} message Message to encrypt
 * @param {String} privateKey Our private key
 * @param {String} publicKey Their public key (optional)
 * @returns {String} Encrypted message as base64
 */
export function encrypt(message: object | string, privateKey: string, publicKey: string | null = null): string {
  // Convert message to string if it's an object
  const messageStr = typeof message === 'object' ? JSON.stringify(message) : message;
  
  // Convert message to Uint8Array
  const messageBytes = naclUtil.decodeUTF8(messageStr);
  
  // Create nonce
  const nonce = nacl.randomBytes(24);
  
  // Get shared secret
  let sharedSecret;
  if (publicKey) {
    sharedSecret = createSharedSecret(privateKey, publicKey);
  } else {
    sharedSecret = naclUtil.decodeBase64(privateKey);
  }
  
  // Encrypt
  const encryptedBytes = nacl.secretbox(messageBytes, nonce, sharedSecret);
  
  // Combine nonce and encrypted message
  const combined = new Uint8Array(nonce.length + encryptedBytes.length);
  combined.set(nonce);
  combined.set(encryptedBytes, nonce.length);
  
  // Return as base64
  return naclUtil.encodeBase64(combined);
}

/**
 * Decrypt a message using the shared secret
 * @param {String} encryptedB64 Base64 encoded encrypted message
 * @param {String} privateKey Our private key
 * @param {String} publicKey Their public key (optional)
 * @returns {Object|String} Decrypted message
 */
export function decrypt(encryptedB64: string, privateKey: string, publicKey: string | null = null): object | string {
  // Decode base64
  const combined = naclUtil.decodeBase64(encryptedB64);
  
  // Extract nonce and encrypted message
  const nonce = combined.slice(0, 24);
  const encryptedBytes = combined.slice(24);
  
  // Get shared secret
  let sharedSecret;
  if (publicKey) {
    sharedSecret = createSharedSecret(privateKey, publicKey);
  } else {
    sharedSecret = naclUtil.decodeBase64(privateKey);
  }
  
  // Decrypt
  const decryptedBytes = nacl.secretbox.open(encryptedBytes, nonce, sharedSecret);
  if (!decryptedBytes) {
    throw new Error('Failed to decrypt message');
  }
  
  // Convert to string
  const decryptedStr = naclUtil.encodeUTF8(decryptedBytes);
  
  // Try to parse as JSON
  try {
    return JSON.parse(decryptedStr);
  } catch (e) {
    return decryptedStr;
  }
}

/**
 * Create a signature for a message
 * @param {String} message Message to sign
 * @param {String} privateKey Private key to sign with
 * @returns {String} Base64 encoded signature
 */
export function sign(message: string, privateKey: string): string {
  const messageBytes = naclUtil.decodeUTF8(message);
  const keyBytes = naclUtil.decodeBase64(privateKey);
  const signatureBytes = nacl.sign.detached(messageBytes, keyBytes);
  return naclUtil.encodeBase64(signatureBytes);
}

/**
 * Verify a signature
 * @param {String} message Original message
 * @param {String} signature Base64 encoded signature
 * @param {String} publicKey Public key to verify with
 * @returns {Boolean} Whether signature is valid
 */
export function verify(message: string, signature: string, publicKey: string): boolean {
  const messageBytes = naclUtil.decodeUTF8(message);
  const signatureBytes = naclUtil.decodeBase64(signature);
  const keyBytes = naclUtil.decodeBase64(publicKey);
  return nacl.sign.detached.verify(messageBytes, signatureBytes, keyBytes);
}

/**
 * Generate HMAC for authentication
 * @param {String} message Message to authenticate
 * @param {String} key Key for HMAC
 * @returns {String} Base64 encoded HMAC
 */
export function hmac(message: string, key: string): string {
  const hmacInstance = createHmac('sha256', Buffer.from(key, 'base64'));
  hmacInstance.update(message);
  return hmacInstance.digest('base64');
}

/**
 * Create authentication information for connection
 * @param {Object} credentials Authentication credentials
 * @returns {Object} Authentication info ready to send
 */
export function getAuthInfo(credentials: any): object {
  // Create authentication info
  const authInfo = {
    clientId: credentials.clientId,
    publicKey: credentials.publicKey,
    serverToken: credentials.serverToken || null,
    clientToken: credentials.clientToken || randomBytes(16).toString('hex'),
    encKey: credentials.encKey || randomBytes(32).toString('base64'),
    macKey: credentials.macKey || randomBytes(32).toString('base64')
  };
  
  return authInfo;
}

/**
 * Generate random bytes as base64 string
 * @param {Number} length Length of random bytes
 * @returns {String} Base64 encoded random bytes
 */
export function randomBytesBase64(length: number): string {
  return randomBytes(length).toString('base64');
}

/**
 * Hash a string using SHA256
 * @param {String} str String to hash
 * @returns {String} Base64 encoded hash
 */
export function sha256(str: string): string {
  return createHash('sha256').update(str).digest('base64');
}