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
import Documents from "./pages/Documents"; // Documents komponentini kiritdik
import CalculatorPage from "./pages/CalculatorPage";
import Profile from "./pages/Profile";
import AdminLogin from "./pages/AdminLogin"; // Admin kirish sahifasi
import AdminPage from "./pages/AdminPage";   // Admin boshqaruv paneli
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
              <Route path="/documents" element={<Documents />} /> {/* Documents yo'nalishini qo'shdik */}
              <Route path="/calculator" element={<CalculatorPage />} />
              <Route path="/profile" element={<Profile />} />
              
              {/* Admin paneliga kirish uchun sahifa - /admin */}
              <Route path="/admin" element={<AdminLogin />} /> 
              
              {/* Admin panelining asosiy kontenti, kirishdan keyin ko'rsatiladi */}
              <Route path="/admin/dashboard" element={<AdminPage />} /> 
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;