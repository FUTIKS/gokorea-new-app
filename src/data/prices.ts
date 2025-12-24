// src/data/prices.ts
interface Prices {
  umumiy: string;
  firma: string;
  kurslar: string;
  hujjatlar: string;
}

export const prices: Prices = {
  umumiy: `💰 Koreyaga Ketguncha **Umumiy Xarajatlar** (To'liq shaffoflik):
- Konsalting: $0 - $500
- Application Fee: $0 - $200
- Kontrakt: $0 - $3,000
- Viza: $200
- KDB (Depozit Banki): $0 - $1,400
- Bilet: $600 - $1,000
- Kvartira (1-oy): $200 - $400

Jami Tahlil:
- **Eng kam xarajat:** ~$1,000
- **Eng yuqori xarajat:** ~$6,700
- **O'rtacha xarajat:** ~$5,000`,
  firma: `📄 **Go Korea Consulting Xizmatlari Narxlari** (Ikki bosqichli to'lov):
1. **Oldindan To'lov** (Shartnoma & Hujjatlar): **2,000,000 So'm**. Shartnoma imzolangan kuni to'lanadi.
2. **Oxirgi To'lov** (Firma Xizmati): **1,900 USD**. VIZA qo'lingizga olganinggizdan so'ng to'lanadi.

Konsalting Xizmatiga Kiritilganlar: Hujjat topshirish, qabul nazorati, viza olishda yordam. Hujjatlarni apostil, tarjima va boshqa kerakli xarajatlar oldindan to'lovga kiritilgan.`,
  kurslar: `📚 **Koreys Tili Kurslari (D-4 Viza):**
- **Davomiylik:** 6 oy (har bir daraja).
- **Boshlanish:** Mart, Iyun, Sentyabr, Dekabr (yiliga 4 marta).
- **Dars vaqti:** Haftada 5 kun, kuniga 4 soat (09:00 - 13:00).
- **Narx (bir semestr):** **1,500,000 KRW** (3 oy uchun).`,
  hujjatlar: `📄 **Asosiy Hujjat Talablari (Viza uchun):**
1. Zagran pasport (skaner), 2. ID yoki Yashil pasport (skaner), 3. Rasm 3x4 JPG (elektron, oq fonda), 4. Ota-ona pasportlari (skaner), 5. Metrika (skaner), 6. IELTS/TOPIK sertifikat (agar bo'lsa), 7. Diplom (asl).
*2025 Bitiruvchilar uchun: 1-7 semestr baholar va O'qishdan ma'lumotnoma talab qilinadi.*`,
};