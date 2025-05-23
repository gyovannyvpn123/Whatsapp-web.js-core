#!/usr/bin/env node

/**
 * Complete WhatsApp Core Example
 * 
 * Demonstrates all features of @ourorg/whatsapp-core:
 * - QR Code & Pairing Code Authentication
 * - Complete Messaging (Text, Media, Reactions)
 * - Chat & Group Management
 * - Event Handling & Webhooks
 * - Contact Management
 * - Status Updates
 */

import WhatsAppCore, { WhatsAppConfig, WAMessage, WAChat, WAUser } from '../src/whatsapp-core';
import { promises as fs } from 'fs';

// Complete configuration showcasing all features
const config: WhatsAppConfig = {
  auth: {
    qrAuth: true,           // Enable QR code authentication
    pairingCode: false,     // Disable pairing code (can enable both)
    sessionPath: './session', // Save session for auto-login
    autoSave: true          // Auto-save session
  },
  
  connection: {
    retryCount: 5,          // Retry connection 5 times
    retryDelay: 5000,       // Wait 5 seconds between retries
    keepAlive: true,        // Keep connection alive with heartbeat
    timeout: 30000          // 30 second connection timeout
  },
  
  features: {
    messaging: true,        // Enable messaging
    media: true,           // Enable media messages
    groups: true,          // Enable group management
    status: true,          // Enable status updates
    webhooks: true         // Enable webhooks
  },
  
  webhooks: {
    url: 'http://localhost:3000/webhook',
    events: ['message.new', 'chat.update', 'group.created'],
    secret: 'your-webhook-secret-key'
  }
};

class WhatsAppDemo {
  private wa: WhatsAppCore;
  
  constructor() {
    this.wa = new WhatsAppCore(config);
    this.setupEventHandlers();
  }

  /**
   * Setup comprehensive event handlers
   */
  private setupEventHandlers(): void {
    console.log('🎭 Setting up event handlers...\n');

    // Connection Events
    this.wa.on('connection.update', (update) => {
      console.log('🔌 Connection:', update.state);
      if (update.state === 'connected') {
        console.log('✅ Successfully connected to WhatsApp Web!');
      }
    });

    // Authentication Events
    this.wa.on('qr', (qrString) => {
      console.log('\n🔲 QR CODE GENERATED:');
      console.log('═══════════════════════════════════════');
      console.log(qrString);
      console.log('═══════════════════════════════════════');
      console.log('📱 Scan this QR code with WhatsApp on your phone');
      console.log('💡 Go to Settings > Linked Devices > Link a Device\n');
      
      // Save QR code to file for external QR generators
      fs.writeFile('./qr-code.txt', qrString).catch(console.error);
      
      // You could also generate a visual QR code here using libraries like 'qrcode'
      this.generateVisualQR(qrString);
    });

    this.wa.on('pairing.code', (data) => {
      console.log('\n🔑 PAIRING CODE GENERATED:');
      console.log('═══════════════════════════════════════');
      console.log(`    ${data.code}    `);
      console.log('═══════════════════════════════════════');
      console.log('📱 Enter this code on your phone in WhatsApp');
      console.log('💡 Go to Settings > Linked Devices > Link with Phone Number\n');
    });

    this.wa.on('auth.success', (data) => {
      console.log('🎉 Authentication successful!');
      console.log('👤 Logged in as:', data.user.name, `(${data.user.id})`);
      console.log('📱 Phone:', data.user.phone);
      console.log('');
    });

    this.wa.on('ready', () => {
      console.log('🚀 WhatsApp Core is ready!');
      console.log('✨ You can now send messages, manage chats, and use all features\n');
      
      // Start demonstration
      this.startDemo();
    });

    // Message Events
    this.wa.on('message.new', (message: WAMessage) => {
      console.log('📨 New message received:');
      console.log(`   From: ${message.sender}`);
      console.log(`   Chat: ${message.chat}`);
      console.log(`   Type: ${message.type}`);
      if (message.type === 'text') {
        console.log(`   Text: ${message.content.text}`);
      }
      console.log(`   Time: ${new Date(message.timestamp).toLocaleString()}`);
      console.log('');
      
      // Auto-reply to text messages (demo feature)
      this.handleAutoReply(message);
    });

    this.wa.on('message.sent', (message: WAMessage) => {
      console.log('📤 Message sent successfully:');
      console.log(`   To: ${message.chat}`);
      console.log(`   Type: ${message.type}`);
      console.log(`   ID: ${message.id}`);
      console.log('');
    });

    this.wa.on('message.update', (message: WAMessage) => {
      console.log('📋 Message updated:');
      console.log(`   ID: ${message.id}`);
      console.log(`   Status: ${message.status}`);
      console.log('');
    });

    this.wa.on('message.reaction', (data) => {
      console.log('😊 Message reaction:');
      console.log(`   Message: ${data.messageId}`);
      console.log(`   Emoji: ${data.emoji}`);
      console.log(`   From: ${data.from}`);
      console.log('');
    });

    // Chat Events
    this.wa.on('chat.update', (chat: WAChat) => {
      console.log('💬 Chat updated:');
      console.log(`   Name: ${chat.name}`);
      console.log(`   Type: ${chat.type}`);
      console.log(`   Unread: ${chat.unreadCount}`);
      console.log('');
    });

    // Group Events
    this.wa.on('group.created', (group: WAChat) => {
      console.log('👥 Group created:');
      console.log(`   Name: ${group.name}`);
      console.log(`   ID: ${group.id}`);
      console.log(`   Participants: ${group.participants?.length || 0}`);
      console.log('');
    });

    this.wa.on('group.participants.add', (data) => {
      console.log('👤 Participants added to group:');
      console.log(`   Group: ${data.groupId}`);
      console.log(`   Added: ${data.participants.join(', ')}`);
      console.log('');
    });

    // Presence Events
    this.wa.on('presence.update', (data) => {
      console.log('👁️ Presence update:');
      console.log(`   User: ${data.userId}`);
      console.log(`   Online: ${data.isOnline ? 'Yes' : 'No'}`);
      if (data.lastSeen) {
        console.log(`   Last seen: ${new Date(data.lastSeen).toLocaleString()}`);
      }
      console.log('');
    });

    // Contact Events
    this.wa.on('contact.update', (data) => {
      console.log('📱 Contact updated:');
      console.log(`   Contact: ${data.contactId}`);
      console.log(`   Blocked: ${data.blocked ? 'Yes' : 'No'}`);
      console.log('');
    });

    // User Events
    this.wa.on('user.update', (user: WAUser) => {
      console.log('👤 User profile updated:');
      console.log(`   Name: ${user.name}`);
      console.log(`   Status: ${user.status || 'No status'}`);
      console.log('');
    });

    // Error Events
    this.wa.on('error', (error) => {
      console.error('❌ Error:', error.message);
    });

    this.wa.on('connection.failed', () => {
      console.error('❌ Connection failed after all retry attempts');
    });
  }

