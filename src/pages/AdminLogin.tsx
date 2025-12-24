// src/pages/AdminLogin.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, LogIn, Lock, UserRound } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const AdminLogin = () => {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // ADMIN LOGIN MA'LUMOTLARI
  const ADMIN_USERNAME = "adminforgokorea";
  const ADMIN_PASSWORD = "Fght1_22TbnQ11ffjL_2011"; 

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/auth', { replace: true });
        return;
      }

      if (isAdmin) {
        navigate('/admin/dashboard', { replace: true });
        return;
      }
    }
  }, [user, isAdmin, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);

    await new Promise(resolve => setTimeout(resolve, 1500)); 

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      toast({
        title: "✅ Muvaffaqiyatli kirish",
        description: "Admin paneliga xush kelibsiz!",
      });
      navigate('/admin/dashboard', { replace: true });
    } else {
      toast({
        title: "❌ Kirish rad etildi",
        description: "Noto'g'ri username yoki kod. Iltimos, qayta tekshiring.",
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

  return (
    // Eski orqa fonni qaytardik
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d1e] px-4 py-8">
      {/* Kartochka joylashuvi va stillarini to'g'riladik */}
      <Card className="w-full max-w-sm bg-black/30 border-gray-700 text-white shadow-lg rounded-xl backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-white">Admin Paneliga Kirish</CardTitle>
          <CardDescription className="text-gray-400 mt-2 text-sm">
            Maxsus ma'lumotlaringizni kiritib, admin boshqaruviga o'ting.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4"> {/* space-y ni 4 ga kamaytirdik */}
          <form onSubmit={handleLogin} className="space-y-4"> {/* space-y ni 4 ga kamaytirdik */}
            <div className="relative">
              <Label htmlFor="username" className="text-gray-200 text-sm font-medium">Username</Label>
              <div className="flex items-center bg-black/20 border border-gray-700 rounded-md mt-2"> {/* border-md o'rniga rounded-md */}
                <UserRound className="h-5 w-5 text-gray-400 ml-3 flex-shrink-0" /> {/* Ikonka rangi o'zgartirildi */}
                <Input
                  id="username"
                  type="text"
                  // placeholder matnini olib tashladik
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="flex-1 pl-2 pr-3 py-2 bg-transparent border-none text-white focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                  required
                  disabled={isLoggingIn}
                />
              </div>
            </div>
            
            <div className="relative">
              <Label htmlFor="password" className="text-gray-200 text-sm font-medium">Kod (Password)</Label>
              <div className="flex items-center bg-black/20 border border-gray-700 rounded-md mt-2"> {/* border-md o'rniga rounded-md */}
                <Lock className="h-5 w-5 text-gray-400 ml-3 flex-shrink-0" /> {/* Ikonka rangi o'zgartirildi */}
                <Input
                  id="password"
                  type="password"
                  // placeholder matnini olib tashladik
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 pl-2 pr-3 py-2 bg-transparent border-none text-white focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                  required
                  disabled={isLoggingIn}
                />
              </div>
            </div>
            
            <Button
              type="submit"
              className={cn(
                "w-full h-11 text-base font-semibold rounded-md transition-all duration-300",
                "bg-blue-600 hover:bg-blue-700", // Oddiy ko'k rangga qaytardik
                isLoggingIn ? "opacity-70 cursor-not-allowed" : "shadow-md hover:shadow-lg" // Soya effektini kamaytirdik
              )}
              disabled={isLoggingIn}
            >
              {isLoggingIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {!isLoggingIn && <LogIn className="mr-2 h-4 w-4" />}
              Kirish
            </Button>
          </form>

          {user && !isAdmin && (
            <p className="text-xs text-gray-500 text-center mt-4">
              * Bu login faqat namuna uchun. Haqiqiy adminlar uchun Supabase orqali "role: admin" o'rnatilishi kerak.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;