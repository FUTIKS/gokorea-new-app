import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client"; // Agar ishlatilsa
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast"; // Agar ishlatilsa
import { 
  Send, Mic, MicOff, Bot, User, FileDown, Calculator, Volume2, 
  VolumeX, AlertCircle, Headphones, Image as ImageIcon 
} from "lucide-react";
import { cn } from "@/lib/utils";

// =========================================================================================
// YAGILANGAN BILIMLAR BAZASI (KNOWLEDGE BASE) - Sizning ma'lumotlaringiz kiritilgan qism
// =========================================================================================

const knowledgeBase = {
  narxlar: {
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
  },
  universitetlar: [
    { 
      name: "Woosuk Universiteti", 
      command: "CMD_UNI_WOOSUK", 
      shahar: "Jeonju (Wanju County)", 
      kontrakt: "$2,200 - $2,500 / semestr", 
      image: "/images/woosuk.jpg", 
      details: `
    Tashkil topgan: 1979 | Talabalar soni: ~12,000

    ✨ **Asosiy Yo'nalishlar:** Biznes va Menejment, Turizm va Mehmondo'stlik, Xalqaro Munosabatlar, IT va Kompyuter Fanlari, Muhandislik, Farmatsevtika.

    🏠 **Yotoqxona:** $380 - $620 / semestr

    ⭐ **Afzalliklari:**
    - Past narx va qulay yashash sharoiti
    - 3 yillik Turizm dasturi mavjud
    - Part-time ish imkoniyati

    **Qabul:** Standart hujjat (Intervyu yo'q)
    
    📌 **Universitet manzili:** 66 Daehak-ro, Wanju-gun, Jeollabuk-do, South Korea
  ` 
    },
    { 
      name: "BUFS (Busan Xorijiy Tillar Universiteti)", 
      command: "CMD_UNI_BUFS", 
      shahar: "Busan", 
      kontrakt: "$2,400 - $2,600 / semestr", 
      image: "/images/bufs.jpg", 
      details: `
    Tashkil topgan: 1981 | Talabalar soni: ~8,500

    ✨ **Asosiy Yo'nalishlar:** Xorijiy Tillar (20+ til), Xalqaro Munosabatlar, Tarjimonlik va Tarjima, Xalqaro Biznes, IT va Dasturlash, Turizm va Mehmondo'stlik.

    🏠 **Yotoqxona:** $800 - $1,200 / semestr

    ⭐ **Afzalliklari:**
    - **20+ til kurslari** mavjud
    - Dengiz bo'yida joylashgan go'zal shahar
    - **Intervyu asosida qabul** (imtihon yo'q)
    - 94 ta universitetlar bilan hamkorlik dasturlari

    **Qabul:** Intervyu asosida qabul (Imtihon yo'q)
    
    📌 **Universitet manzili:** 65 Geumsaem-ro 485beon-gil, Geumjeong-gu, Busan, South Korea
  ` 
    },
    { 
      name: "Baekseok Universiteti", 
      command: "CMD_UNI_BAEKSEOK", 
      shahar: "Cheonan", 
      kontrakt: "$2,500 - $2,700 / semestr", 
      image: "/images/baekseok.jpg", 
      details: `
    Tashkil topgan: 1994 | Talabalar soni: ~14,000

    ✨ **Asosiy Yo'nalishlar:** Biznes Administratsiya, Muhandislik (Mexanika, Elektr), Ijtimoiy Fanlar, Pedagogika, Musiqiy Ta'lim, Kompyuter Injiniring.

    🏠 **Yotoqxona:** $600 - $900 / semestr

    ⭐ **Afzalliklari:**
    - Seulga 1 soat masofada
    - Zamonaviy kampus va laboratoriyalar
    - Arzon yashash xarajatlari

    **Qabul:** Standart hujjat
    
    📌 **Universitet manzili:** 76 Munam-ro, Dongnam-gu, Cheonan-si, Chungcheongnam-do, South Korea
  ` 
    },
    { 
      name: "Daeshin Universiteti", 
      command: "CMD_UNI_DAESHIN", 
      shahar: "Gyeongsan (Daegu yaqinida)", 
      kontrakt: "$2,600 - $2,800 / semestr", 
      image: "/images/daeshin.jpg", 
      details: `
    Tashkil topgan: 1991 | Talabalar soni: ~3,500

    ✨ **Asosiy Yo'nalishlar:** Ijtimoiy Fanlar, Teologiya, Musiqiy Ta'lim, Bolalar Rivojlanishi, Sport va Jismoniy Tarbiya, Ofisiant va Mehmondo'stlik.

    🏠 **Yotoqxona:** $500 - $750 / semestr

    ⭐ **Afzalliklari:**
    - Tinch shahar, yashash arzon
    - Kichik kampus, individual e'tibor
    - **Intervyu asosida qabul**
    - Qulay yotoqxona narxlari

    **Qabul:** Intervyu asosida qabul
    
    📌 **Universitet manzili:** 39 Daeshin-ro, Gyeongsan-si, Gyeongsangbuk-do, South Korea
  ` 
    },
    { 
      name: "Sungkyul Universiteti", 
      command: "CMD_UNI_SUNGKYUL", 
      shahar: "Anyang", 
      kontrakt: "$2,600 - $2,800 / semestr", 
      image: "/images/sungkyul.jpg", 
      details: `
    Tashkil topgan: 1962 | Talabalar soni: ~7,000

    ✨ **Asosiy Yo'nalishlar:** Koreys Tili va Adabiyoti, Xalqaro Munosabatlar, Biznes va Iqtisod, Ijtimoiy Ish, Tarix va Madaniyat, Media va Kommunikatsiya.

    🏠 **Yotoqxona:** $700 - $1,000 / 1 semestr

    ⭐ **Afzalliklari:**
    - Kichik kampus, shaxsiy yondashuv
    - Arzon turar joylar atrofida
    - Yaxshi transport aloqasi

    **Qabul:** Standart hujjat
    
    📌 **Universitet manzili:** 53 Sungkyuldaehak-ro, Manan-gu, Anyang-si, Gyeonggi-do, South Korea
  ` 
    },
    { 
      name: "Singyeongju Universiteti", 
      command: "CMD_UNI_SINGYEONGJU", 
      shahar: "Gyeongju", 
      kontrakt: "$2,800 - $3,000 / semestr", 
      image: "/images/singyeongju.jpg", 
      details: `
    Tashkil topgan: 1994 | Talabalar soni: ~4,000

    ✨ **Asosiy Yo'nalishlar:** Tarix va Arxeologiya, Turizm va Madaniyat, Hotel Menejment, Koreys Madaniyati, Biznes Administratsiya, Sport Menejmenti.

    🏠 **Yotoqxona:** $600 - $850 / semestr

    ⭐ **Afzalliklari:**
    - Tarixiy shahar (**UNESCO merosi**)
    - Madaniyat va an'analarni o'rganish
    - Qulay yashash narxlari
    - Tinch va xavfsiz muhit
    - Turizm yo'nalishi kuchli

    **Qabul:** Standart hujjat
    
    📌 **Universitet manzili:** 188 Taejong-ro, Gyeongju-si, Gyeongsangbuk-do, South Korea
  ` 
    },
    { 
      name: "Hansung Universiteti", 
      command: "CMD_UNI_HANSUNG", 
      shahar: "Seoul", 
      kontrakt: "$3,200 - $3,400 / semestr", 
      image: "/images/hansung.jpg", 
      details: `
    Tashkil topgan: 1972 | Talabalar soni: ~6,500

    ✨ **Asosiy Yo'nalishlar:** Dizayn va San'at, IT va Dasturlash, Fashion Dizayn, Biznes va Marketing, Muhandislik, Media va Jurnalistika.

    🏠 **Yotoqxona:** $900 - $1.200 / 1 semestr

    ⭐ **Afzalliklari:**
    - **Seul markazida** joylashgan
    - Dizayn va IT yo'nalishlari kuchli
    - **Intervyu asosida qabul**
    - Zamonaviy kampus va laboratoriyalar

    **Qabul:** Intervyu asosida qabul
    
    📌 **Universitet manzili:** 116 Samseongyoro-16-gil, Seongbuk-gu, Seoul, South Korea
  ` 
    },
  ],
  aloqa: {
    info: `📞 **Go Korea Consulting - Aloqa Ma'lumotlari:**
Biz **6+ yillik tajribaga** egamiz, **500+ muvaffaqiyatli talaba** va **98% viza tasdig'i** bilan sizning kelajagingizga yo'llanmamiz.

- **Telegram Admin:** @gokorea_admin
- **Telegram Jamoa:** @gokorea_tashkent
- **Telefonlar:** +998 33 9391515, +998 97 9481515
- **Kanal:** [https://t.me/GoKoreaGroup](https://t.me/GoKoreaGroup)
- **Ish vaqti:** Dushanba-Juma, 9:00 - 18:00
- **Manzil:** улица Шокирарык 97, 100085, Ташкент, Tashkent`,
    operator_text: `Xabaringiz uchun rahmat, men bu savolni tushunmadim. **Xavotir olmang!** Sizni tajribali operatorga yo'naltiraman. Operator yozishingizni kutyapti: **@gokorea_admin** yoki **+998 33 9391515** raqamiga qo'ng'iroq qiling.`,
  },
  faq: {
    CMD_FAQ_JARAYON: "Qabul jarayonida **professional yordam** beramiz: hujjat rasmiylashtirish, motivatsion xat, viza olishda. Mutaxassislarimiz har bir bosqichda yoningizda bo'ladi.",
    CMD_FAQ_GRANT: "Ha, **to'liq yoki qisman grantlar** topishga yordam beramiz. Akademik ko'rsatkichlaringizga qarab eng mos variantlarni topamiz. Woosuk universiteti 10-50% stipendiya beradi.",
    CMD_FAQ_MAMLAKAT: "Biz faqat **Janubiy Koreyaga** talabalar jo'natamiz.",
    CMD_FAQ_NARXI: "Xizmat narxi tanlangan dasturga qarab farq qiladi. **💰 Xarajatlar & Narxlar** bo'limidan batafsil ma'lumot olishingiz mumkin. Firma xizmati: 2,000,000 So'm + 1,900 USD.",
    CMD_FAQ_TIL: "Til bilish muhim, lekin ko'pchilik universitetlar **preparatory kurslarini** (D-4 viza) taklif qiladi. TOPIK yoki IELTS sertifikati bo'lishi afzallik beradi.",
    CMD_FAQ_VAQT: "Qabul jarayoni odatda **3-6 oy** davom etadi. Til kurslari har 3 oyda (Mart, Iyun, Sentyabr, Dekabr) boshlanadi.",
    CMD_FAQ_TAJRIBA: "Kompaniyamiz **6+ yillik tajribaga** ega, 500 dan ortiq talaba muvaffaqiyatga erishgan va viza tasdiqlash darajasi **98%** ni tashkil etadi.", // Yangi FAQ
    CMD_FAQ_QANDAY_BOSHLA: "Agar o'qishni boshlamoqchi bo'lsangiz, **Oldindan To'lov (2,000,000 So'm)** ni to'lab, shartnoma imzolashingiz kerak. Aloqa bo'limi orqali bizga murojaat qiling.", // Yangi FAQ
  }
};