  /**
   * Generate visual QR code (placeholder for actual QR generation)
   */
  private async generateVisualQR(qrString: string): Promise<void> {
    // In a real implementation, you would use a library like 'qrcode' to generate visual QR
    console.log('💡 Tip: Install qrcode library to generate visual QR codes:');
    console.log('   npm install qrcode');
    console.log('   Then use: qrcode.toFile("qr.png", qrString)');
    console.log('');
  }

  /**
   * Handle auto-reply to incoming messages (demo feature)
   */
  private async handleAutoReply(message: WAMessage): Promise<void> {
    // Don't reply to own messages
    if (message.fromMe) return;
    
    // Don't reply to group messages (for demo)
    if (message.chat.includes('@g.us')) return;
    
    const text = message.content.text?.toLowerCase();
    
    if (text?.includes('hello') || text?.includes('hi')) {
      await this.wa.sendMessage(message.chat, '👋 Hello! This is an auto-reply from WhatsApp Core demo!');
    } else if (text?.includes('help')) {
      const helpText = `🤖 WhatsApp Core Demo Bot

Available commands:
• hello - Get a greeting
• help - Show this help
• status - Get bot status
• demo - Run feature demo

This bot demonstrates the WhatsApp Core library capabilities!`;
      
      await this.wa.sendMessage(message.chat, helpText);
    } else if (text?.includes('status')) {
      const status = this.wa.getStatus();
      const statusText = `📊 Bot Status:
• Connected: ${status.connected ? '✅' : '❌'}
• Authenticated: ${status.authenticated ? '✅' : '❌'}
• Chats: ${status.chats}
• Messages: ${status.messages}
• Contacts: ${status.contacts}`;
      
      await this.wa.sendMessage(message.chat, statusText);
    } else if (text?.includes('demo')) {
      await this.runFeatureDemo(message.chat);
    }
  }

