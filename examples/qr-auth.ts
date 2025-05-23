/**
 * QR Code authentication example for @ourorg/whatsapp-core
 * 
 * Demonstrates QR code generation, display, and authentication flow
 */

import { WhatsAppClient, DEFAULT_CONFIG, Logger } from '../src';
import { promises as fs } from 'fs';

// You can install 'qrcode' package for QR generation: npm install qrcode @types/qrcode
// import * as QRCode from 'qrcode';

async function qrAuthExample() {
  // Configure logging
  Logger.configure({
    level: 'info',
    enableConsole: true,
    includeTimestamp: true,
    includeLevel: true,
    includeModule: true
  });

  const logger = new Logger('QRAuthExample');
  logger.info('Starting QR Authentication example...');

  // Create WhatsApp client
  const client = new WhatsAppClient({
    ...DEFAULT_CONFIG,
    logLevel: 'info',
    qrTimeout: 120000, // 2 minutes timeout for QR scanning
  });

  let qrCount = 0;
  let authAttempts = 0;

  // Handle QR code generation
  client.on('auth.qr', async (qrData) => {
    qrCount++;
    logger.info(`QR Code generated (${qrCount})`);
    logger.info('QR Data:', qrData);

    try {
      // Generate QR code image (uncomment if you have qrcode package installed)
      /*
      const qrImagePath = `./qr-code-${qrCount}.png`;
      await QRCode.toFile(qrImagePath, qrData, {
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 256
      });
      logger.info(`QR code saved to: ${qrImagePath}`);
      */

      // Generate ASCII QR code for terminal display
      /*
      const qrAscii = await QRCode.toString(qrData, { type: 'terminal' });
      console.log('\n--- SCAN THIS QR CODE WITH WHATSAPP ---');
      console.log(qrAscii);
      console.log('--- SCAN THIS QR CODE WITH WHATSAPP ---\n');
      */

      // For this example, we'll just display the raw QR data
      console.log('\n=== QR CODE DATA ===');
      console.log('Please scan this with your WhatsApp mobile app:');
      console.log(qrData);
      console.log('===================\n');

      // Save QR data to file for external QR generation
      await fs.writeFile(`./qr-data-${qrCount}.txt`, qrData);
      logger.info(`QR data saved to: ./qr-data-${qrCount}.txt`);

    } catch (error) {
      logger.error('Failed to process QR code:', error);
    }
  });

  // Handle successful authentication
  client.on('auth.success', (user) => {
    logger.info('🎉 Authentication successful!');
    logger.info(`Welcome, ${user.name || user.notify || user.id.user}!`);
    logger.info(`User ID: ${user.id.full}`);
    
    if (user.picture) {
      logger.info(`Profile picture: ${user.picture}`);
    }
  });

  // Handle authentication failure
  client.on('auth.failure', (error) => {
    authAttempts++;
    logger.error(`❌ Authentication failed (attempt ${authAttempts}):`, error.message);
    
    if (authAttempts >= 3) {
      logger.error('Maximum authentication attempts reached. Exiting...');
      process.exit(1);
    } else {
      logger.info('Retrying authentication...');
    }
  });

  // Handle connection state changes
  client.on('connection.update', ({ state, lastDisconnect }) => {
    logger.info(`📡 Connection state: ${state}`);
    
    switch (state) {
      case 'connecting':
        logger.info('🔄 Connecting to WhatsApp servers...');
        break;
      case 'connected':
        logger.info('✅ Connected to WhatsApp servers');
        logger.info('📱 Please scan the QR code with your phone');
        break;
      case 'authenticating':
        logger.info('🔐 Authenticating with WhatsApp...');
        break;
      case 'authenticated':
        logger.info('✅ Successfully authenticated!');
        break;
      case 'disconnected':
        logger.warn('❌ Disconnected from WhatsApp');
        if (lastDisconnect) {
          logger.error('Disconnect reason:', lastDisconnect.message);
        }
        break;
      case 'reconnecting':
        logger.info('🔄 Attempting to reconnect...');
        break;
    }
  });

  // Handle errors
  client.on('error', (error) => {
    logger.error('❌ Client error:', error);
  });

  // Handle first message after authentication
  let firstMessage = true;
  client.on('message.new', (message) => {
    if (firstMessage) {
      logger.info('📧 First message received - client is fully operational!');
      firstMessage = false;
    }
    
    if (!message.fromMe) {
      logger.info(`📨 Message from ${message.sender?.full}: ${message.content.text}`);
    }
  });

  try {
    logger.info('🚀 Starting WhatsApp Web client...');
    logger.info('📋 Steps to authenticate:');
    logger.info('   1. Wait for QR code to be generated');
    logger.info('   2. Open WhatsApp on your phone');
    logger.info('   3. Go to Settings > Linked Devices > Link a Device');
    logger.info('   4. Scan the QR code displayed below');
    logger.info('');

    // Start the connection process
    await client.connect();

    // Success message
    logger.info('🎉 Client connected and authenticated successfully!');
    logger.info('📱 Your WhatsApp Web client is now ready to use');
    
    // Keep the process running
    logger.info('✋ Press Ctrl+C to disconnect and exit');

    // Handle graceful shutdown
    const shutdown = async () => {
      logger.info('🛑 Shutting down...');
      
      try {
        client.disconnect();
        logger.info('✅ Disconnected successfully');
      } catch (error) {
        logger.error('❌ Error during shutdown:', error);
      }
      
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    // Prevent the process from exiting
    setInterval(() => {
      // Keep alive
    }, 1000);

  } catch (error) {
    logger.error('❌ Failed to connect:', error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('timeout')) {
      logger.error('⏰ QR code scan timeout. Please try again.');
      logger.info('💡 Tips:');
      logger.info('   - Make sure your phone is connected to the internet');
      logger.info('   - Check that WhatsApp is up to date');
      logger.info('   - Try scanning the QR code faster');
    } else if (errorMessage.includes('authentication')) {
      logger.error('🔐 Authentication failed. Please try again.');
      logger.info('💡 Tips:');
      logger.info('   - Make sure you\'re scanning the correct QR code');
      logger.info('   - Try logging out of other WhatsApp Web sessions');
    }
    
    process.exit(1);
  }
}

// Add helper function to clean up QR files
async function cleanupQRFiles() {
  try {
    const files = await fs.readdir('./');
    const qrFiles = files.filter(file => 
      file.startsWith('qr-code-') || file.startsWith('qr-data-')
    );
    
    for (const file of qrFiles) {
      await fs.unlink(file);
    }
    
    if (qrFiles.length > 0) {
      console.log(`Cleaned up ${qrFiles.length} QR files`);
    }
  } catch (error) {
    // Ignore cleanup errors
  }
}

// Run the example
if (require.main === module) {
  // Clean up old QR files before starting
  cleanupQRFiles().then(() => {
    qrAuthExample().catch((error) => {
      console.error('QR Auth example failed:', error);
      process.exit(1);
    });
  });
}

export { qrAuthExample };
