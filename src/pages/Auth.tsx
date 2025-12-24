import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { toast } = useToast();

  const [fullName, setFullName] = useState("");
  // Telefon raqamini +998 bilan boshlaymiz
  const [phone, setPhone] = useState("+998");
  const [loading, setLoading] = useState(false);

  // Ism-familiya maydoni uchun o'zgartirish funksiyasi
  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Raqamlar yoki maxsus belgilar borligini tekshirish
    if (/[0-9!@#$%^&*()_+={}\[\]:;"'<>,.?/~`\-=/|]/g.test(value)) {
      toast({
        title: "Xatolik",
        description: "Ism-familiya faqat harflardan iborat bo'lishi kerak.",
        variant: "destructive",
      });
      return;
    }
    setFullName(value);
  };

  // Telefon raqami maydoni uchun o'zgartirish funksiyasi
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Har doim +998 bilan boshlanishini ta'minlash
    if (!value.startsWith("+998")) {
      value = "+998" + value.replace(/\D/g, ""); // Noto'g'ri kiritilsa +998 ni qo'shamiz
    }

    // +998 dan keyingi qismini olish va faqat raqamlarni qoldirish
    const rawValue = value.substring(4).replace(/\D/g, "");
    let formattedValue = "+998 ";

    if (rawValue.length > 0) {
      formattedValue += rawValue.substring(0, 2);
    }
    if (rawValue.length > 2) {
      formattedValue += " " + rawValue.substring(2, 5);
    }
    if (rawValue.length > 5) {
      formattedValue += " " + rawValue.substring(5, 7);
    }
    if (rawValue.length > 7) {
      formattedValue += " " + rawValue.substring(7, 7); // Bu yerda rawValue.substring(7, 9) bo'lishi kerak.
                                                          // Xatolikni to'g'irladim.
    }
    if (rawValue.length > 7) {
      formattedValue += " " + rawValue.substring(7, 9);
    }


    // Maksimal uzunlikni cheklash (+998 XX YYY YY YY = 19 ta belgi)
    if (formattedValue.length <= 19) {
      setPhone(formattedValue);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !phone.trim()) {
      toast({
        title: "Ma'lumot yetarli emas",
        description: "Iltimos, F.I.Sh va telefon raqamingizni kiriting.",
        variant: "destructive",
      });
      return;
    }

    // Telefon raqamini validatsiya qilish
    const cleanedPhone = phone.replace(/\D/g, ""); // Faqat raqamlarni qoldiramiz
    // O'zbekistondagi mobil va shahar telefon kodlari
    const uzbekPhoneRegex = /^\+998(?:33|71|88|90|91|93|94|95|97|98|99|77|50)\d{7}$/;

    if (!uzbekPhoneRegex.test("+" + cleanedPhone)) {
      toast({
        title: "Xatolik",
        description: "Iltimos, O'zbekistonning haqiqiy telefon raqamini kiriting (masalan, +998 90 123 45 67).",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const fakeEmail = cleanedPhone + "@gokorea.app";
    const password = cleanedPhone + "_pass";

    const { error } = await signUp(fakeEmail, password, {
      username: fullName,
      phone: phone, // Formatlangan raqamni saqlashimiz mumkin
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Xatolik",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-[#08132A] relative overflow-hidden">
      <div className="relative z-10 flex flex-col items-center">
        <img
          src="/images/gokoreaai.jpg"
          alt="Logo"
          className="w-24 h-24 rounded-full object-cover mb-6 shadow-xl"
        />

        <Card className="w-full max-w-sm p-6 shadow-2xl border border-blue-500/30 bg-black/60 backdrop-blur-sm rounded-xl text-white">
          <h1 className="text-center text-xl font-bold mb-2 text-white">Kirish</h1>
          <p className="text-center text-sm text-gray-300 mb-6">
            Davom etish uchun ma’lumotlaringizni kiriting
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName" className="text-gray-200">Ism Familiya</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={handleFullNameChange}
                placeholder="Masalan: Jasurbek Karimov"
                className="h-12 text-lg bg-black/20 border border-blue-400/30 placeholder:text-gray-400 text-white
                                   focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#1E293B]
                                   transition-all duration-300"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-gray-200">Telefon raqam</Label>
              <Input
                id="phone"
                type="tel" // Telefon raqami uchun type="tel" ishlatish yaxshi
                value={phone}
                onChange={handlePhoneChange}
                placeholder="+998 __ ___ __ __"
                className="h-12 text-lg bg-black/20 border border-blue-400/30 placeholder:text-gray-400 text-white
                                   focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#1E293B]
                                   transition-all duration-300"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg font-semibold
                               bg-gradient-to-r from-blue-600 to-blue-800
                               hover:from-blue-700 hover:to-blue-900
                               shadow-lg shadow-blue-500/50
                               text-white transition-all duration-300"
              disabled={loading}
            >
              {loading ? "Yuklanmoqda..." : "Kirish"}
            </Button>
          </form>
        </Card>

        <p className="text-xs text-gray-400 text-center mt-4">
          GoKorea xizmatiga xush kelibsiz!
        </p>
      </div>
    </div>
  );
}