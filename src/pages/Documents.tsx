import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  FileImage, 
  Upload, 
  FolderOpen, 
  ScanLine,
  FileText,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Download,
  FileArchive,
  FolderPlus,
  Edit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";

type DocumentType = "passport" | "id_card" | "contract" | "medical" | "diploma" | "reference" | "other";
type DocumentStatus = "pending" | "approved" | "rejected" | "incomplete";

interface Document {
  id: string;
  file_name: string;
  file_url: string;
  file_type: DocumentType;
  file_size: number | null;
  status: DocumentStatus;
  created_at: string;
  admin_notes?: string;
  rejection_reason?: string;
  folder_name?: string;
  custom_name?: string;
}

interface UserFolder {
  user_id: string;
  folder_name: string;
  document_count: number;
}

const documentTypeLabels: Record<DocumentType, string> = {
  passport: "Pasport",
  id_card: "ID Karta",
  contract: "Shartnoma",
  medical: "Tibbiy Hujjat",
  diploma: "Diploma",
  reference: "Ma'lumotnoma",
  other: "Boshqa",
};

// Consulting kompaniyasi uchun kerakli hujjatlar ro'yxati
const REQUIRED_DOCUMENTS: DocumentType[] = [
  "passport",
  "id_card", 
  "diploma",
  "medical",
  "contract"
];

const statusLabels: Record<DocumentStatus, string> = {
  pending: "Tekshirilmoqda",
  approved: "Tasdiqlangan",
  rejected: "Rad etilgan",
  incomplete: "To'liq emas",
};

const statusIcons: Record<DocumentStatus, React.ReactNode> = {
  pending: <Clock className="h-4 w-4 text-yellow-400" />,
  approved: <CheckCircle className="h-4 w-4 text-green-400" />,
  rejected: <XCircle className="h-4 w-4 text-red-400" />,
  incomplete: <AlertCircle className="h-4 w-4 text-orange-400" />,
};

const statusColors: Record<DocumentStatus, string> = {
  pending: "bg-yellow-500/20 border-yellow-500/50",
  approved: "bg-green-500/20 border-green-500/50", 
  rejected: "bg-red-500/20 border-red-500/50",
  incomplete: "bg-orange-500/20 border-orange-500/50",
};