// =========================================================================================
// INTERFACES & TURLAR
// =========================================================================================

interface ButtonOption {
  text: string;
  command: string;
}

type DialogState = 'MAIN_MENU' | 'UNI_LIST' | 'PRICES_MENU' | 'FAQ_MENU' | 'CONTACT_MENU';

interface Message {
  id: string;
  content: string;
  is_ai: boolean;
  message_type: "voice" | "text" | "command";
  created_at: string;
  quick_replies?: ButtonOption[];
  image_url?: string;
  markdown_enabled?: boolean;
}


// =========================================================================================
// QUICK REPLIES KOMPONENTI
// =========================================================================================

const QuickReplies = ({ replies, onClick, isSending }: { replies: ButtonOption[], onClick: (command: string, text: string) => void, isSending: boolean }) => (
    <div className="flex flex-wrap gap-2 mt-4 max-w-[90%] ml-11">
        {replies.map((reply) => (
            <Button
                key={reply.command}
                variant="telegram"
                size="sm"
                onClick={() => onClick(reply.command, reply.text)}
                disabled={isSending}
                className="bg-blue-800/80 hover:bg-blue-700/80 text-xs px-3 py-1 h-auto whitespace-normal break-words text-left shadow-md shadow-blue-500/10 transition-all duration-200"
            >
                {reply.text}
            </Button>
        ))}
    </div>
);

