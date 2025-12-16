// Telegram Bot - Hujjatlarni qabul qilish
// telegram-bot.js

const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Bot tokenini kiriting
const BOT_TOKEN = '8576990240:AAH6WI36cU1iJcqvz0YRnzz3KymgsFR3Ydc';
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Fayllar saqlanadigan papka
const DOWNLOAD_DIR = './downloads';

// Papka mavjud emasligini tekshirish
if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}

// Faylni yuklab olish funksiyasi
async function downloadFile(fileId, fileName) {
  try {
    const file = await bot.getFile(fileId);
    const filePath = file.file_path;
    const downloadUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;
    
    const localPath = path.join(DOWNLOAD_DIR, fileName);
    const fileStream = fs.createWriteStream(localPath);

    return new Promise((resolve, reject) => {
      https.get(downloadUrl, (response) => {
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          console.log(`✅ Fayl saqlandi: ${localPath}`);
          resolve(localPath);
        });
      }).on('error', (err) => {
        fs.unlink(localPath, () => {}); // O'chirib tashlash
        reject(err);
      });
    });
  } catch (error) {
    console.error('Faylni yuklab olishda xatolik:', error);
    throw error;
  }
}

// /start komandasi
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name;
  
  const welcomeMessage = `
Assalomu alaykum, ${firstName}! 👋

🤖 Men Hujjatlarni Qabul Qilish Botiman.

📋 **Vazifam:**
- ZIP arxivlarni qabul qilish
- Hujjatlarni saqlash
- Ma'lumotlarni bazaga kiritish

📌 **Sizning Chat ID:** \`${chatId}\`

💡 **Qo'llanma:**
1. Mini app dan ZIP fayl yarating
2. Shu botga yuboring
3. Men avtomatik qabul qilaman

Xizmatlarimizdan foydalanganingiz uchun rahmat! 🙏
  `;
  
  bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
});

// /help komandasi
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  
  const helpMessage = `
📚 **Yordam**

**Qo'llab-quvvatlanadigan formatlar:**
- ZIP arxivlar (.zip)
- PDF hujjatlar (.pdf)
- Rasmlar (.jpg, .png)
- Word fayllari (.doc, .docx)

**Maksimal fayl hajmi:** 50 MB

**Buyruqlar:**
/start - Botni ishga tushirish
/help - Yordam
/myid - Chat ID ni olish
/stats - Statistika

**Aloqa:** @your_support_username
  `;
  
  bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

// /myid komandasi - Chat ID ni ko'rsatish
bot.onText(/\/myid/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId, 
    `🆔 **Sizning Chat ID:**\n\`${chatId}\`\n\nBu ID ni mini app da ishlatishingiz mumkin.`,
    { parse_mode: 'Markdown' }
  );
});

// Hujjat qabul qilish
bot.on('document', async (msg) => {
  const chatId = msg.chat.id;
  const document = msg.document;
  const fileName = document.file_name;
  const fileSize = document.file_size;
  const fileId = document.file_id;
  
  console.log('\n📥 Yangi hujjat qabul qilindi:');
  console.log(`  📁 Fayl nomi: ${fileName}`);
  console.log(`  📊 Hajmi: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  👤 Foydalanuvchi: ${msg.from.first_name} (${chatId})`);
  
  try {
    // Yuklanish jarayonini bildirish
    await bot.sendMessage(chatId, '⏳ Fayl yuklanmoqda...');
    
    // Faylni yuklab olish
    const savedPath = await downloadFile(fileId, fileName);
    
    // Muvaffaqiyatli xabar
    const successMessage = `
✅ **Fayl muvaffaqiyatli qabul qilindi!**

📁 **Fayl:** ${fileName}
📊 **Hajmi:** ${(fileSize / 1024 / 1024).toFixed(2)} MB
💾 **Saqlangan:** ${path.basename(savedPath)}
📅 **Sana:** ${new Date().toLocaleString('uz-UZ')}

Hujjatingiz xavfsiz qabul qilindi va saqlanmoqda. ✅
    `;
    
    await bot.sendMessage(chatId, successMessage, { parse_mode: 'Markdown' });
    
    // Admin/moderatorlarga xabar yuborish (ixtiyoriy)
    // const ADMIN_CHAT_ID = 'YOUR_ADMIN_CHAT_ID';
    // await bot.sendMessage(
    //   ADMIN_CHAT_ID,
    //   `🔔 Yangi hujjat:\n📁 ${fileName}\n👤 ${msg.from.first_name}\n🆔 ${chatId}`
    // );
    
  } catch (error) {
    console.error('❌ Xatolik yuz berdi:', error);
    await bot.sendMessage(
      chatId,
      '❌ Kechirasiz, faylni qabul qilishda xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.'
    );
  }
});

// Foto qabul qilish
bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;
  const photo = msg.photo[msg.photo.length - 1]; // Eng yuqori sifatli rasm
  const fileId = photo.file_id;
  const fileName = `photo_${Date.now()}.jpg`;
  
  try {
    await bot.sendMessage(chatId, '⏳ Rasm yuklanmoqda...');
    const savedPath = await downloadFile(fileId, fileName);
    
    await bot.sendMessage(
      chatId,
      `✅ Rasm qabul qilindi!\n📁 ${path.basename(savedPath)}`
    );
  } catch (error) {
    console.error('Rasm yuklab olishda xatolik:', error);
    await bot.sendMessage(chatId, '❌ Rasmni qabul qilishda xatolik yuz berdi.');
  }
});

// Oddiy matn xabarlari
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  
  // Agar buyruq yoki fayl bo'lsa, ignore qilish
  if (msg.document || msg.photo || text?.startsWith('/')) {
    return;
  }
  
  // Oddiy xabar uchun javob
  bot.sendMessage(
    chatId,
    '📩 Xabaringiz qabul qilindi.\n\n' +
    'Hujjat yuklash uchun fayl yuboring yoki /help buyrug\'ini ishlating.'
  );
});

// Xatoliklarni tutish
bot.on('polling_error', (error) => {
  console.error('Polling xatolik:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
});

// Bot ishga tushdi
console.log('🤖 Telegram bot ishga tushdi!');
console.log('📡 Hujjatlar kutilmoqda...\n');

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Bot to\'xtatilmoqda...');
  bot.stopPolling();
  process.exit(0);
});

Package.json  
/
{
  "name": "telegram-document-bot",
  "version": "1.0.0",
  "description": "Telegram bot for receiving documents",
  "main": "telegram-bot.js",
  "scripts": {
    "start": "node telegram-bot.js",
    "dev": "nodemon telegram-bot.js"
  },
  "dependencies": {
    "node-telegram-bot-api": "^0.64.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.0"
  }
}


// O'rnatish:
// npm init -y
// npm install node-telegram-bot-api
// npm install --save-dev nodemon
// node telegram-bot.js