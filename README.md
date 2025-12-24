# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/b30a346d-d97b-4f54-a718-5b8c017cf05b

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/b30a346d-d97b-4f54-a718-5b8c017cf05b) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/b30a346d-d97b-4f54-a718-5b8c017cf05b) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
# 📁 Hujjatlar Boshqaruv Tizimi - Telegram Mini App

Consulting kompaniyalari uchun to'liq hujjatlar boshqaruv tizimi. React + Supabase + Telegram Bot.

---

## 🎯 Asosiy Xususiyatlar

### ✅ Bajarilgan Funksiyalar:

1. **📂 Papkalar Tizimi**
   - Admin har bir foydalanuvchi uchun papka yaratadi
   - Papka foydalanuvchi ismi bilan nomlanadi
   - Hujjatlar papkalarga tartibli joylashadi

2. **📋 Hujjat Holatlari**
   - ✅ **Tasdiqlangan** (approved) - Hujjat to'g'ri
   - 🔄 **Tekshirilmoqda** (pending) - Kutilmoqda
   - ⚠️ **To'liq emas** (incomplete) - O'zgartirish kerak + Admin izohi
   - ❌ **Rad etilgan** (rejected) - Noto'g'ri + Sabab

3. **🔄 PDF Konvertatsiya**
   - JPG → PDF (bitta rasm)
   - Ko'p rasmlarni bitta PDF ga birlashtirish
   - Real vaqtda ishlovchi konvertatsiya
   - Avtomatik yuklab olish

4. **📦 ZIP Export**
   - Barcha hujjatlarni ZIP ga joylashtirish
   - Telegram botga avtomatik yuborish
   - Oddiy yuklab olish

5. **✏️ Custom Nomlar**
   - Har bir hujjatga maxsus nom berish
   - O'qish oson bo'lishi uchun

6. **💾 Ma'lumotlar Saqlanadi**
   - Supabase database
   - Xavfsiz storage
   - Barcha tarix saqlanadi

---

## 🚀 O'rnatish

### 1. NPM Paketlarni O'rnatish

```bash
npm install jszip file-saver jspdf
```

yoki

```bash
yarn add jszip file-saver jspdf
```

### 2. Textarea Komponenti

Agar yo'q bo'lsa:

```bash
npx shadcn-ui@latest add textarea
```

### 3. Supabase Migration

`migration.sql` faylini Supabase SQL Editor da ishga tushiring:

1. Supabase Dashboard ga kiring
2. SQL Editor ga o'ting
3. `migration.sql` faylini nusxalang
4. Run tugmasini bosing

### 4. Telegram Bot Sozlash

#### Bot Yaratish:

1. Telegram da @BotFather ga o'ting
2. `/newbot` buyrug'ini yuboring
3. Bot nomini kiriting
4. Username kiriting (masalan: `my_documents_bot`)
5. Token oling: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`

#### Bot Kodini Ishga Tushirish:

```bash
# telegram-bot.js faylini oching
# BOT_TOKEN ni o'zgartiring

cd bot-folder
npm init -y
npm install node-telegram-bot-api
node telegram-bot.js
```

#### Chat ID Olish:

1. Botingizga `/start` yuboring
2. Bot sizning Chat ID ni ko'rsatadi
3. Bu ID ni mini app da ishlating

---

## 📖 Foydalanish Yo'riqnomasi

### 👨‍💼 Admin Uchun:

#### 1. Papka Yaratish
```
1. "Papka Yaratish" tugmasini bosing
2. Foydalanuvchi ismini kiriting
   Masalan: Alisher_Valiyev
3. Papka avtomatik ochiladi
```

#### 2. Hujjat Yuklash
```
1. "Yuklash" tugmasini bosing
2. Hujjat nomini kiriting (ixtiyoriy)
3. Faylni tanlang
4. Hujjat turini tanlang:
   - Pasport *
   - ID Karta *
   - Diploma *
   - Tibbiy Hujjat *
   - Shartnoma *
   - Boshqa
5. "Yuklash" tugmasini bosing
```

#### 3. Hujjat Holati O'zgartirish
```
1. Hujjat kartochkasida ✏️ tugmasini bosing
2. Yangi holatni tanlang:
   - ✅ Tasdiqlangan
   - 🔄 Tekshirilmoqda
   - ⚠️ To'liq emas (izoh qo'shing)
   - ❌ Rad etilgan (sabab yozing)
3. "Yangilash" tugmasini bosing
```

#### 4. ZIP Export
```
1. Barcha hujjatlar to'planganda
2. "ZIP Export" tugmasini bosing
3. Telegram bot ma'lumotlarini kiriting:
   - Bot Token
   - Chat ID
