// src/pages/AdminLogin.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, LogIn, Lock, UserRound, AlertTriangle } from 'lucide-react'; // AlertTriangle qo'shildi
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// --- Yordamchi vaqt funksiyalari ---
// Berilgan muddatni hozirgi sanaga qo'shish funksiyasi
const addDurationToDate = (date: Date, years: number, months: number, days: number, hours: number): Date => {
  const newDate = new Date(date);
  newDate.setFullYear(newDate.getFullYear() + years);
  newDate.setMonth(newDate.getMonth() + months);
  newDate.setDate(newDate.getDate() + days);
  newDate.setHours(newDate.getHours() + hours);
  return newDate;
};

// Vaqt farqini "X yil Y oy Z kun W soat A daqiqa B soniya" formatiga keltirish funksiyasi
const formatTimeDifference = (ms: number): string => {
  if (ms <= 0) return "Hoziroq urinib ko'rishingiz mumkin!";

  const MS_PER_SECOND = 1000;
  const MS_PER_MINUTE = 60 * MS_PER_SECOND;
  const MS_PER_HOUR = 60 * MS_PER_MINUTE;
  const MS_PER_DAY = 24 * MS_PER_HOUR;
  const MS_PER_MONTH = 30.44 * MS_PER_DAY; // O'rtacha oy
  const MS_PER_YEAR = 365.25 * MS_PER_DAY; // O'rtacha yil

  let remainingMs = ms;

  const years = Math.floor(remainingMs / MS_PER_YEAR);
  remainingMs -= years * MS_PER_YEAR;

  const months = Math.floor(remainingMs / MS_PER_MONTH);
  remainingMs -= months * MS_PER_MONTH;

  const days = Math.floor(remainingMs / MS_PER_DAY);
  remainingMs -= days * MS_PER_DAY;

  const hours = Math.floor(remainingMs / MS_PER_HOUR);
  remainingMs -= hours * MS_PER_HOUR;

  const minutes = Math.floor(remainingMs / MS_PER_MINUTE);
  remainingMs -= minutes * MS_PER_MINUTE;

  const seconds = Math.floor(remainingMs / MS_PER_SECOND);

  let parts: string[] = [];
  if (years > 0) parts.push(`${years} yil`);
  if (months > 0) parts.push(`${months} oy`);
  if (days > 0) parts.push(`${days} kun`);
  if (hours > 0) parts.push(`${hours} soat`);
  if (minutes > 0) parts.push(`${minutes} daqiqa`);
  if (seconds > 0) parts.push(`${seconds} soniya`);
  
  return parts.length > 0 ? parts.join(' ') : "Hoziroq urinib ko'rishingiz mumkin!";
};
// --- Yordamchi vaqt funksiyalari yakuni ---


