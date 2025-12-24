import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
// import { supabase } from "@/integrations/supabase/client"; // Agar ishlatilsa
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Card komponenti endi xabarlar uchun ishlatilmaydi. QuickReplies ichida qolishi mumkin.
// import { Card, CardContent } from "@/components/ui/card";
// import { useToast } from "@/hooks/use-toast"; // Agar ishlatilsa
import {
  Send, Mic, MicOff, Bot, User, Volume2,
  Image as ImageIcon, CircleDot,
  Paperclip, Smile, Check, CheckCheck // CheckCheck ham qo'shildi "o'qilgan" uchun
} from "lucide-react";
import { cn } from "@/lib/utils";

// =========================================================================================
// YANGI IMPORT QILINGAN BILIMLAR BAZASI (KNOWLEDGE BASE)
// =========================================================================================
import { universities } from "@/data/universities";
import { prices } from "@/data/prices";
import { faq } from "@/data/faq";
import { contact } from "@/data/contact";

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
  senderName: string; // Yuboruvchi nomi qo'shildi
  status?: 'sent' | 'read'; // Xabar statusi
}


// =========================================================================================
// QUICK REPLIES KOMPONENTI (styling rasmga moslab to'g'irlandi)
// =========================================================================================

const QuickReplies = ({ replies, onClick, isSending }: { replies: ButtonOption[], onClick: (command: string, text: string) => void, isSending: boolean }) => (
    <div className="flex flex-wrap gap-2 mt-2 ml-2 max-w-[90%]"> {/* ml-2 qilinib AI bubble bilan hizalandi */}
        {replies.map((reply) => (
            <Button
                key={reply.command}
                variant="telegram"
                size="sm"
                onClick={() => onClick(reply.command, reply.text)}
                disabled={isSending}
                className="bg-blue-800/80 hover:bg-blue-700/80 text-xs px-3 py-1 h-auto whitespace-normal break-words text-left shadow-md shadow-blue-500/10 transition-all duration-200 rounded-lg"
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
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  // const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  // const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const [currentDialogState, setCurrentDialogState] = useState<DialogState>('MAIN_MENU');

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);


  const [voiceSupported, setVoiceSupported] = useState(false);
  // const [autoSpeakEnabled, setAutoSpeakEnabled] = useState(true);
  // const [isMicrophoneActive, setIsMicrophoneActive] = useState(false);


  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  const loadOrCreateConversation = async () => {
    // if (!user) return;
    setIsLoading(true);

    const welcomeMsg: Message = {
      id: "welcome",
      content: "🤖 **Assalomu alaykum!** Men Go Korea Consulting kompaniyasining AI maslahatchisiman. Sizni Koreyaga borishga tayyorlashda yordam berish uchun shu yerdaman. Iltimos, sizni qiziqtirgan asosiy mavzuni tanlang:",
      is_ai: true,
      message_type: "text",
      created_at: new Date().toISOString(),
      quick_replies: getMainMenuButtons(),
      markdown_enabled: true,
      image_url: '/images/gokoreaai.jpg',
      senderName: "AI Yordamchi",
      status: 'read',
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
  // COMMANDLARNI QAYTA ISHLASH MANTIQI (Yangi ma'lumotlar bazasi import qilingan)
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
        const uniDetail = universities.find(u => u.command === command);
        if (uniDetail) {
            const responseText = `🎓 **${uniDetail.name}** (${uniDetail.shahar}) haqida batafsil ma'lumot:\n- **Kontrakt:** ${uniDetail.kontrakt}\n- **Tavsif:** ${uniDetail.details}`;
            return { aiResponse: responseText, newState: 'UNI_LIST', replies: [{ text: "Boshqa Universitetlar", command: 'CMD_MENU_UNI' }, { text: "🏠 Bosh Menyu", command: 'CMD_MENU_MAIN' }], image_url: uniDetail.image };
        }
        const uniButtons = universities.map(uni => ({ text: `${uni.name.replace(' Universiteti', '')} (${uni.shahar})`, command: uni.command }));
        return { aiResponse: "**Qaysi universitet haqida ma'lumot olishni istaysiz?**", newState: 'UNI_LIST', replies: [...uniButtons, { text: "🏠 Bosh Menyu", command: 'CMD_MENU_MAIN' }] };
    }

    // Narxlar menyusi
    if (command === 'CMD_MENU_PRICES' || currentState === 'PRICES_MENU') {
        const replies: ButtonOption[] = [{ text: "💵 Umumiy Xarajatlar", command: 'CMD_PRICE_TOTAL' }, { text: "📄 Firma Xizmati Narxi", command: 'CMD_PRICE_CONSULTING' }, { text: "📚 Til Kurslari & Hujjatlar", command: 'CMD_PRICE_COURSES' }, { text: "🏠 Bosh Menyu", command: 'CMD_MENU_MAIN' }];
        if (command === 'CMD_PRICE_TOTAL') return { aiResponse: prices.umumiy, newState: 'PRICES_MENU', replies: [{ text: "Boshqa Narxlar", command: 'CMD_MENU_PRICES' }, { text: "🏠 Bosh Menyu", command: 'CMD_MENU_MAIN' }], image_url: "/images/umumiy_xarajat.jpg" };
        if (command === 'CMD_PRICE_CONSULTING') return { aiResponse: prices.firma, newState: 'PRICES_MENU', replies: [{ text: "Boshqa Narxlar", command: 'CMD_MENU_PRICES' }, { text: "🏠 Bosh Menyu", command: 'CMD_MENU_MAIN' }] };
        if (command === 'CMD_PRICE_COURSES') return { aiResponse: prices.kurslar + '\n\n' + prices.hujjatlar, newState: 'PRICES_MENU', replies: [{ text: "Boshqa Narxlar", command: 'CMD_MENU_PRICES' }, { text: "🏠 Bosh Menyu", command: 'CMD_MENU_MAIN' }] };
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
            const responseText = faq[command as keyof typeof faq] || "**Kechirasiz**, bu savolga aniq javob topilmadi.";
            return { aiResponse: responseText, newState: 'FAQ_MENU', replies: [{ text: "Boshqa Savollar", command: 'CMD_MENU_FAQ' }, { text: "🏠 Bosh Menyu", command: 'CMD_MENU_MAIN' }] };
        }
        return { aiResponse: "Iltimos, **tez-tez so'raladigan savollardan** birini tanlang:", newState: 'FAQ_MENU', replies: replies };
    }

    // Aloqa menyusi
    if (command === 'CMD_MENU_CONTACT') {
        return { aiResponse: contact.info, newState: 'CONTACT_MENU', replies: [{ text: "🏠 Bosh Menyu", command: 'CMD_MENU_MAIN' }] };
    }

    // Boshqa har qanday noma'lum matnli so'rov (qo'lda kiritilgan)
    if (command.length > 0 && command !== 'voice') {
        return { aiResponse: contact.operator_text, newState: currentState, replies: [{ text: "🏠 Bosh Menyu", command: 'CMD_MENU_MAIN' }] };
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
      senderName: "Sevinchm", // Rasmga mos ravishda "Sevinchm"
      status: 'sent', // Yuborilgan status
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
      senderName: "AI Yordamchi", // AI nomi
      status: 'read', // AI xabarlari "o'qilgan" deb hisoblanadi
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

  // Xabarni jo'natuvchi nomini ko'rsatish logikasi
  const shouldShowSenderName = (currentMessage: Message, index: number) => {
    if (index === 0) return true; // Birinchi xabar uchun har doim ko'rsatish
    const previousMessage = messages[index - 1];
    // Agar oldingi xabar boshqa yuboruvchidan bo'lsa
    // Yoki oldingi xabar bilan hozirgi xabar orasida ma'lum bir vaqt farqi bo'lsa (opsional)
    // Hozircha faqat yuboruvchi o'zgarishini tekshiramiz
    return currentMessage.senderName !== previousMessage.senderName;
  };

  // Input maydoni balandligini hisoblash (taxminan)
  const INPUT_AREA_HEIGHT = 70; // Taxminan 56px + biroz margin/padding uchun
  const HEADER_HEIGHT = 60; // Taxminan header balandligi

  return (
    // Asosiy konteyner butun ekran balandligini oladi va flex kolonna bo'ladi
    <div className="h-screen flex flex-col text-white bg-gray-900"> {/* Umumiy fon rangi rasmga mos */}
      {/* HEADER (Fixed Top) - Rasmga mos ravishda to'g'irlandi */}
      {/* Fon rangi qora, shaffoflik va soya yo'q */}
      <header className="fixed top-0 left-0 right-0 z-30 border-b border-gray-700 bg-gray-950 px-4 py-3 safe-area-top">
        <div className="flex items-center justify-start"> {/* Faqat chap tomonni ko'rsatish uchun justify-start */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-white">AI Yordamchi</h1>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <CircleDot className="h-3 w-3 text-green-400" /> Onlayn
              </p>
            </div>
          </div>
          {/* O'ng tomondagi undovcha/sozlamalar tugmasi olib tashlandi */}
        </div>
      </header>

       {/* MESSAGES CONTAINER - Xabarlar oqimi Telegram rasmiga moslab stilizatsiya qilindi */}
       {/* pt: Header balandligi, pb: Input maydoni balandligi */}
       <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2" style={{ paddingTop: `${HEADER_HEIGHT + 10}px`, paddingBottom: `${INPUT_AREA_HEIGHT + 10}px` }}>
        {messages.map((message, index) => {
          const isMyMessage = !message.is_ai; // Agar is_ai false bo'lsa, bu mening xabarim
          const showSender = shouldShowSenderName(message, index);

          return (
            <div key={message.id} className={cn("flex", isMyMessage ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[75%] px-3 py-2 relative break-words text-white rounded-xl", // Rounded-xl umumiy yumaloq burchak
                  isMyMessage
                    ? "bg-blue-600 rounded-br-none" // O'ng tomondagi mening xabarim, pastki o'ng burchak tekis
                    : "bg-gray-800 rounded-bl-none", // Chap tomondagi AI xabari, pastki chap burchak tekis
                  showSender ? "mt-3" : "mt-1" // Yuboruvchi nomi ko'rsatilsa biroz yuqoridan joy
                )}
              >
                {showSender && (
                  <div className={cn(
                    "text-xs mb-1 font-semibold",
                    isMyMessage ? "text-blue-200 text-right" : "text-purple-300 text-left"
                  )}>
                    {message.senderName} 
                  </div>
                )}
                {/* Agar rasm bo'lsa */}
                {message.is_ai && message.image_url && (
                    <div className="mb-2 rounded-lg overflow-hidden border border-gray-600">
                         <img
                              src={message.image_url}
                              alt="Go Korea Info"
                              className="w-full h-auto object-cover max-h-40"
                              onError={(e) => { (e.target as HTMLImageElement).onerror = null; (e.target as HTMLImageElement).style.display = 'none'; }}
                         />
                         <div className="flex items-center gap-1 text-[10px] text-gray-400 p-1">
                             <ImageIcon className="w-3 h-3" /> Ma'lumot rasmi
                         </div>
                    </div>
                )}
                {/* Xabar matni */}
                {message.markdown_enabled ? formatRichText(message.content) : (
                    <p className="text-sm">{message.content}</p>
                )}
                {/* Vaqt va status */}
                <div className={cn(
                    "text-[10px] mt-1 flex items-center justify-end gap-1",
                    isMyMessage ? "text-blue-200/80" : "text-gray-400"
                )}>
                  <span>{new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  {isMyMessage && message.status === 'sent' && <Check className="h-3 w-3 text-blue-200/80" />} {/* Yuborilganlik belgisi */}
                  {isMyMessage && message.status === 'read' && <CheckCheck className="h-3 w-3 text-blue-200/80" />} {/* O'qilganlik belgisi */}
                </div>
              </div>
            </div>
          );
        })}

        {/* Quick Replies (Tugmalar) - Har bir AI xabaridan keyin alohida turadi */}
        {messages.length > 0 && messages[messages.length - 1].is_ai && messages[messages.length - 1].quick_replies && (
            <div className="flex justify-start"> {/* Quick Replies ni alohida joylash */}
                <QuickReplies replies={messages[messages.length - 1].quick_replies!} onClick={handleButtonClick} isSending={isSending} />
            </div>
        )}

        {/* LOADING DOTS (Yuborish paytidagi animatsiya) */}
        {isSending && (
         <div className="flex justify-start mt-2">
            <div className="max-w-[75%] px-3 py-2 rounded-xl rounded-bl-none bg-gray-800 text-white">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT MAYDONI (Fixed Bottom) - Rasmga moslab qayta tuzildi */}
      {/* bottom-0 qilinib, pastki nav bar yo'qligi hisobga olindi */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-700 bg-gray-900 p-2 safe-area-bottom"> {/* p-2 umumiy padding */}
        <form onSubmit={handleSubmit} className="flex items-end gap-2 px-2"> {/* items-end elementlarni pastki qismdan hizalaydi, px-2 ichki padding */}
           {/* Hujjat biriktirish tugmasi */}
           <Button
            type="button"
            variant="ghost" // Fon rangi yo'q tugma
            size="icon"
            className="text-gray-400 hover:text-white w-10 h-10" // Katta hajmli ikonka
            onClick={() => { /* Hujjat biriktirish logikasi */ }}
          >
            <Paperclip className="h-5 w-5" />
          </Button>

          {/* Input field va Emoji tugmasi */}
          <div className="relative flex-1"> {/* Input field va emoji tugmasini birga boshqarish uchun */}
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={isListening ? "Gapiring..." : "Xabar yozing (yoki tugmalardan foydalaning)..."}
              className="w-full pl-4 pr-10 py-2 rounded-full bg-gray-700 border-gray-600 text-white focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-blue-500 placeholder-gray-400 h-10" // Padding va fon ranglari to'g'irlandi
              disabled={isSending || isListening}
            />
            {/* Emoji tugmasi */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white w-8 h-8" // Kichikroq emoji tugmasi
              onClick={() => { /* Emoji tanlash logikasi */ }}
            >
              <Smile className="h-5 w-5" />
            </Button>
          </div>

          {/* Mikrofon / Yuborish tugmasi */}
          {inputValue.trim() ? (
            <Button type="submit" variant="telegram" size="icon" disabled={isSending} className="bg-blue-600/90 hover:bg-blue-700/90 rounded-full w-10 h-10"> {/* Telegram uslubidagi dumaloq tugma */}
              <Send className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="telegram"
              size="icon"
              onClick={() => { setIsListening(!isListening); }}
              disabled={isSending || !voiceSupported}
              className={cn( isListening ? "bg-red-600/90 hover:bg-red-700/90 animate-pulse rounded-full w-10 h-10" : "bg-blue-600/90 hover:bg-blue-700/90 rounded-full w-10 h-10" )} // Dumaloq tugma
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
          )}

        </form>
      </div>
    </div>
  );
}

