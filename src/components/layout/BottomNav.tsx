import { Home, FileText, Calculator, User, Users } from "lucide-react"; // Users ikonkasini qo'shdim
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

// Navigatsiya elementlarining o'zbekcha ro'yxati
const navItems = [
    { to: "/", label: "Bosh sahifa", icon: Home, key: "home" },
    // Hujjatlar o'rniga Admin Panel tugmasi
    { to: "/admin", label: "Admin Panel", icon: Users, key: "admin" }, // <-- O'zgartirildi
    // AI/Chat markazda bo'ladi
    { to: "/calculator", label: "Hisob-kitob", icon: Calculator, key: "calc" },
    { to: "/profile", label: "Profil", icon: User, key: "profile" },
];

export const BottomNav = () => {
  const location = useLocation();

  // /auth sahifasida pastki navigatsiyani yashirishni davom ettiramiz
  if (location.pathname === "/auth") { // Faqat /auth uchun yashiramiz
    return null;
  }
  
  // E'tibor bering: "Admin Panel" tugmasi endi /admin ga yo'naltiradi,
  // va u yerda (AdminPage ichida) "Hujjatlar" tabini topasiz.

  return (
    // Orqa fonni bir oz quyuqroq qilib, yanada chuqurroq effekt beramiz
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-700/30 bg-[#0a0a1a] backdrop-blur-lg safe-area-bottom">
      <div className="relative flex h-20 items-end justify-between px-2 pb-2">

        {/* 1. Chap tomon (Bosh sahifa, Admin Panel) */}
        <div className="flex w-2/5 justify-around items-end h-full">
            <BottomItem 
                to="/" 
                label="Bosh sahifa" 
                icon={Home} 
                active={location.pathname === "/"} 
            />
            {/* O'zgartirilgan "Hujjatlar" tugmasi */}
            <BottomItem
                to="/admin" // <-- Yo'nalish o'zgartirildi
                label="Admin Panel" // <-- Nomi o'zgartirildi
                icon={Users} // <-- Ikonka o'zgartirildi
                active={location.pathname.startsWith("/admin")} // <-- Aktiv holati o'zgartirildi
            />
        </div>

        {/* 2. Markaziy Floating AI Tugmasi - Dumaloq, AI matni */}
        <NavLink
          to="/chat"
          className="absolute -top-3 left-1/2 transform -translate-x-1/2"
        >
          <div
            className={cn(
              "h-16 w-16 rounded-full flex items-center justify-center text-white font-black text-xl",
              "bg-gradient-to-br from-blue-500 to-purple-600", // Yorqin rang gradient
              "shadow-[0_0_40px_rgba(147,51,234,0.7)] transition-all duration-300 ease-in-out", // Yangi, yanada chuqurroq binafsha rangli soya
              "border-4 border-[#0a0a1a]", // Fon bilan bir xil rangdagi qalin ramka (ko'tarilgan effekt uchun)
              location.pathname === "/chat" && "scale-105 shadow-[0_0_60px_rgba(147,51,234,0.9)]" // Aktiv bo'lganda yanada kuchliroq soya va kattalashish
            )}
          >
            AI
          </div>
        </NavLink>
        
        {/* 3. O'ng tomon (Hisob-kitob, Profil) */}
        <div className="flex w-2/5 justify-around items-end h-full">
            <BottomItem
                to="/calculator"
                label="Hisob-kitob"
                icon={Calculator}
                active={location.pathname === "/calculator"}
            />
            <BottomItem
                to="/profile"
                icon={User}
                label="Profil"
                active={location.pathname === "/profile"}
            />
        </div>

      </div>
    </nav>
  );
};

function BottomItem({ to, label, icon: Icon, active }: any) {
  const splitLabel = label.split(" ");
  
  return (
    <NavLink
      to={to}
      // Barcha o'zgarishlarga silliq o'tishni ta'minlaymiz
      className={cn(
        "flex flex-col items-center justify-center h-16 w-16 py-1 relative transition-all duration-300 ease-in-out", 
        "rounded-xl bg-gray-900/40", // Asosiy fon biroz quyuqroq
        "border border-transparent", // Standart holatda shaffof ramka
        "group", // Hover effektlari uchun guruh elementi
        
        // Aktiv bo'lmagan holatda hover effektlari
        !active && "hover:bg-gray-800/60 hover:border-blue-600/30", 
        
        // Aktiv holatda dizayn: ko'k ramka, soya, yengil ko'k fon va biroz kattalashish
        active && "border-blue-500/80 shadow-lg shadow-blue-500/30 bg-blue-600/20 scale-[1.03]" 
      )}
    >
      {/* Ikonka */}
      <Icon 
        className={cn("h-6 w-6 mb-0.5 transition-colors duration-300", 
          // Aktiv ikonka: Yorqin ko'k rang, biroz qalinroq chiziq va yengil "glow" effekti
          active 
            ? "text-blue-300 drop-shadow-[0_0_8px_rgba(100,200,255,0.6)]" 
            : "text-gray-300 group-hover:text-white group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.4)]" // Aktiv bo'lmagan holda: och kulrang, hoverda oq rang va yengil "glow"
        )} 
        strokeWidth={active ? 2.8 : 2} // Aktiv bo'lganda ikonka chiziqlari biroz qalinroq
      />
      {/* Matn - ikki qatorga ajratish */}
      <span className="text-[11px] font-medium text-center leading-tight transition-colors duration-300">
          {splitLabel.map((word: string, index: number) => (
              <span 
                key={index} 
                className={cn("block", 
                  // Matn ranglari va "glow" effekti ikonkaga o'xshash
                  active 
                    ? "text-blue-300 drop-shadow-[0_0_8px_rgba(100,200,255,0.6)]" 
                    : "text-gray-300 group-hover:text-white group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.4)]"
                )}>
                  {word}
              </span>
          ))}
      </span>
    </NavLink>
  );
}