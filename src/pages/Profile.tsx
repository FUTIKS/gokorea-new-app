import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Phone, 
  Calendar, 
  Shield, 
  LogOut,
  Edit,
  Check,
  X,
  Settings,
  Camera,
} from "lucide-react";

const formatPhoneNumber = (phone: string) => {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("998")) {
    return `+${cleaned}`;
  } else if (cleaned.length === 9) {
    return `+998${cleaned}`;
  }
  return phone;
};

export default function Profile() {
  const { user, profile, isAdmin, signOut, refreshProfile, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    phone: "",
    avatar_url: "",
  });
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setEditForm({
        username: profile.username || "",
        phone: profile.phone || "",
        avatar_url: profile.avatar_url || "",
      });
      setPreviewUrl(profile.avatar_url || "");
    }
  }, [profile]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const uploadAvatar = async (userId: string) => {
    if (!avatarFile) return editForm.avatar_url;

    try {
      const fileExt = avatarFile.name.split(".").pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile, { upsert: true });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);
        
      return publicUrl;
    } catch (error) {
      console.error("Avatar upload failed:", error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);

    try {
      let newAvatarUrl = editForm.avatar_url;
      
      if (avatarFile) {
        newAvatarUrl = await uploadAvatar(user.id);
      }

      const formattedPhone = editForm.phone ? formatPhoneNumber(editForm.phone) : null;

      const { error } = await supabase
        .from("profiles")
        .update({
          username: editForm.username || null,
          phone: formattedPhone,
          avatar_url: newAvatarUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) {
        console.error("Profile update error:", error);
        throw error;
      }

      await refreshProfile();
      
      setIsEditing(false);
      setAvatarFile(null);
      
      toast({
        title: "Muvaffaqiyatli",
        description: "Profilingiz yangilandi",
      });
    } catch (error: any) {
      console.error("Save error:", error);
      toast({
        title: "Xatolik",
        description: error?.message || "Profilni yangilashda xatolik yuz berdi",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setAvatarFile(null);
    if (profile) {
      setEditForm({
        username: profile.username || "",
        phone: profile.phone || "",
        avatar_url: profile.avatar_url || "",
      });
      setPreviewUrl(profile.avatar_url || "");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-[#6366f1] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white text-base font-medium">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const initials = profile?.username?.slice(0, 2).toUpperCase() || "U";
  const displayAvatar = previewUrl || profile?.avatar_url || "";

  return (
    <div className="min-h-screen w-full pb-20 bg-[#0f172a]">
      
      {/* Header Section */}
      <header className="pt-16 pb-12 px-6">
        <div className="flex flex-col items-center text-center">
          
          {/* Avatar with Glow Effect */}
          <div className="relative mb-6">
            <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] opacity-50 blur-xl"></div>
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-[#1e293b] shadow-2xl ring-4 ring-[#6366f1]/30">
                <AvatarImage 
                  src={displayAvatar} 
                  alt={profile?.username || "Avatar"}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white text-4xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
            
            {isEditing && (
              <Label 
                htmlFor="avatar-upload" 
                className="absolute bottom-1 right-1 w-10 h-10 rounded-full bg-[#6366f1] flex items-center justify-center cursor-pointer border-3 border-[#1e293b] shadow-xl hover:bg-[#5558e3] transition-all duration-300"
              >
                <Camera className="h-5 w-5 text-white" />
                <Input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarChange} 
                  className="hidden"
                  disabled={isSaving}
                />
              </Label>
            )}
          </div>
          
          {/* Name */}
          <h1 className="text-3xl font-bold text-white mb-2">
            {profile?.username || "Foydalanuvchi"}
          </h1>
          
          {/* Admin Badge */}
          {isAdmin && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-yellow-500/20 rounded-full border border-yellow-500/50">
              <Shield className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-semibold text-yellow-500">Admin</span>
            </div>
          )}
        </div>
      </header>

      {/* Profile Information Card */}
      <section className="px-6">
        <div className="bg-[#1e293b] rounded-2xl overflow-hidden">
          
          {/* Card Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#334155]">
            <h2 className="text-lg font-semibold text-white">Profil Ma'lumotlari</h2>
            
            {!isEditing ? (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsEditing(true)} 
                className="h-9 px-4 text-[#6366f1] hover:text-[#6366f1] hover:bg-[#6366f1]/10 flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Tahrirlash
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="h-9 px-3 text-gray-400 hover:text-white hover:bg-[#334155]"
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="h-9 px-4 bg-[#6366f1] hover:bg-[#5558e3] text-white"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
          
          {/* Card Content */}
          <div className="p-6 space-y-5">
            
            {/* Username Field */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#334155] flex items-center justify-center flex-shrink-0">
                <User className="h-6 w-6 text-[#6366f1]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 mb-1.5">Ism Familiya</p>
                {isEditing ? (
                  <Input
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    placeholder="Ismingizni kiriting"
                    className="h-11 bg-[#0f172a] border-[#334155] text-white focus:border-[#6366f1] focus:ring-0"
                    disabled={isSaving}
                  />
                ) : (
                  <p className="font-semibold text-white text-lg">
                    {profile?.username || "Kiritilmagan"}
                  </p>
                )}
              </div>
            </div>

            <Separator className="bg-[#334155]" />

            {/* Phone Field */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#334155] flex items-center justify-center flex-shrink-0">
                <Phone className="h-6 w-6 text-[#6366f1]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 mb-1.5">Telefon Raqami</p>
                {isEditing ? (
                  <Input
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="+998 XX XXX XX XX"
                    className="h-11 bg-[#0f172a] border-[#334155] text-white focus:border-[#6366f1] focus:ring-0"
                    disabled={isSaving}
                  />
                ) : (
                  <p className="font-semibold text-white text-lg">
                    {profile?.phone || "Kiritilmagan"}
                  </p>
                )}
              </div>
            </div>

            <Separator className="bg-[#334155]" />

            {/* Registration Date */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#334155] flex items-center justify-center flex-shrink-0">
                <Calendar className="h-6 w-6 text-[#6366f1]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 mb-1.5">Ro'yxatdan O'tilgan</p>
                <p className="font-semibold text-white text-lg">
                  {profile?.created_at 
                    ? new Date(profile.created_at).toLocaleDateString('uz-UZ')
                    : "Noma'lum"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <section className="px-6 mt-6 space-y-3">
        {isAdmin && (
          <Button
            variant="outline"
            className="w-full h-14 justify-start bg-[#1e293b] border-[#334155] text-white hover:bg-[#334155] transition-colors"
            onClick={() => navigate("/admin")}
          >
            <div className="w-11 h-11 rounded-lg bg-[#334155] flex items-center justify-center mr-3">
              <Settings className="h-5 w-5 text-[#6366f1]" />
            </div>
            <span className="text-base font-medium">Admin Panel</span>
          </Button>
        )}
        
        <Button
          variant="outline"
          className="w-full h-14 justify-start bg-[#dc2626] border-[#dc2626] text-white hover:bg-[#b91c1c] transition-colors"
          onClick={handleSignOut}
        >
          <div className="w-11 h-11 rounded-lg bg-white/10 flex items-center justify-center mr-3">
            <LogOut className="h-5 w-5 text-white" />
          </div>
          <span className="text-base font-medium">Tizimdan Chiqish</span>
        </Button>
      </section>
    </div>
  );
}