4. "ZIP va Botga Yuborish" ni bosing
5. Fayl avtomatik botga yuboriladi
```

### 👤 Foydalanuvchi Uchun:

```
1. O'z hujjatlaringizni yuklab boring
2. Hujjat holatini kuzatib boring
3. Agar ⚠️ bo'lsa, admin izohini o'qing
4. Kerakli o'zgarishlar kiritib qayta yuklang
5. ✅ belgisini kutib turing
```

---

## 📁 Fayl Tuzilishi

```
src/
├── components/
│   └── Documents.tsx          # Asosiy komponent
├── integrations/
│   └── supabase/
│       └── client.ts          # Supabase client
├── hooks/
│   ├── useAuth.ts            # Auth hook
│   └── use-toast.ts          # Toast notifications
└── lib/
    └── utils.ts              # Utility funksiyalar

database/
└── migration.sql             # Database migration

bot/
└── telegram-bot.js           # Telegram bot kodi

docs/
├── README.md                 # Ushbu fayl
└── SETUP_INSTRUCTIONS.md     # Batafsil yo'riqnoma
```

---

## 🗄️ Database Schema

### documents jadvali:

```sql
id              UUID PRIMARY KEY
user_id         UUID REFERENCES auth.users
file_name       TEXT
file_url        TEXT
file_type       TEXT (passport, id_card, contract, etc.)
file_size       BIGINT
status          TEXT (pending, approved, rejected, incomplete)
created_at      TIMESTAMP
admin_notes     TEXT (Admin izohlari)
rejection_reason TEXT (Rad etilish sababi)
folder_name     TEXT (Papka nomi)
custom_name     TEXT (Maxsus nom)
```

---

## 🔐 Xavfsizlik

### Row Level Security (RLS):

- ✅ Foydalanuvchi faqat o'z hujjatlarini ko'radi
- ✅ Foydalanuvchi faqat o'z papkasiga yuklaydi
- ✅ Admin barcha hujjatlarni boshqaradi
- ✅ Storage bucket xavfsizligi

### Telegram Bot:

- ⚠️ Bot tokenni hech qaerga joylashtirmang (environment variable ishlatilsin)
- ⚠️ Faqat ishonchli foydalanuvchilarga Chat ID bering
- ✅ SSL/TLS orqali fayllar yuboriladi

---

## 📊 Hujjatlar To'liqligi

Consulting kompaniyasi uchun majburiy hujjatlar:

1. ✅ Pasport
2. ✅ ID Karta  
3. ✅ Diploma
4. ✅ Tibbiy Hujjat
5. ✅ Shartnoma

Progress bar avtomatik hisoblanadi va ko'rsatiladi.

---

## 🛠️ Texnologiyalar

- **Frontend:** React, TypeScript, Tailwind CSS
- **UI Library:** shadcn/ui
- **Backend:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage
- **PDF Library:** jsPDF
- **ZIP Library:** JSZip
- **File Saver:** file-saver
- **Bot:** node-telegram-bot-api

---

## 🐛 Muammolarni Hal Qilish

### Hujjat yuklanmayapti?
```
- Fayl hajmi 10MB dan kichik bo'lishi kerak
- Internet tezligini tekshiring
- Supabase Storage ni tekshiring
```

### PDF konvertatsiya ishlamayapti?
```
- Browser yangilangan bo'lishi kerak
- Console da xatolarni tekshiring
- Rasm formati to'g'ri bo'lishi kerak (JPG, PNG)
```

### ZIP botga yuborilmayapti?
```
- Bot token to'g'ri bo'lishi kerak
- Chat ID to'g'ri bo'lishi kerak
- Bot ishlab turishi kerak (node telegram-bot.js)
- Internet tezligini tekshiring
```

### Papka ko'rinmayapti?
```
- Papka nomida bo'sh joy bo'lmasligi kerak
- Database migration ishga tushgan bo'lishi kerak
- Browser cache ni tozalang
```

---

## 📞 Yordam

Savollar bo'lsa:

- 📧 Email: support@yourcompany.com
- 💬 Telegram: @your_support_bot
- 🌐 Website: https://yourcompany.com

---

## 📝 Litsenziya

MIT License - O'z kompaniyangizda erkin foydalaning

---

## 🎉 Yakuniy Izohlar

Ushbu tizim consulting kompaniyalar uchun to'liq ishlab chiqilgan professional yechimdir. Barcha asosiy funksiyalar bajarilgan:

✅ Papkalar tizimi
✅ Hujjat holatlari
✅ PDF konvertatsiya
✅ ZIP export
✅ Telegram bot integratsiyasi
✅ Admin panel
✅ Xavfsizlik

**Omad tilaymiz!** 🚀