const AdminLogin = () => {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // --- Yangi blokirovka holati ---
  const [lockoutEndTime, setLockoutEndTime] = useState<Date | null>(null);
  const [remainingLockoutTime, setRemainingLockoutTime] = useState<string>('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  // --- Blokirovka holati yakuni ---

  // ADMIN LOGIN MA'LUMOTLARI (o'zgartirishlar kiritilmadi)
  const ADMIN_USERNAME = "adminforgokorea";
  const ADMIN_PASSWORD = "Fght1_22TbnQ11ffjL_2011"; 

  // Komponent yuklanganda blokirovka holatini localStorage dan tekshirish
  useEffect(() => {
    const storedLockout = localStorage.getItem('adminLockoutEndTime');
    if (storedLockout) {
      const endTime = new Date(storedLockout);
      if (endTime > new Date()) { // Agar blokirovka hali ham faol bo'lsa
        setLockoutEndTime(endTime);
      } else {
        localStorage.removeItem('adminLockoutEndTime'); // Muddati o'tgan blokirovkani o'chirish
      }
    }
  }, []);

  // Blokirovka vaqtini hisoblash uchun taymer
  useEffect(() => {
    if (lockoutEndTime && lockoutEndTime > new Date()) {
      intervalRef.current = setInterval(() => {
        const now = new Date();
        const diff = lockoutEndTime.getTime() - now.getTime();

        if (diff <= 0) {
          clearInterval(intervalRef.current!);
          setLockoutEndTime(null);
          setRemainingLockoutTime('');
          localStorage.removeItem('adminLockoutEndTime');
        } else {
          setRemainingLockoutTime(formatTimeDifference(diff));
        }
      }, 1000); // Har soniyada yangilash
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [lockoutEndTime]);


  // Asosiy yo'naltirish mantig'i, blokirovka holatini hisobga olgan holda
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/auth', { replace: true });
        return;
      }
      // Agar foydalanuvchi admin bo'lsa va blokirovka faol bo'lmasa, admin paneliga yo'naltirish
      if (isAdmin && (!lockoutEndTime || lockoutEndTime <= new Date())) {
        navigate('/admin/dashboard', { replace: true });
        return;
      }
      // Aks holda, agar user tizimga kirgan bo'lsa, ammo admin bo'lmasa yoki bloklangan bo'lsa,
      // u AdminLogin sahifasida qoladi (blokirovka xabarini ko'rish uchun)
    }
  }, [user, isAdmin, authLoading, navigate, lockoutEndTime]); // lockoutEndTime dependencies ga qo'shildi

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Agar blokirovka faol bo'lsa, kirishga ruxsat bermaslik
    if (lockoutEndTime && lockoutEndTime > new Date()) {
        toast({
            title: "Kirish cheklangan",
            description: `Iltimos, ${remainingLockoutTime} dan keyin qayta urinib ko'ring.`,
            variant: "destructive",
        });
        return;
    }

    setIsLoggingIn(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Tarmoq kechikishini simulyatsiya qilish

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      toast({
        title: "✅ Muvaffaqiyatli kirish",
        description: "Admin paneliga xush kelibsiz!",
      });
      // Muvaffaqiyatli kirishda har qanday blokirovkani tozalash
      localStorage.removeItem('adminLockoutEndTime');
      setLockoutEndTime(null);
      navigate('/admin/dashboard', { replace: true });
    } else {
      // Noto'g'ri urinishda blokirovka vaqtini hisoblash va o'rnatish
      const now = new Date();
      // 35 yil, 6 oy, 15 kun, 7 soat qo'shamiz
      const newLockoutEndTime = addDurationToDate(now, 35, 6, 15, 7);
      
      setLockoutEndTime(newLockoutEndTime);
      localStorage.setItem('adminLockoutEndTime', newLockoutEndTime.toISOString());

      toast({
        title: "❌ Kirish rad etildi",
        description: `Noto'g'ri username yoki kod. Kirish ${formatTimeDifference(newLockoutEndTime.getTime() - now.getTime())}ga bloklandi.`,
        variant: "destructive",
      });
    }
    setIsLoggingIn(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d1e]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="ml-3 text-white text-lg">Yuklanmoqda...</p>
      </div>
    );
  }

  // Forma tugmasini blokirovka holatiga qarab o'chirish
  const isFormDisabled = isLoggingIn || (lockoutEndTime && lockoutEndTime > new Date());

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d1e] px-4 py-8">
      <Card className="w-full max-w-sm bg-black/30 border-gray-700 text-white shadow-lg rounded-xl backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-white">Admin Paneliga Kirish</CardTitle>
          <CardDescription className="text-gray-400 mt-2 text-sm">
            Maxsus ma'lumotlaringizni kiritib, admin boshqaruviga o'ting.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {lockoutEndTime && lockoutEndTime > new Date() ? (
            // Blokirovka holatida ko'rsatiladigan xabar
            <div className="text-center bg-red-800/20 border border-red-700 rounded-md p-4 space-y-2">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto" />
              <p className="text-red-300 font-semibold text-lg">Kirish cheklangan!</p>
              <p className="text-red-400 text-sm">
                Qayta urinish uchun qolgan vaqt: <br />
                <span className="text-red-200 font-bold text-xl">{remainingLockoutTime}</span>
              </p>
            </div>
          ) : (
            // Oddiy login formasi
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Label htmlFor="username" className="text-gray-200 text-sm font-medium">Username</Label>
                <div className="flex items-center bg-black/20 border border-gray-700 rounded-md mt-2">
                  <UserRound className="h-5 w-5 text-gray-400 ml-3 flex-shrink-0" />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="flex-1 pl-2 pr-3 py-2 bg-transparent border-none text-white focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                    required
                    disabled={isFormDisabled}
                  />
                </div>
              </div>
              
              <div className="relative">
                <Label htmlFor="password" className="text-gray-200 text-sm font-medium">Kod (Password)</Label>
                <div className="flex items-center bg-black/20 border border-gray-700 rounded-md mt-2">
                  <Lock className="h-5 w-5 text-gray-400 ml-3 flex-shrink-0" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-1 pl-2 pr-3 py-2 bg-transparent border-none text-white focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                    required
                    disabled={isFormDisabled}
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                className={cn(
                  "w-full h-11 text-base font-semibold rounded-md transition-all duration-300",
                  "bg-blue-600 hover:bg-blue-700",
                  isFormDisabled ? "opacity-70 cursor-not-allowed" : "shadow-md hover:shadow-lg"
                )}
                disabled={isFormDisabled}
              >
                {isLoggingIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {!isLoggingIn && <LogIn className="mr-2 h-4 w-4" />}
                Kirish
              </Button>
            </form>
          )}

          {user && !isAdmin && (!lockoutEndTime || lockoutEndTime <= new Date()) && (
            <p className="text-xs text-gray-500 text-center mt-4">
              * Bu login faqat namuna ADMIN uchun. 
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;