export default function Documents() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [zipDialogOpen, setZipDialogOpen] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [selectedType, setSelectedType] = useState<DocumentType>("other");
  const [conversionType, setConversionType] = useState<"jpg-to-pdf" | "doc-to-pdf" | "merge-pdf">("jpg-to-pdf");
  const [isConverting, setIsConverting] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [missingDocuments, setMissingDocuments] = useState<DocumentType[]>([]);
  
  // Papka funksiyalari uchun
  const [currentFolder, setCurrentFolder] = useState<string>("");
  const [folderName, setFolderName] = useState<string>("");
  const [customFileName, setCustomFileName] = useState<string>("");
  
  // Status o'zgartirish uchun
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [newStatus, setNewStatus] = useState<DocumentStatus>("pending");
  const [adminNotes, setAdminNotes] = useState<string>("");
  
  // ZIP export uchun
  const [isExporting, setIsExporting] = useState(false);
  const [telegramBotToken, setTelegramBotToken] = useState<string>("");
  const [telegramChatId, setTelegramChatId] = useState<string>("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadDocuments();
    }
  }, [user, currentFolder]);

  const loadDocuments = async () => {
    if (!user) return;
    
    try {
      let query = supabase
        .from("documents")
        .select("*")
        .eq("user_id", user.id);
      
      if (currentFolder) {
        query = query.eq("folder_name", currentFolder);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      const docs = (data as Document[]) || [];
      setDocuments(docs);
      
      // Hujjatlar to'liqligini hisoblash
      calculateCompletion(docs);
    } catch (error) {
      console.error("Error loading documents:", error);
      toast({
        title: "Xatolik",
        description: "Hujjatlarni yuklashda xatolik yuz berdi.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateCompletion = (docs: Document[]) => {
    const approvedTypes = new Set(
      docs
        .filter(d => d.status === "approved")
        .map(d => d.file_type)
    );
    
    const missing = REQUIRED_DOCUMENTS.filter(type => !approvedTypes.has(type));
    setMissingDocuments(missing);
    
    const percentage = Math.round((approvedTypes.size / REQUIRED_DOCUMENTS.length) * 100);
    setCompletionPercentage(percentage);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Fayl juda katta",
          description: "Maksimal fayl hajmi 10MB.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleMultipleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Har bir faylni tekshirish
      for (let i = 0; i < files.length; i++) {
        if (files[i].size > 10 * 1024 * 1024) {
          toast({
            title: "Fayl juda katta",
            description: `${files[i].name} - Maksimal fayl hajmi 10MB.`,
            variant: "destructive",
          });
          return;
        }
      }
      setSelectedFiles(files);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;
    setIsUploading(true);

    try {
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = customFileName || selectedFile.name;
      const filePath = `${user.id}${currentFolder ? `/${currentFolder}` : ''}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase.from("documents").insert({
        user_id: user.id,
        file_name: fileName,
        file_url: publicUrl,
        file_type: selectedType,
        file_size: selectedFile.size,
        status: "pending",
        folder_name: currentFolder || null,
        custom_name: customFileName || null,
      });

      if (dbError) throw dbError;

      toast({
        title: "Muvaffaqiyat",
        description: "Hujjat muvaffaqiyatli yuklandi va tekshirish uchun yuborildi.",
      });

      setUploadDialogOpen(false);
      setSelectedFile(null);
      setCustomFileName("");
      loadDocuments();
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Yuklash Amali Muvaffaqiyatsiz",
        description: "Hujjatni yuklashda xatolik yuz berdi.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "O'chirildi",
        description: "Hujjat muvaffaqiyatli o'chirildi.",
      });
      loadDocuments();
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Xatolik",
        description: "Hujjatni o'chirishda xatolik yuz berdi.",
        variant: "destructive",
      });
    }
  };

  // JPG to PDF konvertatsiya
  const convertImageToPDF = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const pdf = new jsPDF({
            orientation: img.width > img.height ? 'landscape' : 'portrait',
            unit: 'px',
            format: [img.width, img.height]
          });
          
          pdf.addImage(img, 'JPEG', 0, 0, img.width, img.height);
          const pdfBlob = pdf.output('blob');
          resolve(pdfBlob);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Multiple PDF merge
  const mergePDFs = async (files: FileList): Promise<Blob> => {
    const pdf = new jsPDF();
    let isFirstPage = true;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (file.type === 'application/pdf') {
        // PDF fayllarni birlashtirish uchun pdf-lib kerak bo'ladi
        // Hozircha faqat imagelarni qo'llab-quvvatlaymiz
        toast({
          title: "Diqqat",
          description: "PDF birlashtirishni hozircha qo'llab-quvvatlanmaydi. Faqat rasmlarni PDF ga aylantirish mumkin.",
          variant: "destructive",
        });
        throw new Error("PDF merging not yet implemented");
      } else if (file.type.startsWith('image/')) {
        const imgData = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });

        const img = new Image();
        await new Promise((resolve) => {
          img.onload = resolve;
          img.src = imgData;
        });

        if (!isFirstPage) {
          pdf.addPage([img.width, img.height], img.width > img.height ? 'landscape' : 'portrait');
        } else {
          isFirstPage = false;
        }
        
        pdf.addImage(img, 'JPEG', 0, 0, img.width, img.height);
      }
    }

    return pdf.output('blob');
  };

  const handleConversion = async () => {
    if (!selectedFile && !selectedFiles) return;
    setIsConverting(true);

    try {
      let pdfBlob: Blob;
      let fileName = "converted.pdf";

      if (conversionType === "jpg-to-pdf" && selectedFile) {
        pdfBlob = await convertImageToPDF(selectedFile);
        fileName = selectedFile.name.replace(/\.[^/.]+$/, "") + ".pdf";
      } else if (conversionType === "merge-pdf" && selectedFiles) {
        pdfBlob = await mergePDFs(selectedFiles);
        fileName = "merged_" + Date.now() + ".pdf";
      } else if (conversionType === "doc-to-pdf") {
        toast({
          title: "Xatolik",
          description: "Word to PDF konvertatsiyasi hozircha qo'llab-quvvatlanmaydi. Iltimos, online konverterdan foydalaning.",
          variant: "destructive",
        });
        return;
      } else {
        throw new Error("Invalid conversion type");
      }

      // PDF ni yuklab olish
      saveAs(pdfBlob, fileName);
      
      toast({
        title: "Konvertatsiya Muvaffaqiyatli",
        description: `Fayl ${fileName} nomi bilan saqlandi.`,
      });
      
      setConvertDialogOpen(false);
      setSelectedFile(null);
      setSelectedFiles(null);
    } catch (error) {
      console.error("Conversion error:", error);
      toast({
        title: "Xatolik",
        description: "Faylni konvertatsiya qilishda xatolik yuz berdi.",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  // Papka yaratish
  const handleCreateFolder = () => {
    if (!folderName.trim()) {
      toast({
        title: "Xatolik",
        description: "Papka nomini kiriting.",
        variant: "destructive",
      });
      return;
    }

    setCurrentFolder(folderName.trim());
    setFolderDialogOpen(false);
    setFolderName("");
    
    toast({
      title: "Papka yaratildi",
      description: `"${folderName}" papkasi yaratildi.`,
    });
  };

  // Admin: Hujjat statusini o'zgartirish
  const handleUpdateStatus = async () => {
    if (!selectedDocument || !isAdmin) return;

    try {
      const updateData: any = {
        status: newStatus,
      };

      if (adminNotes.trim()) {
        if (newStatus === "rejected") {
          updateData.rejection_reason = adminNotes;
        } else if (newStatus === "incomplete") {
          updateData.admin_notes = adminNotes;
        }
      }

      const { error } = await supabase
        .from("documents")
        .update(updateData)
        .eq("id", selectedDocument.id);

      if (error) throw error;

      toast({
        title: "Yangilandi",
        description: "Hujjat holati yangilandi.",
      });

      setStatusDialogOpen(false);
      setSelectedDocument(null);
      setAdminNotes("");
      loadDocuments();
    } catch (error) {
      console.error("Update status error:", error);
      toast({
        title: "Xatolik",
        description: "Holatni yangilashda xatolik yuz berdi.",
        variant: "destructive",
      });
    }
  };

  // ZIP export va Telegram botga yuborish
  const handleExportZIP = async () => {
    if (documents.length === 0) {
      toast({
        title: "Hujjatlar yo'q",
        description: "Export qilish uchun hujjatlar mavjud emas.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    try {
      const zip = new JSZip();
      const folder = zip.folder(currentFolder || "Documents");

      // Har bir hujjatni ZIP ga qo'shish
      for (const doc of documents) {
        try {
          const response = await fetch(doc.file_url);
          const blob = await response.blob();
          const fileName = doc.custom_name || doc.file_name;
          folder?.file(fileName, blob);
        } catch (error) {
          console.error(`Error fetching ${doc.file_name}:`, error);
        }
      }

      // ZIP ni generatsiya qilish
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipFileName = `${currentFolder || 'documents'}_${Date.now()}.zip`;

      // Agar Telegram bot token va chat ID berilgan bo'lsa, botga yuborish
      if (telegramBotToken && telegramChatId) {
        const formData = new FormData();
        formData.append('chat_id', telegramChatId);
        formData.append('document', zipBlob, zipFileName);

        const response = await fetch(
          `https://api.telegram.org/bot${telegramBotToken}/sendDocument`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error('Telegram botga yuborishda xatolik');
        }

        toast({
          title: "Muvaffaqiyat",
          description: "Hujjatlar ZIP qilib Telegram botga yuborildi.",
        });
      } else {
        // Faqat yuklab olish
        saveAs(zipBlob, zipFileName);
        
        toast({
          title: "Yuklab olindi",
          description: `${documents.length} ta hujjat ZIP qilindi.`,
        });
      }

      setZipDialogOpen(false);
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Xatolik",
        description: "ZIP export qilishda xatolik yuz berdi.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary">Yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full text-white pb-24">
      {/* Header */}
      <header className="pt-16 pb-6 px-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Hujjatlarni Boshqarish</h1>
            <p className="text-gray-400 mt-1">
              {currentFolder ? `Papka: ${currentFolder}` : "Fayllaringizni boshqaring va konvertatsiya qiling"}
            </p>
          </div>
          {currentFolder && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentFolder("")}
              className="text-blue-400 hover:text-blue-300"
            >
              Asosiy sahifa
            </Button>
          )}
        </div>
      </header>

      {/* Completion Progress */}
      <section className="px-4 mb-6">
        <Card className={cn(
          "border-0 shadow-lg backdrop-blur-sm",
          completionPercentage === 100 ? "bg-green-500/20" : "bg-black/30"
        )}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">Hujjatlar to'liqligi</span>
              <span className="text-lg font-bold text-white">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div 
                className="bg-gradient-to-r from-blue-600 to-green-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            {missingDocuments.length > 0 && (
              <div className="mt-3 p-2 bg-orange-500/20 border border-orange-500/50 rounded-lg">
                <p className="text-xs text-orange-300 font-medium mb-1">Kamayotgan hujjatlar:</p>
                <div className="flex flex-wrap gap-1">
                  {missingDocuments.map(type => (
                    <span key={type} className="text-xs bg-orange-500/30 px-2 py-0.5 rounded">
                      {documentTypeLabels[type]}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Tools Grid */}
      <section className="px-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Amallar
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {isAdmin && (
            <Card
              className="border-0 shadow-lg bg-black/30 backdrop-blur-sm hover:shadow-xl transition-all cursor-pointer animate-fade-in"
              onClick={() => setFolderDialogOpen(true)}
            >
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-purple-600/20 flex items-center justify-center border border-purple-600/50">
                  <FolderPlus className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="font-semibold text-sm text-white">Papka Yaratish</h3>
                <p className="text-xs text-gray-400">Foydalanuvchi papkasi</p>
              </CardContent>
            </Card>
          )}

          <Card
            className="border-0 shadow-lg bg-black/30 backdrop-blur-sm hover:shadow-xl transition-all cursor-pointer animate-fade-in"
            onClick={() => setConvertDialogOpen(true)}
          >
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-blue-600/20 flex items-center justify-center border border-blue-600/50">
                <FileImage className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="font-semibold text-sm text-white">Konvertatsiya</h3>
              <p className="text-xs text-gray-400">JPG → PDF</p>
            </CardContent>
          </Card>

          <Card
            className="border-0 shadow-lg bg-black/30 backdrop-blur-sm hover:shadow-xl transition-all cursor-pointer animate-fade-in"
            style={{ animationDelay: "50ms" }}
            onClick={() => setUploadDialogOpen(true)}
          >
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-green-600/20 flex items-center justify-center border border-green-600/50">
                <Upload className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="font-semibold text-sm text-white">Yuklash</h3>
              <p className="text-xs text-gray-400">Yangi hujjat qo'shish</p>
            </CardContent>
          </Card>

          <Card
            className="border-0 shadow-lg bg-black/30 backdrop-blur-sm hover:shadow-xl transition-all cursor-pointer animate-fade-in"
            style={{ animationDelay: "100ms" }}
            onClick={() => setZipDialogOpen(true)}
          >
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-orange-600/20 flex items-center justify-center border border-orange-600/50">
                <FileArchive className="h-6 w-6 text-orange-400" />
              </div>
              <h3 className="font-semibold text-sm text-white">ZIP Export</h3>
              <p className="text-xs text-gray-400">Barcha hujjatlar</p>
            </CardContent>
          </Card>

          <Card
            className="border-0 shadow-lg bg-black/30 backdrop-blur-sm hover:shadow-xl transition-all cursor-pointer animate-fade-in"
            style={{ animationDelay: "150ms" }}
            onClick={() => setViewDialogOpen(true)}
          >
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-cyan-600/20 flex items-center justify-center border border-cyan-600/50">
                <FolderOpen className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="font-semibold text-sm text-white">Mening Hujjatlarim</h3>
              <p className="text-xs text-gray-400">Barcha fayllar</p>
            </CardContent>
          </Card>

          {isAdmin && (
            <Card
              className="border-0 shadow-lg bg-black/30 backdrop-blur-sm hover:shadow-xl transition-all cursor-pointer animate-fade-in"
              style={{ animationDelay: "200ms" }}
              onClick={() => navigate("/admin/documents")}
            >
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-red-600/20 flex items-center justify-center border border-red-600/50">
                  <ScanLine className="h-6 w-6 text-red-400" />
                </div>
                <h3 className="font-semibold text-sm text-white">Admin Panel</h3>
                <p className="text-xs text-gray-400">Tekshirish</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Recent Documents */}
      <section className="px-4 mt-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          So'nggi Hujjatlar
        </h2>
        {documents.length === 0 ? (
          <Card className="border-dashed border-2 border-blue-500/50 bg-black/30">
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-400 mb-2">
                {currentFolder ? `"${currentFolder}" papkasida hujjatlar yo'q` : "Hali hujjatlar yo'q"}
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Ish bilan ta'minlash uchun {REQUIRED_DOCUMENTS.length} ta hujjat talab qilinadi
              </p>
              <Button
                variant="telegram"
                className="mt-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                onClick={() => setUploadDialogOpen(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Birinchi Hujjatni Yuklash
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <Card key={doc.id} className={cn("border-0 shadow-lg", statusColors[doc.status])}>
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-white truncate">
                        {doc.custom_name || doc.file_name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {documentTypeLabels[doc.file_type]} • {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {statusIcons[doc.status]}
                        <span className="text-xs text-gray-300">{statusLabels[doc.status]}</span>
                      </div>
                      {doc.rejection_reason && (
                        <div className="mt-2 p-2 bg-red-500/20 rounded text-xs text-red-300">
                          <span className="font-medium">Sabab: </span>
                          {doc.rejection_reason}
                        </div>
                      )}
                      {doc.admin_notes && doc.status === "incomplete" && (
                        <div className="mt-2 p-2 bg-orange-500/20 rounded text-xs text-orange-300">
                          <span className="font-medium">Izoh: </span>
                          {doc.admin_notes}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="hover:bg-blue-500/20"
                      >
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-4 w-4 text-blue-400" />
                        </a>
                      </Button>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedDocument(doc);
                            setNewStatus(doc.status);
                            setStatusDialogOpen(true);
                          }}
                          className="hover:bg-green-500/20"
                        >
                          <Edit className="h-4 w-4 text-green-400" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(doc.id)}
                        className="hover:bg-red-500/20"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Papka yaratish Dialog */}
      <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
        <DialogContent className="bg-[#0d0d1e] text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>Yangi Papka Yaratish</DialogTitle>
            <DialogDescription className="text-gray-400">
              Foydalanuvchi uchun papka yarating
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="folder-name" className="text-gray-200">Papka Nomi (Foydalanuvchi ismi)</Label>
              <Input
                id="folder-name"
                type="text"
                placeholder="Masalan: Alisher_Valiyev"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="mt-2 bg-black/20 border-gray-700 text-white"
              />
              <p className="text-xs text-gray-400 mt-1">
                Papka nomida bo'sh joy bo'lmasligi kerak
              </p>
            </div>
            <Button
              variant="telegram"
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
              onClick={handleCreateFolder}
            >
              <FolderPlus className="h-4 w-4 mr-2" />
              Papka Yaratish
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="bg-[#0d0d1e] text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>Hujjat Yuklash</DialogTitle>
            <DialogDescription className="text-gray-400">
              Hujjatingizni tanlang va turini belgilang
              {currentFolder && (
                <span className="block mt-1 text-purple-400">
                  Papka: {currentFolder}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="custom-name" className="text-gray-200">Hujjat Nomi (ixtiyoriy)</Label>
              <Input
                id="custom-name"
                type="text"
                placeholder="Masalan: Pasport_nusxasi"
                value={customFileName}
                onChange={(e) => setCustomFileName(e.target.value)}
                className="mt-2 bg-black/20 border-gray-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="file" className="text-gray-200">Faylni Tanlang</Label>
              <Input
                id="file"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                onChange={handleFileChange}
                className="mt-2 bg-black/20 border-gray-700 text-white"
              />
              <p className="text-xs text-gray-400 mt-1">
                Maksimal 10MB. Qo'llab-quvvatlanadi: JPG, PNG, PDF, DOC, DOCX
              </p>
            </div>
            <div>
              <Label className="text-gray-200">Hujjat Turi</Label>
              <Select value={selectedType} onValueChange={(v) => setSelectedType(v as DocumentType)}>
                <SelectTrigger className="mt-2 bg-black/20 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0d0d1e] text-white border-gray-700">
                  {Object.entries(documentTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value} className="hover:bg-gray-800">
                      {label}
                      {REQUIRED_DOCUMENTS.includes(value as DocumentType) && (
                        <span className="ml-2 text-xs text-red-400">*</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-400 mt-1">
                * - Majburiy hujjatlar
              </p>
            </div>
            {selectedFile && (
              <Card className="bg-blue-600/20 border-blue-500/50">
                <CardContent className="p-3 flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-white">
                      {customFileName || selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            <Button
              variant="telegram"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? "Yuklanmoqda..." : "Hujjatni Yuklash"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Conversion Dialog */}
      <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <DialogContent className="bg-[#0d0d1e] text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>Fayl Konvertatsiyasi</DialogTitle>
            <DialogDescription className="text-gray-400">
              Faylni PDF formatiga o'zgartiring
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-200">Konvertatsiya Turi</Label>
              <Select value={conversionType} onValueChange={(v) => setConversionType(v as any)}>
                <SelectTrigger className="mt-2 bg-black/20 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0d0d1e] text-white border-gray-700">
                  <SelectItem value="jpg-to-pdf" className="hover:bg-gray-800">
                    JPG → PDF (Bitta rasm)
                  </SelectItem>
                  <SelectItem value="merge-pdf" className="hover:bg-gray-800">
                    Rasmlarni PDF ga birlashtirish
                  </SelectItem>
                  <SelectItem value="doc-to-pdf" className="hover:bg-gray-800" disabled>
                    Word → PDF (Hozircha mavjud emas)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="convert-file" className="text-gray-200">
                {conversionType === "merge-pdf" ? "Rasmlarni Tanlang (ko'p fayl)" : "Faylni Tanlang"}
              </Label>
              <Input
                id="convert-file"
                type="file"
                accept={conversionType === "jpg-to-pdf" ? ".jpg,.jpeg,.png" : conversionType === "doc-to-pdf" ? ".doc,.docx" : ".jpg,.jpeg,.png,.pdf"}
                multiple={conversionType === "merge-pdf"}
                onChange={conversionType === "merge-pdf" ? handleMultipleFilesChange : handleFileChange}
                className="mt-2 bg-black/20 border-gray-700 text-white"
              />
              <p className="text-xs text-gray-400 mt-1">
                {conversionType === "merge-pdf" 
                  ? "Bir nechta rasm fayllarini tanlang (JPG, PNG)"
                  : "Bitta fayl tanlang"
                }
              </p>
            </div>
            {(selectedFile || selectedFiles) && (
              <Card className="bg-green-600/20 border-green-500/50">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-green-400" />
                    <div className="flex-1 min-w-0">
                      {selectedFiles ? (
                        <>
                          <p className="text-sm font-medium text-white">{selectedFiles.length} ta fayl tanlandi</p>
                          <p className="text-xs text-gray-400">
                            {Array.from(selectedFiles).map(f => f.name).join(", ")}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-medium truncate text-white">{selectedFile?.name}</p>
                          <p className="text-xs text-gray-400">
                            {selectedFile && (selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            <Button
              variant="telegram"
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              onClick={handleConversion}
              disabled={(!selectedFile && !selectedFiles) || isConverting}
            >
              {isConverting ? "Konvertatsiya qilinmoqda..." : "PDF ga Aylantirish"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Admin: Status o'zgartirish Dialog */}
      {isAdmin && (
        <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
          <DialogContent className="bg-[#0d0d1e] text-white border-gray-700">
            <DialogHeader>
              <DialogTitle>Hujjat Holatini O'zgartirish</DialogTitle>
              <DialogDescription className="text-gray-400">
                {selectedDocument?.file_name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-200">Yangi Holat</Label>
                <Select value={newStatus} onValueChange={(v) => setNewStatus(v as DocumentStatus)}>
                  <SelectTrigger className="mt-2 bg-black/20 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0d0d1e] text-white border-gray-700">
                    <SelectItem value="pending" className="hover:bg-gray-800">
                      🔄 Tekshirilmoqda
                    </SelectItem>
                    <SelectItem value="approved" className="hover:bg-gray-800">
                      ✅ Tasdiqlangan
                    </SelectItem>
                    <SelectItem value="incomplete" className="hover:bg-gray-800">
                      ⚠️ To'liq emas
                    </SelectItem>
                    <SelectItem value="rejected" className="hover:bg-gray-800">
                      ❌ Rad etilgan
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(newStatus === "rejected" || newStatus === "incomplete") && (
                <div>
                  <Label className="text-gray-200">
                    {newStatus === "rejected" ? "Rad etilish sababi" : "Admin izohi"}
                  </Label>
                  <Textarea
                    placeholder={
                      newStatus === "rejected" 
                        ? "Nima uchun rad etildi..." 
                        : "Qanday o'zgartirish kerak..."
                    }
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="mt-2 bg-black/20 border-gray-700 text-white min-h-[100px]"
                  />
                </div>
              )}
              <Button
                variant="telegram"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                onClick={handleUpdateStatus}
              >
                Holatni Yangilash
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ZIP Export Dialog */}
      <Dialog open={zipDialogOpen} onOpenChange={setZipDialogOpen}>
        <DialogContent className="bg-[#0d0d1e] text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>Hujjatlarni ZIP qilish</DialogTitle>
            <DialogDescription className="text-gray-400">
              Barcha hujjatlarni ZIP arxivga joylashtiring
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-blue-600/20 border border-blue-500/50 rounded-lg">
              <p className="text-sm text-white">
                <strong>{documents.length} ta hujjat</strong> ZIP qilinadi
              </p>
              {currentFolder && (
                <p className="text-xs text-gray-400 mt-1">
                  Papka: {currentFolder}
                </p>
              )}
            </div>
            
            <div className="p-3 bg-gray-800 rounded-lg space-y-3">
              <h4 className="text-sm font-medium text-white">Telegram Botga Yuborish (ixtiyoriy)</h4>
              <div>
                <Label htmlFor="bot-token" className="text-gray-200 text-xs">Bot Token</Label>
                <Input
                  id="bot-token"
                  type="text"
                  placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                  value={telegramBotToken}
                  onChange={(e) => setTelegramBotToken(e.target.value)}
                  className="mt-1 bg-black/20 border-gray-700 text-white text-sm"
                />
              </div>
              <div>
                <Label htmlFor="chat-id" className="text-gray-200 text-xs">Chat ID</Label>
                <Input
                  id="chat-id"
                  type="text"
                  placeholder="123456789"
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  className="mt-1 bg-black/20 border-gray-700 text-white text-sm"
                />
              </div>
              <p className="text-xs text-gray-400">
                Token va Chat ID bo'sh qoldirilsa, faqat yuklab olinadi
              </p>
            </div>

            <Button
              variant="telegram"
              className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800"
              onClick={handleExportZIP}
              disabled={isExporting}
            >
              {isExporting ? (
                "ZIP qilinmoqda..."
              ) : (
                <>
                  <FileArchive className="h-4 w-4 mr-2" />
                  {telegramBotToken && telegramChatId ? "ZIP va Botga Yuborish" : "ZIP Yuklab Olish"}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View All Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto bg-[#0d0d1e] text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>Mening Hujjatlarim ({documents.length})</DialogTitle>
            {currentFolder && (
              <p className="text-sm text-gray-400">Papka: {currentFolder}</p>
            )}
          </DialogHeader>
          <div className="space-y-2">
            {documents.map((doc) => (
              <Card key={doc.id} className={cn("border-0 shadow-sm", statusColors[doc.status])}>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate text-white">
                      {doc.custom_name || doc.file_name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{documentTypeLabels[doc.file_type]}</span>
                      <span>•</span>
                      {statusIcons[doc.status]}
                      <span className="capitalize">{statusLabels[doc.status]}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="hover:bg-blue-500/20"
                    >
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                        <Eye className="h-4 w-4 text-blue-400" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="hover:bg-green-500/20"
                    >
                      <a href={doc.file_url} download>
                        <Download className="h-4 w-4 text-green-400" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}