// =========================================================================================
// TEXT FORMATLASH FUNKSIYASI
// =========================================================================================

const formatRichText = (text: string) => {
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formattedText = formattedText.replace(/\n/g, '<br/>');
    formattedText = formattedText.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="text-green-400 hover:underline flex items-center gap-1"><svg class="w-3 h-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4m-6-6l6 6m0 0v-6m0 6h-6"></path></svg>$1</a>');

    return (
        <p
            className="text-sm whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: formattedText }}
        />
    );
};


// =========================================================================================
// ASOSIY CHAT KOMPONENTI
// =========================================================================================

export default function Chat() {
  const { user, isLoading: authLoading } = useAuth(); // Agar ishlatilsa
  const navigate = useNavigate();
  const { toast } = useToast(); // Agar ishlatilsa
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null); // Agar ishlatilsa
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const [currentDialogState, setCurrentDialogState] = useState<DialogState>('MAIN_MENU'); 

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [autoSpeakEnabled, setAutoSpeakEnabled] = useState(true); 
  const [isMicrophoneActive, setIsMicrophoneActive] = useState(false); 
  
  
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  
  const loadOrCreateConversation = async () => {
    // if (!user) return; // Agar user tekshiruvi muhim bo'lsa
    setIsLoading(true);
   
    const welcomeMsg: Message = {
      id: "welcome",
      content: "🤖 **Assalomu alaykum!** Men Go Korea Consulting kompaniyasining AI maslahatchisiman. Sizni Koreyaga borishga tayyorlashda yordam berish uchun shu yerdaman. Iltimos, sizni qiziqtirgan asosiy mavzuni tanlang:",
      is_ai: true,
      message_type: "text",
      created_at: new Date().toISOString(),
      quick_replies: getMainMenuButtons(),
      markdown_enabled: true,
      image_url: '/images/gokoreaai.jpg', // Rasmingiz yo'lini o'rnating
    };
    setMessages([welcomeMsg]);
    setIsLoading(false);
  };
  
 
  const getMainMenuButtons = (): ButtonOption[] => [
    { text: "🇰🇷 Universitetlar Ro'yxati", command: 'CMD_MENU_UNI' },
    { text: "💰 Xarajatlar & Narxlar", command: 'CMD_MENU_PRICES' },
    { text: "❓ Tez-tez So'raladigan Savollar (FAQ)", command: 'CMD_MENU_FAQ' },
    { text: "📞 Kompaniya bilan Aloqa", command: 'CMD_MENU_CONTACT' },
  ];
  
  // =========================================================================================
  // COMMANDLARNI QAYTA ISHLASH MANTIQI
  // =========================================================================================
  const handleCommand = (
      command: string, 
      currentState: DialogState
  ): { aiResponse: string, newState: DialogState, replies: ButtonOption[], image_url?: string } => {
    
    // Asosiy menyu
    if (command === 'CMD_MENU_MAIN' || command.toLowerCase().includes('salom')) {
        const text = command === 'CMD_MENU_MAIN' ? "Bosh menyuga qaytdik. Iltimos, qiziqtirgan mavzuni tanlang:" : "**Assalomu alaykum!** Men Go Korea AI maslahatchisiman. Qanday ma'lumot olishni istaysiz?";
        return { aiResponse: text, newState: 'MAIN_MENU', replies: getMainMenuButtons(), image_url: '/images/gokoreaai.jpg' };
    }
    
    // Universitetlar menyusi
    if (command === 'CMD_MENU_UNI' || currentState === 'UNI_LIST') {
        const uniDetail = knowledgeBase.universitetlar.find(u => u.command === command);
        if (uniDetail) {
             // Yangi formatda detailni ishlatish uchun
            const responseText = `🎓 **${uniDetail.name}** (${uniDetail.shahar}) haqida batafsil ma'lumot:\n- **Kontrakt:** ${uniDetail.kontrakt}\n- **Tavsif:** ${uniDetail.details}`; 
            return { aiResponse: responseText, newState: 'UNI_LIST', replies: [{ text: "Boshqa Universitetlar", command: 'CMD_MENU_UNI' }, { text: "🏠 Bosh Menyu", command: 'CMD_MENU_MAIN' }], image_url: uniDetail.image };
        }
        const uniButtons = knowledgeBase.universitetlar.map(uni => ({ text: `${uni.name.replace(' Universiteti', '')} (${uni.shahar})`, command: uni.command }));
        return { aiResponse: "**Qaysi universitet haqida ma'lumot olishni istaysiz?**", newState: 'UNI_LIST', replies: [...uniButtons, { text: "🏠 Bosh Menyu", command: 'CMD_MENU_MAIN' }] };
    }
    
    // Narxlar menyusi
    if (command === 'CMD_MENU_PRICES' || currentState === 'PRICES_MENU') {
        const replies: ButtonOption[] = [{ text: "💵 Umumiy Xarajatlar", command: 'CMD_PRICE_TOTAL' }, { text: "📄 Firma Xizmati Narxi", command: 'CMD_PRICE_CONSULTING' }, { text: "📚 Til Kurslari & Hujjatlar", command: 'CMD_PRICE_COURSES' }, { text: "🏠 Bosh Menyu", command: 'CMD_MENU_MAIN' }];
        if (command === 'CMD_PRICE_TOTAL') return { aiResponse: knowledgeBase.narxlar.umumiy, newState: 'PRICES_MENU', replies: [{ text: "Boshqa Narxlar", command: 'CMD_MENU_PRICES' }, { text: "🏠 Bosh Menyu", command: 'CMD_MENU_MAIN' }], image_url: "/images/umumiy_xarajat.jpg" }; // Rasmingiz yo'lini o'rnating
        if (command === 'CMD_PRICE_CONSULTING') return { aiResponse: knowledgeBase.narxlar.firma, newState: 'PRICES_MENU', replies: [{ text: "Boshqa Narxlar", command: 'CMD_MENU_PRICES' }, { text: "🏠 Bosh Menyu", command: 'CMD_MENU_MAIN' }] };
        if (command === 'CMD_PRICE_COURSES') return { aiResponse: knowledgeBase.narxlar.kurslar + '\n\n' + knowledgeBase.narxlar.hujjatlar, newState: 'PRICES_MENU', replies: [{ text: "Boshqa Narxlar", command: 'CMD_MENU_PRICES' }, { text: "🏠 Bosh Menyu", command: 'CMD_MENU_MAIN' }] };
        return { aiResponse: "**Xarajatlar bo'yicha qaysi ma'lumotni olishni istaysiz?**", newState: 'PRICES_MENU', replies: replies };
    }
    
    // FAQ menyusi
    if (command === 'CMD_MENU_FAQ' || currentState === 'FAQ_MENU') {
        const replies: ButtonOption[] = [
            { text: "Qabul jarayoni qanday?", command: 'CMD_FAQ_JARAYON' }, 
            { text: "Grant/stipendiya bormi?", command: 'CMD_FAQ_GRANT' }, 
            { text: "Kompaniyaning tajribasi?", command: 'CMD_FAQ_TAJRIBA' }, 
            { text: "Til bilish talabi?", command: 'CMD_FAQ_TIL' }, 
            { text: "Qanday boshlasam bo'ladi?", command: 'CMD_FAQ_QANDAY_BOSHLA' },
            { text: "🏠 Bosh Menyu", command: 'CMD_MENU_MAIN' }
        ];
        if (command.startsWith('CMD_FAQ_')) {
            const responseText = knowledgeBase.faq[command as keyof typeof knowledgeBase.faq] || "**Kechirasiz**, bu savolga aniq javob topilmadi.";
            return { aiResponse: responseText, newState: 'FAQ_MENU', replies: [{ text: "Boshqa Savollar", command: 'CMD_MENU_FAQ' }, { text: "🏠 Bosh Menyu", command: 'CMD_MENU_MAIN' }] };
        }
        return { aiResponse: "Iltimos, **tez-tez so'raladigan savollardan** birini tanlang:", newState: 'FAQ_MENU', replies: replies };
    }

    // Aloqa menyusi
    if (command === 'CMD_MENU_CONTACT') {
        return { aiResponse: knowledgeBase.aloqa.info, newState: 'CONTACT_MENU', replies: [{ text: "🏠 Bosh Menyu", command: 'CMD_MENU_MAIN' }] };
    }
    
    // Boshqa har qanday noma'lum matnli so'rov (qo'lda kiritilgan)
    if (command.length > 0 && command !== 'voice') {
        return { aiResponse: knowledgeBase.aloqa.operator_text, newState: currentState, replies: [{ text: "🏠 Bosh Menyu", command: 'CMD_MENU_MAIN' }] };
    }

    // Bosh menyuga qaytish uchun default
    return handleCommand('CMD_MENU_MAIN', 'MAIN_MENU');
  };
  
 
  const sendMessage = async (content: string, type: "voice" | "text" | "command") => {
    if (!content.trim()) return;
    setIsSending(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      content: type === 'command' ? content.replace('CMD_', '').replace(/_/g, ' ') : content, 
      is_ai: false,
      message_type: type,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    
    const { aiResponse, newState, replies, image_url } = handleCommand(content, currentDialogState);
    setCurrentDialogState(newState);

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: aiResponse,
      is_ai: true,
      message_type: "text",
      created_at: new Date().toISOString(),
      quick_replies: replies, 
      image_url: image_url,
      markdown_enabled: true,
    };

    setMessages((prev) => [...prev, aiMessage]);
    
    
    setIsSending(false);
  };
  
  const handleButtonClick = (command: string, text: string) => { if (isSending) return; sendMessage(command, 'command'); };
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (inputValue.trim()) sendMessage(inputValue, "text"); };


  useEffect(() => { loadOrCreateConversation(); }, [user]);
  useEffect(() => { scrollToBottom(); }, [messages]);


  if (authLoading || isLoading) {
    return ( <div className="min-h-screen flex items-center justify-center"> <div className="animate-pulse text-white">Suhbat yuklanmoqda...</div> </div> );
  }

  return (
    <div className="min-h-screen flex flex-col text-white">
      {/* HEADER (Sticky Top) */}
      <header className="sticky top-0 z-30 border-b border-gray-700 bg-black/50 backdrop-blur-lg px-4 py-3 safe-area-top">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-white">AI Yordamchi</h1>
              <p className="text-xs text-gray-400">
                {isListening ? "🎤 Tinglamoqda..." : isSpeaking ? "🔊 Gapirmoqda..." : "✅ Onlayn"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon-sm" onClick={() => navigate("/calculator")} className="text-blue-400 hover:bg-black/40">
              <Calculator className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => { /* ... */ }} className="text-blue-400 hover:bg-black/40">
              <FileDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      
       {/* MESSAGES CONTAINER */}
       <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id}>
             <div
                className={cn( "flex gap-3 animate-fade-in", message.is_ai ? "flex-row" : "flex-row-reverse" )}
              >
              <div
                className={cn( "w-8 h-8 rounded-full flex items-center justify-center shrink-0", message.is_ai ? "bg-gradient-to-br from-blue-500 to-purple-600" : "bg-gray-700" )}
              >
                {message.is_ai ? ( <Bot className="h-4 w-4 text-white" /> ) : ( <User className="h-4 w-4 text-white" /> )}
              </div>
              <Card
                className={cn( "max-w-[80%] border-0", message.is_ai ? "bg-black/30 shadow-lg shadow-blue-500/10 text-white" : "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30" )}
              >
                <CardContent className="p-3">
                  {/* Rasm */}
                  {message.is_ai && message.image_url && (
                      <div className="mb-2 rounded-lg overflow-hidden border border-gray-600">
                           <img 
                                src={message.image_url} 
                                alt="Go Korea University" 
                                className="w-full h-auto object-cover max-h-40" 
                                onError={(e) => { (e.target as HTMLImageElement).onerror = null; (e.target as HTMLImageElement).style.display = 'none'; }}
                           />
                           <div className="flex items-center gap-1 text-[10px] text-gray-400 p-1">
                               <ImageIcon className="w-3 h-3" /> Ma'lumot rasmi
                           </div>
                      </div>
                  )}
                  {/* Matn */}
                  {message.markdown_enabled ? formatRichText(message.content) : (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}
                  <p className={cn( "text-[10px] mt-1", message.is_ai ? "text-gray-400" : "text-white/70" )}>
                    {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </CardContent>
              </Card>
            </div>
            {/* Quick Replies (Tugmalar) */}
            {message.is_ai && message.quick_replies && (
                <QuickReplies replies={message.quick_replies} onClick={handleButtonClick} isSending={isSending} />
            )}
          </div>
        ))}

        {/* LOADING DOTS (Tuzatilgan) */}
        {isSending && (
         <div className="flex gap-3 animate-fade-in"> 
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <Card className="bg-black/30 shadow-lg shadow-blue-500/10 border-0">
              <CardContent className="p-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* INPUT MAYDONI (Sticky Bottom) */}
      <div className="sticky bottom-0 z-20 border-t border-gray-700 bg-black/50 backdrop-blur-lg p-4 safe-area-bottom">
        <form onSubmit={handleSubmit} className="flex gap-2">
           <Button
            type="button"
            variant="telegram"
            size="icon"
            onClick={() => { setIsListening(!isListening); }} // Simulyatsiya qilingan toggle
            disabled={isSending || !voiceSupported}
            className={cn( isListening ? "bg-red-600/90 hover:bg-red-700/90 animate-pulse" : "bg-blue-600/90 hover:bg-blue-700/90" )}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={isListening ? "Gapiring..." : "Xabar yozing (yoki tugmalardan foydalaning)..."}
            className="flex-1 bg-black/40 border-gray-700 text-white"
            disabled={isSending || isListening}
          />
          <Button type="submit" variant="telegram" size="icon" disabled={!inputValue.trim() || isSending} className="bg-blue-600/90 hover:bg-blue-700/90">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}