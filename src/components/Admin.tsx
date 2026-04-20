import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, 
  Plus, 
  Trash, 
  Edit3, 
  Save, 
  FileText, 
  LogOut, 
  LayoutDashboard, 
  Settings, 
  ArrowLeft,
  Search,
  ChevronRight,
  Eye,
  Send,
  Copy,
  Check,
  Calendar,
  X,
  Smartphone,
  MapPin,
  LogIn,
  Youtube,
  ImagePlus,
  Video,
  MessageSquare,
  Mail,
  Phone,
  Map as MapIcon,
  Info,
  Facebook,
  Twitter,
  Users,
  AlertTriangle,
  Megaphone,
  Globe,
  Tag,
  MonitorOff,
  User,
  Camera,
  Type,
  Bold,
  Italic,
  Link as LinkIcon,
  List as ListIcon,
  TrendingUp,
  Mic,
  Music,
  Headset,
  Upload,
  Heart,
  CreditCard,
  Award,
  CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Article, Event, SiteSettings, Comment, Subscriber, MediaAsset, SupportMessage, Poll, UserProfile, LiveBlog, LiveUpdate, WebTV } from '../types';
import { cn, optimizeImage } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { SupabaseService } from '../lib/supabase';
import { MOCK_ARTICLES, MOCK_EVENTS } from '../constants';

const GitHubImageUpload = ({ 
  value, 
  onChange, 
  placeholder,
  icon: Icon = Smartphone,
  inputClassName = "bg-slate-50"
}: { 
  value: string, 
  onChange: (val: string) => void,
  placeholder?: string,
  icon?: any,
  inputClassName?: string
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
        const token = import.meta.env.VITE_GITHUB_TOKEN;

        if (!token) {
          alert("Erreur: VITE_GITHUB_TOKEN n'est pas configurée.");
          setIsUploading(false);
          return;
        }

        const response = await fetch(`https://api.github.com/repos/Akwabanews/akwaba-info/contents/public/images/${fileName}`, {
          method: 'PUT',
          headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `Upload image ${fileName}`,
            content: base64,
          }),
        });

        if (response.ok) {
          const rawUrl = `https://raw.githubusercontent.com/Akwabanews/akwaba-info/main/public/images/${fileName}`;
          onChange(rawUrl);
          alert("✅ Image téléchargée avec succès !");
        } else {
          const err = await response.json();
          console.error("GitHub upload error:", err);
          alert(`Erreur d'upload: ${err.message || 'Inconnue'}`);
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Erreur lors du téléchargement.");
      setIsUploading(false);
    }
  };

  return (
    <div className="relative flex gap-2">
      <div className="relative flex-1">
        <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          type="text" 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn("w-full rounded-xl pl-9 pr-4 py-3 text-[10px] outline-none focus:ring-2 focus:ring-primary/10 transition-all", inputClassName)}
          placeholder={placeholder || "https://..."}
        />
      </div>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className={cn(
          "px-4 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary transition-all shadow-lg shadow-slate-900/10 shrink-0",
          isUploading && "opacity-50 cursor-not-allowed"
        )}
      >
        {isUploading ? (
          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <Upload size={14} />
        )}
        {isUploading ? "..." : "📤 Upload"}
      </button>
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleUpload}
        className="hidden"
        accept="image/*"
      />
    </div>
  );
};

export const AdminLogin = ({ onLogin }: { onLogin: () => void }) => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-slate-100"
      >
        <div className="flex flex-col items-center gap-6 mb-8 text-center">
          <div className="p-4 bg-primary/10 rounded-2xl text-primary">
            <Lock size={40} />
          </div>
          <div>
            <h2 className="text-2xl font-black">Espace Admin</h2>
            <p className="text-slate-400 text-sm mt-1">Authentification sécurisée par lien magique.</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <button 
            onClick={onLogin}
            className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-3"
          >
            <Mail size={20} className="text-primary" />
            Recevoir le lien d'accès
          </button>
        </div>
        
        <p className="text-center text-[10px] text-slate-400 mt-8 font-bold uppercase tracking-widest">
          Akwaba Info • Système de Gestion de Contenu
        </p>
      </motion.div>
    </div>
  );
};

