require('dotenv').config();
const mongoose = require('mongoose');
const Message = require('./models/Message');

async function viewRecentMessages() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Calculate date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    console.log(`📅 Fetching messages from the past week (since ${sevenDaysAgo.toLocaleString()})\n`);
    console.log('='.repeat(80));

    // Query messages from the past week
    const messages = await Message.find({
      createdAt: { $gte: sevenDaysAgo }
    })
    .populate('sender', 'username firstName lastName email')
    .populate('recipient', 'username firstName lastName email')
    .sort({ createdAt: -1 });

    if (messages.length === 0) {
      console.log('\n❌ No messages found in the past week.');
    } else {
      console.log(`\n✅ Found ${messages.length} message(s) in the past week:\n`);

      messages.forEach((msg, index) => {
        const senderName = msg.sender 
          ? `${msg.sender.firstName || msg.sender.username} ${msg.sender.lastName || ''}`.trim()
          : 'Unknown';
        const senderEmail = msg.sender?.email || 'N/A';
        
        const recipientName = msg.recipient 
          ? `${msg.recipient.firstName || msg.recipient.username} ${msg.recipient.lastName || ''}`.trim()
          : 'Unknown';
        const recipientEmail = msg.recipient?.email || 'N/A';

        console.log(`\n${'─'.repeat(80)}`);
        console.log(`📧 Message #${index + 1}`);
        console.log(`${'─'.repeat(80)}`);
        console.log(`📤 From: ${senderName} (${senderEmail})`);
        console.log(`📥 To: ${recipientName} (${recipientEmail})`);
        console.log(`📅 Date: ${msg.createdAt.toLocaleString()}`);
        console.log(`📋 Subject: ${msg.subject}`);
        console.log(`${msg.isRead ? '✅' : '📬'} Status: ${msg.isRead ? 'Read' : 'Unread'}`);
        if (msg.readAt) {
          console.log(`👁️  Read at: ${msg.readAt.toLocaleString()}`);
        }
        console.log(`\n💬 Content:`);
        console.log(`${'-'.repeat(80)}`);
        console.log(msg.content);
        console.log(`${'-'.repeat(80)}`);
      });

      console.log(`\n${'='.repeat(80)}`);
      console.log(`\n📊 Summary:`);
      console.log(`   Total messages: ${messages.length}`);
      console.log(`   Unread: ${messages.filter(m => !m.isRead).length}`);
      console.log(`   Read: ${messages.filter(m => m.isRead).length}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed.');
  }
}

viewRecentMessages();



