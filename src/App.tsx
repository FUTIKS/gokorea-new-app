import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Chat from "./pages/Chat";
// import Documents from "./pages/Documents"; // Documents komponentini bu yerdan olib tashlaymiz
import CalculatorPage from "./pages/CalculatorPage";
import Profile from "./pages/Profile";
import AdminLogin from "./pages/AdminLogin";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/chat" element={<Chat />} />
              {/* Documents yo'nalishini olib tashladik, chunki u AdminPage ichida bo'ladi */}
              {/* <Route path="/documents" element={<Documents />} /> */}
              <Route path="/calculator" element={<CalculatorPage />} />
              <Route path="/profile" element={<Profile />} />
              
              {/* Admin paneliga kirish uchun sahifa - /admin */}
              <Route path="/admin" element={<AdminLogin />} /> 
              
              {/* Admin panelining asosiy kontenti, kirishdan keyin ko'rsatiladi */}
              {/* Endi AdminPage ni to'g'ridan-to'g'ri /admin/dashboard emas, balki /admin yo'nalishida render qilamiz */}
              {/* AdminLogin komponenti foydalanuvchi admin bo'lmasa AdminPage ichida shartli render qilinishi mumkin */}
              {/* Lekin hozircha, oddiyroq qilish uchun: agar /admin ga kirilsa va user admin bo'lsa, AdminPage ko'rsatiladi. */}
              {/* Agar user admin bo'lmasa, AdminLogin ga yo'naltirilishi kerak. Bu logikani useAuth hook ichida yoki AdminPage ichida boshqarish kerak. */}
              <Route path="/admin/dashboard" element={<AdminPage />} /> {/* Bu yo'nalishni ham saqlab turamiz, agar kerak bo'lsa */}
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;