export const PollEditor = ({ poll, onSave, onCancel }: { poll: Partial<Poll>, onSave: (p: Poll) => void, onCancel: () => void }) => {
  const [formData, setFormData] = useState<Poll>({
    id: poll.id || Date.now().toString(),
    question: poll.question || '',
    options: poll.options || [
      { id: '1', text: '', votes: 0 },
      { id: '2', text: '', votes: 0 }
    ],
    startDate: poll.startDate || new Date().toISOString().split('T')[0],
    endDate: poll.endDate || null,
    active: poll.active !== undefined ? poll.active : true
  });

  const handleAddOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { id: (formData.options.length + 1).toString(), text: '', votes: 0 }]
    });
  };

  const handleRemoveOption = (id: string) => {
    if (formData.options.length <= 2) return;
    setFormData({
      ...formData,
      options: formData.options.filter(o => o.id !== id)
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button 
          onClick={onCancel}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black transition-all text-sm uppercase tracking-widest"
        >
          <ArrowLeft size={18} /> RETOUR
        </button>
        <button 
          onClick={() => onSave(formData)}
          className="px-8 py-4 bg-primary text-white font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest border-2 border-white"
        >
          <Save size={18} /> ENREGISTRER
        </button>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl p-10 space-y-10">
        <div className="space-y-4">
          <label className="text-xs font-black uppercase tracking-widest text-primary italic px-2">Question du Sondage</label>
          <input 
            type="text"
            value={formData.question}
            onChange={(e) => setFormData({...formData, question: e.target.value})}
            placeholder="Ex: Pensez-vous que..."
            className="w-full bg-slate-50 border-none rounded-3xl px-8 py-6 text-2xl font-black outline-none focus:ring-4 focus:ring-primary/10 transition-all"
          />
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center px-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Options de réponse</label>
            <button 
              onClick={handleAddOption}
              className="text-[10px] font-black uppercase text-primary hover:underline flex items-center gap-1"
            >
              <Plus size={14} /> Ajouter une option
            </button>
          </div>
          <div className="grid gap-4">
            {formData.options.map((option, idx) => (
              <div key={option.id} className="flex gap-4">
                <div className="flex-1 relative">
                   <div className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                    {idx + 1}
                  </div>
                  <input 
                    type="text"
                    value={option.text}
                    onChange={(e) => {
                      const newOptions = [...formData.options];
                      newOptions[idx].text = e.target.value;
                      setFormData({...formData, options: newOptions});
                    }}
                    placeholder={`Option ${idx + 1}`}
                    className="w-full bg-slate-50 border-none rounded-2xl pl-16 pr-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                  />
                </div>
                <button 
                   type="button"
                  onClick={() => handleRemoveOption(option.id)}
                  className="p-4 text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-50">
           <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-2 italic">Date de début</label>
            <input 
              type="date"
              value={(formData.startDate || '').split('T')[0]}
              onChange={(e) => setFormData({...formData, startDate: e.target.value || null})}
              className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none"
            />
          </div>
          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-2 italic">Statut</label>
            <div className="flex bg-slate-50 p-1 rounded-2xl">
              <button 
                onClick={() => setFormData({...formData, active: true})}
                className={cn(
                  "flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all",
                  formData.active ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-slate-400"
                )}
              >
                Actif
              </button>
              <button 
                onClick={() => setFormData({...formData, active: false})}
                className={cn(
                  "flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all",
                  !formData.active ? "bg-amber-500 text-white shadow-lg" : "text-slate-400"
                )}
              >
                Terminé
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AdminDashboard = ({ 
  articles, 
  events,
  comments,
  subscribers,
  mediaLibrary,
  settings,
  polls,
  stats,
  onEditArticle,
  onEditEvent, 
  onEditPoll,
  onCreateArticle,
  onCreateEvent, 
  onCreatePoll,
  onDeleteArticle,
  onDeleteEvent, 
  onDeletePoll,
  onDeleteComment,
  onDeleteSubscriber,
  onDeleteMedia,
  onBlockUser,
  onSaveSettings,
  onLogout,
  onGenerateCode,
  setActiveNotification,
  liveBlogs,
  onEditLiveBlog,
  onCreateLiveBlog,
  onDeleteLiveBlog,
  webTV,
  onEditWebTV,
  onCreateWebTV,
  onDeleteWebTV
}: { 
  articles: Article[], 
  events: Event[],
  comments: Comment[],
  subscribers: Subscriber[],
  mediaLibrary: MediaAsset[],
  settings: SiteSettings,
  polls: Poll[],
  liveBlogs: LiveBlog[],
  webTV: WebTV[],
  stats?: any,
  onEditArticle: (a: Article) => void,
  onEditEvent: (e: Event) => void,
  onEditPoll: (p: Poll) => void,
  onEditLiveBlog: (l: LiveBlog) => void,
  onEditWebTV: (v: WebTV) => void,
  onCreateArticle: () => void,
  onCreateEvent: () => void,
  onCreatePoll: () => void,
  onCreateLiveBlog: () => void,
  onCreateWebTV: () => void,
  onDeleteArticle: (id: string) => void,
  onDeleteEvent: (id: string) => void,
  onDeletePoll: (id: string) => void,
  onDeleteLiveBlog: (id: string) => void,
  onDeleteWebTV: (id: string) => void,
  onDeleteComment: (id: string) => void,
  onDeleteSubscriber: (id: string) => void,
  onDeleteMedia: (id: string) => void,
  onBlockUser: (userId: string) => void,
  onSaveSettings: (s: SiteSettings) => void,
  onLogout: () => void,
  onGenerateCode: () => void,
  setActiveNotification?: (n: { message: string, type: 'success' | 'urgent' | 'info' } | null) => void
}) => {
  const [activeTab, setActiveTab] = useState<'articles' | 'events' | 'comments' | 'subscribers' | 'media' | 'settings' | 'analytics' | 'alerts' | 'support' | 'polls' | 'premium' | 'payments' | 'live-blog' | 'web-tv'>(
    (localStorage.getItem('akwaba_admin_tab') as any) || 'articles'
  );

  useEffect(() => {
    try {
      localStorage.setItem('akwaba_admin_tab', activeTab);
    } catch (e) {
      console.warn("LocalStorage save error:", e);
    }
  }, [activeTab]);

  const [searchTerm, setSearchTerm] = useState('');
  const [tempSettings, setTempSettings] = useState<SiteSettings>(settings || {
    aboutText: '',
    email: '',
    phone: '',
    address: '',
    facebookUrl: '',
    twitterUrl: '',
    instagramUrl: '',
    tiktokUrl: '',
    linkedinUrl: '',
    youtubeUrl: '',
    categories: [],
    maintenanceMode: false,
    urgentBannerActive: false,
    urgentBannerText: '',
    adSlotHeader: '',
    adSlotSidebar: '',
    donationAmounts: [1000, 2000, 5000],
    donationPaymentMethods: [],
    premiumPrice: 5000,
    isDonationActive: false,
    isPremiumActive: false,
    activePaymentMethods: {},
    paymentLinks: {},
    orangeMoneyNumber: '',
    mtnMoneyNumber: '',
    moovMoneyNumber: '',
    waveNumber: ''
  });
  const [newCategory, setNewCategory] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Sync tempSettings when props change
  useEffect(() => {
    if (settings) {
      setTempSettings(prev => {
        // Only update if settings are actually different to avoid unnecessary re-renders
        // or if we are not currently saving
        return {
          ...prev,
          ...settings,
          activePaymentMethods: settings.activePaymentMethods || prev.activePaymentMethods || {},
          paymentLinks: settings.paymentLinks || prev.paymentLinks || {},
          categories: settings.categories || prev.categories || [],
          donationAmounts: settings.donationAmounts || prev.donationAmounts || [1000, 2000, 5000]
        };
      });
    }
  }, [settings]);

  const validate = () => {
    if (!tempSettings.email || !tempSettings.email.includes('@')) {
      alert("Vérifiez l'adresse email de contact.");
      return false;
    }
    if (!tempSettings.aboutText || tempSettings.aboutText.length < 10) {
      alert("Le texte 'À propos' doit être rempli (min. 10 caractères).");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    
    // Safety : Réinitialiser isSaving après 15s si la promesse ne revient pas
    const safetyTimer = setTimeout(() => {
      setIsSaving(false);
    }, 15000);

    try {
      if (onSaveSettings) {
        await onSaveSettings(tempSettings);
      }
      // Success is handled by the parent's notification system
    } catch (e: any) {
      console.error("[AdminDashboard] Error saving settings:", e);
      alert("Une erreur est survenue lors de la sauvegarde : " + (e.message || "Erreur inconnue"));
    } finally {
      clearTimeout(safetyTimer);
      setIsSaving(false);
    }
  };
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertTopic, setAlertTopic] = useState('Urgent');

  // Support Management
  const [allSupportMessages, setAllSupportMessages] = useState<Record<string, SupportMessage[]>>({});
  const [activeChatUserId, setActiveChatUserId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    if (activeTab === 'support') {
      const unsub = SupabaseService.subscribeToAllSupportMessages((userId, msgs) => {
        setAllSupportMessages(prev => ({ ...prev, [userId]: msgs }));
      });
      return unsub;
    }
  }, [activeTab]);

  const handleSendReply = async () => {
    if (!replyText.trim() || !activeChatUserId) return;
    const adminMsg: SupportMessage = {
      id: Date.now().toString(),
      userId: activeChatUserId,
      userName: 'Support Akwaba',
      content: replyText,
      date: new Date().toISOString(),
      isAdmin: true
    };
    setReplyText('');
    await SupabaseService.sendSupportMessage(adminMsg);
  };

  const onSendAlert = async () => {
    if (!alertTitle || !alertMessage) return;
    try {
      const notif = {
          id: Date.now().toString(),
          userId: 'global',
          topic: alertTopic,
          title: alertTitle,
          message: alertMessage,
          date: new Date().toISOString(),
          read: false,
          type: alertTopic === 'Urgent' ? 'urgent' : 'article'
      } as any;
      
      await SupabaseService.sendNotification(notif);
      alert(`Alerte envoyée avec succès : ${alertTitle}`);
      setAlertTitle('');
      setAlertMessage('');
    } catch (error) {
       console.error(error);
       alert("Erreur lors de l'envoi de l'alerte.");
    }
  };
  
  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredComments = comments.filter(c => 
    c.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLiveBlogs = liveBlogs.filter(l => 
    l.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredWebTV = webTV.filter(v =>
    v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSubscribers = subscribers.filter(s => s.email.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredMedia = mediaLibrary.filter(m => m.url.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-4 border-b border-slate-50">
        <div className="flex items-start gap-5">
          <div className="p-4 bg-primary text-white rounded-[24px] shadow-2xl shadow-primary/30 shrink-0">
            <LayoutDashboard size={32} />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl md:text-4xl font-black tracking-tight leading-tight">Tableau de Bord</h2>
            <p className="text-slate-400 text-sm font-medium italic">Contrôle total : articles, événements et paramètres.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={onGenerateCode}
            className="flex-1 md:flex-none px-6 py-4 bg-slate-900 text-white font-black rounded-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 text-xs shadow-xl"
          >
            <Copy size={18} /> EXPORT
          </button>
          {(activeTab === 'articles' || activeTab === 'events' || activeTab === 'polls' || activeTab === 'live-blog' || activeTab === 'web-tv') && (
            <button 
              onClick={() => {
                if (activeTab === 'articles') onCreateArticle();
                else if (activeTab === 'events') onCreateEvent();
                else if (activeTab === 'polls') onCreatePoll();
                else if (activeTab === 'live-blog') onCreateLiveBlog();
                else if (activeTab === 'web-tv') onCreateWebTV();
              }}
              className="flex-1 md:flex-none px-6 py-4 bg-primary text-white font-black rounded-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 text-xs shadow-xl shadow-primary/20 border-2 border-white"
            >
              <Plus size={18} /> 
              NOUVEAU
            </button>
          )}
          <button 
            onClick={onLogout}
            className="p-4 bg-white text-slate-400 border border-slate-100 rounded-2xl hover:text-red-500 hover:bg-white transition-all shadow-sm group"
          >
            <LogOut size={22} className="group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      </div>

      {/* Modern Horizontal Tabs with snap and custom scroll */}
      <div className="relative group">
        <div className="flex border-b border-slate-100 overflow-x-auto whitespace-nowrap scrollbar-hide snap-x scroll-smooth -mx-4 px-4 lg:mx-0 lg:px-0">
        <button 
          onClick={() => setActiveTab('articles')}
          className={cn(
            "px-6 py-4 font-black transition-all border-b-2 shrink-0 text-sm",
            activeTab === 'articles' ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600"
          )}
        >
          Articles
        </button>
        <button 
          onClick={() => setActiveTab('events')}
          className={cn(
            "px-6 py-4 font-black transition-all border-b-2 shrink-0 text-sm",
            activeTab === 'events' ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600"
          )}
        >
          Agenda
        </button>
        <button 
          onClick={() => setActiveTab('polls')}
          className={cn(
            "px-6 py-4 font-black transition-all border-b-2 shrink-0 text-sm",
            activeTab === 'polls' ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600"
          )}
        >
          Sondages
        </button>
        <button 
          onClick={() => setActiveTab('live-blog')}
          className={cn(
            "px-6 py-4 font-black transition-all border-b-2 shrink-0 text-sm",
            activeTab === 'live-blog' ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600"
          )}
        >
          Direct
        </button>
        <button 
          onClick={() => setActiveTab('web-tv')}
          className={cn(
            "px-6 py-4 font-black transition-all border-b-2 shrink-0 text-sm",
            activeTab === 'web-tv' ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600"
          )}
        >
          Web TV
        </button>
        <button 
          onClick={() => setActiveTab('comments')}
          className={cn(
            "px-6 py-4 font-black transition-all border-b-2 shrink-0 text-sm",
            activeTab === 'comments' ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600"
          )}
        >
          Modération
        </button>
        <button 
          onClick={() => setActiveTab('media')}
          className={cn(
            "px-6 py-4 font-black transition-all border-b-2 shrink-0 text-sm",
            activeTab === 'media' ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600"
          )}
        >
          Médias
        </button>
        <button 
          onClick={() => setActiveTab('subscribers')}
          className={cn(
            "px-6 py-4 font-black transition-all border-b-2 shrink-0 text-sm",
            activeTab === 'subscribers' ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600"
          )}
        >
          Abonnés
        </button>
        <button 
          onClick={() => setActiveTab('alerts')}
          className={cn(
            "px-6 py-4 font-black transition-all border-b-2 shrink-0 text-sm",
            activeTab === 'alerts' ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600"
          )}
        >
          Alertes Push
        </button>
        <button 
          onClick={() => setActiveTab('analytics')}
          className={cn(
            "px-6 py-4 font-black transition-all border-b-2 shrink-0 text-sm",
            activeTab === 'analytics' ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600"
          )}
        >
          Statistiques
        </button>
        <button 
          onClick={() => setActiveTab('support')}
          className={cn(
            "px-6 py-4 font-black transition-all border-b-2 shrink-0 text-sm",
            activeTab === 'support' ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600"
          )}
        >
          Support Client
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={cn(
            "px-6 py-4 font-black transition-all border-b-2 shrink-0 text-sm",
            activeTab === 'settings' ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600"
          )}
        >
          Paramètres
        </button>
        <button 
          onClick={() => setActiveTab('premium')}
          className={cn(
            "px-6 py-4 font-black transition-all border-b-2 shrink-0 text-sm",
            activeTab === 'premium' ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600"
          )}
        >
          Abonnements
        </button>
        <button 
          onClick={() => setActiveTab('payments')}
          className={cn(
            "px-6 py-4 font-black transition-all border-b-2 shrink-0 text-sm",
            activeTab === 'payments' ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600"
          )}
        >
          Gestion des paiements
        </button>
      </div>
    </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div key={activeTab} className="md:col-span-3 space-y-6">
          {activeTab !== 'settings' && (
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Rechercher..."
                className="w-full bg-white border border-slate-100 rounded-2xl pl-14 pr-6 py-4 shadow-sm focus:ring-2 focus:ring-primary/20 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}

          {activeTab === 'settings' ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 pb-20"
            >
              {/* Infos Contact */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 space-y-8">
                <h3 className="text-xl font-black flex items-center gap-2"><Mail className="text-primary" /> Coordonnées du Site</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Email Contact</label>
                    <input 
                      type="email"
                      className="w-full bg-slate-50 rounded-2xl px-6 py-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                      value={tempSettings.email}
                      onChange={(e) => setTempSettings({...tempSettings, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Téléphone</label>
                    <input 
                      type="text"
                      className="w-full bg-slate-50 rounded-2xl px-6 py-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                      value={tempSettings.phone}
                      onChange={(e) => setTempSettings({...tempSettings, phone: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Adresse Physique</label>
                    <input 
                      type="text"
                      placeholder="Ex: 10 rue ange Rubaud, 94230 Cachan"
                      className="w-full bg-slate-50 rounded-2xl px-6 py-4 text-base outline-none focus:ring-2 focus:ring-primary/20"
                      value={tempSettings.address}
                      onChange={(e) => setTempSettings({...tempSettings, address: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Réseaux Sociaux</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400 px-1">Facebook</label>
                        <input type="text" placeholder="Facebook URL" className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm outline-none border border-slate-100 focus:border-primary/30" value={tempSettings.facebookUrl} onChange={e => setTempSettings({...tempSettings, facebookUrl: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400 px-1">X (Twitter)</label>
                        <input type="text" placeholder="Twitter URL" className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm outline-none border border-slate-100 focus:border-primary/30" value={tempSettings.twitterUrl} onChange={e => setTempSettings({...tempSettings, twitterUrl: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400 px-1">Instagram</label>
                        <input type="text" placeholder="Instagram URL" className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm outline-none border border-slate-100 focus:border-primary/30" value={tempSettings.instagramUrl} onChange={e => setTempSettings({...tempSettings, instagramUrl: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400 px-1">TikTok</label>
                        <input type="text" placeholder="TikTok URL" className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm outline-none border border-slate-100 focus:border-primary/30" value={tempSettings.tiktokUrl} onChange={e => setTempSettings({...tempSettings, tiktokUrl: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400 px-1">LinkedIn</label>
                        <input type="text" placeholder="LinkedIn URL" className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm outline-none border border-slate-100 focus:border-primary/30" value={tempSettings.linkedinUrl} onChange={e => setTempSettings({...tempSettings, linkedinUrl: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400 px-1">YouTube</label>
                        <input type="text" placeholder="YouTube URL" className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm outline-none border border-slate-100 focus:border-primary/30" value={tempSettings.youtubeUrl} onChange={e => setTempSettings({...tempSettings, youtubeUrl: e.target.value})} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Breaking News Banner */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 space-y-6">
                <h3 className="text-xl font-black flex items-center gap-2 text-red-500"><Megaphone /> Bandeau Urgent & Flash Info</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4 bg-red-50 p-4 rounded-2xl border border-red-100">
                    <input 
                      type="checkbox" 
                      checked={tempSettings.urgentBannerActive}
                      onChange={e => setTempSettings({...tempSettings, urgentBannerActive: e.target.checked})}
                      className="w-6 h-6 accent-red-500"
                    />
                    <div className="flex-1 space-y-2">
                      <label className="text-[10px] font-black uppercase text-red-700">Activer le bandeau d'alerte (Rouge fix)</label>
                      <input 
                        type="text" 
                        placeholder="Texte du message urgent..."
                        className="w-full bg-white rounded-xl px-4 py-3 text-sm outline-none border border-red-200"
                        value={tempSettings.urgentBannerText}
                        onChange={e => setTempSettings({...tempSettings, urgentBannerText: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <label className="text-[10px] font-black uppercase text-slate-400">Contenu du Flash Info (Bande passante)</label>
                    <textarea 
                      placeholder="Séparez chaque nouvelle par un point-virgule (;)"
                      className="w-full bg-white rounded-xl px-4 py-3 text-sm outline-none border border-slate-200 min-h-[100px] resize-none"
                      value={tempSettings.flashNews}
                      onChange={e => setTempSettings({...tempSettings, flashNews: e.target.value})}
                    />
                    <p className="text-[9px] text-slate-400 font-bold italic">Note : Utilisez le point-virgule (;) pour séparer les différents messages qui défileront.</p>
                  </div>
                </div>
              </div>

              {/* Import Demo Data */}
              <div className="bg-orange-50 rounded-3xl border border-orange-100 p-8 space-y-4">
                <h3 className="text-xl font-black flex items-center gap-2 text-orange-700"><AlertTriangle size={20} /> Zone de récupération</h3>
                <p className="text-sm text-orange-600 font-bold leading-relaxed">
                  Si vos articles ont disparu suite à une réinitialisation de la base de données, vous pouvez importer les données de démonstration ci-dessous vers votre Cloud (Supabase).
                </p>
                <div className="pt-2">
                  <button 
                    disabled={isImporting}
                    onClick={async () => {
                      if (confirm("Importer les articles et événements de démonstration vers Supabase ? Cela n'effacera pas vos articles existants.")) {
                        setIsImporting(true);
                        try {
                          await SupabaseService.importMockData(MOCK_ARTICLES, MOCK_EVENTS);
                          if (setActiveNotification) {
                            setActiveNotification({ message: "Données importées avec succès ! Rafraîchissez la page.", type: 'success' });
                            setTimeout(() => setActiveNotification(null), 5000);
                          } else {
                            alert("Données importées avec succès ! Rafraîchissez la page.");
                          }
                          // Attendre un peu pour laisser l'utilisateur voir la notification
                          setTimeout(() => {
                            window.location.reload();
                          }, 2000);
                        } catch (e: any) {
                          console.error("[AdminDashboard] Import error:", e);
                          if (setActiveNotification) {
                            setActiveNotification({ message: "Erreur lors de l'import: " + (e.message || "Erreur inconnue"), type: 'urgent' });
                            setTimeout(() => setActiveNotification(null), 5000);
                          } else {
                            alert("Erreur lors de l'import : " + e.message);
                          }
                        } finally {
                          setIsImporting(false);
                        }
                      }
                    }}
                    className={cn(
                      "bg-orange-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-200 hover:scale-105 transition-all text-center flex items-center justify-center",
                      isImporting && "opacity-50 cursor-not-allowed scale-100"
                    )}
                  >
                     {isImporting ? "Import en cours..." : "Restaurer les données de démonstration (Cloud)"}
                  </button>
                </div>
              </div>

              {/* Maintenance Mode */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 space-y-6">
                <h3 className="text-xl font-black flex items-center gap-2 text-slate-700"><MonitorOff /> Mode Maintenance</h3>
                <div className={cn(
                  "flex items-center gap-4 p-4 rounded-2xl border transition-colors",
                  tempSettings.maintenanceMode ? "bg-slate-100 border-slate-300" : "bg-emerald-50 border-emerald-100"
                )}>
                  <input 
                    type="checkbox" 
                    checked={tempSettings.maintenanceMode}
                    onChange={e => setTempSettings({...tempSettings, maintenanceMode: e.target.checked})}
                    className="w-6 h-6 accent-slate-900"
                  />
                  <div>
                    <p className="text-sm font-bold">Le site est {tempSettings.maintenanceMode ? "Hors ligne (Maintenance)" : "En ligne"}</p>
                    <p className="text-[10px] text-slate-500">Activez ce mode pour suspendre l'accès public durant des travaux.</p>
                  </div>
                </div>
              </div>

              {/* À Propos */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black flex items-center gap-2"><Info className="text-primary" /> À propos du Journal</h3>
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    <button 
                      type="button"
                      onClick={() => {
                        const textarea = document.querySelector('textarea[name="aboutText"]') as HTMLTextAreaElement;
                        if (!textarea) return;
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        const text = textarea.value;
                        const selectedText = text.substring(start, end);
                        const newText = text.substring(0, start) + `**${selectedText}**` + text.substring(end);
                        setTempSettings({...tempSettings, aboutText: newText});
                      }}
                      className="p-2 hover:bg-white hover:text-primary rounded-lg transition-all text-slate-500"
                      title="Gras"
                    >
                      <Bold size={16} />
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        const textarea = document.querySelector('textarea[name="aboutText"]') as HTMLTextAreaElement;
                        if (!textarea) return;
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        const text = textarea.value;
                        const selectedText = text.substring(start, end);
                        const newText = text.substring(0, start) + `\n### ${selectedText}` + text.substring(end);
                        setTempSettings({...tempSettings, aboutText: newText});
                      }}
                      className="px-2 py-1 hover:bg-white hover:text-primary rounded-lg transition-all text-slate-500 text-[10px] font-black"
                      title="Titre"
                    >
                      H3
                    </button>
                  </div>
                </div>
                <textarea 
                  name="aboutText"
                  value={tempSettings.aboutText}
                  onChange={e => setTempSettings({...tempSettings, aboutText: e.target.value})}
                  className="w-full bg-slate-50 rounded-2xl px-6 py-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 min-h-[200px]"
                  placeholder="Décrivez votre journal, sa mission, son équipe..."
                />
              </div>

              {/* Ads Configuration */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 space-y-6">
                <h3 className="text-xl font-black flex items-center gap-2"><Globe /> Emplacements Publicitaires (JSON/HTML)</h3>
                <div className="grid grid-cols-1 gap-4">
                  <textarea placeholder="Ad Slot Header" className="bg-slate-100 rounded-xl p-4 text-xs font-mono h-24" value={tempSettings.adSlotHeader} onChange={e => setTempSettings({...tempSettings, adSlotHeader: e.target.value})} />
                  <textarea placeholder="Ad Slot Sidebar" className="bg-slate-100 rounded-xl p-4 text-xs font-mono h-24" value={tempSettings.adSlotSidebar} onChange={e => setTempSettings({...tempSettings, adSlotSidebar: e.target.value})} />
                </div>
              </div>

              {/* Dynamic Categories */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 space-y-6">
                <h3 className="text-xl font-black flex items-center gap-2"><Tag /> Gestion des Catégories</h3>
                <div className="flex flex-wrap gap-2">
                  {tempSettings?.categories?.map((cat, i) => (
                    <div key={`${cat}-${i}`} className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full text-xs font-black">
                      {cat}
                      <button 
                        type="button"
                        onClick={() => {
                          if (tempSettings?.categories) {
                            setTempSettings({...tempSettings, categories: tempSettings.categories.filter(c => c !== cat)});
                          }
                        }} 
                        className="text-red-500 hover:scale-110"
                      >
                        <X size={14}/>
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Nouvelle catégorie..."
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="flex-1 bg-slate-50 rounded-xl px-4 py-2 text-sm outline-none border border-slate-100"
                  />
                  <button 
                    onClick={() => {
                      if(newCategory && tempSettings?.categories && !tempSettings.categories.includes(newCategory)) {
                        setTempSettings({
                          ...tempSettings, 
                          categories: [...(tempSettings.categories || []), newCategory]
                        });
                        setNewCategory('');
                      }
                    }}
                    className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold"
                  >
                    Ajouter
                  </button>
                </div>
              </div>

              <div className="sticky bottom-4 z-10 flex justify-end">
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className={cn(
                    "bg-primary text-white font-black px-12 py-5 rounded-3xl hover:scale-105 transition-all shadow-2xl shadow-primary/40 flex items-center gap-3 border-4 border-white",
                    isSaving && "opacity-70 cursor-not-allowed scale-100"
                  )}
                >
                  {isSaving ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ENREGISTREMENT...
                    </div>
                  ) : (
                    <>
                      <Save size={24} /> ENREGISTRER LA CONFIGURATION
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ) : activeTab === 'payments' ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 pb-20"
            >
              <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl p-10 space-y-12 african-pattern">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-primary/10 rounded-2xl text-primary shadow-lg shadow-primary/5">
                      <CreditCard size={32} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black tracking-tight">Gestion des Paiements</h3>
                      <p className="text-slate-400 font-medium italic">Configurez vos moyens de paiement et vos tarifs premium.</p>
                    </div>
                  </div>
                  <div className="bg-slate-900 text-white px-8 py-4 rounded-[25px] flex items-center gap-6 shadow-xl">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase text-slate-500">Revenu Estimé</p>
                      <p className="text-2xl font-black font-mono">{(stats?.totalRevenue || 0).toLocaleString()} <span className="text-primary text-xs">XOF</span></p>
                    </div>
                    <TrendingUp className="text-primary opacity-50" size={32} />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                   {/* Moyens de Paiement */}
                  <div className="space-y-8">
                    <h4 className="text-xl font-black flex items-center gap-2 border-b border-slate-50 pb-4">
                      <CheckCircle className="text-emerald-500" size={24} /> 
                      Moyens de Paiement Activés
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                      {Object.entries({
                        paypal: 'PayPal',
                        stripe: 'Stripe',
                        flutterwave: 'Flutterwave',
                        orangeMoney: 'Orange Money',
                        wave: 'Wave',
                        mtn: 'MTN Mobile Money',
                        moov: 'Moov Money'
                      }).map(([key, label]) => (
                        <div key={key} className={cn(
                          "p-6 rounded-3xl border-2 transition-all flex flex-col gap-4",
                          tempSettings.activePaymentMethods?.[key] ? "bg-white border-primary shadow-xl shadow-primary/5" : "bg-slate-50 border-transparent opacity-60"
                        )}>
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={!!tempSettings.activePaymentMethods?.[key]}
                                onChange={e => {
                                  const active = { ...(tempSettings.activePaymentMethods || {}) };
                                  (active as any)[key] = e.target.checked;
                                  setTempSettings({...tempSettings, activePaymentMethods: active});
                                }}
                                className="w-6 h-6 rounded-lg accent-primary"
                              />
                              <span className="font-black text-sm uppercase tracking-wider">{label}</span>
                            </label>
                          </div>
                          
                          {tempSettings.activePaymentMethods?.[key] && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                               <div className="space-y-1">
                                  <label className="text-[10px] font-black uppercase text-slate-400 px-1">Lien de redirection (Optionnel)</label>
                                  <div className="relative">
                                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                                    <input 
                                      type="text"
                                      placeholder="https://votre-lien-de-paiement.com/..."
                                      className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-3 text-xs font-bold outline-none focus:border-primary transition-all"
                                      value={tempSettings.paymentLinks?.[key] || ''}
                                      onChange={e => {
                                        const links = { ...(tempSettings.paymentLinks || {}) };
                                        (links as any)[key] = e.target.value;
                                        setTempSettings({...tempSettings, paymentLinks: links});
                                      }}
                                    />
                                  </div>
                               </div>

                               {(key === 'orangeMoney' || key === 'mtn' || key === 'moov' || key === 'wave') && (
                                 <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 px-1">Numéro de réception (Transfert Manuel)</label>
                                    <div className="relative">
                                      <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                                      <input 
                                        type="text"
                                        placeholder="Ex: 07 00 00 00 00"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-3 text-xs font-bold outline-none focus:border-primary transition-all"
                                        value={(() => {
                                          if (key === 'orangeMoney') return tempSettings.orangeMoneyNumber || '';
                                          if (key === 'mtn') return tempSettings.mtnMoneyNumber || '';
                                          if (key === 'moov') return tempSettings.moovMoneyNumber || '';
                                          if (key === 'wave') return tempSettings.waveNumber || '';
                                          return '';
                                        })()}
                                        onChange={e => {
                                          const val = e.target.value;
                                          const update: any = {};
                                          if (key === 'orangeMoney') update.orangeMoneyNumber = val;
                                          else if (key === 'mtn') update.mtnMoneyNumber = val;
                                          else if (key === 'moov') update.moovMoneyNumber = val;
                                          else if (key === 'wave') update.waveNumber = val;
                                          setTempSettings({...tempSettings, ...update});
                                        }}
                                      />
                                    </div>
                                 </div>
                               )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Config & Amounts */}
                  <div className="space-y-12">
                    {/* Configuration Dons */}
                    <div className="space-y-8">
                      <h4 className="text-xl font-black flex items-center gap-2 border-b border-slate-50 pb-4">
                        <Heart className="text-red-500" size={24} /> 
                        Donations
                      </h4>
                      <div className="bg-slate-50 p-8 rounded-[35px] space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="font-black text-sm uppercase">Activer les dons</p>
                            <p className="text-xs text-slate-400 font-medium">Afficher le bouton de don.</p>
                          </div>
                          <input 
                            type="checkbox" 
                            checked={tempSettings.isDonationActive}
                            onChange={e => setTempSettings({...tempSettings, isDonationActive: e.target.checked})}
                            className="w-8 h-8 rounded-full accent-emerald-500 cursor-pointer"
                          />
                        </div>

                        <div className="space-y-3 pt-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Montants suggérés (XOF)</label>
                          <div className="flex flex-wrap gap-3">
                            {tempSettings?.donationAmounts?.map((amt, idx) => (
                              <div key={idx} className="flex items-center gap-3 bg-white border border-slate-200 pl-4 pr-2 py-2 rounded-2xl shadow-sm">
                                <span className="font-black text-sm">{amt?.toLocaleString()}</span>
                                <button 
                                  type="button"
                                  onClick={() => setTempSettings({...tempSettings, donationAmounts: (tempSettings.donationAmounts || []).filter((_, i) => i !== idx)})}
                                  className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-all"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                            <div className="flex gap-2">
                               <input 
                                type="number"
                                id="new-donation-amt-dashboard"
                                placeholder="Ajouter..."
                                className="bg-white border border-slate-200 rounded-2xl px-4 py-2 text-sm font-bold w-28 outline-none focus:border-primary"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const val = parseInt((e.target as HTMLInputElement).value);
                                    if (!isNaN(val)) {
                                      setTempSettings({...tempSettings, donationAmounts: [...(tempSettings.donationAmounts || []), val].sort((a,b) => a-b)});
                                      (e.target as HTMLInputElement).value = '';
                                    }
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Configuration Premium */}
                    <div className="space-y-8">
                      <h4 className="text-xl font-black flex items-center gap-2 border-b border-slate-50 pb-4">
                        <Award className="text-primary" size={24} /> 
                        Tarification Premium
                      </h4>
                      <div className="bg-slate-900 text-white p-8 rounded-[35px] space-y-8 shadow-2xl relative overflow-hidden">
                          <TrendingUp className="absolute top-0 right-0 p-8 opacity-10" size={120} />
                          <div className="flex items-center justify-between relative z-10">
                             <div className="space-y-1">
                                <p className="font-black text-sm uppercase text-primary">Service Premium Actif</p>
                                <p className="text-[10px] text-slate-400 font-medium">Autoriser l'achat d'abonnements.</p>
                             </div>
                             <input 
                                type="checkbox" 
                                checked={tempSettings.isPremiumActive}
                                onChange={e => setTempSettings({...tempSettings, isPremiumActive: e.target.checked})}
                                className="w-8 h-8 rounded-full accent-primary cursor-pointer ring-4 ring-white/10"
                             />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tarif Mensuel (XOF)</label>
                              <div className="relative">
                                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={24} />
                                <input 
                                  type="number"
                                  value={tempSettings.premiumPrice}
                                  onChange={e => setTempSettings({...tempSettings, premiumPrice: parseInt(e.target.value) || 0})}
                                  className="w-full bg-white/5 border-2 border-white/10 rounded-2xl pl-14 pr-6 py-4 text-2xl font-black outline-none focus:border-primary transition-all"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Durée (Mois)</label>
                              <select 
                                value={tempSettings.premiumDurationMonths || 1}
                                onChange={e => setTempSettings({...tempSettings, premiumDurationMonths: parseInt(e.target.value)})}
                                className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-6 py-4 text-xl font-black outline-none focus:border-primary transition-all appearance-none"
                              >
                                {[1, 3, 6, 12].map(m => <option key={m} value={m} className="bg-slate-800">{m} {m === 1 ? 'Mois' : 'Mois'}</option>)}
                              </select>
                            </div>
                          </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <TransactionsList />

                {/* Sticky Footer for save */}
                <div className="sticky bottom-0 bg-white/80 backdrop-blur-md p-6 border-t border-slate-50 -mx-10 -mb-10 flex justify-end items-center gap-6">
                   <p className="text-xs text-slate-400 font-medium hidden md:block italic">Modifications non enregistrées détectées</p>
                   <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-3 bg-primary text-white font-black px-12 py-5 rounded-3xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/40 disabled:opacity-50"
                  >
                    {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={24} />}
                    ENREGISTRER LA CONFIGURATION
                  </button>
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'premium' ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black">Gestion des Abonnés Premium</h3>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full" /> Total Premium : {stats?.totalPremium || 0}
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="grid grid-cols-12 px-6 py-4 bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <div className="col-span-4">Utilisateur</div>
                  <div className="col-span-3">Date d'expiration</div>
                  <div className="col-span-2">Mode Paiement</div>
                  <div className="col-span-3 text-right">Actions</div>
                </div>
                <div className="divide-y divide-slate-100">
                  <PremiumUserList 
                    onUpgrade={async (uid) => {
                      await SupabaseService.upgradeToPremium(uid, 'Admin Override', 1);
                      alert("Utilisateur passé en Premium pour 1 mois.");
                    }}
                    onUpdateStatus={async (uid, date) => {
                      await SupabaseService.setPremiumUntil(uid, date);
                      alert("Statut premium mis à jour avec succès.");
                    }}
                  />
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'support' ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[70vh]"
            >
              {/* Sidebar: Chats List */}
              <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h3 className="font-black italic">Support Direct</h3>
                  <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-full">LIVE</span>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                  {Object.keys(allSupportMessages).length === 0 ? (
                    <div className="p-10 text-center space-y-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                        <MessageSquare size={24} />
                      </div>
                      <p className="text-xs text-slate-400 font-bold">Aucun chat actif.</p>
                    </div>
                  ) : (
                    Object.entries(allSupportMessages).map(([userId, msgs]) => {
                      const lastMsg = msgs[msgs.length - 1];
                      const user = msgs.find(m => !m.isAdmin);
                      return (
                        <div 
                          key={userId}
                          onClick={() => setActiveChatUserId(userId)}
                          className={cn(
                            "p-5 cursor-pointer transition-all hover:bg-slate-50 flex gap-4 items-center",
                            activeChatUserId === userId ? "bg-primary/5 border-r-4 border-primary" : ""
                          )}
                        >
                          <img 
                            src={user?.userPhoto || `https://ui-avatars.com/api/?name=${user?.userName || 'User'}`} 
                            className="w-12 h-12 rounded-full border border-slate-100 bg-slate-50" 
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                              <h4 className="font-bold text-sm truncate">{user?.userName || 'Utilisateur'}</h4>
                              <span className="text-[9px] text-slate-400 font-bold">{format(new Date(lastMsg.date), 'HH:mm')}</span>
                            </div>
                            <p className="text-xs text-slate-500 truncate">{lastMsg.isAdmin ? 'Vous: ' : ''}{lastMsg.content}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* main: Chat view */}
              <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden flex flex-col relative">
                {activeChatUserId ? (
                  <>
                    <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black">
                        {allSupportMessages[activeChatUserId][0]?.userName[0] || '?'}
                      </div>
                      <div>
                        <h3 className="font-black text-sm">{allSupportMessages[activeChatUserId][0]?.userName}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{activeChatUserId}</p>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30 african-pattern">
                      {allSupportMessages[activeChatUserId].map((msg) => (
                        <div key={msg.id} className={cn("flex flex-col", msg.isAdmin ? "items-end" : "items-start")}>
                          <div className={cn(
                            "max-w-[70%] p-5 rounded-3xl text-sm leading-relaxed shadow-sm",
                            msg.isAdmin ? "bg-slate-900 text-white rounded-tr-none" : "bg-white text-slate-700 rounded-tl-none border border-slate-100"
                          )}>
                            {msg.content}
                          </div>
                          <span className="text-[9px] font-black text-slate-400 mt-2 uppercase tracking-widest">
                            {msg.isAdmin ? 'Moi (Support)' : msg.userName} • {format(new Date(msg.date), 'HH:mm')}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 bg-emerald-50 border-t border-emerald-100 flex items-center justify-between px-8">
                       <div className="flex items-center gap-3">
                         <Award className="text-emerald-500" size={20} />
                         <div>
                            <p className="text-[10px] font-black uppercase text-emerald-800">Support Client Prioritaire</p>
                            <p className="text-[9px] text-emerald-600 font-bold italic">Actions rapides pour cet utilisateur</p>
                         </div>
                       </div>
                       <div className="flex gap-2">
                          <button 
                            onClick={async () => {
                              if(confirm(`Activer 1 mois Premium pour l'utilisateur ${activeChatUserId} ?`)) {
                                try {
                                  await SupabaseService.upgradeToPremium(activeChatUserId, 'Support Manual', 1);
                                  alert("Premium activé avec succès !");
                                } catch(e) {
                                  alert("Erreur lors de l'activation.");
                                }
                              }
                            }}
                            className="bg-emerald-500 text-white text-[9px] font-black px-4 py-2 rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all"
                          >
                            ACTIVER PREMIUM
                          </button>
                       </div>
                    </div>
                    <div className="p-6 border-t border-slate-100 flex gap-4 bg-white">
                      <input 
                        type="text" 
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSendReply()}
                        placeholder="Répondre à l'utilisateur..."
                        className="flex-1 bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary outline-none transition-all"
                      />
                      <button 
                        onClick={handleSendReply}
                        className="bg-primary text-white p-4 rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                      >
                        <Send size={24} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-6">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                      <Headset size={48} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black italic">Gestionnaire de Support</h3>
                      <p className="text-slate-400 font-medium max-w-sm mx-auto mt-2">Sélectionnez une discussion à gauche pour commencer à répondre aux lecteurs en temps réel.</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : activeTab === 'alerts' ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 space-y-6">
                <div className="flex items-center gap-3">
                   <div className="p-3 bg-red-500 text-white rounded-2xl shadow-lg shadow-red-200">
                     <Megaphone size={24} />
                   </div>
                   <div>
                     <h3 className="text-xl font-black">Diffusion d'Alerte</h3>
                     <p className="text-xs text-slate-400">Envoyez une notification push à tous les utilisateurs ou selon une catégorie.</p>
                   </div>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sujet / Thème</label>
                      <select 
                        className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm outline-none border border-slate-100"
                        value={alertTopic}
                        onChange={e => setAlertTopic(e.target.value)}
                      >
                        <option value="Urgent">⚠️ Urgent (Flash Info)</option>
                        <option value="Afrique">🌍 Afrique</option>
                        <option value="Tech">💻 Technologie</option>
                        <option value="Économie">📈 Économie</option>
                        <option value="Politique">🏛️ Politique</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Titre de l'alerte</label>
                       <input 
                         type="text"
                         placeholder="Ex: Coupure d'électricité majeure..."
                         className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm outline-none border border-slate-100"
                         value={alertTitle}
                         onChange={e => setAlertTitle(e.target.value)}
                       />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Message complet</label>
                    <textarea 
                      placeholder="Contenu de la notification..."
                      className="w-full bg-slate-50 rounded-2xl px-4 py-3 text-sm outline-none border border-slate-100 min-h-[100px]"
                      value={alertMessage}
                      onChange={e => setAlertMessage(e.target.value)}
                    />
                  </div>
                  
                  <div className="pt-4">
                    <button 
                      onClick={onSendAlert}
                      className="w-full md:w-auto bg-red-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-red-200"
                    >
                      <Send size={18} /> DIFFUSER L'ALERTE MAINTENANT
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 rounded-3xl p-8 text-white space-y-4">
                <h4 className="font-bold flex items-center gap-2"><Smartphone size={18} /> Conseils pour les notifications</h4>
                <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4">
                  <li>Utilisez des titres courts et percutants (moins de 50 caractères).</li>
                  <li>Le message doit encourager le clic sans être trompeur.</li>
                  <li>Les alertes <strong>Urgentes</strong> s'affichent sous forme de bandeau rouge sur le site.</li>
                  <li>Ciblez des catégories spécifiques pour augmenter le taux de lecture.</li>
                </ul>
              </div>
            </motion.div>
          ) : activeTab === 'web-tv' ? (
            <motion.div 
              key="web-tv"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[40px] border border-slate-100 shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <h3 className="text-xl font-black italic">Gestion Web TV</h3>
                <span className="text-[10px] font-black bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-widest">
                  {filteredWebTV.length} Vidéos
                </span>
              </div>

              <div className="divide-y divide-slate-50">
                <div className="grid grid-cols-12 px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">
                  <div className="col-span-5">Vidéo</div>
                  <div className="col-span-3 text-center">Catégorie</div>
                  <div className="col-span-2 text-center">Date</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>

                {filteredWebTV.map(video => (
                  <div key={video.id} className="grid grid-cols-12 px-8 py-6 items-center hover:bg-slate-50/50 transition-all group">
                    <div className="col-span-5 flex items-center gap-4">
                      <div className="relative w-24 h-14 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
                        <img src={video.thumbnail} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <Youtube size={16} className="text-white" />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-slate-900 truncate text-sm">{video.title}</p>
                        <p className="text-[10px] text-slate-400 font-bold truncate tracking-widest uppercase">
                          {video.views} vues
                        </p>
                      </div>
                    </div>
                    <div className="col-span-3 text-center">
                      <span className="text-[10px] font-black text-primary bg-primary/5 px-3 py-1 rounded-full uppercase tracking-widest">
                        {video.category}
                      </span>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                        {format(new Date(video.date), 'dd/MM/yyyy')}
                      </span>
                    </div>
                    <div className="col-span-2 flex justify-end gap-2">
                       <button 
                        onClick={() => onEditWebTV(video)}
                        className="p-3 text-slate-400 hover:text-slate-900 hover:bg-white rounded-2xl transition-all shadow-sm"
                      >
                        <Edit3 size={18}/>
                      </button>
                      <button 
                        onClick={() => onDeleteWebTV(video.id)}
                        className="p-3 text-slate-400 hover:text-red-500 hover:bg-white rounded-2xl transition-all shadow-sm"
                      >
                        <Trash size={18}/>
                      </button>
                    </div>
                  </div>
                ))}

                {filteredWebTV.length === 0 && (
                  <div className="p-20 text-center space-y-4">
                    <Video size={48} className="text-slate-200 mx-auto" />
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest italic">Aucune vidéo Web TV trouvée.</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : activeTab === 'analytics' ? (
            <motion.div 
              key="analytics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-10"
            >
              {stats?.error ? (
                <div className="bg-red-50 border border-red-100 rounded-3xl p-10 text-center space-y-4">
                  <AlertTriangle className="text-red-500 mx-auto" size={48} />
                  <h3 className="text-xl font-black text-red-900">Erreur de chargement</h3>
                  <p className="text-sm text-red-700 max-w-md mx-auto">
                    Impossible de récupérer les statistiques en temps réel. Vérifiez que vos <span className="font-bold">règles de sécurité Firestore</span> sont bien déployées sur votre console Firebase.
                  </p>
                </div>
              ) : (articles.length === 0 && !stats) ? (
                <div className="bg-slate-50 border border-slate-100 rounded-3xl p-10 text-center space-y-4">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm animate-pulse">
                    <TrendingUp className="text-slate-200" size={32} />
                  </div>
                  <h3 className="text-xl font-black text-slate-800">En attente de données...</h3>
                  <p className="text-sm text-slate-500 max-w-md mx-auto">
                    Dès que vous publierez vos premiers articles, les statistiques de performance s'afficheront ici en temps réel.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-xl space-y-2">
                      <div className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Total Vues</div>
                      <div className="text-4xl font-black italic">{(stats?.totalViews ?? articles.reduce((acc, a) => acc + (a.views || 0), 0)).toLocaleString()}</div>
                      <div className="text-emerald-500 text-[10px] font-bold">+12% cette semaine</div>
                    </div>
                    <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-xl space-y-2">
                      <div className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Total Likes</div>
                      <div className="text-4xl font-black italic">{articles.reduce((acc, a) => acc + (a.likes || 0), 0).toLocaleString()}</div>
                      <div className="text-emerald-500 text-[10px] font-bold">+5% cette semaine</div>
                    </div>
                    <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-xl space-y-2">
                      <div className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Abonnés</div>
                      <div className="text-4xl font-black italic">{(stats?.totalSubscribers ?? subscribers.length).toLocaleString()}</div>
                      <div className="text-emerald-500 text-[10px] font-bold">En progression</div>
                    </div>
                  </div>

                  <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-xl space-y-8">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black italic">Performance par Catégorie</h3>
                      <div className="flex gap-2">
                        <span className="w-3 h-3 bg-primary rounded-full" />
                        <span className="text-[10px] font-black uppercase text-slate-400">Vues Cumulées</span>
                      </div>
                    </div>
                   <div className="space-y-6">
                      {stats?.categoryStats ? (
                        Object.entries(stats.categoryStats).map(([cat, val]: [string, any]) => {
                          const catViews = typeof val === 'number' ? val : (val as any).count || 0;
                          const percentage = Math.min(100, (catViews / 5000) * 100);
                          return (
                            <div key={cat} className="space-y-2">
                              <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                                <span>{cat}</span>
                                <span>{catViews.toLocaleString()} vues</span>
                              </div>
                              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  className="h-full bg-primary"
                                />
                              </div>
                            </div>
                          );
                        })
                      ) : (settings.categories || ['Afrique', 'Monde', 'Politique']).map((cat: string) => {
                        const catViews = articles.filter(a => a.category === cat).reduce((acc, a) => acc + (a.views || 0), 0);
                        const percentage = Math.min(100, (catViews / 5000) * 100);
                        return (
                          <div key={cat} className="space-y-2">
                            <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                              <span>{cat}</span>
                              <span>{catViews.toLocaleString()} vues</span>
                            </div>
                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                className="h-full bg-primary"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-slate-900 p-10 rounded-[40px] shadow-2xl text-white space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                      <TrendingUp size={120} />
                    </div>
                    <h3 className="text-xl font-black italic">Articles les plus performants</h3>
                    <div className="space-y-4">
                      {articles.sort((a,b) => (b.views || 0) - (a.views || 0)).slice(0, 5).map((a, i) => (
                        <div key={a.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                          <div className="flex items-center gap-4">
                            <span className="text-primary font-black italic text-lg">#{i+1}</span>
                            <span className="font-bold text-sm line-clamp-1">{a.title}</span>
                          </div>
                          <span className="text-xs font-black text-slate-400">{(a.views || 0).toLocaleString()} vues</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          ) : activeTab === 'polls' ? (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
               <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-black text-xl">Gestion des Sondages</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    <span className="text-xs font-bold uppercase text-slate-400">En direct</span>
                  </div>
               </div>
               <div className="divide-y divide-slate-100">
                  {polls.map(poll => (
                    <div key={poll.id} className="p-6 hover:bg-slate-50/50 transition-colors group">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-black text-lg text-slate-900 leading-tight mb-2">{poll.question}</h4>
                          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            <span className={cn(poll.active ? "text-emerald-500" : "text-amber-500")}>
                              {poll.active ? "Actif" : "Terminé"}
                            </span>
                            <span>•</span>
                            <span>Début : {poll.startDate}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => onEditPoll(poll)}
                            className="p-3 bg-white text-slate-400 rounded-xl shadow-sm border border-slate-100 hover:text-primary transition-all"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button 
                            onClick={() => onDeletePoll(poll.id)}
                            className="p-3 bg-white text-slate-400 rounded-xl shadow-sm border border-slate-100 hover:text-red-500 transition-all"
                          >
                            <Trash size={18} />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {poll.options.map(opt => {
                          const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);
                          const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                          return (
                            <div key={opt.id} className="space-y-1">
                              <div className="flex justify-between text-[10px] font-black uppercase">
                                <span className="text-slate-600 truncate max-w-[80%]">{opt.text}</span>
                                <span className="text-slate-400">{percentage}% ({opt.votes})</span>
                              </div>
                              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary/40" 
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  {polls.length === 0 && (
                    <div className="p-20 text-center space-y-4">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                        <TrendingUp size={40} />
                      </div>
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Aucun sondage disponible</p>
                    </div>
                  )}
               </div>
            </div>
          ) : activeTab === 'subscribers' ? (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
               <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-black text-xl">Liste des Abonnés Newsletter</h3>
                  <button className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                    <Copy size={14}/> Télécharger CSV
                  </button>
               </div>
               <div className="divide-y divide-slate-100">
                  {filteredSubscribers.map(sub => (
                    <div key={sub.id} className="flex justify-between items-center px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black">{sub.email[0].toUpperCase()}</div>
                        <span className="text-sm font-medium">{sub.email}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-slate-400">{sub.date}</span>
                        <button 
                          onClick={() => onDeleteSubscriber(sub.id)}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          ) : activeTab === 'media' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMedia.map(item => (
                <div key={item.id} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm group relative">
                   <div className="aspect-square bg-slate-100 relative">
                      {item.type === 'image' ? (
                        <img src={item.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-red-500"><Youtube size={32}/></div>
                      )}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteMedia(item.id);
                          }}
                          className="p-2 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition-all"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                   </div>
                   <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                       <button onClick={() => {navigator.clipboard.writeText(item.url); alert("Copié !")}} className="p-2 bg-white rounded-full text-slate-900"><Copy size={16}/></button>
                       <button className="p-2 bg-white rounded-full text-red-500"><Trash size={16}/></button>
                   </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
              <div className="grid grid-cols-12 px-6 py-4 bg-slate-50/50 border-bottom border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <div className="col-span-6">Nom / Titre</div>
                <div className="col-span-2">{activeTab === 'articles' ? 'Catégorie' : activeTab === 'events' ? 'Lieu' : 'Date'}</div>
                <div className="col-span-2">Date / Likes</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
              <div className="divide-y divide-slate-100">
                {activeTab === 'articles' && filteredArticles.map(article => (
                  <div key={article.id} className="grid grid-cols-12 px-6 py-4 items-center hover:bg-slate-50/50 transition-colors group">
                    <div className="col-span-6 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                        {article.image && <img src={article.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 leading-tight line-clamp-1">{article.title}</h4>
                        <p className="text-[10px] text-slate-400 font-medium">Par {article.author}</p>
                      </div>
                    </div>
                    <div className="col-span-2 text-xs font-bold text-slate-600 italic">
                      {article.category}
                    </div>
                    <div className="col-span-2 text-xs text-slate-500 font-mono">
                      {article.date}
                    </div>
                    <div className="col-span-2 flex justify-end gap-2 pr-2">
                      <button 
                        onClick={() => onEditArticle(article)}
                        className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => onDeleteArticle(article.id)}
                        className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-red-50 hover:text-red-500 transition-all opacity-70 lg:opacity-0 lg:group-hover:opacity-100"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                {activeTab === 'events' && filteredEvents.map(event => (
                  <div key={event.id} className="grid grid-cols-12 px-6 py-4 items-center hover:bg-slate-50/50 transition-colors group">
                    <div className="col-span-6 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                        {event.image && <img src={event.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 leading-tight line-clamp-1">{event.title}</h4>
                        <p className="text-[10px] text-slate-400 font-medium">{event.category}</p>
                      </div>
                    </div>
                    <div className="col-span-2 text-xs font-bold text-slate-600 line-clamp-1">
                      {event.location}
                    </div>
                    <div className="col-span-2 text-xs text-slate-500 font-mono">
                      {event.date}
                    </div>
                    <div className="col-span-2 flex justify-end gap-2 pr-2">
                      <button 
                        onClick={() => onEditEvent(event)}
                        className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => onDeleteEvent(event.id)}
                        className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-red-50 hover:text-red-500 transition-all opacity-70 lg:opacity-0 lg:group-hover:opacity-100"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                {activeTab === 'live-blog' && filteredLiveBlogs.map(blog => (
                  <div key={blog.id} className="grid grid-cols-12 px-6 py-4 items-center hover:bg-slate-50/50 transition-colors group">
                    <div className="col-span-6 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <TrendingUp size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 leading-tight line-clamp-1">{blog.title}</h4>
                        <p className="text-[10px] text-slate-400 font-medium">{blog.updates.length} mises à jour</p>
                      </div>
                    </div>
                    <div className="col-span-2 text-xs font-black uppercase">
                       <span className={blog.status === 'live' ? "text-emerald-500" : "text-slate-400"}>
                         {blog.status === 'live' ? "● En Direct" : "Terminé"}
                       </span>
                    </div>
                    <div className="col-span-2 text-xs text-slate-500 font-mono">
                      {blog.createdAt.split('T')[0]}
                    </div>
                    <div className="col-span-2 flex justify-end gap-2 pr-2">
                      <button 
                        onClick={() => onEditLiveBlog(blog)}
                        className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => onDeleteLiveBlog(blog.id)}
                        className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-red-50 hover:text-red-500 transition-all opacity-70 lg:opacity-0 lg:group-hover:opacity-100"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                {activeTab === 'comments' && filteredComments.map(comment => (
                  <div key={comment.id} className="grid grid-cols-12 px-6 py-4 items-start hover:bg-slate-50/50 transition-colors group">
                    <div className="col-span-6 space-y-2 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{comment.username}</span>
                        <span className="text-[10px] text-slate-400">• {(comment as any).articleTitle || 'Article inconnu'}</span>
                      </div>
                      <p className="text-xs text-slate-600 italic line-clamp-2">"{comment.content}"</p>
                    </div>
                    <div className="col-span-2 text-xs text-slate-500 font-mono mt-1">
                      {comment.date}
                    </div>
                    <div className="col-span-2 text-xs text-slate-400 mt-1">
                      {comment.likes} J'aime
                    </div>
                    <div className="col-span-2 flex justify-end gap-2 pr-2">
                      <button 
                        onClick={() => onBlockUser(comment.userId)}
                        className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all"
                        title="Bloquer l'utilisateur"
                      >
                        <Lock size={16} />
                      </button>
                      <button 
                        onClick={() => onDeleteComment(comment.id)}
                        className="p-2 bg-slate-50 text-red-400 rounded-lg hover:bg-red-50 hover:text-red-500 transition-all"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                {((activeTab === 'articles' && filteredArticles.length === 0) || 
                  (activeTab === 'events' && filteredEvents.length === 0) || 
                  (activeTab === 'comments' && filteredComments.length === 0)) && (
                  <div className="py-20 text-center space-y-4">
                    <div className="p-4 bg-slate-50 w-20 h-20 rounded-full mx-auto flex items-center justify-center text-slate-200">
                      <FileText size={40} />
                    </div>
                    <p className="text-slate-400 font-medium italic">Aucun contenu trouvé.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-6">
            <h4 className="font-black text-sm uppercase tracking-widest text-slate-400">Statistiques</h4>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white/5 p-4 rounded-2xl">
                <p className="text-[10px] font-bold uppercase text-slate-400">Total Articles</p>
                <p className="text-3xl font-black mt-1 font-mono tracking-tighter">{articles.length}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl">
                <p className="text-[10px] font-bold uppercase text-slate-400">Commentaires</p>
                <p className="text-3xl font-black mt-1 font-mono tracking-tighter">{comments.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-lg space-y-4">
            <div className="flex items-center gap-3 text-slate-900">
              <Settings size={20} />
              <h4 className="font-bold">Accès Rapide</h4>
            </div>
            <div className="space-y-2">
              <button 
                onClick={() => setActiveTab('settings')}
                className="w-full text-left px-4 py-3 bg-slate-50 rounded-xl hover:bg-primary/5 hover:text-primary transition-all text-xs font-bold flex items-center gap-2"
              >
                <Info size={14} /> Modifier "À Propos"
              </button>
              <button 
                onClick={() => setActiveTab('comments')}
                className="w-full text-left px-4 py-3 bg-slate-50 rounded-xl hover:bg-primary/5 hover:text-primary transition-all text-xs font-bold flex items-center gap-2"
              >
                <MessageSquare size={14} /> Modération Globale
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TransactionsList = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await SupabaseService.getTransactions();
        setTransactions(data);
      } catch (err) {
        console.error("Error loading transactions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  if (loading) return <div className="p-10 text-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-6 mt-16 animate-in slide-in-from-bottom-5">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black">Journal des Transactions</h3>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{transactions.length} transactions</span>
      </div>
      
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
        <div className="grid grid-cols-12 px-6 py-4 bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <div className="col-span-3">Utilisateur / Email</div>
          <div className="col-span-2">Montant</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2">Méthode</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-1 text-right">Statut</div>
        </div>
        <div className="divide-y divide-slate-100">
          {transactions.length === 0 ? (
            <div className="p-10 text-center text-slate-400 font-medium italic">Aucune transaction enregistrée.</div>
          ) : (
            transactions.map(t => (
              <div key={t.id} className="grid grid-cols-12 px-6 py-4 items-center hover:bg-slate-50 transition-colors text-xs">
                <div className="col-span-3 truncate font-bold text-slate-900" title={t.email}>{t.email}</div>
                <div className="col-span-2 font-black text-slate-700">{t.amount.toLocaleString()} XOF</div>
                <div className="col-span-2">
                   <span className={cn(
                     "px-2 py-0.5 rounded-full text-[9px] font-black uppercase",
                     t.type === 'subscription' ? "bg-primary/10 text-primary" : "bg-red-50 text-red-600"
                   )}>{t.type === 'subscription' ? 'Abonnement' : 'Don'}</span>
                </div>
                <div className="col-span-2 font-medium uppercase text-slate-400 tracking-tighter">{t.method}</div>
                <div className="col-span-2 text-[10px] text-slate-400">{format(new Date(t.date), 'dd/MM HH:mm')}</div>
                <div className="col-span-1 text-right">
                   <span className={cn(
                     "inline-block w-2 h-2 rounded-full",
                     t.status === 'success' ? "bg-emerald-500" : (t.status === 'failed' ? "bg-red-500" : "bg-amber-500")
                   )} title={t.status} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export const AdminEditor = ({ 
  type,
  data, 
  categories,
  onSave, 
  onCancel 
}: { 
  type: 'article' | 'event',
  data: any, 
  categories: string[],
  onSave: (d: any) => void, 
  onCancel: () => void 
}) => {
  const [formData, setFormData] = useState<any>({
    id: data.id || crypto.randomUUID(),
    slug: data.slug || '',
    title: data.title || '',
    date: data.date || new Date().toISOString().split('T')[0],
    image: data.image || '',
    video: data.video || '',
    excerpt: data.excerpt || '',
    content: data.content || '',
    imageCredit: data.imageCredit || '',
    seoTitle: data.seoTitle || '',
    seoDescription: data.seoDescription || '',
    socialImage: data.socialImage || '',
    status: data.status || 'published',
    scheduledAt: data.scheduledAt || null,
    audioUrl: data.audioUrl || '',
    gallery: data.gallery || [],
    isPremium: data.isPremium || false,
    // Article specific
    ...(type === 'article' ? {
      category: data.category || 'Afrique',
      author: data.author || 'Équipe Akwaba Info',
      authorRole: data.authorRole || 'Journaliste',
      source: data.source || '',
      readingTime: data.readingTime || '4 min',
      views: data.views || 0,
      likes: data.likes || 0,
      tags: data.tags || [],
    } : {
      // Event specific
      location: data.location || '',
      category: data.category || 'Événement Culturel',
    }),
    ...data
  });
  
  const [previewMode, setPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const validate = () => {
    if (!formData.title || formData.title.length < 5) {
      alert("Le titre est trop court (min. 5 caractères).");
      return false;
    }
    if (!formData.content || formData.content.length < 20) {
      alert("Le contenu est trop court (min. 20 caractères).");
      return false;
    }
    if (type === 'event' && !formData.location) {
      alert("Le lieu de l'événement est requis.");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);

    // Auto-generate slug if missing
    const finalData = { ...formData };
    if (!finalData.slug && finalData.title) {
      finalData.slug = `${slugify(finalData.title)}-${Math.random().toString(36).substring(2, 7)}`;
    }

    // Sécurité : Réinitialiser isSaving après 20s si la promesse ne revient pas
    const safetyTimer = setTimeout(() => {
      setIsSaving(false);
      alert("L'enregistrement prend du temps. Cela peut être dû à la taille des images ou à votre connexion.");
    }, 20000);

    try {
      await onSave(finalData);
    } catch (e: any) {
      console.error("Save error in AdminEditor:", e);
      const details = e.message || "Erreur de permission ou de connexion";
      if (details.includes("Could not find the table")) {
        alert(`TABLE MANQUANTE : La table n'a pas été trouvée sur Supabase.\n\nSOLUTION : Exécutez le script d'initialisation 'supabase_init.sql' dans l'onglet SQL Editor de votre projet Supabase.`);
      } else {
        alert(`Une erreur est survenue lors de l'enregistrement : ${details}`);
      }
    } finally {
      clearTimeout(safetyTimer);
      setIsSaving(false);
    }
  };

  // Fallback if categories is empty
  const availableCategories = categories.length > 0 
    ? categories 
    : (type === 'article' 
        ? ['À la une', 'Urgent', 'Politique', 'Économie', 'Science', 'Santé', 'Culture', 'Histoire', 'Sport', 'Afrique', 'Monde', 'Tech']
        : ['Concert', 'Conférence', 'Exposition', 'Festival', 'Sport', 'Événement Culturel']
      );

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button 
          onClick={onCancel}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black transition-all text-sm uppercase tracking-widest"
        >
          <ArrowLeft size={18} /> RETOUR
        </button>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setPreviewMode(!previewMode)}
            className={cn(
              "flex-1 sm:flex-none px-5 py-3 rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all shadow-sm",
              previewMode ? "bg-slate-900 text-white" : "bg-white border border-slate-100 text-slate-500"
            )}
          >
            {previewMode ? <Edit3 size={16} /> : <Eye size={16} />}
            {previewMode ? "Éditer" : "Aperçu"}
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              "flex-1 sm:flex-none px-6 py-3 bg-primary text-white rounded-2xl flex items-center justify-center gap-2 font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-[10px] uppercase tracking-widest border-2 border-white",
              isSaving && "opacity-70 cursor-not-allowed"
            )}
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Check size={16} />
            )}
            {isSaving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {previewMode ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl min-h-[600px] animate-in fade-in slide-in-from-bottom-2">
              <h1 className="text-4xl font-black mb-6">{formData.title || "Titre de l'élément"}</h1>
              {formData.image && (
                <div className={cn(
                  "rounded-2xl overflow-hidden mb-8 bg-slate-100",
                  type === 'article' && "aspect-video"
                )}>
                  <img 
                    src={optimizeImage(formData.image, 800, type === 'event' ? 'contain' : 'crop')} 
                    className={cn(
                      "w-full",
                      type === 'article' ? "h-full object-cover object-top" : "h-auto"
                    )} 
                    referrerPolicy="no-referrer" 
                  />
                </div>
              )}
              {formData.video && (
                <div className="aspect-video rounded-2xl overflow-hidden mb-8 bg-black flex items-center justify-center text-white">
                  <div className="text-center space-y-2">
                    <Youtube size={48} className="mx-auto text-red-500" />
                    <p className="text-xs font-bold">Vidéo YouTube configurée</p>
                  </div>
                </div>
              )}
              {type === 'event' && (
                <div className="flex items-center gap-4 mb-6 text-primary font-bold">
                  <span className="flex items-center gap-1"><Calendar size={18} /> {formData.date}</span>
                  <span className="flex items-center gap-1"><MapPin size={18} /> {formData.location}</span>
                </div>
              )}
              <div className="markdown-body">
                <ReactMarkdown>{formData.content || "*Aucun contenu pour le moment...*"}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              {/* Premium Content Toggle */}
              {type === 'article' && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 space-y-6">
                   <h3 className="text-lg font-black flex items-center gap-2 text-primary font-display"><TrendingUp size={20} /> Article Premium</h3>
                   <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10">
                     <div className="space-y-1">
                        <p className="font-bold text-sm">Contenu réservé</p>
                        <p className="text-[10px] text-slate-500 font-medium tracking-wide">Seuls les membres avec abonnement actif pourront lire cet article.</p>
                     </div>
                     <input 
                      type="checkbox" 
                      checked={formData.isPremium}
                      onChange={e => setFormData({...formData, isPremium: e.target.checked})}
                      className="w-8 h-8 rounded-full border-2 accent-primary cursor-pointer"
                    />
                   </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Titre {type === 'article' ? "de l'article" : "de l'événement"}</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Entrez un titre percutant..."
                  className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-5 text-2xl font-black outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
                />
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Contenu de la Rédaction</label>
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                      <button 
                        type="button"
                        onClick={() => {
                          const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
                          if (!textarea) return;
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const text = textarea.value;
                          const selectedText = text.substring(start, end);
                          const newText = text.substring(0, start) + `**${selectedText}**` + text.substring(end);
                          setFormData({...formData, content: newText});
                        }}
                        className="p-2 hover:bg-white hover:text-primary rounded-lg transition-all text-slate-500"
                        title="Gras"
                      >
                        <Bold size={16} />
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
                          if (!textarea) return;
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const text = textarea.value;
                          const selectedText = text.substring(start, end);
                          const newText = text.substring(0, start) + `*${selectedText}*` + text.substring(end);
                          setFormData({...formData, content: newText});
                        }}
                        className="p-2 hover:bg-white hover:text-primary rounded-lg transition-all text-slate-500"
                        title="Italique"
                      >
                        <Italic size={16} />
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
                          if (!textarea) return;
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const text = textarea.value;
                          const selectedText = text.substring(start, end);
                          const newText = text.substring(0, start) + `[${selectedText}](url)` + text.substring(end);
                          setFormData({...formData, content: newText});
                        }}
                        className="p-2 hover:bg-white hover:text-primary rounded-lg transition-all text-slate-500"
                        title="Lien"
                      >
                        <LinkIcon size={16} />
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
                          if (!textarea) return;
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const text = textarea.value;
                          const selectedText = text.substring(start, end);
                          const newText = text.substring(0, start) + `\n- ${selectedText}` + text.substring(end);
                          setFormData({...formData, content: newText});
                        }}
                        className="p-2 hover:bg-white hover:text-primary rounded-lg transition-all text-slate-500"
                        title="Liste"
                      >
                        <ListIcon size={16} />
                      </button>
                      <div className="w-px h-4 bg-slate-200 mx-1" />
                      <button 
                        type="button"
                        onClick={() => {
                          const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
                          if (!textarea) return;
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const text = textarea.value;
                          const selectedText = text.substring(start, end);
                          const newText = text.substring(0, start) + `### ${selectedText}` + text.substring(end);
                          setFormData({...formData, content: newText});
                        }}
                        className="px-2 py-1 hover:bg-white hover:text-primary rounded-lg transition-all text-slate-500 text-[10px] font-black"
                        title="Titre"
                      >
                        H3
                      </button>
                    </div>
                  </div>
                  <textarea 
                    name="content"
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    placeholder="Saisissez votre texte ici. Utilisez les boutons ci-dessus pour la mise en forme..."
                    className="w-full bg-white border border-slate-100 rounded-3xl px-6 py-6 min-h-[500px] text-sm leading-relaxed outline-none focus:ring-2 focus:ring-primary/20 shadow-sm resize-y"
                  />
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    <Info size={12} /> Conseil : Séparez vos paragraphes par une ligne vide pour une meilleure lecture.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-lg space-y-6">
            <h4 className="font-black text-sm uppercase tracking-widest">Métadonnées</h4>
            
            <div className="space-y-6">
              {/* --- Section: Général --- */}
              <div className="space-y-4 border-b border-slate-50 pb-6">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-widest"><Info size={14}/> Infos Générales</div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Statut de Publication</label>
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button 
                      onClick={() => setFormData({...formData, status: 'published'})}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all",
                        formData.status === 'published' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-slate-500"
                      )}
                    >
                      Publié
                    </button>
                    <button 
                      onClick={() => setFormData({...formData, status: 'draft'})}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all",
                        formData.status === 'draft' ? "bg-slate-500 text-white shadow-lg" : "text-slate-50"
                      )}
                    >
                      Brouillon
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Planifier pour le (Optionnel)</label>
                  <input 
                    type="datetime-local" 
                    value={formData.scheduledAt || ''}
                    onChange={(e) => setFormData({...formData, scheduledAt: e.target.value || null})}
                    className="w-full bg-slate-50 rounded-xl px-4 py-3 text-[10px] outline-none focus:ring-2 focus:ring-primary/10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Slug (URL)</label>
                  <input 
                    type="text" 
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    className="w-full bg-slate-50 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-primary/10"
                    placeholder="titre-de-l-element"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Catégorie</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                    className="w-full bg-slate-50 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-primary/10 appearance-none font-bold italic text-primary"
                  >
                    {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Date de Publication</label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="date" 
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value || null})}
                      className="w-full bg-slate-50 rounded-xl pl-9 pr-4 py-3 text-xs outline-none focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                </div>
                {type === 'article' && (
                  <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-2xl border border-amber-100">
                    <input 
                      type="checkbox" 
                      checked={formData.isPremium}
                      onChange={e => setFormData({...formData, isPremium: e.target.checked})}
                      className="w-5 h-5 accent-amber-600"
                    />
                    <div>
                      <p className="text-[10px] font-black uppercase text-amber-700">Contenu Premium</p>
                      <p className="text-[8px] text-amber-500">Réserver cet article aux abonnés Premium.</p>
                    </div>
                  </div>
                )}
                {type === 'event' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Lieu de l'événement</label>
                    <div className="relative">
                      <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="w-full bg-slate-50 rounded-xl pl-9 pr-4 py-3 text-xs outline-none focus:ring-2 focus:ring-primary/10"
                        placeholder="Ex: Cotonou, Bénin"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* --- Section: Rédaction --- */}
              {type === 'article' && (
                <div className="space-y-4 border-b border-slate-50 pb-6">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest"><User size={14}/> La Rédaction</div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nom de l'auteur</label>
                    <input 
                      type="text" 
                      value={formData.author}
                      onChange={(e) => setFormData({...formData, author: e.target.value})}
                      className="w-full bg-slate-50 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-primary/10"
                      placeholder="Ex: Jean Dupont"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Rôle / Fonction</label>
                    <input 
                      type="text" 
                      value={formData.authorRole || ''}
                      onChange={(e) => setFormData({...formData, authorRole: e.target.value})}
                      className="w-full bg-slate-50 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-primary/10"
                      placeholder="Ex: Journaliste Reporter"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Source de l'information</label>
                    <input 
                      type="text" 
                      value={(formData as Article).source || ''}
                      onChange={(e) => setFormData({...formData, source: e.target.value})}
                      className="w-full bg-slate-50 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-primary/10"
                      placeholder="Ex: Agence Ivoirienne de Presse"
                    />
                  </div>
                </div>
              )}

              {/* --- Section: Médias --- */}
              <div className="space-y-4 border-b border-slate-50 pb-6">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest"><ImagePlus size={14}/> Médias & Source</div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Lien Image Principale</label>
                  <GitHubImageUpload 
                    value={formData.image || ''}
                    onChange={(val) => setFormData({...formData, image: val})}
                    placeholder="URL directe de l'image (https://...)"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Source / Crédit Photo</label>
                  <div className="relative">
                    <Camera size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      value={formData.imageCredit || ''}
                      onChange={(e) => setFormData({...formData, imageCredit: e.target.value})}
                      className="w-full bg-slate-50 rounded-xl pl-9 pr-4 py-3 text-xs outline-none focus:ring-2 focus:ring-primary/10"
                      placeholder="Ex: AFP / Justin Kpatcha"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Lien Vidéo (YouTube)</label>
                  <div className="relative">
                    <Youtube size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500" />
                    <input 
                      type="text" 
                      value={formData.video || ''}
                      onChange={(e) => setFormData({...formData, video: e.target.value})}
                      className="w-full bg-slate-50 rounded-xl pl-9 pr-4 py-3 text-[10px] outline-none focus:ring-2 focus:ring-primary/10"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Lien Audio (Podcast/MP3)</label>
                  <div className="relative">
                    <Check size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
                    <input 
                      type="text" 
                      value={formData.audioUrl || ''}
                      onChange={(e) => setFormData({...formData, audioUrl: e.target.value})}
                      className="w-full bg-slate-50 rounded-xl pl-9 pr-4 py-3 text-[10px] outline-none focus:ring-2 focus:ring-primary/10"
                      placeholder="URL directe du fichier audio (https://...)"
                    />
                  </div>
                </div>
              </div>

              {/* --- Section: Résumé --- */}
              <div className="space-y-4 border-b border-slate-50 pb-6">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-widest"><Type size={14}/> Accroche</div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Résumé (Extrait court)</label>
                  <textarea 
                    value={formData.excerpt}
                    onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                    className="w-full bg-slate-50 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-primary/10 min-h-[100px] resize-none"
                    placeholder="Un court résumé qui s'affichera sur la page d'accueil..."
                  />
                </div>
              </div>

              {/* --- Section: SEO --- */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-widest"><Globe size={14}/> Référencement (SEO)</div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Titre Google</label>
                  <input 
                    type="text" 
                    value={formData.seoTitle || ''}
                    onChange={(e) => setFormData({...formData, seoTitle: e.target.value})}
                    className="w-full bg-slate-50 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-primary/10"
                    placeholder="Titre pour les moteurs de recherche"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Méta Description</label>
                  <textarea 
                    value={formData.seoDescription || ''}
                    onChange={(e) => setFormData({...formData, seoDescription: e.target.value})}
                    className="w-full bg-slate-50 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-primary/10 h-20"
                    placeholder="Méta description pour Google..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Image Partage Social</label>
                  <GitHubImageUpload 
                    value={formData.socialImage || ''}
                    onChange={(val) => setFormData({...formData, socialImage: val})}
                    placeholder="URL image Facebook/Twitter"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PremiumUserList = ({ onUpgrade, onUpdateStatus }: { onUpgrade: (uid: string) => Promise<void>, onUpdateStatus: (uid: string, date: string | null) => Promise<void> }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [subSearch, setSubSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const u = await SupabaseService.getAllUsers();
        setUsers(u.filter(user => user.role !== 'admin'));
      } catch (err) {
        console.error("Erreur chargement utilisateurs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filtered = users.filter(u => 
    u.displayName.toLowerCase().includes(subSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(subSearch.toLowerCase())
  );

  if (loading) return <div className="p-10 text-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>;

  return (
    <>
      <div className="p-6 border-b border-slate-100">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          <input 
            type="text" 
            placeholder="Rechercher par nom ou email..."
            className="w-full bg-slate-50 border-none rounded-xl pl-12 pr-6 py-3 text-xs font-bold outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-primary/20"
            value={subSearch}
            onChange={e => setSubSearch(e.target.value)}
          />
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="p-10 text-center text-slate-400 font-medium italic">Aucun utilisateur trouvé.</div>
      ) : (
        filtered.map(user => (
          <div key={user.uid} className="grid grid-cols-12 px-6 py-5 items-center hover:bg-slate-50/50 transition-colors group">
            <div className="col-span-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-[18px] overflow-hidden bg-slate-100 border-2 border-white shadow-md">
                <img src={user.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="min-w-0">
                <p className="font-black text-slate-900 truncate text-[13px] tracking-tight">{user.displayName}</p>
                <p className="text-[10px] text-slate-500 truncate font-medium">{user.email}</p>
              </div>
            </div>
            <div className="col-span-3">
              {user.isPremium ? (
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter flex items-center gap-1">
                    <CheckCircle size={10} /> Abonné Actif
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">
                    Expire le {user.premiumUntil ? format(new Date(user.premiumUntil), 'dd/MM/yyyy') : 'N/A'}
                  </span>
                </div>
              ) : (
                <span className="text-slate-300 text-[10px] font-bold uppercase italic">Membre Gratuit</span>
              )}
            </div>
            <div className="col-span-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-lg">{user.paymentMethod || 'MANUEL'}</span>
            </div>
            <div className="col-span-3 flex justify-end gap-2">
              {user.isPremium ? (
                <div className="flex gap-2">
                   <button 
                    onClick={() => {
                      const days = prompt("Nombre de jours à ajouter ?", "30");
                      if (days) {
                        const current = user.premiumUntil ? new Date(user.premiumUntil) : new Date();
                        const next = new Date(current.getTime() + parseInt(days) * 24 * 60 * 60 * 1000).toISOString();
                        onUpdateStatus(user.uid, next);
                      }
                    }}
                    className="p-2 bg-slate-100 text-slate-400 hover:text-primary rounded-xl transition-all"
                    title="Prolonger"
                  >
                    <Plus size={18} />
                  </button>
                  <button 
                    onClick={() => {
                      if(confirm(`Bloquer l'accès premium de ${user.displayName} ?`)) {
                        onUpdateStatus(user.uid, null);
                      }
                    }}
                    className="p-2 bg-slate-100 text-slate-400 hover:text-red-500 rounded-xl transition-all"
                    title="Bloquer Premium"
                  >
                    <MonitorOff size={18} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => onUpgrade(user.uid)}
                  className="bg-primary text-white text-[10px] font-black px-5 py-2.5 rounded-[12px] shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <TrendingUp size={14} /> ACTIVER PREMIUM
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </>
  );
};

const LiveUpdateEditor = ({ update, onSave, onCancel }: { update: Partial<LiveUpdate>, onSave: (u: LiveUpdate) => void, onCancel: () => void }) => {
  const [formData, setFormData] = useState<LiveUpdate>({
    id: update.id || Date.now().toString(),
    content: update.content || '',
    date: update.date || new Date().toISOString(),
    type: update.type || 'info', // Default to info
    imageUrl: update.imageUrl || '',
    videoUrl: update.videoUrl || '',
    author: update.author || 'Rédaction'
  });

  return (
    <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-6 relative overflow-hidden African-pattern-light">
      <div className="flex items-center justify-between relative z-10">
         <h5 className="text-[10px] font-black uppercase tracking-widest text-primary italic">Nouvelle Mise à Jour</h5>
         <div className="flex gap-2">
            <button onClick={onCancel} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><X size={18}/></button>
            <button onClick={() => onSave(formData)} className="p-2 bg-primary text-white rounded-lg shadow-lg shadow-primary/20 hover:scale-105 transition-all"><Check size={18}/></button>
         </div>
      </div>

      <div className="space-y-4 relative z-10">
        <textarea 
          placeholder="Détail de l'information en direct..."
          className="w-full bg-white rounded-2xl p-4 text-sm font-medium border-none outline-none focus:ring-4 focus:ring-primary/10 min-h-[120px]"
          value={formData.content}
          onChange={e => setFormData({...formData, content: e.target.value})}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 px-2">Lien Image (Optionnel)</label>
              <GitHubImageUpload 
                value={formData.imageUrl || ''}
                onChange={(val) => setFormData({...formData, imageUrl: val, type: val ? 'media' : formData.type})}
                placeholder="https://... (image)"
                icon={Camera}
                inputClassName="bg-white border border-slate-100 py-2.5"
              />
           </div>
           <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 px-2">Lien Vidéo YouTube (Optionnel)</label>
              <div className="relative">
                <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500" size={12} />
                <input 
                  type="text"
                  placeholder="https://youtube.com/..."
                  className="w-full bg-white rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold outline-none border border-slate-100"
                  value={formData.videoUrl}
                  onChange={e => setFormData({...formData, videoUrl: e.target.value, type: e.target.value ? 'media' : formData.type})}
                />
              </div>
           </div>
        </div>

        <div className="flex bg-white/50 p-1 rounded-xl w-fit">
           {(['info', 'urgent'] as const).map(t => (
             <button 
              key={t}
              onClick={() => setFormData({...formData, type: t})}
              className={cn(
                "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all",
                formData.type === t ? "bg-slate-900 text-white" : "text-slate-400"
              )}
             >
               {t === 'info' ? 'Info' : 'Urgent'}
             </button>
           ))}
        </div>
      </div>
    </div>
  );
};

export const LiveBlogEditor = ({ blog, onSave, onCancel }: { blog: Partial<LiveBlog>, onSave: (b: LiveBlog) => void, onCancel: () => void }) => {
  const [formData, setFormData] = useState<LiveBlog>({
    id: blog.id || Date.now().toString(),
    articleId: blog.articleId || '',
    title: blog.title || '',
    updates: blog.updates || [],
    status: blog.status || 'live',
    createdAt: blog.createdAt || new Date().toISOString()
  });
  const [isAddingUpdate, setIsAddingUpdate] = useState(false);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button 
          onClick={onCancel}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black transition-all text-sm uppercase tracking-widest"
        >
          <ArrowLeft size={18} /> RETOUR
        </button>
        <button 
          onClick={() => onSave(formData)}
          className="px-8 py-4 bg-primary text-white font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest border-2 border-white"
        >
          <Save size={18} /> ENREGISTRER
        </button>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl p-10 space-y-12 African-pattern">
        <div className="space-y-4">
          <label className="text-xs font-black uppercase tracking-widest text-primary italic px-2 flex items-center gap-2">
            <TrendingUp size={16} /> Titre de l'événement en direct
          </label>
          <input 
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            placeholder="Ex: Élections Présidentielles 2026..."
            className="w-full bg-slate-50 border-none rounded-3xl px-8 py-6 text-2xl font-black outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 px-2">Statut du Direct</label>
              <div className="flex bg-slate-50 p-1 rounded-2xl">
                 <button 
                  onClick={() => setFormData({...formData, status: 'live'})}
                  className={cn("flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all", formData.status === 'live' ? "bg-emerald-500 text-white shadow-lg" : "text-slate-400")}
                 >
                   En Direct
                 </button>
                 <button 
                  onClick={() => setFormData({...formData, status: 'ended'})}
                  className={cn("flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all", formData.status === 'ended' ? "bg-slate-900 text-white shadow-lg" : "text-slate-400")}
                 >
                   Terminé
                 </button>
              </div>
           </div>
           <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 px-2">Date d'initialisation</label>
              <input 
                type="date" 
                value={(formData.createdAt || '').split('T')[0]} 
                onChange={e => setFormData({...formData, createdAt: e.target.value ? new Date(e.target.value).toISOString() : null})}
                className="w-full bg-slate-50 rounded-2xl px-6 py-3 text-xs font-bold outline-none border border-slate-100"
              />
           </div>
        </div>

        <div className="space-y-8 pt-8 border-t border-slate-50">
           <div className="flex items-center justify-between">
              <h4 className="text-xl font-black italic">Fil d'actualité ({formData.updates.length})</h4>
              <button 
                onClick={() => setIsAddingUpdate(true)}
                className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all flex items-center gap-2"
              >
                <Plus size={14} /> Ajouter une Mise à Jour
              </button>
           </div>

           <div className="space-y-6">
              {isAddingUpdate && (
                <LiveUpdateEditor 
                  update={{}} 
                  onCancel={() => setIsAddingUpdate(false)}
                  onSave={(update) => {
                    setFormData({...formData, updates: [update, ...formData.updates]});
                    setIsAddingUpdate(false);
                  }}
                />
              )}

              {formData.updates.map((update, idx) => (
                <div key={update.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex gap-6 items-start relative group">
                   <div className="flex flex-col items-center gap-2 pt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      <div className="w-0.5 flex-1 bg-slate-100" />
                   </div>
                   <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded">
                          {format(new Date(update.date), 'HH:mm')} • {update.type.toUpperCase()}
                        </span>
                        <button 
                          onClick={() => {
                            if(confirm("Supprimer cette mise à jour ?")) {
                              setFormData({
                                ...formData,
                                updates: formData.updates.filter(u => u.id !== update.id)
                              });
                            }
                          }}
                          className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash size={16}/>
                        </button>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed font-medium">{update.content}</p>
                      <div className="flex gap-4">
                        {update.imageUrl && <img src={update.imageUrl} className="w-20 h-20 rounded-xl object-cover border border-slate-200" referrerPolicy="no-referrer" />}
                        {update.videoUrl && (
                          <div className="w-20 h-20 rounded-xl bg-slate-900 flex items-center justify-center text-red-500 border border-slate-200">
                            <Youtube size={24} />
                          </div>
                        )}
                      </div>
                   </div>
                </div>
              ))}

              {formData.updates.length === 0 && !isAddingUpdate && (
                <div className="py-12 bg-slate-50 rounded-3xl text-center space-y-4 border border-dashed border-slate-200">
                   <TrendingUp className="mx-auto text-slate-200" size={32} />
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-widest italic">Le fil est vide. Commencez à publier.</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export const WebTVEditor = ({ video, onSave, onCancel, categories }: { video: Partial<WebTV>, onSave: (v: WebTV) => void, onCancel: () => void, categories: string[] }) => {
  const [formData, setFormData] = useState<WebTV>({
    id: video.id || Date.now().toString(),
    title: video.title || '',
    description: video.description || '',
    videoUrl: video.videoUrl || '',
    thumbnail: video.thumbnail || '',
    category: video.category || categories[0] || 'Web TV',
    date: video.date || new Date().toISOString(),
    views: video.views || 0,
    isPremium: video.isPremium || false
  });

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button 
          onClick={onCancel}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black transition-all text-sm uppercase tracking-widest"
        >
          <ArrowLeft size={18} /> RETOUR
        </button>
        <button 
          onClick={() => onSave(formData)}
          className="px-8 py-4 bg-primary text-white font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest border-2 border-white"
        >
          <Save size={18} /> ENREGISTRER
        </button>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl p-10 space-y-12 African-pattern">
        <div className="space-y-4">
          <label className="text-xs font-black uppercase tracking-widest text-primary italic px-2 flex items-center gap-2">
            <Video size={16} /> Titre de la vidéo
          </label>
          <input 
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            placeholder="Ex: Interview exclusive du Ministre..."
            className="w-full bg-slate-50 border-none rounded-3xl px-8 py-6 text-2xl font-black outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 px-2">Catégorie</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full bg-slate-50 rounded-2xl px-6 py-3 text-xs font-bold outline-none border border-slate-100"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                <option value="Web TV">Web TV</option>
              </select>
           </div>
           <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 px-2">Date de publication</label>
              <input 
                type="date" 
                value={(formData.date || '').split('T')[0]} 
                onChange={e => setFormData({...formData, date: e.target.value ? new Date(e.target.value).toISOString() : null})}
                className="w-full bg-slate-50 rounded-2xl px-6 py-3 text-xs font-bold outline-none border border-slate-100"
              />
           </div>
        </div>

        <div className="space-y-6">
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 px-2 flex items-center gap-2">
                <Youtube size={14} className="text-red-500" /> Lien Vidéo YouTube (ou autre)
              </label>
              <input 
                type="text"
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full bg-slate-50 rounded-2xl px-6 py-4 text-sm font-bold outline-none border border-slate-100"
                value={formData.videoUrl}
                onChange={e => setFormData({...formData, videoUrl: e.target.value})}
              />
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 px-2">Lien Miniature (Vignette)</label>
              <GitHubImageUpload 
                value={formData.thumbnail || ''}
                onChange={(val) => setFormData({...formData, thumbnail: val})}
                placeholder="https://... (image)"
              />
           </div>
        </div>

        <div className="space-y-4">
           <label className="text-[10px] font-black uppercase text-slate-400 px-2 italic">Description de la vidéo</label>
           <textarea 
            placeholder="Détails sur le contenu de cette émission..."
            className="w-full bg-slate-50 border-none rounded-[32px] px-8 py-6 text-sm font-medium outline-none focus:ring-4 focus:ring-primary/10 transition-all min-h-[150px]"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </div>
      </div>
    </div>
  );
};

export const ExportModal = ({ articles, events, onClose }: { articles: Article[], events: Event[], onClose: () => void }) => {
  const [copied, setCopied] = useState(false);
  const [activeExport, setActiveExport] = useState<'articles' | 'events'>('articles');
  
  const articleCode = `export const MOCK_ARTICLES: Article[] = ${JSON.stringify(articles, null, 2)};`;
  const eventCode = `export const MOCK_EVENTS: Event[] = ${JSON.stringify(events, null, 2)};`;

  const code = activeExport === 'articles' ? articleCode : eventCode;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black italic">Code d'Exportation</h3>
            <p className="text-xs text-slate-400 font-medium">Copiez ce code et collez-le dans constants.ts</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-all">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex bg-slate-100 p-1 m-4 rounded-xl w-fit">
          <button 
            onClick={() => setActiveExport('articles')}
            className={cn(
              "px-6 py-2 rounded-lg text-xs font-black transition-all",
              activeExport === 'articles' ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Articles
          </button>
          <button 
            onClick={() => setActiveExport('events')}
            className={cn(
              "px-6 py-2 rounded-lg text-xs font-black transition-all",
              activeExport === 'events' ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Événements
          </button>
        </div>

        <div className="p-8 pt-2">
          <div className="relative">
            <textarea 
              readOnly
              className="w-full h-[350px] bg-slate-900 text-emerald-400 font-mono text-[10px] p-6 rounded-2xl outline-none"
              value={code}
            />
            <button 
              onClick={handleCopy}
              className={cn(
                "absolute top-4 right-4 px-4 py-2 rounded-xl flex items-center gap-2 font-black text-xs transition-all shadow-xl",
                copied ? "bg-emerald-500 text-white" : "bg-white text-slate-900 border border-slate-200"
              )}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copié !" : "Copier le code"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