  /**
   * Start comprehensive demo of all features
   */
  private async startDemo(): Promise<void> {
    console.log('🎬 Starting WhatsApp Core feature demonstration...\n');
    
    try {
      // Wait a bit for initialization
      await this.delay(2000);
      
      // Demo 1: Get chats
      console.log('📋 Demo 1: Getting all chats...');
      const chats = await this.wa.getChats();
      console.log(`   Found ${chats.length} chats`);
      
      if (chats.length > 0) {
        const firstChat = chats[0];
        console.log(`   First chat: ${firstChat.name} (${firstChat.type})`);
        
        // Demo 2: Get messages from first chat
        console.log('\n📋 Demo 2: Getting messages from first chat...');
        const messages = await this.wa.getMessages(firstChat.id, 10);
        console.log(`   Found ${messages.length} recent messages`);
        
        // Demo 3: Send a demo message
        console.log('\n📋 Demo 3: Sending demo message...');
        await this.wa.sendMessage(firstChat.id, '🤖 Hello from WhatsApp Core! This is a demo message.');
        
        // Demo 4: Update presence (typing indicator)
        console.log('\n📋 Demo 4: Updating presence...');
        await this.wa.updatePresence('composing', firstChat.id);
        await this.delay(2000);
        await this.wa.updatePresence('paused', firstChat.id);
        
        // Demo 5: Mark message as read
        if (messages.length > 0) {
          console.log('\n📋 Demo 5: Marking message as read...');
          await this.wa.markAsRead(firstChat.id, messages[0].id);
        }
      }
      
      // Demo 6: Update own profile
      console.log('\n📋 Demo 6: Updating profile...');
      await this.wa.updateProfile({
        name: 'WhatsApp Core Demo',
        status: '🤖 Powered by @ourorg/whatsapp-core'
      });
      
      console.log('✅ All demos completed successfully!\n');
      
    } catch (error) {
      console.error('❌ Demo error:', error);
    }
  }

  /**
   * Run comprehensive feature demo for a specific chat
   */
  private async runFeatureDemo(chatId: string): Promise<void> {
    try {
      await this.wa.sendMessage(chatId, '🎬 Starting feature demonstration...');
      
      // Demo messaging features
      await this.delay(1000);
      await this.wa.sendMessage(chatId, '✨ This demonstrates text messaging');
      
      await this.delay(1000);
      await this.wa.sendMessage(chatId, '📋 Features available:\n• Text messages ✅\n• Media messages ✅\n• Reactions ✅\n• Group management ✅\n• Chat operations ✅');
      
      // Demo reactions
      await this.delay(1000);
      const reactionMsg = await this.wa.sendMessage(chatId, '👍 React to this message!');
      
      // Auto-react after a moment
      setTimeout(async () => {
        await this.wa.reactToMessage(reactionMsg.id, '🎉');
      }, 2000);
      
      await this.delay(1000);
      await this.wa.sendMessage(chatId, '✅ Demo completed! WhatsApp Core is fully functional.');
      
    } catch (error) {
      await this.wa.sendMessage(chatId, '❌ Demo error: ' + error.message);
    }
  }

  /**
   * Start the WhatsApp Core connection
   */
  async start(): Promise<void> {
    console.log('🚀 Starting WhatsApp Core Demo...\n');
    
    try {
      await this.wa.connect();
    } catch (error) {
      console.error('❌ Failed to connect:', error);
    }
  }

  /**
   * Demonstrate group management features
   */
  async demonstrateGroupFeatures(): Promise<void> {
    console.log('👥 Demonstrating group management features...\n');
    
    try {
      // Create a demo group
      const participants = ['1234567890@c.us']; // Replace with real numbers
      const group = await this.wa.createGroup('WhatsApp Core Demo Group', participants);
      console.log('✅ Created group:', group.name);
      
      // Send message to group
      await this.wa.sendMessage(group.id, '🎉 Welcome to the WhatsApp Core demo group!');
      
      // Update group (examples)
      await this.wa.sendMessage(group.id, '📋 Group features available:\n• Add/remove participants\n• Set admins\n• Update group info\n• Send media\n• And much more!');
      
    } catch (error) {
      console.error('❌ Group demo error:', error);
    }
  }

  /**
   * Demonstrate media features
   */
  async demonstrateMediaFeatures(): Promise<void> {
    console.log('📎 Demonstrating media features...\n');
    
    // Note: In a real implementation, you would provide actual media files
    console.log('💡 Media features available:');
    console.log('   • Image messages (.jpg, .png, .gif)');
    console.log('   • Video messages (.mp4, .mov)');
    console.log('   • Audio messages (.mp3, .wav, voice notes)');
    console.log('   • Document messages (.pdf, .doc, .txt)');
    console.log('   • Sticker messages');
    console.log('   • Location sharing');
    console.log('');
    console.log('📝 To send media, use:');
    console.log('   await wa.sendMediaMessage(chatId, mediaBuffer, { type: "image", caption: "Hello!" })');
    console.log('');
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    console.log('\n🛑 Shutting down WhatsApp Core...');
    this.wa.disconnect();
    console.log('✅ Shutdown complete');
  }
}

// Main execution
async function main() {
  const demo = new WhatsAppDemo();
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    await demo.shutdown();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    await demo.shutdown();
    process.exit(0);
  });
  
  // Start the demo
  await demo.start();
}

// Run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { WhatsAppDemo };
export default WhatsAppDemo;