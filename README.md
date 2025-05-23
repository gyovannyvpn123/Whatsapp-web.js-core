# @ourorg/whatsapp-core

A production-ready, feature-complete WhatsApp Web library for Node.js, implementing the full WhatsApp Web protocol with QR code and pairing code authentication.

![WhatsApp Core](https://img.shields.io/badge/WhatsApp-Core-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Production Ready](https://img.shields.io/badge/Production-Ready-success?style=for-the-badge)

## ✨ Features

### 🔐 **Authentication Methods**
- **QR Code Authentication** - Scan QR code with your phone
- **Pairing Code Authentication** - Use 8-letter codes with phone number
- **Session Management** - Auto-save and restore sessions
- **Multi-device Support** - Connect multiple devices simultaneously

### 💬 **Complete Messaging**
- **Text Messages** - Send and receive text messages
- **Media Messages** - Images, videos, audio, documents, stickers
- **Quoted Messages** - Reply to specific messages
- **Message Reactions** - React with emojis
- **Mentions** - Tag users in groups
- **Link Previews** - Automatic link preview generation
- **Voice Messages** - Send and receive voice notes
- **Location Sharing** - Share and receive locations

### 👥 **Group Management**
- **Create Groups** - Create new WhatsApp groups
- **Add/Remove Participants** - Manage group members
- **Admin Controls** - Promote/demote administrators
- **Group Settings** - Update group name, description, picture
- **Group Invites** - Generate and manage invite links
- **Group Events** - Handle join/leave notifications

### 📱 **Chat Operations**
- **Archive/Unarchive** - Manage chat visibility
- **Pin/Unpin** - Pin important conversations
- **Mute/Unmute** - Control chat notifications
- **Mark as Read** - Update message read status
- **Delete Messages** - Delete for everyone or just you
- **Chat Search** - Search through chat history

### 👤 **Contact & Profile Management**
- **Block/Unblock** - Manage blocked contacts
- **Profile Updates** - Update name, status, profile picture
- **Contact Info** - Get user profile information
- **Presence Updates** - Online status, typing indicators, last seen
- **Status Management** - View and update WhatsApp status

### 🔄 **Real-time Events**
- **Message Events** - New messages, updates, receipts
- **Chat Events** - Chat updates, participant changes
- **Presence Events** - Online status changes
- **Group Events** - Group member changes, admin updates
- **Connection Events** - Connection status updates

### 🪝 **Webhooks & Integration**
- **HTTP Webhooks** - Send events to external services
- **Event Filtering** - Choose which events to receive
- **HMAC Signatures** - Secure webhook verification
- **Custom Endpoints** - Integrate with any system

### 🛠️ **Advanced Features**
- **Binary Protocol** - Authentic WhatsApp Web protocol implementation
- **Curve25519 Cryptography** - Secure end-to-end encryption
- **Connection Retry Logic** - Automatic reconnection on failures
- **Message Queue** - Handle messages during connection issues
- **TypeScript Support** - Full type definitions included
- **Error Handling** - Comprehensive error management

## 🚀 Quick Start

### Installation

```bash
npm install @ourorg/whatsapp-core
# or
yarn add @ourorg/whatsapp-core
```

### Basic Usage

```javascript
import WhatsAppCore from '@ourorg/whatsapp-core';

// Initialize with QR code authentication
const wa = new WhatsAppCore({
  auth: {
    qrAuth: true,
    sessionPath: './session',
    autoSave: true
  },
  features: {
    messaging: true,
    media: true,
    groups: true
  }
});

// Connect and authenticate
await wa.connect();

// Send a message
await wa.sendMessage('1234567890@c.us', 'Hello from WhatsApp Core!');

// Listen for new messages
wa.on('message.new', (message) => {
  console.log('New message:', message.content.text);
});
```

## 📋 Authentication Methods

### QR Code Authentication

The most common method - scan a QR code with your phone:

```javascript
const wa = new WhatsAppCore({
  auth: {
    qrAuth: true,
    sessionPath: './session'
  }
});

// Listen for QR code
wa.on('qr', (qrString) => {
  console.log('Scan this QR code with WhatsApp on your phone:');
  console.log(qrString);
  // You can also generate a visual QR code using libraries like 'qrcode'
});

await wa.connect();
```

### Pairing Code Authentication

Use an 8-letter code with your phone number:

```javascript
const wa = new WhatsAppCore({
  auth: {
    pairingCode: true,
    sessionPath: './session'
  }
});

// Listen for pairing code
wa.on('pairing.code', (data) => {
  console.log('Your pairing code:', data.code);
  console.log('Enter this code in WhatsApp > Settings > Linked Devices');
});

await wa.connect();
```

### Session Management

Sessions are automatically saved and restored:

```javascript
const wa = new WhatsAppCore({
  auth: {
    sessionPath: './my-session',
    autoSave: true // Automatically save session
  }
});

// Check if session exists
if (await wa.hasValidSession()) {
  console.log('Existing session found, connecting...');
} else {
  console.log('No session found, starting fresh authentication...');
}

await wa.connect();
```

## 💬 Messaging Examples

### Send Text Messages

```javascript
// Simple text message
await wa.sendMessage('1234567890@c.us', 'Hello World!');

// Message with options
await wa.sendMessage('1234567890@c.us', 'Hello!', {
  quotedMessage: 'message-id-to-quote',
  mentions: ['1234567890@c.us'],
  linkPreview: true
});
```

### Send Media Messages

```javascript
import fs from 'fs';

// Send image
const imageBuffer = fs.readFileSync('./image.jpg');
await wa.sendMediaMessage('1234567890@c.us', imageBuffer, {
  type: 'image',
  caption: 'Check out this image!',
  filename: 'photo.jpg'
});

// Send document
const docBuffer = fs.readFileSync('./document.pdf');
await wa.sendMediaMessage('1234567890@c.us', docBuffer, {
  type: 'document',
  filename: 'document.pdf',
  mimetype: 'application/pdf'
});

// Send audio
const audioBuffer = fs.readFileSync('./audio.mp3');
await wa.sendMediaMessage('1234567890@c.us', audioBuffer, {
  type: 'audio',
  filename: 'audio.mp3'
});
```

### Message Reactions

```javascript
// React to a message
await wa.reactToMessage('message-id', '👍');

// Remove reaction
await wa.reactToMessage('message-id', '');
```

### Delete Messages

```javascript
// Delete for everyone
await wa.deleteMessage('message-id', true);

// Delete for yourself only
await wa.deleteMessage('message-id', false);
```

## 👥 Group Management

### Create Groups

```javascript
// Create a new group
const group = await wa.createGroup('My Group', [
  '1234567890@c.us',
  '0987654321@c.us'
]);

console.log('Group created:', group.id);
```

### Manage Participants

```javascript
// Add participants
await wa.addToGroup('group-id@g.us', ['1111111111@c.us']);

// Remove participants
await wa.removeFromGroup('group-id@g.us', ['1111111111@c.us']);

// Promote to admin
await wa.setGroupAdmin('group-id@g.us', ['1111111111@c.us'], true);

// Demote from admin
await wa.setGroupAdmin('group-id@g.us', ['1111111111@c.us'], false);
```

### Update Group Info

```javascript
// Update group name
await wa.updateGroupSubject('group-id@g.us', 'New Group Name');

// Update group description
await wa.updateGroupDescription('group-id@g.us', 'New description');

// Update group picture
const imageBuffer = fs.readFileSync('./group-photo.jpg');
await wa.updateGroupPicture('group-id@g.us', imageBuffer);
```

## 📱 Chat Operations

### Archive and Pin Chats

```javascript
// Archive a chat
await wa.archiveChat('chat-id', true);

// Unarchive a chat
await wa.archiveChat('chat-id', false);

// Pin a chat
await wa.pinChat('chat-id', true);

// Unpin a chat
await wa.pinChat('chat-id', false);
```

### Mute Chats

```javascript
// Mute for 8 hours
await wa.muteChat('chat-id', true, 8 * 60 * 60 * 1000);

// Mute indefinitely
await wa.muteChat('chat-id', true);

// Unmute
await wa.muteChat('chat-id', false);
```

### Mark as Read

```javascript
// Mark specific message as read
await wa.markAsRead('chat-id', 'message-id');

// Mark all messages in chat as read
const messages = await wa.getMessages('chat-id');
for (const message of messages) {
  await wa.markAsRead('chat-id', message.id);
}
```

## 👤 Contact Management

### Block and Unblock

```javascript
// Block a contact
await wa.blockContact('1234567890@c.us', true);

// Unblock a contact
await wa.blockContact('1234567890@c.us', false);
```

### Update Profile

```javascript
// Update your name
await wa.updateProfile({ name: 'My New Name' });

// Update your status
await wa.updateProfile({ status: 'Hey there! I am using WhatsApp Core.' });

// Update profile picture
const avatarBuffer = fs.readFileSync('./avatar.jpg');
await wa.updateProfile({ avatar: avatarBuffer });
```

### Get User Info

```javascript
// Get user profile
const user = await wa.getUserProfile('1234567890@c.us');
console.log('User name:', user.name);
console.log('User status:', user.status);
```

## 🔄 Presence Management

### Update Presence

```javascript
// Set as available
await wa.updatePresence('available');

// Set as unavailable
await wa.updatePresence('unavailable');

// Show typing in specific chat
await wa.updatePresence('composing', 'chat-id');

// Stop typing
await wa.updatePresence('paused', 'chat-id');
```

### Typing Indicators

```javascript
// Show typing indicator
await wa.markTyping('chat-id', true);

// Hide typing indicator
await wa.markTyping('chat-id', false);
```

## 🔄 Event Handling

### Message Events

```javascript
// New message received
wa.on('message.new', (message) => {
  console.log('New message from:', message.sender);
  console.log('Content:', message.content);
});

// Message updated (status change)
wa.on('message.update', (message) => {
  console.log('Message status:', message.status);
});

// Message sent successfully
wa.on('message.sent', (message) => {
  console.log('Message sent:', message.id);
});

// Message reaction
wa.on('message.reaction', (data) => {
  console.log('Reaction:', data.emoji, 'on message:', data.messageId);
});
```

### Chat Events

```javascript
// Chat updated
wa.on('chat.update', (chat) => {
  console.log('Chat updated:', chat.name);
  console.log('Unread count:', chat.unreadCount);
});

// New chat created
wa.on('chat.new', (chat) => {
  console.log('New chat:', chat.name);
});
```

### Group Events

```javascript
// Group created
wa.on('group.created', (group) => {
  console.log('Group created:', group.name);
});

// Participants added
wa.on('group.participants.add', (data) => {
  console.log('Participants added to', data.groupId);
  console.log('New participants:', data.participants);
});

// Participants removed
wa.on('group.participants.remove', (data) => {
  console.log('Participants removed from', data.groupId);
});

// Admin rights changed
wa.on('group.participants.update', (data) => {
  console.log('Admin rights updated in', data.groupId);
});
```

### Presence Events

```javascript
// User presence updated
wa.on('presence.update', (data) => {
  console.log('User', data.userId, 'is', data.isOnline ? 'online' : 'offline');
  if (data.lastSeen) {
    console.log('Last seen:', new Date(data.lastSeen));
  }
});
```

### Connection Events

```javascript
// Connection state changed
wa.on('connection.update', (update) => {
  console.log('Connection state:', update.state);
});

// Authentication events
wa.on('auth.success', (data) => {
  console.log('Authenticated as:', data.user.name);
});

wa.on('auth.failure', (error) => {
  console.error('Authentication failed:', error);
});

// Ready to use
wa.on('ready', () => {
  console.log('WhatsApp Core is ready!');
});
```

## 🪝 Webhooks

Configure webhooks to receive events via HTTP:

```javascript
const wa = new WhatsAppCore({
  features: {
    webhooks: true
  },
  webhooks: {
    url: 'https://your-server.com/webhook',
    events: ['message.new', 'chat.update', 'group.created'],
    secret: 'your-webhook-secret'
  }
});
```

Your webhook endpoint will receive POST requests:

```javascript
// Express.js webhook handler
app.post('/webhook', (req, res) => {
  const { event, timestamp, data, signature } = req.body;
  
  // Verify signature (optional)
  const expectedSignature = crypto
    .createHmac('sha256', 'your-webhook-secret')
    .update(JSON.stringify({ event, timestamp, data }))
    .digest('hex');
    
  if (signature === expectedSignature) {
    console.log('Webhook event:', event);
    console.log('Event data:', data);
  }
  
  res.sendStatus(200);
});
```

## ⚙️ Configuration

### Complete Configuration Example

```javascript
const wa = new WhatsAppCore({
  auth: {
    qrAuth: true,              // Enable QR code authentication
    pairingCode: false,        // Enable pairing code authentication
    sessionPath: './session',  // Session storage path
    autoSave: true            // Auto-save sessions
  },
  
  connection: {
    retryCount: 5,            // Number of retry attempts
    retryDelay: 5000,         // Delay between retries (ms)
    keepAlive: true,          // Keep connection alive
    timeout: 30000            // Connection timeout (ms)
  },
  
  features: {
    messaging: true,          // Enable messaging
    media: true,             // Enable media messages
    groups: true,            // Enable group management
    status: true,            // Enable status updates
    webhooks: true           // Enable webhooks
  },
  
  webhooks: {
    url: 'https://your-server.com/webhook',
    events: ['message.new', 'chat.update'],
    secret: 'your-secret-key'
  }
});
```

### Authentication Options

```javascript
// QR Code only
const wa = new WhatsAppCore({
  auth: { qrAuth: true }
});

// Pairing Code only  
const wa = new WhatsAppCore({
  auth: { pairingCode: true }
});

// Both methods enabled
const wa = new WhatsAppCore({
  auth: { 
    qrAuth: true, 
    pairingCode: true 
  }
});
```

## 📡 Data Retrieval

### Get Chats

```javascript
// Get all chats
const chats = await wa.getChats();

// Filter chats
const groups = chats.filter(chat => chat.type === 'group');
const directMessages = chats.filter(chat => chat.type === 'dm');
const unreadChats = chats.filter(chat => chat.unreadCount > 0);
```

### Get Messages

```javascript
// Get recent messages from a chat
const messages = await wa.getMessages('chat-id', 50);

// Get messages before a specific message
const olderMessages = await wa.getMessages('chat-id', 25, 'before-message-id');

// Filter messages
const textMessages = messages.filter(msg => msg.type === 'text');
const mediaMessages = messages.filter(msg => ['image', 'video', 'audio'].includes(msg.type));
```

### Get Connection Status

```javascript
// Get current status
const status = wa.getStatus();
console.log('Connected:', status.connected);
console.log('Authenticated:', status.authenticated);
console.log('User:', status.user);
console.log('Chats count:', status.chats);
console.log('Messages count:', status.messages);
```

## 🔧 Utility Methods

### Message Helpers

```javascript
// Generate message ID
const messageId = wa.generateMessageId();

// Check if chat is group
const isGroup = wa.isGroupChat('chat-id@g.us'); // true
const isDM = wa.isGroupChat('phone@c.us'); // false

// Format phone number
const formatted = wa.formatPhoneNumber('+1 234 567 8900'); // 12345678900@c.us
```

### Session Helpers

```javascript
// Check session validity
const isValid = await wa.hasValidSession();

// Load existing session
await wa.loadSession();

// Save current session
await wa.saveSession();

// Clear session
await wa.clearSession();
```

## 🚨 Error Handling

### Connection Errors

```javascript
wa.on('error', (error) => {
  console.error('WhatsApp error:', error.message);
  
  // Handle specific error types
  switch (error.code) {
    case 'CONNECTION_LOST':
      console.log('Connection lost, will retry automatically...');
      break;
    case 'AUTH_FAILURE':
      console.log('Authentication failed, please re-authenticate');
      break;
    case 'RATE_LIMITED':
      console.log('Rate limited, slowing down requests...');
      break;
  }
});

wa.on('connection.failed', () => {
  console.log('Failed to connect after all retry attempts');
});
```

### Message Errors

```javascript
try {
  await wa.sendMessage('invalid-id', 'test');
} catch (error) {
  if (error.code === 'INVALID_JID') {
    console.log('Invalid phone number format');
  } else if (error.code === 'MESSAGE_FAILED') {
    console.log('Failed to send message');
  }
}
```

## 🧪 Testing Examples

### Run Examples

Check out the `examples/` directory for complete working examples:

```bash
# QR Code authentication example
node examples/qr-auth.js

# Pairing code authentication example  
node examples/pairing-auth.js

# Complete feature demonstration
node examples/complete-example.js

# Basic messaging bot
node examples/basic-bot.js
```

### Simple Bot Example

```javascript
import WhatsAppCore from '@ourorg/whatsapp-core';

const bot = new WhatsAppCore({
  auth: { qrAuth: true, sessionPath: './bot-session' }
});

// Auto-reply bot
bot.on('message.new', async (message) => {
  // Don't reply to own messages
  if (message.fromMe) return;
  
  // Don't reply in groups (optional)
  if (message.chat.includes('@g.us')) return;
  
  const text = message.content.text?.toLowerCase();
  
  if (text?.includes('hello')) {
    await bot.sendMessage(message.chat, 'Hello! How can I help you?');
  } else if (text?.includes('time')) {
    await bot.sendMessage(message.chat, `Current time: ${new Date().toLocaleString()}`);
  } else if (text?.includes('help')) {
    await bot.sendMessage(message.chat, 'Available commands: hello, time, help');
  }
});

await bot.connect();
console.log('Bot is running...');
```

## 🔐 Security Best Practices

### Session Security

```javascript
// Use secure session storage
const wa = new WhatsAppCore({
  auth: {
    sessionPath: './secure-session',
    encryption: true,
    encryptionKey: process.env.SESSION_ENCRYPTION_KEY
  }
});
```

### Webhook Security

```javascript
// Always verify webhook signatures
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
    
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}
```

### Environment Variables

```bash
# .env file
WHATSAPP_SESSION_PATH=/secure/path/to/session
WHATSAPP_ENCRYPTION_KEY=your-32-byte-encryption-key
WEBHOOK_SECRET=your-webhook-secret
WEBHOOK_URL=https://your-secure-server.com/webhook
```

## 📊 Performance Tips

### Batch Operations

```javascript
// Send multiple messages efficiently
const messages = [
  { chat: 'chat1@c.us', text: 'Message 1' },
  { chat: 'chat2@c.us', text: 'Message 2' },
  { chat: 'chat3@c.us', text: 'Message 3' }
];

// Add delay between messages to avoid rate limiting
for (const msg of messages) {
  await wa.sendMessage(msg.chat, msg.text);
  await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
}
```

### Memory Management

```javascript
// Limit message cache size
const wa = new WhatsAppCore({
  cache: {
    maxMessages: 1000,      // Keep only last 1000 messages
    maxChats: 100,          // Keep only last 100 chats
    cleanupInterval: 60000  // Cleanup every minute
  }
});
```

### Connection Optimization

```javascript
// Optimize for your use case
const wa = new WhatsAppCore({
  connection: {
    retryCount: 3,          // Fewer retries for faster failover
    retryDelay: 2000,       // Shorter delays
    keepAlive: true,        // Keep connection alive
    timeout: 15000          // Shorter timeout
  }
});
```

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/yourorg/whatsapp-core.git
cd whatsapp-core

# Install dependencies
npm install

# Run tests
npm test

# Build the project
npm run build

# Run examples
npm run example:qr
npm run example:pairing
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:auth
npm run test:messaging
npm run test:groups

# Run with coverage
npm run test:coverage
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This library is not affiliated with, endorsed by, or in any way officially connected with WhatsApp or Meta Platforms, Inc. WhatsApp is a trademark of Meta Platforms, Inc.

This is an unofficial library that implements the WhatsApp Web protocol through reverse engineering for educational and development purposes. Use at your own risk and ensure compliance with WhatsApp's Terms of Service.

## 🆘 Support

### Documentation

- [API Reference](docs/API.md)
- [Advanced Examples](docs/EXAMPLES.md)
- [Troubleshooting Guide](docs/TROUBLESHOOTING.md)
- [Migration Guide](docs/MIGRATION.md)

### Community

- [GitHub Issues](https://github.com/yourorg/whatsapp-core/issues)
- [Discord Server](https://discord.gg/whatsapp-core)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/whatsapp-core)

### Commercial Support

For commercial support, custom development, or enterprise licensing, please contact us at [support@yourorg.com](mailto:support@yourorg.com).

---

**Made with ❤️ by the WhatsApp Core team**

⭐ **Star this repo if you find it useful!**