import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import rifansLogo from '@/assets/rifans-logo.png';
import rifansStampImg from '@/assets/rifans-stamp.png';
import { useAuth } from '../../contexts/AuthContext';
import { 
  X, LayoutDashboard, FileText, Users, CheckCircle, Clock, AlertCircle, 
  Download, ExternalLink, Search, Filter, Bell, RefreshCw, PenTool, 
  IdCard, ChevronRight, ChevronLeft, MoreVertical, Trash2, Eye, 
  FileCheck, FileClock, History, UserCheck, UserPlus, TrendingUp,
  ArrowUpRight, ArrowDownRight, Calendar, Mail, Phone, MapPin,
  CreditCard, Briefcase, Hash, Menu, Printer, MessageCircle, Star
} from 'lucide-react';
import { AdminPaymentRequests } from './PaymentRequests';
import ChatPage from './ChatPage';
import { Button, Card } from './Shared';
import { motion, AnimatePresence } from 'motion/react';
import { SubmissionHistory, Notification, Contract, UserProfile } from '../../types';
import { safeStringify, safeParse } from '../../utils/safeJson';
import { getAdminSubmissions, getAdminUsers, getAdminNotifications, getAdminContracts, updateSubmissionStatus, sendContract as apiSendContract, sendInvoice as apiSendInvoice, getSubmissionHistory as apiGetSubmissionHistory, getAdminInvoices, uploadDocument } from '../../lib/api';
import { formatAmount } from '../../lib/formatNumber';
import { toPng } from 'html-to-image';

interface AdminDashboardProps {
  onClose: () => void;
}

type DashboardTab = 'home' | 'stats' | 'clients' | 'waive_requests' | 'rescheduling_requests' | 'service_requests' | 'contracts' | 'invoices' | 'payments' | 'notifications' | 'document_request' | 'reviews';

type AdminDocumentKind = 'contract' | 'invoice' | 'receipt' | 'authorization' | 'general_invoice';

type AdminDocumentItem = {
  id: string;
  submissionId: string;
  label: string;
  date: string;
  signed: boolean;
  type: AdminDocumentKind;
  amount?: number;
  reason?: string;
};

type GeneratedDocumentPayload = {
  fileName: string;
  emailSubject: string;
  emailBody: string;
  html: string;
};

const escapeHtml = (value: unknown) =>
  String(value ?? '---')
    .split('&').join('&amp;')
    .split('<').join('&lt;')
    .split('>').join('&gt;')
    .split('"').join('&quot;')
    .split("'").join('&#39;');

const getRequestTypeLabel = (type?: string) => {
  switch (type) {
    case 'waive_request':
      return 'طلب إعفاء';
    case 'rescheduling_request':
    case 'scheduling_request':
      return 'طلب جدولة';
    case 'service_request':
      return 'طلب خدمة';
    case 'seized_amounts_request':
      return 'إتاحة النسبة النظامية';
    default:
      return 'طلب خدمة';
  }
};

const getDocumentTypeLabel = (type: AdminDocumentKind) => {
  switch (type) {
    case 'contract':
      return 'عقد العميل';
    case 'invoice':
      return 'فاتورة العميل';
    case 'receipt':
      return 'إفادة استلام الطلب';
    case 'authorization':
      return 'إقرار وتفويض العميل';
    case 'general_invoice':
      return 'فاتورة عامة';
    default:
      return 'مستند';
  }
};

const getSubmissionProducts = (submission: any): any[] => {
  const rawProducts = submission?.data?.products;
  if (Array.isArray(rawProducts)) return rawProducts;
  if (typeof rawProducts === 'string') return safeParse(rawProducts, []);
  return [];
};

const AdminReviewSection: React.FC = () => {
  const [clientName, setClientName] = React.useState('');
  const [rating, setRating] = React.useState(5);
  const [comment, setComment] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const handleSubmit = async () => {
    if (!clientName.trim() || !comment.trim()) return;
    setIsSending(true);
    const { supabase } = await import('@/integrations/supabase/client');
    await supabase.from('client_reviews').insert({ client_name: clientName.trim(), rating, comment: comment.trim(), is_published: true });
    setIsSending(false); setSuccess(true); setClientName(''); setComment(''); setRating(5);
    setTimeout(() => setSuccess(false), 3000);
  };
  return (
    <div className="space-y-4" dir="rtl">
      {success && <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-3 text-green-700 dark:text-green-300 text-sm text-center font-bold">✅ تم إرسال التقييم بنجاح</div>}
      <div>
        <label className="block text-sm font-bold text-brand dark:text-gray-200 mb-1">اسم العميل</label>
        <input value={clientName} onChange={e => setClientName(e.target.value)} className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#12031a] px-3 py-2 text-sm text-brand dark:text-gray-100 outline-none focus:border-gold" placeholder="أدخل اسم العميل" />
      </div>
      <div>
        <label className="block text-sm font-bold text-brand dark:text-gray-200 mb-1">التقييم</label>
        <div className="flex gap-1">{[1,2,3,4,5].map(i => <button key={i} onClick={() => setRating(i)} className="transition-transform hover:scale-110"><Star size={28} className={i <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 dark:text-gray-600'} /></button>)}</div>
      </div>
      <div>
        <label className="block text-sm font-bold text-brand dark:text-gray-200 mb-1">التعليق</label>
        <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4} className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#12031a] px-3 py-2 text-sm text-brand dark:text-gray-100 outline-none focus:border-gold resize-none" placeholder="أدخل تعليق العميل" />
      </div>
      <button onClick={handleSubmit} disabled={isSending || !clientName.trim() || !comment.trim()} className="w-full py-2.5 rounded-xl bg-gold text-brand font-bold text-sm hover:bg-gold/90 transition-all disabled:opacity-50">{isSending ? 'جاري الإرسال...' : 'إرسال التقييم'}</button>
    </div>
  );
};

const PdfBulletList: React.FC<{ items: string[]; className?: string }> = ({ items, className }) => (
  <div className={className} dir="rtl">
    {items.map((item, index) => (
      <div key={`${item}-${index}`} className="flex items-start gap-2 text-right">
        <p className="flex-1">{item}</p>
        <span className="pt-[1px] font-black leading-none text-gold">•</span>
      </div>
    ))}
  </div>
);

const PdfNumberedList: React.FC<{ items: string[]; className?: string }> = ({ items, className }) => (
  <div className={className} dir="rtl">
    {items.map((item, index) => (
      <div key={`${item}-${index}`} className="flex items-start gap-2 text-right">
        <p className="flex-1">{item}</p>
        <span className="min-w-[18px] font-black leading-none text-brand">{index + 1}.</span>
      </div>
    ))}
  </div>
);

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [adminInvoices, setAdminInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [submissionHistory, setSubmissionHistory] = useState<any[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [selectedContract, setSelectedContract] = useState<any | null>(null);
  const [autoPrint, setAutoPrint] = useState(false);
  const [isConfirmingSendContract, setIsConfirmingSendContract] = useState(false);
  const [isConfirmingSendInvoice, setIsConfirmingSendInvoice] = useState(false);
  const [pendingContractData, setPendingContractData] = useState<{ userId: string, submissionId: string } | null>(null);
  const [pendingInvoiceData, setPendingInvoiceData] = useState<{ userId: string, submissionId: string } | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const contractContentRef = useRef<HTMLDivElement>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatTargetUser, setChatTargetUser] = useState<{ id: string; name: string } | null>(null);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  
  // Document request state
  const [docSelectedClient, setDocSelectedClient] = useState('');
  const [docType, setDocType] = useState<AdminDocumentKind | ''>('');
  const [docEmailTarget, setDocEmailTarget] = useState('');
  const [docEmailAddress, setDocEmailAddress] = useState('');
  const [docEmailDocId, setDocEmailDocId] = useState<string | null>(null);
  const [activeDocAction, setActiveDocAction] = useState<string | null>(null);
  // General invoice (standalone) inputs
  const [generalInvAmount, setGeneralInvAmount] = useState('');
  const [generalInvReason, setGeneralInvReason] = useState('');

  // Fetch unread chat messages for admin
  useEffect(() => {
    const fetchUnread = async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { count } = await supabase.from('chat_messages').select('*', { count: 'exact', head: true })
        .eq('receiver_id', 'admin').eq('is_read', false);
      setUnreadChatCount(count || 0);
    };
    fetchUnread();
    const channel = (async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      return supabase.channel('unread-chat-admin')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages' }, () => fetchUnread())
        .subscribe();
    })();
    return () => { channel.then(ch => import('@/integrations/supabase/client').then(m => m.supabase.removeChannel(ch))); };
  }, []);
  const handleDownloadPdf = useCallback(async () => {
    const el = contractContentRef.current;
    if (!el || !selectedContract) return;
    setIsDownloading(true);
    try {
      const { downloadContractPdf } = await import('../../lib/generateContractPdf');
      await downloadContractPdf(el, `عقد-${selectedContract.file_number || selectedContract.id}.pdf`);
    } catch (err) {
      console.error('Download failed:', err);
      alert('فشل تحميل العقد، يرجى المحاولة مرة أخرى');
    } finally {
      setIsDownloading(false);
    }
  }, [selectedContract]);

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (selectedContract && autoPrint) {
      const timer = setTimeout(() => {
        window.print();
        setAutoPrint(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [selectedContract, autoPrint]);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchSubmissions(),
        fetchUsers(),
        fetchNotifications(),
        fetchContracts(),
        fetchInvoices()
      ]);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const data = await getAdminSubmissions();
      setSubmissions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await getAdminUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await getAdminNotifications();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchContracts = async () => {
    try {
      const data = await getAdminContracts();
      setContracts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInvoices = async () => {
    try {
      const data = await getAdminInvoices();
      setAdminInvoices(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubmissionHistory = async (id: string) => {
    setIsHistoryLoading(true);
    try {
      const data = await apiGetSubmissionHistory(id);
      setSubmissionHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string, comment?: string) => {
    try {
      await updateSubmissionStatus(id, status, comment);
      setSubmissions(submissions.map(s => s.id === id ? { ...s, status } : s));
      if (selectedSubmission?.id === id) {
        setSelectedSubmission({ ...selectedSubmission, status });
        fetchSubmissionHistory(id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const sendContract = async (userId: string, submissionId: string) => {
    setPendingContractData({ userId, submissionId });
    setIsConfirmingSendContract(true);
  };

  const sendInvoice = async (userId: string, submissionId: string) => {
    setPendingInvoiceData({ userId, submissionId });
    setIsConfirmingSendInvoice(true);
  };

  const handleConfirmSendContract = async () => {
    if (!pendingContractData) return;
    const { userId, submissionId } = pendingContractData;
    
    try {
      await apiSendContract(userId, submissionId);
      setIsConfirmingSendContract(false);
      setPendingContractData(null);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      fetchContracts();
      fetchSubmissions();
    } catch (err) {
      console.error(err);
      alert('حدث خطأ');
    }
  };

  const handleConfirmSendInvoice = async () => {
    if (!pendingInvoiceData) return;
    const { userId, submissionId } = pendingInvoiceData;
    
    try {
      await apiSendInvoice(userId, submissionId);
      setIsConfirmingSendInvoice(false);
      setPendingInvoiceData(null);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      fetchSubmissions();
    } catch (err) {
      console.error(err);
      alert('حدث خطأ في إرسال الفاتورة');
    }
  };


  // Stats calculation
  const stats = useMemo(() => {
    return {
      totalUsers: users.length,
      totalRequests: submissions.length,
      newRequests: submissions.filter(s => s.status === 'pending').length,
      processing: submissions.filter(s => s.status === 'processing').length,
      executing: submissions.filter(s => s.status === 'executing').length,
      completed: submissions.filter(s => s.status === 'completed').length,
      rejected: submissions.filter(s => s.status === 'rejected').length,
      contractsSent: contracts.length,
      pendingSignature: contracts.filter(c => !c.signed_at).length,
      signedContracts: contracts.filter(c => !!c.signed_at).length,
    };
  }, [users, submissions, contracts]);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'جديد';
      case 'processing': return 'تحت الإجراء';
      case 'executing': return 'قيد التنفيذ';
      case 'completed': return 'مكتمل';
      case 'rejected': return 'مرفوض';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'processing': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'executing': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'rejected': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const filteredSubmissions = useMemo(() => {
    return submissions.filter(s => {
      const search = searchTerm.toLowerCase();
      const userName = s.user_name || s.data?.firstName || '';
      const matchesSearch = 
        userName.toLowerCase().includes(search) || 
        (s.id || '').toLowerCase().includes(search) ||
        (s.data?.nationalId || s.data?.national_id || '').includes(search);
      
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [submissions, searchTerm, statusFilter]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const search = searchTerm.toLowerCase();
      return (u.name || '').toLowerCase().includes(search) || 
             (u.email || '').toLowerCase().includes(search) ||
             (u.national_id || u.nationalId || '').includes(search) ||
             (u.phone || u.mobile || '').includes(search);
    });
  }, [users, searchTerm]);

  const filteredContracts = useMemo(() => {
    return contracts.filter(c => {
      const search = searchTerm.toLowerCase();
      return (c.user_name || '').toLowerCase().includes(search) || 
             (c.file_number || '').toLowerCase().includes(search);
    });
  }, [contracts, searchTerm]);

  const getTabTitle = (tab: DashboardTab) => {
    switch (tab) {
      case 'stats': return 'الإحصائيات السريعة';
      case 'clients': return 'بيانات العملاء';
      case 'waive_requests': return 'طلبات الإعفاء';
      case 'rescheduling_requests': return 'طلبات الجدولة';
      case 'service_requests': return 'طلبات الخدمات';
      case 'contracts': return 'عقود العملاء';
      case 'invoices': return 'فواتير العملاء';
      case 'payments': return 'سداد المدفوعات';
      case 'notifications': return 'التنبيهات';
      case 'document_request': return 'طلب مستند';
      case 'reviews': return 'إرسال تقييم';
      default: return '';
    }
  };

  const getTabIcon = (tab: DashboardTab) => {
    switch (tab) {
      case 'stats': return <TrendingUp size={20} />;
      case 'clients': return <Users size={20} />;
      case 'waive_requests': return <FileText size={20} />;
      case 'rescheduling_requests': return <RefreshCw size={20} />;
      case 'service_requests': return <Briefcase size={20} />;
      case 'contracts': return <PenTool size={20} />;
      case 'invoices': return <CreditCard size={20} />;
      case 'payments': return <CreditCard size={20} />;
      case 'notifications': return <Bell size={20} />;
      case 'document_request': return <FileCheck size={20} />;
      case 'reviews': return <Star size={20} />;
      default: return <LayoutDashboard size={20} />;
    }
  };

  const [statPopup, setStatPopup] = useState<{ label: string; items: any[] } | null>(null);

  const getStatItems = (type: string) => {
    switch (type) {
      case 'pending': return submissions.filter(s => s.status === 'pending').map(s => ({ name: s.user_name || 'عميل', id: s.id, date: s.created_at, type: s.type }));
      case 'processing': return submissions.filter(s => s.status === 'processing').map(s => ({ name: s.user_name || 'عميل', id: s.id, date: s.created_at, type: s.type }));
      case 'executing': return submissions.filter(s => s.status === 'executing').map(s => ({ name: s.user_name || 'عميل', id: s.id, date: s.created_at, type: s.type }));
      case 'completed': return submissions.filter(s => s.status === 'completed').map(s => ({ name: s.user_name || 'عميل', id: s.id, date: s.created_at, type: s.type }));
      case 'rejected': return submissions.filter(s => s.status === 'rejected').map(s => ({ name: s.user_name || 'عميل', id: s.id, date: s.created_at, type: s.type }));
      case 'pendingSignature': return contracts.filter(c => !c.signed_at).map(c => ({ name: c.user_name || 'عميل', id: c.id, date: c.created_at }));
      case 'signedContracts': return contracts.filter(c => !!c.signed_at).map(c => ({ name: c.user_name || 'عميل', id: c.id, date: c.signed_at }));
      case 'contractsSent': return contracts.map(c => ({ name: c.user_name || 'عميل', id: c.id, date: c.created_at }));
      case 'totalUsers': return users.map(u => ({ name: u.name || u.full_name || 'عميل', id: u.id, date: u.created_at }));
      case 'totalRequests': return submissions.map(s => ({ name: s.user_name || 'عميل', id: s.id, date: s.created_at, type: s.type }));
      default: return [];
    }
  };

  // Get clients who have submissions or used any service
  const clientsWithActivity = useMemo(() => {
    const userIds = new Set([
      ...submissions.map(s => s.userId || s.user_id),
      ...contracts.map(c => c.user_id),
      ...adminInvoices.map(inv => inv.user_id),
    ]);
    return users.filter(u => userIds.has(u.id));
  }, [users, submissions, contracts, adminInvoices]);

  const buildGeneratedDocument = useCallback((doc: AdminDocumentItem, selectedClient?: any | null): GeneratedDocumentPayload => {
    // Standalone general invoice: no submission required
    if (doc.type === 'general_invoice') {
      const client = selectedClient || users.find(u => u.id === doc.submissionId.replace('general-', '')) || null;
      const clientName = client?.name || client?.full_name || 'عميل';
      const clientNationalId = client?.national_id || client?.nationalId || '---';
      const clientPhone = client?.phone || client?.mobile || '---';
      const clientEmail = client?.email || '---';
      const issueDate = new Date(doc.date || Date.now()).toLocaleDateString('ar-SA');
      const amountNum = Number((doc as any).amount) || 0;
      const reason = (doc as any).reason || '---';
      const invoiceNumber = doc.id;
      const fileName = `فاتورة-عامة-${invoiceNumber}.pdf`;
      const documentTypeLabel = 'فاتورة عامة';

      const html = `
        <div dir="rtl" style="width:794px;min-height:1123px;background:#ffffff;padding:48px 44px;font-family:Tajawal,Arial,sans-serif;color:#22042C;box-sizing:border-box;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:24px;border-bottom:4px solid #22042C;padding-bottom:18px;margin-bottom:24px;">
            <div style="flex:1;text-align:right;">
              <p style="margin:0 0 6px;font-size:15px;font-weight:700;color:#C5A059;">شركة ريفانس المالية</p>
              <h1 style="margin:0;font-size:30px;font-weight:900;line-height:1.35;">${escapeHtml(documentTypeLabel)}</h1>
              <p style="margin:8px 0 0;font-size:13px;line-height:1.9;color:#6b5b76;">فاتورة صادرة من إدارة ريفانس المالية للعميل المذكور أدناه.</p>
            </div>
            <img src="${rifansLogo}" alt="شعار ريفانس" style="width:180px;height:116px;object-fit:contain;" />
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;background:#fcf8f0;border:1px solid #eadfc9;border-radius:18px;padding:16px 18px;margin-bottom:18px;">
            <div style="text-align:right;">
              <div style="font-size:18px;font-weight:900;">بيان الفاتورة</div>
              <div style="font-size:12px;color:#7a6a84;margin-top:4px;">رقم الفاتورة: ${escapeHtml(invoiceNumber)} • تاريخ الإصدار: ${escapeHtml(issueDate)}</div>
            </div>
            <div style="background:#22042C;color:#C5A059;border-radius:999px;padding:8px 16px;font-size:12px;font-weight:800;white-space:nowrap;">بانتظار السداد</div>
          </div>

          <table style="width:100%;border-collapse:collapse;margin-bottom:18px;font-size:13px;">
            <tbody>
              <tr>
                <td style="padding:10px 12px;border:1px solid #eadfc9;background:#fcf8f0;font-weight:700;">اسم العميل</td>
                <td style="padding:10px 12px;border:1px solid #eadfc9;">${escapeHtml(clientName)}</td>
                <td style="padding:10px 12px;border:1px solid #eadfc9;background:#fcf8f0;font-weight:700;">رقم الهوية</td>
                <td style="padding:10px 12px;border:1px solid #eadfc9;">${escapeHtml(clientNationalId)}</td>
              </tr>
              <tr>
                <td style="padding:10px 12px;border:1px solid #eadfc9;background:#fcf8f0;font-weight:700;">رقم الجوال</td>
                <td style="padding:10px 12px;border:1px solid #eadfc9;">${escapeHtml(clientPhone)}</td>
                <td style="padding:10px 12px;border:1px solid #eadfc9;background:#fcf8f0;font-weight:700;">البريد الإلكتروني</td>
                <td style="padding:10px 12px;border:1px solid #eadfc9;">${escapeHtml(clientEmail)}</td>
              </tr>
              <tr>
                <td style="padding:10px 12px;border:1px solid #eadfc9;background:#fcf8f0;font-weight:700;">المبلغ المستحق</td>
                <td style="padding:10px 12px;border:1px solid #eadfc9;font-weight:900;color:#22042C;">${escapeHtml(formatAmount(amountNum))} ر.س</td>
                <td style="padding:10px 12px;border:1px solid #eadfc9;background:#fcf8f0;font-weight:700;">العملة</td>
                <td style="padding:10px 12px;border:1px solid #eadfc9;">ريال سعودي</td>
              </tr>
            </tbody>
          </table>

          <div style="margin-bottom:18px;">
            <h2 style="margin:0 0 10px;font-size:16px;font-weight:900;color:#22042C;">وذلك مقابل</h2>
            <div style="padding:14px 16px;border:1px solid #eadfc9;border-radius:14px;background:#fffdf7;font-size:13px;line-height:2;color:#22042C;white-space:pre-wrap;">${escapeHtml(reason)}</div>
          </div>

          <div style="display:flex;justify-content:space-between;align-items:end;gap:20px;margin-top:28px;">
            <div style="font-size:12px;color:#7a6a84;line-height:1.9;">
              <div>تم إنشاء هذه الفاتورة من لوحة تحكم الإدارة.</div>
              <div>يرجى السداد عبر الوسائل المعتمدة.</div>
            </div>
            <img src="${rifansStampImg}" alt="ختم ريفانس" style="width:150px;height:150px;object-fit:contain;opacity:0.85;" />
          </div>
        </div>
      `;

      return {
        fileName,
        emailSubject: `${documentTypeLabel} - ${clientName}`,
        emailBody: `تم تجهيز ${documentTypeLabel} الخاصة بالعميل ${clientName} بمبلغ ${formatAmount(amountNum)} ر.س.`,
        html,
      };
    }

    const submission = submissions.find(s => s.id === doc.submissionId);
    if (!submission) {
      throw new Error('تعذر العثور على بيانات المستند');
    }

    const client = selectedClient || users.find(u => u.id === (submission.userId || submission.user_id)) || null;
    const contract = doc.type === 'contract'
      ? contracts.find(c => c.id === doc.id) || contracts.find(c => c.submission_id === doc.submissionId)
      : null;
    const invoice = doc.type === 'invoice'
      ? adminInvoices.find(inv => inv.id === doc.id) || adminInvoices.find(inv => inv.submission_id === doc.submissionId)
      : null;

    const products = getSubmissionProducts(submission);
    const totalDebt = products.reduce((acc: number, product: any) => acc + (Number(product.amount) || 0), 0);
    const clientName = client?.name
      || client?.full_name
      || submission.user_name
      || submission.data?.fullName
      || [submission.data?.firstName, submission.data?.middleName, submission.data?.lastName].filter(Boolean).join(' ')
      || 'عميل';
    const clientNationalId = client?.national_id || client?.nationalId || submission.data?.nationalId || submission.data?.national_id || '---';
    const clientPhone = client?.phone || client?.mobile || submission.data?.mobile || submission.data?.phone || '---';
    const clientEmail = client?.email || submission.user_email || '---';
    const issueDate = new Date(doc.date || submission.created_at || Date.now()).toLocaleDateString('ar-SA');
    const requestTypeLabel = getRequestTypeLabel(submission.type);
    const documentTypeLabel = getDocumentTypeLabel(doc.type);
    const fileName = `${documentTypeLabel}-${doc.submissionId}.pdf`;

    const productRows = products.length > 0
      ? products.map((product: any, index: number) => `
          <tr>
            <td style="padding:10px 12px;border:1px solid #eadfc9;">${index + 1}</td>
            <td style="padding:10px 12px;border:1px solid #eadfc9;">${escapeHtml(product.type || 'منتج تمويلي')}</td>
            <td style="padding:10px 12px;border:1px solid #eadfc9;">${escapeHtml(product.accountNumber || product.account_number || '---')}</td>
            <td style="padding:10px 12px;border:1px solid #eadfc9;">${escapeHtml(formatAmount(Number(product.amount) || 0))} ر.س</td>
          </tr>
        `).join('')
      : `
          <tr>
            <td colspan="4" style="padding:12px;border:1px solid #eadfc9;text-align:center;color:#7a6a84;">لا توجد منتجات مرفقة مع هذا الطلب</td>
          </tr>
        `;

    let summaryTitle = '';
    let summaryText = '';
    let statusBadge = '';
    let extraRows = '';
    let customBody = ''; // For receipt and authorization custom layouts

    switch (doc.type) {
      case 'contract':
        summaryTitle = 'بيان العقد';
        summaryText = 'هذه نسخة إدارية من عقد العميل الصادر ضمن الطلب ويمكن اعتمادها للطباعة أو المشاركة.';
        statusBadge = contract?.signed_at ? 'موقّع' : 'غير موقّع';
        extraRows = `
          <tr>
            <td style="padding:10px 12px;border:1px solid #eadfc9;background:#fcf8f0;font-weight:700;">رقم العقد</td>
            <td style="padding:10px 12px;border:1px solid #eadfc9;">${escapeHtml(contract?.id || doc.id)}</td>
            <td style="padding:10px 12px;border:1px solid #eadfc9;background:#fcf8f0;font-weight:700;">حالة التوقيع</td>
            <td style="padding:10px 12px;border:1px solid #eadfc9;">${escapeHtml(statusBadge)}</td>
          </tr>
          <tr>
            <td style="padding:10px 12px;border:1px solid #eadfc9;background:#fcf8f0;font-weight:700;">تاريخ التوقيع</td>
            <td style="padding:10px 12px;border:1px solid #eadfc9;">${escapeHtml(contract?.signed_at ? new Date(contract.signed_at).toLocaleDateString('ar-SA') : '---')}</td>
            <td style="padding:10px 12px;border:1px solid #eadfc9;background:#fcf8f0;font-weight:700;">الجهة التمويلية</td>
            <td style="padding:10px 12px;border:1px solid #eadfc9;">${escapeHtml(submission.data?.bank || '---')}</td>
          </tr>
        `;
        break;
      case 'invoice':
        summaryTitle = 'بيان الفاتورة';
        summaryText = 'هذه نسخة إدارية من الفاتورة الصادرة للعميل ويمكن استخدامها للطباعة أو الإرسال.';
        statusBadge = invoice?.status === 'paid' ? 'مسددة' : 'بانتظار السداد';
        extraRows = `
          <tr>
            <td style="padding:10px 12px;border:1px solid #eadfc9;background:#fcf8f0;font-weight:700;">رقم الفاتورة</td>
            <td style="padding:10px 12px;border:1px solid #eadfc9;">${escapeHtml(invoice?.id || doc.id)}</td>
            <td style="padding:10px 12px;border:1px solid #eadfc9;background:#fcf8f0;font-weight:700;">الحالة</td>
            <td style="padding:10px 12px;border:1px solid #eadfc9;">${escapeHtml(statusBadge)}</td>
          </tr>
          <tr>
            <td style="padding:10px 12px;border:1px solid #eadfc9;background:#fcf8f0;font-weight:700;">المبلغ المستحق</td>
            <td style="padding:10px 12px;border:1px solid #eadfc9;">${escapeHtml(formatAmount(Number(invoice?.amount) || 0))} ر.س</td>
            <td style="padding:10px 12px;border:1px solid #eadfc9;background:#fcf8f0;font-weight:700;">إجمالي المديونية</td>
            <td style="padding:10px 12px;border:1px solid #eadfc9;">${escapeHtml(formatAmount(Number(invoice?.total_debt) || totalDebt || 0))} ر.س</td>
          </tr>
        `;
        break;
      case 'authorization':
        summaryTitle = 'إقرار وتفويض';
        summaryText = '';
        statusBadge = 'ساري';
        extraRows = `
          <tr>
            <td style="padding:10px 12px;border:1px solid #eadfc9;background:#fcf8f0;font-weight:700;">رقم الطلب</td>
            <td style="padding:10px 12px;border:1px solid #eadfc9;">${escapeHtml(submission.id)}</td>
            <td style="padding:10px 12px;border:1px solid #eadfc9;background:#fcf8f0;font-weight:700;">نوع الطلب</td>
            <td style="padding:10px 12px;border:1px solid #eadfc9;">${escapeHtml(requestTypeLabel)}</td>
          </tr>
          <tr>
            <td style="padding:10px 12px;border:1px solid #eadfc9;background:#fcf8f0;font-weight:700;">الجهة التمويلية</td>
            <td style="padding:10px 12px;border:1px solid #eadfc9;">${escapeHtml(submission.data?.bank || '---')}</td>
            <td style="padding:10px 12px;border:1px solid #eadfc9;background:#fcf8f0;font-weight:700;">الحالة الحالية</td>
            <td style="padding:10px 12px;border:1px solid #eadfc9;">${escapeHtml(getStatusLabel(submission.status))}</td>
          </tr>
        `;
        // Full authorization legal text
        customBody = `
          <div style="margin-top:20px;font-size:13px;line-height:2.1;color:#22042C;">
            <h1 style="text-align:center;font-size:24px;font-weight:900;margin:0 0 16px;">إقرار وتفويض</h1>
            <p style="margin:0 0 14px;">أنا الموقع أدناه، أقرّ وأفوض بمحض إرادتي الكاملة، وبكامل أهليتي المعتبرة شرعًا ونظامًا، لشركة ريفانس المالية، للقيام بكافة الإجراءات اللازمة لدراسة ومعالجة حالتي الائتمانية والمالية، وذلك لغرض تقديم ومتابعة الطلب المقدم مني والمتعلق بخدمات (الإعفاء / تسوية المديونيات / إعادة الجدولة / أي خدمات مالية ذات صلة).</p>
            <hr style="border:none;border-top:1px solid #eadfc9;margin:14px 0;">

            <h3 style="font-size:15px;font-weight:900;margin:14px 0 8px;">أولًا: الإقرارات</h3>
            <p style="margin:0 0 6px;">أقرّ وأتعهد بما يلي:</p>
            <ol style="margin:0 0 14px;padding-right:20px;">
              <li style="margin-bottom:4px;">أن جميع البيانات والمعلومات والمستندات التي قمت بتقديمها صحيحة ودقيقة ومحدثة، وأتحمل كامل المسؤولية القانونية والنظامية في حال ثبوت خلاف ذلك.</li>
              <li style="margin-bottom:4px;">أنني قمت بتقديم الطلب برغبتي الحرة دون أي ضغط أو إكراه، وعلى علم تام بكافة تبعاته.</li>
              <li style="margin-bottom:4px;">أن تقديم الطلب لا يُعد ضمانًا للموافقة عليه، وأن القرار النهائي يخضع لسياسات وإجراءات الجهات التمويلية أو المختصة.</li>
              <li style="margin-bottom:4px;">التزامي بتزويد الشركة بأي معلومات أو مستندات إضافية تُطلب مني خلال فترة دراسة الطلب.</li>
              <li style="margin-bottom:4px;">موافقتي على استخدام بياناتي لأغراض تحليل ودراسة الحالة المالية والائتمانية واتخاذ القرار المناسب.</li>
              <li style="margin-bottom:4px;">علمي بأن أي تأخير في تزويد المعلومات قد يؤثر على مدة معالجة الطلب.</li>
              <li style="margin-bottom:4px;">إقراري بعدم تقديم معلومات مضللة أو إخفاء أي بيانات جوهرية قد تؤثر على نتيجة الطلب.</li>
            </ol>
            <hr style="border:none;border-top:1px solid #eadfc9;margin:14px 0;">

            <h3 style="font-size:15px;font-weight:900;margin:14px 0 8px;">ثانيًا: نطاق التفويض</h3>
            <p style="margin:0 0 6px;">أفوض شركة ريفانس المالية تفويضًا صريحًا وواضحًا بما يلي:</p>
            <ol style="margin:0 0 14px;padding-right:20px;">
              <li style="margin-bottom:4px;">الاطلاع على سجلاتي الائتمانية لدى الجهات المرخصة (مثل سمة أو أي جهات ذات علاقة).</li>
              <li style="margin-bottom:4px;">الاستعلام عن بياناتي لدى الجهات الحكومية والخاصة، بما في ذلك الجهات ذات العلاقة بالخدمات المالية.</li>
              <li style="margin-bottom:4px;">التواصل نيابةً مع البنوك، شركات التمويل، الجهات الدائنة، وشركات التحصيل.</li>
              <li style="margin-bottom:4px;">التفاوض نيابةً عني بشأن تسوية المديونيات أو إعادة جدولة الالتزامات المالية.</li>
              <li style="margin-bottom:4px;">تقديم ومتابعة طلبات الإعفاء أو التسوية أو أي خدمات مرتبطة بحالتي المالية.</li>
              <li style="margin-bottom:4px;">استلام وإرسال المراسلات المتعلقة بالطلب عبر الوسائل الرسمية (رسائل نصية، بريد إلكتروني، اتصال هاتفي).</li>
              <li style="margin-bottom:4px;">تمثيلي أمام الجهات ذات العلاقة في حدود ما يخدم معالجة الطلب دون الإخلال بالأنظمة.</li>
            </ol>
            <hr style="border:none;border-top:1px solid #eadfc9;margin:14px 0;">

            <h3 style="font-size:15px;font-weight:900;margin:14px 0 8px;">ثالثًا: مدة التفويض وسريانه</h3>
            <ul style="margin:0 0 14px;padding-right:20px;list-style:disc;">
              <li style="margin-bottom:4px;">يبدأ سريان هذا التفويض من تاريخ الموافقة عليه، ويستمر حتى الانتهاء من معالجة الطلب أو إلغائه بناءً على طلب خطي مني.</li>
              <li style="margin-bottom:4px;">يحق للشركة تعليق أو إنهاء الإجراءات في حال عدم التزامي بتزويد المعلومات أو مخالفة الشروط.</li>
              <li style="margin-bottom:4px;">يظل التفويض ساريًا خلال فترة متابعة الطلب وحتى إغلاقه رسميًا.</li>
            </ul>
            <hr style="border:none;border-top:1px solid #eadfc9;margin:14px 0;">

            <h3 style="font-size:15px;font-weight:900;margin:14px 0 8px;">رابعًا: حماية البيانات والخصوصية</h3>
            <ol style="margin:0 0 14px;padding-right:20px;">
              <li style="margin-bottom:4px;">أوافق على جمع ومعالجة واستخدام بياناتي الشخصية والمالية لأغراض دراسة الطلب وتنفيذه.</li>
              <li style="margin-bottom:4px;">تلتزم شركة ريفانس المالية بالحفاظ على سرية البيانات وعدم الإفصاح عنها إلا للجهات ذات العلاقة وبما يخدم الطلب.</li>
              <li style="margin-bottom:4px;">يتم التعامل مع البيانات وفق الأنظمة واللوائح المعمول بها في المملكة العربية السعودية.</li>
              <li style="margin-bottom:4px;">أوافق على أرشفة البيانات واستخدامها لأغراض تحسين الخدمة والتحليل الداخلي.</li>
            </ol>
            <hr style="border:none;border-top:1px solid #eadfc9;margin:14px 0;">

            <h3 style="font-size:15px;font-weight:900;margin:14px 0 8px;">خامسًا: المسؤولية القانونية</h3>
            <ol style="margin:0 0 14px;padding-right:20px;">
              <li style="margin-bottom:4px;">يقر المفوِّض بأنه اطلع على كامل شروط وأحكام هذا التفويض وفهمها.</li>
              <li style="margin-bottom:4px;">يتحمل المفوِّض كامل المسؤولية عن صحة المعلومات المقدمة.</li>
              <li style="margin-bottom:4px;">لا تتحمل شركة ريفانس المالية أي مسؤولية عن أي قرارات تتخذها الجهات التمويلية أو المختصة بشأن الطلب.</li>
              <li style="margin-bottom:4px;">يخضع هذا الإقرار والتفويض للأنظمة واللوائح المعمول بها في المملكة العربية السعودية.</li>
            </ol>
            <hr style="border:none;border-top:1px solid #eadfc9;margin:14px 0;">

            <h3 style="font-size:15px;font-weight:900;margin:14px 0 8px;">سادسًا: بيانات المفوِّض</h3>
          </div>
        `;
        break;
      case 'receipt':
      default:
        summaryTitle = 'إفادة استلام الطلب';
        summaryText = '';
        statusBadge = getStatusLabel(submission.status);
        extraRows = `
          <tr>
            <td style="padding:10px 12px;border:1px solid #eadfc9;background:#fcf8f0;font-weight:700;">رقم الطلب</td>
            <td style="padding:10px 12px;border:1px solid #eadfc9;">${escapeHtml(submission.id)}</td>
            <td style="padding:10px 12px;border:1px solid #eadfc9;background:#fcf8f0;font-weight:700;">نوع الطلب</td>
            <td style="padding:10px 12px;border:1px solid #eadfc9;">${escapeHtml(requestTypeLabel)}</td>
          </tr>
          <tr>
            <td style="padding:10px 12px;border:1px solid #eadfc9;background:#fcf8f0;font-weight:700;">تاريخ الاستلام</td>
            <td style="padding:10px 12px;border:1px solid #eadfc9;">${escapeHtml(new Date(submission.created_at).toLocaleDateString('ar-SA'))}</td>
            <td style="padding:10px 12px;border:1px solid #eadfc9;background:#fcf8f0;font-weight:700;">الحالة الحالية</td>
            <td style="padding:10px 12px;border:1px solid #eadfc9;">${escapeHtml(statusBadge)}</td>
          </tr>
        `;
        // Custom receipt body with formal letter
        customBody = `
          <div style="margin-top:16px;font-size:13px;line-height:2.1;color:#22042C;">
            <p style="margin:0 0 12px;">جاري العمل على مراجعة الطلب من قبل الفريق المختص وفق الإجراءات المعتمدة.</p>
            <p style="margin:0 0 12px;">سيتم دراسة الطلب والتأكد من اكتمال البيانات والمرفقات، وفي حال الحاجة إلى أي معلومات إضافية سيتم التواصل معكم مباشرة.</p>
            <p style="margin:0 0 12px;">نأمل التكرم بالانتظار لحين الانتهاء من إجراءات المراجعة، وسيتم إشعاركم بحالة الطلب فور التحديث.</p>
            <p style="margin:0 0 4px;">شاكرين ثقتكم بنا،</p>
            <p style="margin:0 0 20px;font-weight:700;">وتفضلوا بقبول فائق الاحترام والتقدير</p>
          </div>
        `;
        break;
    }

    // Build the HTML - receipt and authorization use customBody for different layout
    const isReceipt = doc.type === 'receipt' || (!['contract','invoice','authorization'].includes(doc.type));
    const isAuthorization = doc.type === 'authorization';

    const html = `
      <div dir="rtl" style="width:794px;min-height:1123px;background:#ffffff;padding:48px 44px;font-family:Tajawal,Arial,sans-serif;color:#22042C;box-sizing:border-box;">
        <!-- Header with bigger logo -->
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:24px;border-bottom:4px solid #22042C;padding-bottom:18px;margin-bottom:24px;">
          <div style="flex:1;text-align:right;">
            <p style="margin:0 0 6px;font-size:15px;font-weight:700;color:#C5A059;">شركة ريفانس المالية</p>
            <h1 style="margin:0;font-size:30px;font-weight:900;line-height:1.35;">${escapeHtml(documentTypeLabel)}</h1>
            ${(!isReceipt && !isAuthorization) ? `<p style="margin:8px 0 0;font-size:13px;line-height:1.9;color:#6b5b76;">${escapeHtml(summaryText)}</p>` : ''}
          </div>
          <img src="${rifansLogo}" alt="شعار ريفانس" style="width:180px;height:116px;object-fit:contain;" />
        </div>

        ${isReceipt ? `
          <!-- Receipt greeting -->
          <p style="font-size:14px;margin:0 0 8px;line-height:1.8;">عزيزي العميل / <strong>${escapeHtml(clientName)}</strong></p>
          <p style="font-size:13px;margin:0 0 16px;line-height:1.8;">نود إشعاركم بأنه تم استلام طلبكم بنجاح،</p>
        ` : ''}

        <!-- Reference bar -->
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;background:#fcf8f0;border:1px solid #eadfc9;border-radius:18px;padding:16px 18px;margin-bottom:18px;">
          <div style="text-align:right;">
            <div style="font-size:18px;font-weight:900;">${escapeHtml(summaryTitle)}</div>
            <div style="font-size:12px;color:#7a6a84;margin-top:4px;">رقم المرجع: ${escapeHtml(doc.submissionId)} • تاريخ الإصدار: ${escapeHtml(issueDate)}</div>
          </div>
          <div style="background:#22042C;color:#C5A059;border-radius:999px;padding:8px 16px;font-size:12px;font-weight:800;white-space:nowrap;">${escapeHtml(statusBadge)}</div>
        </div>

        <!-- Client data table -->
        <table style="width:100%;border-collapse:collapse;margin-bottom:18px;font-size:13px;">
          <tbody>
            <tr>
              <td style="padding:10px 12px;border:1px solid #eadfc9;background:#fcf8f0;font-weight:700;">اسم العميل</td>
              <td style="padding:10px 12px;border:1px solid #eadfc9;">${escapeHtml(clientName)}</td>
              <td style="padding:10px 12px;border:1px solid #eadfc9;background:#fcf8f0;font-weight:700;">رقم الهوية</td>
              <td style="padding:10px 12px;border:1px solid #eadfc9;">${escapeHtml(clientNationalId)}</td>
            </tr>
            <tr>
              <td style="padding:10px 12px;border:1px solid #eadfc9;background:#fcf8f0;font-weight:700;">رقم الجوال</td>
              <td style="padding:10px 12px;border:1px solid #eadfc9;">${escapeHtml(clientPhone)}</td>
              <td style="padding:10px 12px;border:1px solid #eadfc9;background:#fcf8f0;font-weight:700;">البريد الإلكتروني</td>
              <td style="padding:10px 12px;border:1px solid #eadfc9;">${escapeHtml(clientEmail)}</td>
            </tr>
            ${extraRows}
          </tbody>
        </table>

        <!-- Products table -->
        <div style="margin-bottom:18px;">
          <h2 style="margin:0 0 10px;font-size:16px;font-weight:900;color:#22042C;">بيانات المنتجات التمويلية</h2>
          <table style="width:100%;border-collapse:collapse;font-size:12px;">
            <thead>
              <tr style="background:#22042C;color:#ffffff;">
                <th style="padding:10px 12px;border:1px solid #22042C;">#</th>
                <th style="padding:10px 12px;border:1px solid #22042C;">المنتج</th>
                <th style="padding:10px 12px;border:1px solid #22042C;">رقم الحساب</th>
                <th style="padding:10px 12px;border:1px solid #22042C;">المبلغ</th>
              </tr>
            </thead>
            <tbody>
              ${productRows}
            </tbody>
          </table>
        </div>

        ${customBody}

        ${isAuthorization ? `
          <!-- Authorization client data at bottom -->
          <table style="width:100%;border-collapse:collapse;margin-bottom:18px;font-size:13px;">
            <tbody>
              <tr>
                <td style="padding:10px 12px;border:1px solid #eadfc9;background:#fcf8f0;font-weight:700;">الاسم الكامل</td>
                <td style="padding:10px 12px;border:1px solid #eadfc9;">${escapeHtml(clientName)}</td>
              </tr>
              <tr>
                <td style="padding:10px 12px;border:1px solid #eadfc9;background:#fcf8f0;font-weight:700;">رقم الهوية</td>
                <td style="padding:10px 12px;border:1px solid #eadfc9;">${escapeHtml(clientNationalId)}</td>
              </tr>
              <tr>
                <td style="padding:10px 12px;border:1px solid #eadfc9;background:#fcf8f0;font-weight:700;">رقم الجوال</td>
                <td style="padding:10px 12px;border:1px solid #eadfc9;">${escapeHtml(clientPhone)}</td>
              </tr>
              <tr>
                <td style="padding:10px 12px;border:1px solid #eadfc9;background:#fcf8f0;font-weight:700;">تاريخ الإقرار</td>
                <td style="padding:10px 12px;border:1px solid #eadfc9;">${escapeHtml(issueDate)}</td>
              </tr>
              <tr>
                <td style="padding:10px 12px;border:1px solid #eadfc9;background:#fcf8f0;font-weight:700;">التوقيع</td>
                <td style="padding:10px 12px;border:1px solid #eadfc9;">${contract?.signature_data ? `<img src="${contract.signature_data}" style="height:50px;" />` : '___________________'}</td>
              </tr>
            </tbody>
          </table>
        ` : ''}

        <!-- Footer with bigger stamp -->
        <div style="display:flex;justify-content:space-between;align-items:end;gap:20px;margin-top:28px;">
          <div style="font-size:12px;color:#7a6a84;line-height:1.9;">
            <div>نوع الخدمة: ${escapeHtml(requestTypeLabel)}</div>
            <div>الجهة التمويلية: ${escapeHtml(submission.data?.bank || '---')}</div>
            <div>تم إنشاء هذه النسخة من لوحة تحكم الإدارة.</div>
          </div>
          <img src="${rifansStampImg}" alt="ختم ريفانس" style="width:150px;height:150px;object-fit:contain;opacity:0.85;" />
        </div>
      </div>
    `;

    return {
      fileName,
      emailSubject: `${documentTypeLabel} - ${clientName}`,
      emailBody: `تم تجهيز ${documentTypeLabel} الخاص بالعميل ${clientName} ورابط المستند مرفق أدناه.`,
      html,
    };
  }, [adminInvoices, contracts, submissions, users, getStatusLabel]);

  const withTemporaryDocumentElement = useCallback(async (
    doc: AdminDocumentItem,
    selectedClient: any | null,
    callback: (element: HTMLElement, payload: GeneratedDocumentPayload) => Promise<void>
  ) => {
    const payload = buildGeneratedDocument(doc, selectedClient);
    const mount = document.createElement('div');
    mount.style.position = 'fixed';
    mount.style.left = '-10000px';
    mount.style.top = '0';
    mount.style.opacity = '0';
    mount.style.pointerEvents = 'none';
    mount.innerHTML = payload.html;
    document.body.appendChild(mount);

    const element = mount.firstElementChild as HTMLElement | null;
    if (!element) {
      document.body.removeChild(mount);
      throw new Error('تعذر تجهيز المستند');
    }

    try {
      await callback(element, payload);
    } finally {
      document.body.removeChild(mount);
    }
  }, [buildGeneratedDocument]);

  const handleDocumentAction = useCallback(async (
    doc: AdminDocumentItem,
    action: 'download' | 'print' | 'send',
    selectedClient: any | null
  ) => {
    if (action === 'send' && !docEmailAddress.trim()) {
      alert('يرجى إدخال عنوان البريد الإلكتروني');
      return;
    }

    const actionKey = `${action}-${doc.id}`;
    setActiveDocAction(actionKey);

    try {
      // For contract type, use the actual contract view from "عقودي" section
      if (doc.type === 'contract') {
        const contractObj = contracts.find(c => c.id === doc.id) || contracts.find(c => c.submission_id === doc.submissionId);
        if (!contractObj) {
          alert('لم يتم العثور على العقد');
          return;
        }

        // Set the selected contract to render it
        setSelectedContract(contractObj);

        // Wait for the contract to render in the DOM
        await new Promise<void>(resolve => {
          const checkRef = () => {
            if (contractContentRef.current) {
              resolve();
            } else {
              requestAnimationFrame(checkRef);
            }
          };
          requestAnimationFrame(checkRef);
        });
        // Extra delay for images/fonts to load
        await new Promise(r => setTimeout(r, 500));

        const el = contractContentRef.current;
        if (!el) {
          alert('تعذر تجهيز العقد');
          return;
        }

        const fileName = `عقد-${contractObj.file_number || contractObj.id}.pdf`;

        if (action === 'download') {
          const { downloadContractPdf } = await import('../../lib/generateContractPdf');
          await downloadContractPdf(el, fileName);
        } else if (action === 'print') {
          const { printContractPdf } = await import('../../lib/generateContractPdf');
          await printContractPdf(el);
        } else {
          const { generateContractPdf } = await import('../../lib/generateContractPdf');
          const { blob } = await generateContractPdf(el, fileName);
          const file = new File([blob], fileName, { type: 'application/pdf' });
          const uploaded = await uploadDocument(file);
          const sub = submissions.find(s => s.id === contractObj.submission_id);
          const clientName = selectedClient?.name || selectedClient?.full_name || 'العميل';
          const emailSubject = `عقد العميل - ${clientName}`;
          const emailBody = `مرفق لكم عقد العميل ${clientName}`;
          window.location.href = `mailto:${docEmailAddress.trim()}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(`${emailBody}\n\nرابط المستند:\n${uploaded.filePath}`)}`;
          setDocEmailDocId(null);
          setDocEmailTarget('');
          setDocEmailAddress('');
        }

        // Keep the contract view open so user can see it
        return;
      }

      // For non-contract types, use the generated document template
      await withTemporaryDocumentElement(doc, selectedClient, async (element, payload) => {
        if (action === 'download') {
          const { downloadContractPdf } = await import('../../lib/generateContractPdf');
          await downloadContractPdf(element, payload.fileName);
          return;
        }

        if (action === 'print') {
          const { printContractPdf } = await import('../../lib/generateContractPdf');
          await printContractPdf(element);
          return;
        }

        const { generateContractPdf } = await import('../../lib/generateContractPdf');
        const { blob } = await generateContractPdf(element, payload.fileName);
        const file = new File([blob], payload.fileName, { type: 'application/pdf' });
        const uploaded = await uploadDocument(file);

        window.location.href = `mailto:${docEmailAddress.trim()}?subject=${encodeURIComponent(payload.emailSubject)}&body=${encodeURIComponent(`${payload.emailBody}\n\nرابط المستند:\n${uploaded.filePath}`)}`;
      });

      if (action === 'send') {
        setDocEmailDocId(null);
        setDocEmailTarget('');
        setDocEmailAddress('');
      }
    } catch (err) {
      console.error('Document action failed:', err);
      alert(
        action === 'send'
          ? 'تعذر تجهيز المستند للإرسال، حاول مرة أخرى'
          : action === 'print'
            ? 'تعذر تجهيز المستند للطباعة، حاول مرة أخرى'
            : 'تعذر تحميل المستند، حاول مرة أخرى'
      );
    } finally {
      setActiveDocAction(null);
    }
  }, [docEmailAddress, withTemporaryDocumentElement, contracts, submissions]);

  const renderDocumentRequest = () => {
    const selectedClient = clientsWithActivity.find(c => c.id === docSelectedClient);
    
    // Find documents for selected client
    const clientContracts = contracts.filter(c => c.user_id === docSelectedClient);
    const clientInvoices = adminInvoices.filter(inv => inv.user_id === docSelectedClient);
    const clientSubmissions = submissions.filter(s => (s.userId || s.user_id) === docSelectedClient);

    const getDocuments = (): AdminDocumentItem[] => {
      switch (docType) {
        case 'contract':
          return clientContracts.map(c => ({
            id: c.id,
            submissionId: c.submission_id,
            label: `عقد - ${c.signed_at ? 'موقّع' : 'غير موقّع'}`,
            date: c.created_at,
            signed: !!c.signed_at,
            type: 'contract' as const,
          }));
        case 'invoice':
          return clientInvoices.map(inv => ({
            id: inv.id,
            submissionId: inv.submission_id,
            label: `فاتورة - ${inv.status === 'paid' ? 'مدفوعة' : 'معلقة'}`,
            date: inv.created_at,
            signed: false,
            type: 'invoice' as const,
          }));
        case 'receipt':
          return clientSubmissions.map(s => ({
            id: `receipt-${s.id}`,
            submissionId: s.id,
            label: `إفادة استلام - ${s.type === 'waive_request' ? 'إعفاء' : s.type === 'rescheduling_request' ? 'جدولة' : 'خدمة'}`,
            date: s.created_at,
            signed: false,
            type: 'receipt' as const,
          }));
        case 'authorization':
          return clientSubmissions.map(s => ({
            id: `authorization-${s.id}`,
            submissionId: s.id,
            label: `إقرار وتفويض - ${s.type === 'waive_request' ? 'إعفاء' : s.type === 'rescheduling_request' ? 'جدولة' : 'خدمة'}`,
            date: s.created_at,
            signed: false,
            type: 'authorization' as const,
          }));
        default: return [];
      }
    };

    const docs = docType ? getDocuments() : [];

    const handleDownloadDoc = (doc: AdminDocumentItem) => {
      handleDocumentAction(doc, 'download', selectedClient);
    };

    const handlePrintDoc = (doc: AdminDocumentItem) => {
      handleDocumentAction(doc, 'print', selectedClient);
    };

    const handleSendEmail = async (doc: AdminDocumentItem) => {
      await handleDocumentAction(doc, 'send', selectedClient);
    };

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className="p-3 sm:p-4 md:p-6">
          <h3 className="text-sm font-bold text-brand dark:text-gold mb-6 flex items-center gap-2">
            <FileCheck size={18} className="text-purple-600" />
            طلب مستند
          </h3>

          {/* Step 1: Select Client */}
          <div className="mb-5">
            <label className="block text-[12px] font-bold text-brand dark:text-white mb-2">الرجاء اختيار العميل</label>
            <select
              value={docSelectedClient}
              onChange={(e) => {
                setDocSelectedClient(e.target.value);
                setDocType('');
                setDocEmailDocId(null);
                setDocEmailTarget('');
                setDocEmailAddress('');
              }}
              className="w-full p-2.5 rounded-[12px] border border-gold/30 text-[13px] focus:border-gold focus:ring-1 focus:ring-gold/30 outline-none bg-white dark:bg-[#06010a] dark:text-white"
            >
              <option value="">-- اختر العميل --</option>
              {clientsWithActivity.map(c => (
                <option key={c.id} value={c.id}>{c.name || c.full_name || 'عميل'} - {c.national_id || c.phone || ''}</option>
              ))}
            </select>
          </div>

          {/* Step 2: Select Document Type */}
          {docSelectedClient && (
            <div className="mb-5 animate-in fade-in duration-300">
              <label className="block text-[12px] font-bold text-brand dark:text-white mb-2">نوع المستند</label>
              <select
                value={docType}
                onChange={(e) => {
                  setDocType(e.target.value as AdminDocumentKind | '');
                  setDocEmailDocId(null);
                  setDocEmailTarget('');
                  setDocEmailAddress('');
                  setGeneralInvAmount('');
                  setGeneralInvReason('');
                }}
                className="w-full p-2.5 rounded-[12px] border border-gold/30 text-[13px] focus:border-gold focus:ring-1 focus:ring-gold/30 outline-none bg-white dark:bg-[#06010a] dark:text-white"
              >
                <option value="">-- اختر نوع المستند --</option>
                <option value="receipt">إفادة باستلام الطلب</option>
                <option value="contract">عقد العميل</option>
                <option value="authorization">إقرار وتفويض العميل</option>
                <option value="invoice">فاتورة العميل</option>
                <option value="general_invoice">فاتورة عامة</option>
              </select>
            </div>
          )}

          {/* General invoice inputs */}
          {docSelectedClient && docType === 'general_invoice' && (
            <div className="mb-5 animate-in fade-in duration-300 space-y-3 p-4 bg-gold/5 rounded-2xl border border-gold/20">
              <div>
                <label className="block text-[12px] font-bold text-brand dark:text-white mb-2">المبلغ (ر.س)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={generalInvAmount}
                  onChange={(e) => setGeneralInvAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full p-2.5 rounded-[12px] border border-gold/30 text-[13px] focus:border-gold focus:ring-1 focus:ring-gold/30 outline-none bg-white dark:bg-[#06010a] dark:text-white"
                />
                {generalInvAmount && Number(generalInvAmount) > 0 && (
                  <p className="text-[11px] text-muted mt-1">القيمة: <span className="font-bold text-brand dark:text-gold">{formatAmount(Number(generalInvAmount))} ر.س</span></p>
                )}
              </div>
              <div>
                <label className="block text-[12px] font-bold text-brand dark:text-white mb-2">وذلك مقابل</label>
                <textarea
                  value={generalInvReason}
                  onChange={(e) => setGeneralInvReason(e.target.value)}
                  placeholder="اكتب سبب الفاتورة هنا..."
                  rows={3}
                  className="w-full p-2.5 rounded-[12px] border border-gold/30 text-[13px] focus:border-gold focus:ring-1 focus:ring-gold/30 outline-none bg-white dark:bg-[#06010a] dark:text-white resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 3: Documents List & Actions */}
          {docSelectedClient && docType && (
            <div className="animate-in fade-in duration-300 space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gold/10">
                <p className="text-xs text-muted mb-1">العميل: <span className="font-bold text-brand dark:text-white">{selectedClient?.name || selectedClient?.full_name}</span></p>
                <p className="text-xs text-muted">المستند: <span className="font-bold text-brand dark:text-white">
                  {docType === 'receipt' ? 'إفادة باستلام الطلب' : docType === 'contract' ? 'عقد العميل' : docType === 'authorization' ? 'إقرار وتفويض العميل' : 'فاتورة العميل'}
                </span></p>
                <p className="text-xs text-muted mt-1">عدد المستندات: <span className="font-bold text-brand dark:text-white">{docs.length}</span></p>
              </div>

              {docs.length === 0 ? (
                <div className="text-center py-6 text-sm text-muted">
                  <AlertCircle size={24} className="mx-auto mb-2 text-gold/50" />
                  لا يوجد مستندات من هذا النوع لهذا العميل
                </div>
              ) : (
                <div className="space-y-3">
                  {docs.map((doc) => {
                    const isDownloadLoading = activeDocAction === `download-${doc.id}`;
                    const isPrintLoading = activeDocAction === `print-${doc.id}`;
                    const isSendLoading = activeDocAction === `send-${doc.id}`;
                    const isEmailOpen = docEmailDocId === doc.id;

                    return (
                    <div key={doc.id} className="p-3 bg-white dark:bg-[#12031a] rounded-xl border border-gold/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-muted">{new Date(doc.date).toLocaleDateString('ar-SA')}</span>
                        <span className="text-[12px] font-bold text-brand dark:text-white">{doc.label}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => handleDownloadDoc(doc)}
                          disabled={!!activeDocAction}
                          className="flex items-center justify-center gap-1 p-2 rounded-lg bg-brand text-gold font-bold text-[10px] hover:bg-brand/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Download size={13} />
                          {isDownloadLoading ? 'جاري...' : 'تحميل'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePrintDoc(doc)}
                          disabled={!!activeDocAction}
                          className="flex items-center justify-center gap-1 p-2 rounded-lg bg-white dark:bg-[#06010a] text-brand dark:text-white font-bold text-[10px] border border-gold/30 hover:bg-gold/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Printer size={13} />
                          {isPrintLoading ? 'جاري...' : 'طباعة'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDocEmailDocId(isEmailOpen ? null : doc.id);
                            setDocEmailTarget('');
                            setDocEmailAddress('');
                          }}
                          disabled={!!activeDocAction}
                          className={`flex items-center justify-center gap-1 p-2 rounded-lg font-bold text-[10px] transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isEmailOpen ? 'bg-gold text-brand' : 'bg-white dark:bg-[#06010a] text-brand dark:text-white border border-gold/30 hover:bg-gold/5'}`}
                        >
                          <Mail size={13} />
                          {isSendLoading ? 'جاري...' : 'إرسال'}
                        </button>
                      </div>

                      {/* Email Options */}
                      {isEmailOpen && (
                        <div className="animate-in fade-in duration-300 space-y-3 p-3 bg-gold/5 rounded-xl border border-gold/20">
                          <div>
                            <label className="block text-[11px] font-bold text-brand dark:text-white mb-1.5">إرسال إلى</label>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => { setDocEmailTarget('admin'); setDocEmailAddress(authUser?.email || ''); }}
                                className={`flex-1 p-2 rounded-lg text-[10px] font-bold border transition-all ${docEmailTarget === 'admin' ? 'bg-brand text-gold border-brand' : 'bg-white dark:bg-[#06010a] text-brand dark:text-white border-gold/30'}`}
                              >
                                بريد الإدارة
                              </button>
                              <button
                                type="button"
                                onClick={() => { setDocEmailTarget('client'); setDocEmailAddress(selectedClient?.email || ''); }}
                                className={`flex-1 p-2 rounded-lg text-[10px] font-bold border transition-all ${docEmailTarget === 'client' ? 'bg-brand text-gold border-brand' : 'bg-white dark:bg-[#06010a] text-brand dark:text-white border-gold/30'}`}
                              >
                                بريد العميل
                              </button>
                            </div>
                          </div>
                          {docEmailTarget && (
                            <div className="animate-in fade-in duration-200">
                              <input
                                type="email"
                                value={docEmailAddress}
                                onChange={(e) => setDocEmailAddress(e.target.value)}
                                placeholder="example@email.com"
                                className="w-full p-2 rounded-lg border border-gold/30 text-[12px] focus:border-gold outline-none bg-white dark:bg-[#06010a] dark:text-white text-left"
                                dir="ltr"
                              />
                              <button
                                type="button"
                                onClick={() => handleSendEmail(doc)}
                                disabled={!!activeDocAction}
                                className="mt-2 w-full flex items-center justify-center gap-1.5 p-2 rounded-lg bg-gold text-brand font-bold text-[11px] hover:bg-gold/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Mail size={14} />
                                {isSendLoading ? 'جاري تجهيز الرابط...' : 'إرسال المستند'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )})}
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    );
  };

  const renderHome = () => (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h3 className="text-base sm:text-lg font-bold text-brand mb-4 sm:mb-6 flex items-center gap-2">
          <TrendingUp size={20} className="text-gold" />
          ملخص سريع
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <StatCard icon={<Clock className="text-blue-500" />} label="طلبات جديدة" value={stats.newRequests} color="blue" onClick={() => setStatPopup({ label: 'طلبات جديدة', items: getStatItems('pending') })} />
          <StatCard icon={<RefreshCw className="text-indigo-500" />} label="تحت الإجراء" value={stats.processing} color="indigo" onClick={() => setStatPopup({ label: 'تحت الإجراء', items: getStatItems('processing') })} />
          <StatCard icon={<FileClock className="text-amber-600" />} label="بانتظار التوقيع" value={stats.pendingSignature} color="amber" onClick={() => setStatPopup({ label: 'بانتظار التوقيع', items: getStatItems('pendingSignature') })} />
          <StatCard icon={<FileCheck className="text-emerald-600" />} label="عقود موقعة" value={stats.signedContracts} color="emerald" onClick={() => setStatPopup({ label: 'عقود موقعة', items: getStatItems('signedContracts') })} />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-5">
        <MenuCard 
          icon={<LayoutDashboard size={20} className="text-indigo-600" />} 
          label="الإحصائيات السريعة" 
          description="نظرة عامة على أداء النظام والطلبات"
          onClick={() => setActiveTab('stats')}
          color="indigo"
        />
        <MenuCard 
          icon={<Users size={20} className="text-brand" />} 
          label="بيانات العملاء" 
          description="إدارة ملفات العملاء والبيانات الشخصية"
          onClick={() => setActiveTab('clients')}
          color="brand"
        />
        <MenuCard 
          icon={<FileText size={20} className="text-blue-500" />} 
          label="طلبات الإعفاء" 
          description="مراجعة ومعالجة طلبات الإعفاء من الالتزامات"
          onClick={() => setActiveTab('waive_requests')}
          color="blue"
        />
        <MenuCard 
          icon={<RefreshCw size={20} className="text-indigo-500" />} 
          label="طلبات الجدولة" 
          description="إدارة طلبات إعادة جدولة المنتجات التمويلية"
          onClick={() => setActiveTab('rescheduling_requests')}
          color="indigo"
        />
        <MenuCard 
          icon={<Briefcase size={20} className="text-amber-500" />} 
          label="طلبات الخدمات" 
          description="مراجعة طلبات الخدمات والاستشارات العامة"
          onClick={() => setActiveTab('service_requests')}
          color="amber"
        />
        <MenuCard 
          icon={<PenTool size={20} className="text-brand" />} 
          label="عقود العملاء" 
          description="متابعة العقود الإلكترونية وحالة التوقيع"
          onClick={() => setActiveTab('contracts')}
          color="brand"
        />
        <MenuCard 
          icon={<CreditCard size={20} className="text-green-600" />} 
          label="فواتير العملاء" 
          description="إدارة ومتابعة فواتير العملاء وحالة السداد"
          onClick={() => setActiveTab('invoices')}
          color="green"
        />
        <MenuCard 
          icon={<FileCheck size={20} className="text-purple-600" />} 
          label="طلب مستند" 
          description="تحميل وطباعة وإرسال مستندات العملاء عبر البريد"
          onClick={() => setActiveTab('document_request')}
          color="purple"
        />
        <MenuCard 
          icon={<Star size={20} className="text-yellow-500" />} 
          label="إرسال تقييم" 
          description="إرسال تقييم ونجوم باسم عميل"
          onClick={() => setActiveTab('reviews')}
          color="yellow"
        />
        <MenuCard 
          icon={<Bell size={20} className="text-gold" />} 
          label="التنبيهات" 
          description="سجل النشاط والتنبيهات الواردة"
          onClick={() => setActiveTab('notifications')}
          color="gold"
          badge={notifications.filter(n => !n.is_read).length}
        />
      </div>
    </div>
  );

  const renderStats = () => (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
        <StatCard icon={<Users className="text-indigo-600" />} label="إجمالي العملاء" value={stats.totalUsers} color="indigo" />
        <StatCard icon={<FileText className="text-brand" />} label="إجمالي الطلبات" value={stats.totalRequests} color="brand" />
        <StatCard icon={<Clock className="text-blue-500" />} label="طلبات جديدة" value={stats.newRequests} color="blue" />
        <StatCard icon={<RefreshCw className="text-indigo-500" />} label="تحت الإجراء" value={stats.processing} color="indigo" />
        <StatCard icon={<TrendingUp className="text-amber-500" />} label="قيد التنفيذ" value={stats.executing} color="amber" />
        <StatCard icon={<CheckCircle className="text-emerald-500" />} label="مكتملة" value={stats.completed} color="emerald" />
        <StatCard icon={<AlertCircle className="text-rose-500" />} label="مرفوضة" value={stats.rejected} color="rose" />
        <StatCard icon={<PenTool className="text-brand" />} label="العقود المرسلة" value={stats.contractsSent} color="brand" />
        <StatCard icon={<FileClock className="text-amber-600" />} label="بانتظار التوقيع" value={stats.pendingSignature} color="amber" />
        <StatCard icon={<FileCheck className="text-emerald-600" />} label="عقود موقعة" value={stats.signedContracts} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-3 sm:p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-brand flex items-center gap-2">
              <Bell size={18} className="text-gold" />
              أحدث التنبيهات
            </h3>
            <button onClick={() => setActiveTab('notifications')} className="text-xs text-gold hover:underline">عرض الكل</button>
          </div>
          <div className="space-y-4">
            {notifications.slice(0, 5).map(n => (
              <div key={n.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  n.type === 'status_update' ? 'bg-blue-100 text-blue-600' : 
                  n.type === 'contract_signature' ? 'bg-emerald-100 text-emerald-600' : 'bg-gold/10 text-gold'
                }`}>
                  {n.type === 'status_update' ? <RefreshCw size={14} /> : 
                   n.type === 'contract_signature' ? <PenTool size={14} /> : <Bell size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-brand dark:text-gold">{n.user_name}</span>
                    <span className="text-[9px] text-muted">{new Date(n.created_at).toLocaleString('ar-SA')}</span>
                  </div>
                  <p className="text-xs text-muted truncate">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-3 sm:p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-brand flex items-center gap-2">
              <TrendingUp size={18} className="text-gold" />
              الطلبات الأخيرة
            </h3>
            <button onClick={() => setActiveTab('waive_requests')} className="text-xs text-gold hover:underline">عرض الكل</button>
          </div>
          <div className="space-y-4">
            {submissions.slice(0, 5).map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand text-gold flex items-center justify-center font-bold text-xs">
                    {(s.user_name || '؟')[0]}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-brand dark:text-white">{s.user_name}</div>
                    <div className="text-[10px] text-muted">{s.type === 'waive_request' ? 'طلب إعفاء' : 'إعادة جدولة'}</div>
                  </div>
                </div>
                <span className={`text-[9px] font-bold px-2 py-1 rounded-full border ${getStatusColor(s.status)}`}>
                  {getStatusLabel(s.status)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderClients = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="overflow-hidden">
      <div className="p-4 border-b border-gold/10 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/50 dark:bg-white/5">
        <div className="relative w-full md:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input 
            type="text" 
            placeholder="بحث باسم العميل، رقم الملف، أو الهوية..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-9 pl-3 py-2 bg-white dark:bg-[#06010a] border border-gold/20 rounded-xl text-xs sm:text-sm focus:border-gold outline-none shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Filter size={14} />
            تصفية
          </Button>
          <Button variant="outline" className="gap-2">
            <Download size={14} />
            تصدير
          </Button>
        </div>
      </div>
      {/* Table - scrollable on all screens */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-right border-collapse min-w-[800px]">
          <thead>
            <tr className="text-[10px] sm:text-xs font-bold text-muted bg-gray-50 dark:bg-black/20 border-b border-gold/10">
              <th className="p-2 sm:p-3 whitespace-nowrap">#</th>
              <th className="p-2 sm:p-3 whitespace-nowrap">العميل</th>
              <th className="p-2 sm:p-3 whitespace-nowrap">رقم الملف</th>
              <th className="p-2 sm:p-3 whitespace-nowrap">رقم الهوية</th>
              <th className="p-2 sm:p-3 whitespace-nowrap">الجوال</th>
              <th className="p-2 sm:p-3 whitespace-nowrap">البريد</th>
              <th className="p-2 sm:p-3 whitespace-nowrap">المنطقة</th>
              <th className="p-2 sm:p-3 whitespace-nowrap">المدينة</th>
              <th className="p-2 sm:p-3 whitespace-nowrap">البنك</th>
              <th className="p-2 sm:p-3 whitespace-nowrap">الحالة الوظيفية</th>
              <th className="p-2 sm:p-3 whitespace-nowrap">العمر</th>
              <th className="p-2 sm:p-3 whitespace-nowrap">تاريخ التسجيل</th>
              <th className="p-2 sm:p-3 whitespace-nowrap">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gold/5">
            {filteredUsers.map((u, idx) => (
              <tr key={u.id} className="hover:bg-gold/5 transition-colors group">
                <td className="p-2 sm:p-3 text-[10px] sm:text-xs text-muted">{idx + 1}</td>
                <td className="p-2 sm:p-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-brand text-gold flex items-center justify-center font-bold text-[10px] sm:text-xs shadow-sm">
                      {(u.name || '؟')[0]}
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-brand dark:text-white group-hover:text-gold transition-colors">{u.name || '---'}</span>
                  </div>
                </td>
                <td className="p-2 sm:p-3 text-[10px] sm:text-xs font-mono text-muted whitespace-nowrap">{u.file_number || '---'}</td>
                <td className="p-2 sm:p-3 text-[10px] sm:text-xs text-brand dark:text-gray-300 whitespace-nowrap">{u.national_id || '---'}</td>
                <td className="p-2 sm:p-3 text-[10px] sm:text-xs text-brand dark:text-gray-300 whitespace-nowrap" dir="ltr">{u.phone || '---'}</td>
                <td className="p-2 sm:p-3 text-[10px] sm:text-xs text-muted whitespace-nowrap">{u.email || '---'}</td>
                <td className="p-2 sm:p-3 text-[10px] sm:text-xs text-muted whitespace-nowrap">{u.region || '---'}</td>
                <td className="p-2 sm:p-3 text-[10px] sm:text-xs text-muted whitespace-nowrap">{u.city || '---'}</td>
                <td className="p-2 sm:p-3 text-[10px] sm:text-xs text-muted whitespace-nowrap">{u.bank || '---'}</td>
                <td className="p-2 sm:p-3 text-[10px] sm:text-xs text-muted whitespace-nowrap">{u.job_status || '---'}</td>
                <td className="p-2 sm:p-3 text-[10px] sm:text-xs text-muted whitespace-nowrap">{u.age || '---'}</td>
                <td className="p-2 sm:p-3 text-[10px] sm:text-xs text-muted whitespace-nowrap">{new Date(u.created_at || '').toLocaleDateString('ar-SA')}</td>
                <td className="p-2 sm:p-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setSelectedUser(u)} className="p-1.5 hover:bg-gold/10 text-gold rounded-lg transition-colors" title="عرض الملف"><Eye size={14} /></button>
                    <button 
                      onClick={() => {
                        const sub = submissions.find(s => s.userId === u.id);
                        if (sub) { setSelectedSubmission(sub); fetchSubmissionHistory(sub.id); } else { alert('لا يوجد طلبات نشطة لهذا العميل'); }
                      }}
                      className="p-1.5 hover:bg-gold/10 text-gold rounded-lg transition-colors" title="فتح الطلب"
                    ><ExternalLink size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr><td colSpan={13} className="p-8 text-center text-muted text-sm">لا يوجد عملاء مسجلين</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
    </div>
  );

  const renderRequests = (types: string | string[]) => {
    const typeArray = Array.isArray(types) ? types : [types];
    const requests = filteredSubmissions.filter(s => typeArray.includes(s.type));
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className="overflow-hidden">
        <div className="p-4 border-b border-gold/10 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/50 dark:bg-white/5">
          <div className="relative w-full md:w-96">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input 
              type="text" 
              placeholder="بحث بالاسم أو رقم الطلب..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-9 pl-3 py-2 bg-white dark:bg-[#06010a] border border-gold/20 rounded-xl text-xs sm:text-sm focus:border-gold outline-none shadow-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white dark:bg-[#06010a] border border-gold/20 rounded-xl px-3 py-2 text-xs sm:text-sm outline-none focus:border-gold shadow-sm"
            >
              <option value="all">كل الحالات</option>
              <option value="pending">جديد</option>
              <option value="processing">تحت الإجراء</option>
              <option value="executing">قيد التنفيذ</option>
              <option value="completed">مكتمل</option>
              <option value="rejected">مرفوض</option>
            </select>
          </div>
        </div>
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto custom-scrollbar">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="text-xs font-bold text-muted bg-gray-50 dark:bg-black/20 border-b border-gold/10">
                <th className="p-4 whitespace-nowrap">العميل</th>
                <th className="p-4 whitespace-nowrap">رقم الملف</th>
                <th className="p-4 whitespace-nowrap">الجهة التمويلية</th>
                <th className="p-4 whitespace-nowrap">مبلغ المديونية</th>
                <th className="p-4 whitespace-nowrap">تاريخ الطلب</th>
                <th className="p-4 whitespace-nowrap">الحالة</th>
                <th className="p-4 whitespace-nowrap">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/5">
              {requests.map(s => (
                <tr key={s.id} className="hover:bg-gold/5 transition-colors group">
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand text-gold flex items-center justify-center font-bold text-xs">{(s.user_name || '؟')[0]}</div>
                      <div className="text-sm font-bold text-brand dark:text-white group-hover:text-gold transition-colors">{s.user_name}</div>
                    </div>
                  </td>
                  <td className="p-4 text-xs font-mono text-muted whitespace-nowrap">{s.id}</td>
                  <td className="p-4 text-xs text-brand dark:text-gray-300 whitespace-nowrap">{s.data?.bank || '---'}</td>
                  <td className="p-4 text-xs font-bold text-brand dark:text-white whitespace-nowrap">{s.data?.totalAmount ? `${formatAmount(s.data.totalAmount)} ر.س` : '---'}</td>
                  <td className="p-4 text-xs text-muted whitespace-nowrap">{new Date(s.timestamp).toLocaleDateString('ar-SA')}</td>
                  <td className="p-4">
                    <select 
                      value={s.status}
                      onChange={(e) => updateStatus(s.id, e.target.value)}
                      className={`text-[10px] font-bold px-3 py-1.5 rounded-full border outline-none shadow-sm transition-all ${getStatusColor(s.status)}`}
                    >
                      <option value="pending">جديد</option>
                      <option value="processing">تحت الإجراء</option>
                      <option value="executing">قيد التنفيذ</option>
                      <option value="completed">مكتمل</option>
                      <option value="rejected">مرفوض</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <button onClick={() => { setSelectedSubmission(s); fetchSubmissionHistory(s.id); }} className="p-2 hover:bg-gold/10 text-gold rounded-lg transition-colors"><Eye size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gold/5">
          {requests.map(s => (
            <div key={s.id} className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-brand text-gold flex items-center justify-center font-bold text-[10px]">{(s.user_name || '؟')[0]}</div>
                  <div className="text-xs font-bold text-brand dark:text-white">{s.user_name}</div>
                </div>
                <div className="flex items-center gap-1">
                  <select 
                    value={s.status}
                    onChange={(e) => updateStatus(s.id, e.target.value)}
                    className={`text-[9px] font-bold px-2 py-1 rounded-full border outline-none ${getStatusColor(s.status)}`}
                  >
                    <option value="pending">جديد</option>
                    <option value="processing">تحت الإجراء</option>
                    <option value="executing">قيد التنفيذ</option>
                    <option value="completed">مكتمل</option>
                    <option value="rejected">مرفوض</option>
                  </select>
                  <button onClick={() => { setSelectedSubmission(s); fetchSubmissionHistory(s.id); }} className="p-1.5 hover:bg-gold/10 text-gold rounded-lg"><Eye size={14} /></button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] pr-9">
                <div><span className="text-muted">رقم الملف:</span> <span className="font-mono text-muted">{s.id}</span></div>
                <div><span className="text-muted">الجهة:</span> <span className="text-brand dark:text-gray-300">{s.data?.bank || '---'}</span></div>
                <div><span className="text-muted">المبلغ:</span> <span className="font-bold text-brand dark:text-white">{s.data?.totalAmount ? `${formatAmount(s.data.totalAmount)} ر.س` : '---'}</span></div>
                <div><span className="text-muted">التاريخ:</span> <span className="text-muted">{new Date(s.timestamp).toLocaleDateString('ar-SA')}</span></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      </div>
    );
  };

  const filteredInvoices = useMemo(() => {
    return adminInvoices.filter(inv => {
      const search = searchTerm.toLowerCase();
      return (inv.user_name || '').toLowerCase().includes(search) || 
             (inv.id || '').toLowerCase().includes(search) ||
             (inv.submission_id || '').toLowerCase().includes(search);
    });
  }, [adminInvoices, searchTerm]);

  const renderInvoices = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="overflow-hidden">
      <div className="p-4 border-b border-gold/10 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/50 dark:bg-white/5">
        <div className="relative w-full md:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input 
            type="text" 
            placeholder="بحث باسم العميل أو رقم الفاتورة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-9 pl-3 py-2 bg-white dark:bg-[#06010a] border border-gold/20 rounded-xl text-xs sm:text-sm focus:border-gold outline-none shadow-sm"
          />
        </div>
      </div>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto custom-scrollbar">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="text-xs font-bold text-muted bg-gray-50 dark:bg-black/20 border-b border-gold/10">
              <th className="p-4 whitespace-nowrap">العميل</th>
              <th className="p-4 whitespace-nowrap">رقم الفاتورة</th>
              <th className="p-4 whitespace-nowrap">نوع الخدمة</th>
              <th className="p-4 whitespace-nowrap">المبلغ</th>
              <th className="p-4 whitespace-nowrap">تاريخ الإصدار</th>
              <th className="p-4 whitespace-nowrap">حالة السداد</th>
              <th className="p-4 whitespace-nowrap">تاريخ السداد</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gold/5">
            {filteredInvoices.map(inv => (
              <tr key={inv.id} className="hover:bg-gold/5 transition-colors group">
                <td className="p-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand text-gold flex items-center justify-center font-bold text-xs">{(inv.user_name || '؟')[0]}</div>
                    <div className="text-sm font-bold text-brand dark:text-white group-hover:text-gold transition-colors">{inv.user_name || '---'}</div>
                  </div>
                </td>
                <td className="p-4 text-xs font-mono text-muted whitespace-nowrap">{inv.id}</td>
                <td className="p-4 text-xs text-brand dark:text-gray-300 whitespace-nowrap">{inv.type === 'rescheduling_request' ? 'إعادة جدولة' : inv.type === 'seized_amounts_request' ? 'مبالغ محجوزة' : 'إعفاء'}</td>
                <td className="p-4 text-xs font-bold text-brand dark:text-white whitespace-nowrap">{formatAmount(inv.amount)} ر.س</td>
                <td className="p-4 text-xs text-muted whitespace-nowrap">{new Date(inv.created_at).toLocaleDateString('ar-SA')}</td>
                <td className="p-4">
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full border whitespace-nowrap ${inv.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                    {inv.status === 'paid' ? 'مسددة' : 'بانتظار السداد'}
                  </span>
                </td>
                <td className="p-4 text-xs text-muted whitespace-nowrap">{inv.paid_at ? new Date(inv.paid_at).toLocaleDateString('ar-SA') : '---'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-gold/5">
        {filteredInvoices.map(inv => (
          <div key={inv.id} className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-brand text-gold flex items-center justify-center font-bold text-[10px]">{(inv.user_name || '؟')[0]}</div>
                <div className="text-xs font-bold text-brand dark:text-white">{inv.user_name || '---'}</div>
              </div>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${inv.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                {inv.status === 'paid' ? 'مسددة' : 'بانتظار السداد'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] pr-9">
              <div><span className="text-muted">رقم الفاتورة:</span> <span className="font-mono text-muted">{inv.id}</span></div>
              <div><span className="text-muted">نوع الخدمة:</span> <span className="text-brand dark:text-gray-300">{inv.type === 'rescheduling_request' ? 'إعادة جدولة' : 'إعفاء'}</span></div>
              <div><span className="text-muted">المبلغ:</span> <span className="font-bold text-brand dark:text-white">{formatAmount(inv.amount)} ر.س</span></div>
              <div><span className="text-muted">التاريخ:</span> <span className="text-muted">{new Date(inv.created_at).toLocaleDateString('ar-SA')}</span></div>
            </div>
          </div>
        ))}
      </div>
    </Card>
    </div>
  );

  const renderContracts = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="overflow-hidden">
      <div className="p-4 border-b border-gold/10 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/50 dark:bg-white/5">
        <div className="relative w-full md:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input 
            type="text" 
            placeholder="بحث باسم العميل أو رقم الملف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-9 pl-3 py-2 bg-white dark:bg-[#06010a] border border-gold/20 rounded-xl text-xs sm:text-sm focus:border-gold outline-none shadow-sm"
          />
        </div>
      </div>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto custom-scrollbar">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="text-xs font-bold text-muted bg-gray-50 dark:bg-black/20 border-b border-gold/10">
              <th className="p-4 whitespace-nowrap">العميل</th>
              <th className="p-4 whitespace-nowrap">رقم الملف</th>
              <th className="p-4 whitespace-nowrap">نوع العقد</th>
              <th className="p-4 whitespace-nowrap">تاريخ الإرسال</th>
              <th className="p-4 whitespace-nowrap">حالة العقد</th>
              <th className="p-4 whitespace-nowrap">تاريخ التوقيع</th>
              <th className="p-4 whitespace-nowrap">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gold/5">
            {filteredContracts.map(c => (
              <tr key={c.id} className="hover:bg-gold/5 transition-colors group">
                <td className="p-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand text-gold flex items-center justify-center font-bold text-xs">{(c.user_name || '؟')[0]}</div>
                    <div className="text-sm font-bold text-brand dark:text-white group-hover:text-gold transition-colors">{c.user_name}</div>
                  </div>
                </td>
                <td className="p-4 text-xs font-mono text-muted whitespace-nowrap">{c.file_number}</td>
                <td className="p-4 text-xs text-brand dark:text-gray-300 whitespace-nowrap">{c.type === 'waive_request' ? 'عقد إعفاء' : 'عقد جدولة'}</td>
                <td className="p-4 text-xs text-muted whitespace-nowrap">{new Date(c.created_at).toLocaleDateString('ar-SA')}</td>
                <td className="p-4">
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full border whitespace-nowrap ${c.signed_at ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                    {c.signed_at ? 'تم التوقيع' : 'في انتظار التوقيع'}
                  </span>
                </td>
                <td className="p-4 text-xs text-muted whitespace-nowrap">{c.signed_at ? new Date(c.signed_at).toLocaleString('ar-SA') : '---'}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSelectedContract(c)} className="p-2 hover:bg-gold/10 text-gold rounded-lg transition-colors" title="عرض العقد"><Eye size={16} /></button>
                    <button onClick={() => { setSelectedContract(c); setAutoPrint(true); }} className="p-2 hover:bg-gold/10 text-gold rounded-lg transition-colors" title="طباعة العقد"><Printer size={16} /></button>
                    <button onClick={() => { setSelectedContract(c); }} className="p-2 hover:bg-gold/10 text-gold rounded-lg transition-colors" title="تحميل العقد"><Download size={16} /></button>
                    {!c.signed_at && (
                      <button onClick={() => sendContract(c.user_id, c.submission_id)} className="p-2 hover:bg-gold/10 text-gold rounded-lg transition-colors" title="إعادة إرسال"><RefreshCw size={16} /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-gold/5">
        {filteredContracts.map(c => (
          <div key={c.id} className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-brand text-gold flex items-center justify-center font-bold text-[10px]">{(c.user_name || '؟')[0]}</div>
                <div className="text-xs font-bold text-brand dark:text-white">{c.user_name}</div>
              </div>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${c.signed_at ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                {c.signed_at ? 'تم التوقيع' : 'في انتظار التوقيع'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] pr-9">
              <div><span className="text-muted">رقم الملف:</span> <span className="font-mono text-muted">{c.file_number}</span></div>
              <div><span className="text-muted">نوع العقد:</span> <span className="text-brand dark:text-gray-300">{c.type === 'waive_request' ? 'عقد إعفاء' : 'عقد جدولة'}</span></div>
              <div><span className="text-muted">تاريخ الإرسال:</span> <span className="text-muted">{new Date(c.created_at).toLocaleDateString('ar-SA')}</span></div>
              <div><span className="text-muted">تاريخ التوقيع:</span> <span className="text-muted">{c.signed_at ? new Date(c.signed_at).toLocaleString('ar-SA') : '---'}</span></div>
            </div>
            <div className="flex items-center gap-1 pr-9">
              <button onClick={() => setSelectedContract(c)} className="p-1.5 hover:bg-gold/10 text-gold rounded-lg" title="عرض العقد"><Eye size={14} /></button>
              <button onClick={() => { setSelectedContract(c); }} className="p-1.5 hover:bg-gold/10 text-gold rounded-lg" title="تحميل العقد"><Download size={14} /></button>
              <button onClick={() => { setSelectedContract(c); setAutoPrint(true); }} className="p-1.5 hover:bg-gold/10 text-gold rounded-lg" title="طباعة العقد"><Printer size={14} /></button>
              {!c.signed_at && (
                <button onClick={() => sendContract(c.user_id, c.submission_id)} className="p-1.5 hover:bg-gold/10 text-gold rounded-lg" title="إعادة إرسال"><RefreshCw size={14} /></button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-8 gap-3">
        <h3 className="font-bold text-brand text-sm sm:text-lg flex items-center gap-2">
          <Bell size={20} className="text-gold" />
          سجل التنبيهات والنشاط
        </h3>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input 
              type="text" 
              placeholder="بحث في التنبيهات..."
              className="w-full pr-10 pl-4 py-2 bg-gray-50 dark:bg-white/5 border border-gold/10 rounded-xl text-xs outline-none focus:border-gold"
            />
          </div>
        </div>
      </div>
      <div className="space-y-3 sm:space-y-4">
        {notifications.map(n => (
          <div key={n.id} className="flex items-start gap-2 sm:gap-4 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl md:rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 hover:border-gold/30 transition-all group">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
              n.type === 'status_update' ? 'bg-blue-100 text-blue-600' : 
              n.type === 'contract_signature' ? 'bg-rose-100 text-rose-600 border border-rose-200' : 'bg-gold/10 text-gold'
            }`}>
              {n.type === 'status_update' ? <RefreshCw size={16} /> : 
               n.type === 'contract_signature' ? <PenTool size={16} /> : <Bell size={16} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 sm:mb-2 gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-brand dark:text-gold">{n.user_name}</span>
                  <span className="hidden sm:inline w-1 h-1 rounded-full bg-gray-300"></span>
                  <span className="text-[9px] sm:text-[10px] text-muted">{n.title}</span>
                </div>
                <span className="text-[9px] sm:text-[10px] text-muted flex items-center gap-1">
                  <Calendar size={10} />
                  {new Date(n.created_at).toLocaleString('ar-SA')}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-muted leading-relaxed">{n.message}</p>
            </div>
            <button className="p-1.5 sm:p-2 opacity-0 group-hover:opacity-100 text-muted hover:text-rose-500 transition-all shrink-0">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </Card>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-[#F5F4FA] dark:bg-[#06010a] flex flex-col font-['Tajawal'] overflow-hidden" dir="rtl">
      {/* Chat */}
      <ChatPage 
        isOpen={isChatOpen} 
        onClose={() => { setIsChatOpen(false); setChatTargetUser(null); }} 
        targetUserId={chatTargetUser?.id} 
        targetUserName={chatTargetUser?.name} 
      />
      {/* Header */}
      <header className="bg-brand text-white p-2 sm:p-3 md:p-5 flex items-center justify-between sticky top-0 z-[102] shadow-xl print-hidden">
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-gold border border-white/10"
          >
            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl md:rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-gold shadow-2xl">
            <LayoutDashboard size={20} className="md:w-6 md:h-6" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base md:text-xl font-black tracking-tight">لوحة تحكم الإدارة</h1>
            <p className="hidden md:block text-[10px] md:text-xs text-gold/80 font-medium">إدارة العملاء والطلبات والعقود والتنبيهات</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsChatOpen(true)}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all text-gold border border-white/10 relative"
            title="المحادثات الفورية"
          >
            <MessageCircle size={20} />
            {unreadChatCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                {unreadChatCount > 99 ? '99+' : unreadChatCount}
              </span>
            )}
          </button>
          <button 
            onClick={fetchAllData}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all text-gold border border-white/10"
            title="تحديث البيانات"
          >
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-rose-500/20 flex items-center justify-center transition-all text-white border border-white/10">
            <X size={24} />
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] md:hidden print-hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar Navigation */}
        <aside className={`
          fixed md:relative inset-y-0 right-0 z-[101] w-72 bg-white dark:bg-[#12031a] border-l border-gold/10 p-4 flex flex-col gap-2 overflow-y-auto custom-scrollbar transition-transform duration-300 ease-in-out print-hidden
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
          md:flex
        `}>
          <NavButton active={activeTab === 'home'} onClick={() => { setActiveTab('home'); setIsSidebarOpen(false); }} icon={<LayoutDashboard size={18} />} label="الرئيسية" />
          <div className="mt-4 mb-2 px-4 text-[10px] font-bold text-muted uppercase tracking-widest">الأقسام</div>
          <NavButton active={activeTab === 'stats'} onClick={() => { setActiveTab('stats'); setIsSidebarOpen(false); }} icon={<TrendingUp size={18} />} label="الإحصائيات السريعة" />
          <NavButton active={activeTab === 'clients'} onClick={() => { setActiveTab('clients'); setIsSidebarOpen(false); }} icon={<Users size={18} />} label="بيانات العملاء" />
          <div className="mt-4 mb-2 px-4 text-[10px] font-bold text-muted uppercase tracking-widest">إدارة الطلبات</div>
          <NavButton active={activeTab === 'waive_requests'} onClick={() => { setActiveTab('waive_requests'); setIsSidebarOpen(false); }} icon={<FileText size={18} />} label="طلبات الإعفاء" />
          <NavButton active={activeTab === 'rescheduling_requests'} onClick={() => { setActiveTab('rescheduling_requests'); setIsSidebarOpen(false); }} icon={<RefreshCw size={18} />} label="طلبات الجدولة" />
          <NavButton active={activeTab === 'service_requests'} onClick={() => { setActiveTab('service_requests'); setIsSidebarOpen(false); }} icon={<Briefcase size={18} />} label="طلبات الخدمات" />
          <div className="mt-4 mb-2 px-4 text-[10px] font-bold text-muted uppercase tracking-widest">المتابعة</div>
          <NavButton active={activeTab === 'contracts'} onClick={() => { setActiveTab('contracts'); setIsSidebarOpen(false); }} icon={<PenTool size={18} />} label="عقود العملاء" />
          <NavButton active={activeTab === 'invoices'} onClick={() => { setActiveTab('invoices'); setIsSidebarOpen(false); }} icon={<CreditCard size={18} />} label="فواتير العملاء" />
          <NavButton active={activeTab === 'payments'} onClick={() => { setActiveTab('payments'); setIsSidebarOpen(false); }} icon={<CreditCard size={18} />} label="سداد المدفوعات" />
          <NavButton active={activeTab === 'notifications'} onClick={() => { setActiveTab('notifications'); setIsSidebarOpen(false); }} icon={<Bell size={18} />} label="التنبيهات" badge={notifications.filter(n => !n.is_read).length} />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-6 custom-scrollbar bg-[#F5F4FA] dark:bg-[#06010a] print:p-0">
          <div className="w-full space-y-6 sm:space-y-8">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-96 gap-4">
                <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin"></div>
                <p className="text-sm text-muted animate-pulse">جاري تحميل البيانات...</p>
              </div>
            ) : (
              renderHome()
            )}
          </div>
        </main>

        {/* Section Modal */}
        <AnimatePresence>
          {activeTab !== 'home' && (
            <div className="fixed inset-0 z-[105] flex items-start sm:items-center justify-center p-0 sm:p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-brand/40 backdrop-blur-md" 
                onClick={() => setActiveTab('home')} 
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full sm:w-[95%] max-w-7xl h-screen sm:h-auto sm:max-h-[92vh] bg-[#F5F4FA] dark:bg-[#06010a] rounded-none sm:rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
              >
                {/* Modal Header - Fixed/Sticky */}
                <div className="sticky top-0 z-10 p-2 sm:p-3 md:p-5 border-b border-gold/10 flex items-center justify-between bg-brand text-white shrink-0">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg bg-white/10 flex items-center justify-center text-gold border border-white/10">
                      {getTabIcon(activeTab)}
                    </div>
                    <h2 className="text-xs sm:text-sm md:text-lg font-bold">{getTabTitle(activeTab)}</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setActiveTab('home')} className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg bg-white/10 text-white text-[9px] sm:text-[10px] md:text-xs font-bold hover:bg-white/20 transition-all border border-white/10">
                      <X size={14} />
                      <span className="hidden sm:inline">العودة للوحة التحكم</span>
                      <span className="sm:hidden">رجوع</span>
                    </button>
                  </div>
                </div>
                
                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-2 sm:p-6 custom-scrollbar">
                  {activeTab === 'stats' && renderStats()}
                  {activeTab === 'clients' && renderClients()}
                  {activeTab === 'waive_requests' && renderRequests('waive_request')}
                  {activeTab === 'rescheduling_requests' && renderRequests(['rescheduling_request', 'scheduling_request'])}
                  {activeTab === 'service_requests' && renderRequests('service_request')}
                  {activeTab === 'contracts' && renderContracts()}
                  {activeTab === 'invoices' && renderInvoices()}
                  {activeTab === 'payments' && <AdminPaymentRequests />}
                  {activeTab === 'notifications' && renderNotifications()}
                  {activeTab === 'document_request' && renderDocumentRequest()}
                  {activeTab === 'reviews' && <AdminReviewSection />}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Request Details Modal */}
      <AnimatePresence>
        {selectedSubmission && (
          <div className="fixed inset-0 z-[110] flex items-start sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brand/40 backdrop-blur-md" 
              onClick={() => setSelectedSubmission(null)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full sm:w-[95%] max-w-6xl max-h-screen sm:max-h-[92vh] bg-white dark:bg-[#12031a] rounded-none sm:rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-3 sm:p-5 border-b border-gold/10 flex items-center justify-between bg-brand text-white">
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/10 flex items-center justify-center text-gold border border-white/10">
                    <FileText size={16} />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-lg font-bold">تفاصيل الطلب: {selectedSubmission.id}</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[7px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${getStatusColor(selectedSubmission.status)}`}>
                        {getStatusLabel(selectedSubmission.status)}
                      </span>
                      <span className="text-[7px] sm:text-[9px] text-gold/80">
                        {selectedSubmission.type === 'waive_request' ? 'طلب إعفاء' : 
                         selectedSubmission.type === 'rescheduling_request' ? 'إعادة جدولة' : 
                         selectedSubmission.type === 'service_request' ? 'طلب خدمة' : 'طلب'}
                      </span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedSubmission(null)} className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                  <X size={14} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-6 custom-scrollbar" dir="rtl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                  {/* Left Column: Client & Request Info */}
                  <div className="lg:col-span-2 space-y-8">
                    {/* Client Info Card */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-brand dark:text-gold flex items-center gap-2">
                        <Users size={18} />
                        بيانات العميل
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoItem icon={<Users size={14} />} label="الاسم الكامل" value={selectedSubmission.user_name} />
                        <InfoItem icon={<Mail size={14} />} label="البريد الإلكتروني" value={selectedSubmission.user_email} />
                        <InfoItem icon={<Phone size={14} />} label="رقم الجوال" value={selectedSubmission.data?.mobile} isLtr />
                        <InfoItem icon={<IdCard size={14} />} label="رقم الهوية" value={selectedSubmission.data?.nationalId} />
                        <InfoItem icon={<MapPin size={14} />} label="المنطقة / المدينة" value={`${selectedSubmission.data?.region} - ${selectedSubmission.data?.city}`} />
                        <InfoItem icon={<Briefcase size={14} />} label="الحالة الوظيفية" value={selectedSubmission.data?.jobStatus} />
                      </div>
                    </div>

                    {/* Financial Info Card */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-brand dark:text-gold flex items-center gap-2">
                        <CreditCard size={18} />
                        التفاصيل المالية
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoItem icon={<Briefcase size={14} />} label="الجهة التمويلية" value={selectedSubmission.data?.bank} />
                        <InfoItem icon={<TrendingUp size={14} />} label="إجمالي الالتزامات" value={`${formatAmount(selectedSubmission.data?.totalAmount)} ر.س`} isBold />
                        <InfoItem 
                          icon={<Calendar size={14} />} 
                          label="تاريخ التقديم" 
                          value={selectedSubmission.timestamp ? new Date(selectedSubmission.timestamp).toLocaleString('ar-SA') : '---'} 
                        />
                        <InfoItem icon={<Hash size={14} />} label="رقم الطلب" value={selectedSubmission.id} />
                      </div>
                    </div>

                    {/* Products Table */}
                    {selectedSubmission.data?.products && Array.isArray(selectedSubmission.data.products) && (
                      <div className="space-y-4">
                        <h3 className="text-sm font-bold text-brand dark:text-gold">المنتجات والالتزامات</h3>
                        <div className="bg-gray-50 dark:bg-white/5 rounded-2xl border border-gold/10 overflow-hidden">
                          <table className="w-full text-right text-xs">
                            <thead>
                              <tr className="bg-gold/5 text-muted font-bold">
                                <th className="p-3">نوع المنتج</th>
                                <th className="p-3">رقم الحساب</th>
                                <th className="p-3">المبلغ</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gold/5">
                              {selectedSubmission.data.products.map((p: any, i: number) => (
                                <tr key={i}>
                                  <td className="p-3 text-brand dark:text-white">{p.type}</td>
                                  <td className="p-3 text-muted font-mono">{p.accountNumber || '---'}</td>
                                  <td className="p-3 font-bold text-brand dark:text-white">{formatAmount(p.amount)} ر.س</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className="bg-brand/5 dark:bg-gold/10 border-t-2 border-gold/20">
                                <td colSpan={2} className="p-3 text-sm font-black text-brand dark:text-gold text-right">المبلغ الإجمالي</td>
                                <td className="p-3 text-sm font-black text-brand dark:text-gold">
                                  {formatAmount(selectedSubmission.data.products.reduce((acc: number, p: any) => acc + (parseFloat(p.amount || '0')), 0))} ر.س
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Attachments */}
                    {((selectedSubmission.data?.attachments && Array.isArray(selectedSubmission.data.attachments) && selectedSubmission.data.attachments.length > 0) || 
                      (selectedSubmission.files && Array.isArray(selectedSubmission.files) && selectedSubmission.files.length > 0)) && (
                      <div className="space-y-4">
                        <h3 className="text-sm font-bold text-brand dark:text-gold">المرفقات والمستندات</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Display files from standard 'files' array */}
                          {selectedSubmission.files && Array.isArray(selectedSubmission.files) && selectedSubmission.files.map((file: any, i: number) => (
                            <div key={`file-${i}`} className="flex items-center justify-between bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gold/10 hover:border-gold/30 transition-all group">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center">
                                  <Download size={18} />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-brand dark:text-white truncate">{file.type || file.fileName || file.name || 'مرفق'}</div>
                                  <div className="text-[10px] text-muted truncate">{file.fileName || file.name || 'ملف'}</div>
                                </div>
                              </div>
                              <a href={file.filePath || file.path || file.publicUrl || file.url} target="_blank" rel="noopener noreferrer" className="text-xs text-gold font-bold hover:underline">عرض</a>
                            </div>
                          ))}
                          
                          {/* Display files from 'data.attachments' (legacy or specific format) */}
                          {selectedSubmission.data?.attachments && Array.isArray(selectedSubmission.data.attachments) && selectedSubmission.data.attachments.map((att: any, i: number) => (
                            <div key={`att-${i}`} className="flex items-center justify-between bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gold/10 hover:border-gold/30 transition-all group">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center">
                                  <Download size={18} />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-brand dark:text-white truncate">{att.type || att.fileName}</div>
                                  <div className="text-[10px] text-muted truncate">{att.fileName}</div>
                                </div>
                              </div>
                              <a href={att.content} download={att.fileName} className="text-xs text-gold font-bold hover:underline">تحميل</a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Signature */}
                    {selectedSubmission.data?.signature && (
                      <div className="space-y-4">
                        <h3 className="text-sm font-bold text-brand dark:text-gold">توقيع العميل</h3>
                        <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gold/10 flex flex-col items-center">
                          <img 
                            src={selectedSubmission.data.signature} 
                            alt="توقيع العميل" 
                            className="max-h-[120px] object-contain bg-white rounded-lg p-2 border border-gray-100"
                            referrerPolicy="no-referrer"
                          />
                          <div className="mt-2 text-[10px] text-muted font-bold">تم التوقيع إلكترونياً عند تقديم الطلب</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: History & Actions */}
                  <div className="space-y-8">
                    {/* Status Update Card */}
                    <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-[24px] border border-gold/10 space-y-4">
                      <h3 className="text-sm font-bold text-brand dark:text-gold">تحديث حالة الطلب</h3>
                      <div className="space-y-3">
                        <select 
                          value={selectedSubmission.status}
                          onChange={(e) => {
                            const newStatus = e.target.value;
                            const comment = prompt('أدخل ملاحظة لهذا التحديث (اختياري):') || '';
                            updateStatus(selectedSubmission.id, newStatus, comment);
                          }}
                          className={`w-full text-sm font-bold px-4 py-3 rounded-xl border outline-none shadow-sm transition-all ${getStatusColor(selectedSubmission.status)}`}
                        >
                          <option value="pending">جديد</option>
                          <option value="processing">تحت الإجراء</option>
                          <option value="executing">قيد التنفيذ</option>
                          <option value="completed">مكتمل</option>
                          <option value="rejected">مرفوض</option>
                        </select>
                        
                        <button 
                          onClick={() => sendContract(selectedSubmission.userId, selectedSubmission.id)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand text-gold rounded-xl text-sm font-bold hover:bg-brand/90 transition-all shadow-lg"
                        >
                          <PenTool size={18} />
                          إرسال العقد للتوقيع
                        </button>

                        {contracts.some(c => c.submission_id === selectedSubmission.id) && (
                          <button 
                            onClick={() => {
                              const contract = contracts.find(c => c.submission_id === selectedSubmission.id);
                              setSelectedContract(contract);
                            }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gold/10 text-gold rounded-xl text-sm font-bold hover:bg-gold/20 transition-all border border-gold/20"
                          >
                            <FileCheck size={18} />
                            عرض العقد الموثق
                          </button>
                        )}

                        <button 
                          onClick={() => sendInvoice(selectedSubmission.userId, selectedSubmission.id)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gold text-brand rounded-xl text-sm font-bold hover:bg-gold/90 transition-all shadow-lg"
                        >
                          <FileText size={18} />
                          إرسال فاتورة الطلب
                        </button>
                      </div>
                    </div>

                    {/* History Timeline */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-brand dark:text-gold flex items-center gap-2">
                        <History size={18} />
                        سجل التحديثات
                      </h3>
                      <div className="relative pr-4 space-y-6">
                        <div className="absolute top-0 bottom-0 right-0 w-[2px] bg-gold/20"></div>
                        {isHistoryLoading ? (
                          <div className="text-right py-4 text-xs text-muted">جاري تحميل السجل...</div>
                        ) : (
                          submissionHistory.map((h, i) => (
                            <div key={h.id} className="relative pr-6">
                              <div className="absolute top-1 right-[-5px] w-[12px] h-[12px] rounded-full bg-gold border-2 border-white dark:border-[#12031a] z-10"></div>
                              <div className="text-xs font-bold text-brand dark:text-white mb-0.5">
                                {getStatusLabel(h.status)}
                              </div>
                              <div className="text-[10px] text-muted mb-1">{h.comment}</div>
                              <div className="flex items-center justify-between text-[9px] text-muted/70">
                                <span>بواسطة: {h.changed_by_name || 'مدير'}</span>
                                <span>{new Date(h.created_at).toLocaleString('ar-SA')}</span>
                              </div>
                            </div>
                          ))
                        )}
                        {submissionHistory.length === 0 && !isHistoryLoading && (
                          <div className="text-[10px] text-muted italic">لا يوجد سجل تحديثات حالياً</div>
                        )}
                      </div>
                     </div>

                     {/* Client Contracts for this submission */}
                     {contracts.filter(c => c.submission_id === selectedSubmission.id).length > 0 && (
                       <div className="space-y-4">
                         <h3 className="text-sm font-bold text-brand dark:text-gold flex items-center gap-2">
                           <PenTool size={18} />
                           عقود العميل
                         </h3>
                         <div className="space-y-3">
                           {contracts.filter(c => c.submission_id === selectedSubmission.id).map(c => (
                             <div key={c.id} className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gold/10 hover:border-gold/30 transition-all">
                               <div className="flex items-center justify-between mb-2">
                                 <span className="text-xs font-bold text-brand dark:text-white">عقد رقم {c.file_number || c.id}</span>
                                 <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${c.signed_at ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                   {c.signed_at ? 'تم التوقيع' : 'بانتظار التوقيع'}
                                 </span>
                               </div>
                               <div className="text-[10px] text-muted space-y-1">
                                 <div>نوع العقد: {c.type === 'waive_request' ? 'عقد إعفاء' : c.type === 'rescheduling_request' ? 'عقد جدولة' : 'عقد خدمة'}</div>
                                 <div>تاريخ الإرسال: {new Date(c.created_at).toLocaleDateString('ar-SA')}</div>
                                 {c.signed_at && <div>تاريخ التوقيع: {new Date(c.signed_at).toLocaleString('ar-SA')}</div>}
                               </div>
                               <button 
                                 onClick={() => setSelectedContract(c)}
                                 className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 bg-gold/10 text-gold rounded-xl text-xs font-bold hover:bg-gold/20 transition-all border border-gold/20"
                               >
                                 <Eye size={14} />
                                 عرض العقد
                               </button>
                             </div>
                           ))}
                         </div>
                       </div>
                     )}

                     {/* Client Invoices for this submission */}
                     {adminInvoices.filter(inv => inv.submission_id === selectedSubmission.id).length > 0 && (
                       <div className="space-y-4">
                         <h3 className="text-sm font-bold text-brand dark:text-gold flex items-center gap-2">
                           <CreditCard size={18} />
                           فواتير العميل
                         </h3>
                         <div className="space-y-3">
                           {adminInvoices.filter(inv => inv.submission_id === selectedSubmission.id).map(inv => (
                             <div key={inv.id} className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gold/10 hover:border-gold/30 transition-all">
                               <div className="flex items-center justify-between mb-2">
                                 <span className="text-xs font-bold text-brand dark:text-white">فاتورة رقم {inv.id}</span>
                                 <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${inv.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                   {inv.status === 'paid' ? 'مسددة' : 'بانتظار السداد'}
                                 </span>
                               </div>
                               <div className="text-[10px] text-muted space-y-1">
                                 <div>المبلغ: <span className="font-bold text-brand dark:text-white">{formatAmount(inv.amount)} ر.س</span></div>
                                 <div>نوع الخدمة: {inv.type === 'rescheduling_request' ? 'إعادة جدولة' : inv.type === 'seized_amounts_request' ? 'مبالغ محجوزة' : 'إعفاء'}</div>
                                 <div>تاريخ الإصدار: {new Date(inv.created_at).toLocaleDateString('ar-SA')}</div>
                                 {inv.paid_at && <div>تاريخ السداد: {new Date(inv.paid_at).toLocaleDateString('ar-SA')}</div>}
                               </div>
                             </div>
                           ))}
                         </div>
                       </div>
                     )}
                   </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gold/10 bg-gray-50 dark:bg-black/20 flex items-center justify-end">
                <Button onClick={() => setSelectedSubmission(null)} variant="outline">إغلاق</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* User Details Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brand/40 backdrop-blur-md" 
              onClick={() => setSelectedUser(null)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full sm:w-[95%] max-w-3xl max-h-screen sm:max-h-[90vh] bg-white dark:bg-[#12031a] rounded-none sm:rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-3 sm:p-5 border-b border-gold/10 flex items-center justify-between bg-brand text-white shrink-0">
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-gold text-brand flex items-center justify-center font-bold text-sm sm:text-lg">
                    {(selectedUser.name || '؟')[0]}
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-lg font-bold">{selectedUser.name}</h2>
                    <p className="text-[8px] sm:text-[10px] text-gold/80">{selectedUser.email}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedUser(null)} className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                  <X size={14} />
                </button>
              </div>
              <div className="p-3 sm:p-6 space-y-3 sm:space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  <InfoItem icon={<IdCard size={14} />} label="رقم الهوية" value={selectedUser.nationalId} />
                  <InfoItem icon={<Phone size={14} />} label="رقم الجوال" value={selectedUser.mobile} isLtr />
                  <InfoItem icon={<Hash size={14} />} label="رقم الملف" value={selectedUser.fileNumber} />
                  <InfoItem icon={<Calendar size={14} />} label="تاريخ الانضمام" value={new Date(selectedUser.created_at || '').toLocaleDateString('ar-SA')} />
                </div>
                <div className="p-4 rounded-2xl bg-gold/5 border border-gold/10">
                  <h4 className="text-xs font-bold text-brand mb-2">ملاحظات إضافية</h4>
                  <p className="text-xs text-muted leading-relaxed">لا توجد ملاحظات مسجلة لهذا العميل حالياً.</p>
                </div>
              </div>
              <div className="p-6 border-t border-gold/10 bg-gray-50 dark:bg-black/20 flex items-center justify-end gap-3">
                <Button variant="outline" onClick={() => setSelectedUser(null)}>إغلاق</Button>
                <Button className="bg-brand text-gold">تعديل البيانات</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Contract View Modal */}
      <AnimatePresence>
        {selectedContract && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-0 sm:p-4 print-container">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brand/40 backdrop-blur-md" 
              onClick={() => setSelectedContract(null)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full sm:w-[95%] max-w-5xl h-full sm:h-[92vh] bg-white dark:bg-[#12031a] rounded-none sm:rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-3 sm:p-5 border-b border-gold/10 flex items-center justify-between bg-brand text-white shrink-0">
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/10 flex items-center justify-center text-gold border border-white/10">
                    <PenTool size={16} />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-lg font-bold">عرض العقد: {selectedContract.file_number}</h2>
                    <p className="text-[8px] sm:text-[10px] text-gold/80">{selectedContract.user_name}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedContract(null)} className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                  <X size={14} />
                </button>
              </div>
              <div className="p-2 sm:p-6 flex-1 overflow-y-auto custom-scrollbar print-container">
                {(() => {
                  const sub = submissions.find(s => s.id === selectedContract.submission_id);
                  if (!sub) return (
                    <div className="flex flex-col items-center justify-center p-12 text-muted">
                      <AlertCircle size={40} className="mb-4 opacity-20" />
                      <p>تعذر تحميل بيانات العقد الكاملة</p>
                    </div>
                  );

                  const isRescheduling = sub.type === 'rescheduling_request' || sub.type === 'scheduling_request';
                  const products = Array.isArray(sub.data?.products) 
                    ? sub.data.products 
                    : (typeof sub.data?.products === 'string' ? safeParse(sub.data.products, []) : []);
                  const totalDebt = products.reduce((acc: number, p: any) => acc + (Number(p.amount) || 0), 0) || 0;
                  const scopeItems = isRescheduling
                    ? [
                        'الاطلاع على المستندات والبيانات المالية',
                        'التواصل مع البنوك والجهات التمويلية',
                        'رفع الطلبات ومتابعتها، وإعداد المذكرات النظامية والحضور النظامي عند الحاجة.',
                      ]
                    : [
                        'الاطلاع على التقارير الطبية والمستندات الرسمية',
                        'التواصل مع البنوك والجهات التمويلية',
                        'رفع الطلبات ومتابعتها، وإعداد المذكرات القانونية والحضور النظامي عند الحاجة.',
                      ];
                  const acknowledgmentItems = [
                    'صحة جميع البيانات والمستندات المقدمة منه.',
                    'صحة احتساب الأتعاب وفق النسبة المتفق عليها.',
                    'التنازل عن أي دفوع أو منازعات تتعلق بسند الأمر متى ما تم إصداره عبر منصة نافذ وفق أحكام هذا العقد.',
                    'عدم الطعن أو الاعتراض على التنفيذ أمام محكمة التنفيذ إلا في الحدود التي يجيزها النظام.',
                  ];

                  return (
                    <div ref={contractContentRef} className="bg-white dark:bg-white/5 rounded-xl border border-gold/10 p-4 sm:p-12 shadow-inner relative font-['Tajawal'] min-h-[800px]">
                      {/* Official Watermark */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02] select-none rotate-[-35deg]">
                        <span className="text-[80px] font-black text-[#22042C]">RIFANS FINANCIAL</span>
                      </div>
                      
                      {!selectedContract.signed_at && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.05] select-none rotate-[-45deg] z-0">
                          <span className="text-[120px] font-black text-rose-600 border-8 border-rose-600 px-8 py-4 rounded-3xl">مسودة</span>
                        </div>
                      )}

                      {/* Document Header */}
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8 relative border-b-4 border-[#22042C] pb-4">
                        <div className="text-right">
                          <div className="space-y-1">
                            <p className="text-[20px] font-black text-[#22042C]">شركة ريفانس المالية</p>
                            <div className="mt-4 space-y-1">
                              <p className="text-[16px] font-black text-[#22042C] bg-gold/10 px-3 py-1 rounded-lg inline-block">
                                {isRescheduling ? 'عقد تفويض ومتابعة طلب جدولة منتجات تمويلية' : 'عقد تفويض ومتابعة طلب إعفاء تمويلي'}
                              </p>
                              <div className="flex flex-col gap-1 mt-2">
                                <p className="text-[11px] font-bold text-[#22042C]">رقم ملف العميل: <span className="font-mono text-gold">{sub.id}</span></p>
                                <p className="text-[11px] font-bold text-[#22042C]">رقم العقد الموحد: <span className="font-mono text-gold">{selectedContract.file_number}</span></p>
                                <p className="text-[11px] font-bold text-[#22042C]">تاريخ الإصدار: {new Date(sub.timestamp).toLocaleDateString('ar-SA')}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="shrink-0">
                          <img src={rifansLogo} alt="شعار ريفانس" className="h-24 sm:h-28 w-auto object-contain" />
                        </div>
                      </div>

                      {/* Contract Body */}
                      <div className="space-y-4 text-right dir-rtl relative text-[10px] leading-[1.6] text-[#22042C] dark:text-gray-200">
                        {/* Parties Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border border-gray-200 dark:border-white/10 rounded-lg p-3 bg-gray-50/30 dark:bg-white/5">
                          <div className="space-y-0.5">
                            <h3 className="font-black text-gold border-b border-gold/30 pb-0.5 mb-1.5 text-[10.5px]">• الطرف الأول</h3>
                            <p><strong>الاسم:</strong> شركة ريفانس المالية</p>
                            <p><strong>الرقم الوطني الموحد:</strong> 7038821125</p>
                            <p><strong>ويمثلها:</strong> AZZAH ALOBIDI بصفة المدير العام</p>
                          </div>
                          <div className="space-y-0.5">
                            <h3 className="font-black text-gold border-b border-gold/30 pb-0.5 mb-1.5 text-[10.5px]">• الطرف الثاني</h3>
                            <p><strong>اسم العميل:</strong> {sub.data?.firstName} {sub.data?.middleName} {sub.data?.lastName}</p>
                            <p><strong>رقم الهوية:</strong> {sub.data?.nationalId || sub.data?.userNationalId || '---'}</p>
                            <p><strong>رقم الجوال:</strong> {sub.data?.mobile}</p>
                          </div>
                        </div>

                        <section>
                          <h3 className="font-black mb-0.5 text-gold text-[10.5px]">التمهيد:</h3>
                          <p className="text-justify opacity-90">
                            {isRescheduling 
                              ? 'حيث إن الطرف الثاني لديه التزامات مالية قائمة لدى البنوك والجهات التمويلية، وحيث إن الطرف الأول يعد من الجهات المتخصصة ذات الخبرة والكفاءة المهنية العالية في مجال المنازعات المصرفية والتمويلية، ويضم نخبة من اللجان القانونية المؤهلة القادرة على دراسة الطلبات وتدقيق المستندات ومتابعة الإجراءات بشكل رسمي ونظامي...'
                              : 'حيث إن الطرف الثاني قد تقدم وأفاد بأن لديه عجزاً طبياً مثبتاً بموجب تقارير رسمية صادرة من الجهات الطبية المختصة؛ وحيث إن الطرف الأول يُعد من الجهات المتخصصة ذات الخبرة والكفاءة المهنية العالية في مجال المنازعات المصرفية والتمويلية، ويضم نخبة من اللجان القانونية المؤهلة القادرة على دراسة الطلبات، وتدقيق المستندات والتقارير الطبية، ومتابعة الإجراءات بشكل رسمي ونظامي مع البنوك والمصارف والجهات التمويلية والهيئات الطبية وكافة الجهات التنظيمية ذات العلاقة؛ وحيث إن الطرف الثاني قد أبدى رغبته الصريحة في التقدم بطلب إعفاء من جميع التزاماته التمويلية القائمة لدى البنوك والمصارف؛ وحيث إن الطرف الأول قد أثبت جدارته المهنية من خلال ما يملكه من لجان متخصصة وخبرات عملية في إدارة طلبات العملاء المقدمة إلى الجهات التمويلية، وما حققه من نتائج إيجابية تسهم في حفظ حقوق العملاء وتحقيق مصالحهم؛ وحيث إن هذا التمهيد يُعد جزءاً لا يتجزأ من هذا العقد ومكملاً ومفسراً لبنوده؛ فقد اتفق الطرفان، وهما بكامل الأهلية المعتبرة شرعاً ونظاماً، على إبرام هذا العقد وفقاً لما يلي:'
                            }
                          </p>
                        </section>

                        <div className="space-y-6">
                          <h2 className="text-right text-[14px] font-black text-[#22042C] border-b-2 border-gold pb-1 inline-block">بنود العقد التفصيلية</h2>
                          
                          <section>
                            <h3 className="font-black text-gold mb-0.5 text-[10.5px]">المادة (1): حجية التعامل الإلكتروني</h3>
                            <p className="pr-2">يقر الطرفان بموافقتهما على إبرام هذا العقد واستخدام الوسائل الإلكترونية (البريد الإلكتروني، الرسائل النصية OTP) لتوثيقه، وتعد هذه الوسائل حجة ملزمة وقائمة بذاتها وفقاً لنظام التعاملات الإلكترونية السعودي، ولها ذات الحجية القانونية للتوقيع اليدوي أمام كافة الجهات الرسمية والقضائية.</p>
                          </section>

                          <section>
                            <h3 className="font-black text-gold mb-0.5 text-[10.5px]">المادة (2): موضوع العقد والتفويض</h3>
                            <p className="mb-1.5">
                              {isRescheduling 
                                ? `يفوض الطرف الثاني بموجب هذا العقد تفويضاً صريحاً ومباشراً وقابلاً للتنفيذ للطرف الأول في استلام وتقديم ومتابعة طلب إعادة جدولة المنتجات التمويلية الخاصة به لدى ${sub.data?.bank || 'الجهات التمويلية والبنوك'}، وذلك فيما يتعلق بمنتجات التمويل الموضحة أدناه:`
                                : `يفوض الطرف الثاني بموجب هذا العقد تفويضاً صريحاً ومباشراً وقابلاً للتنفيذ للطرف الأول في استلام وتقديم ومتابعة طلب الإعفاء المقدم من الطرف الثاني لدى ${sub.data?.bank || 'البنك الأهلي السعودي'}، وذلك فيما يتعلق بمنتجات التمويل الموضحة أدناه:`
                              }
                            </p>
                            
                            <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 p-3 rounded-lg space-y-2 text-[10px]">
                              <p><strong>اسم الجهة التمويلية:</strong> {sub.data?.bank || 'الجهة المالية'}</p>
                              {(() => {
                                const products = Array.isArray(sub.data?.products) 
                                  ? sub.data.products 
                                  : (typeof sub.data?.products === 'string' ? safeParse(sub.data.products, []) : []);
                                return products.map((product: any, idx: number) => (
                                  <div key={idx} className="space-y-1 border-t border-gray-50 dark:border-white/5 pt-1 first:border-0 first:pt-0">
                                    <p><strong>نوع المنتج:</strong> {product.type}</p>
                                    <p><strong>رقم الحساب:</strong> {product.accountNumber || product.account_number}</p>
                                    <p><strong>المبلغ:</strong> {formatAmount(product.amount)} ريال سعودي</p>
                                  </div>
                                ));
                              })()}
                              <p className="font-black text-brand dark:text-gold pt-1 text-[11px] border-t-2 border-brand/10">إجمالي المديونية: {formatAmount(totalDebt)} ريال سعودي</p>
                            </div>
                          </section>

                          <section>
                            <h3 className="font-black text-gold mb-0.5 text-[10.5px]">المادة (3): نطاق التفويض</h3>
                            <div className="pr-2">
                              <p className="mb-0.5">يشمل التفويض الممنوح للطرف الأول الصلاحيات التالية :</p>
                              <PdfBulletList items={scopeItems} className="space-y-0.5 pr-2" />
                            </div>
                          </section>

                          <section>
                            <h3 className="font-black text-gold mb-0.5 text-[10.5px]">المادة (4): التزامات الطرف الأول</h3>
                            <p className="pr-2">يلتزم الطرف الأول بالمحافظة على سرية بيانات الطرف الثاني، وبذل أقصى درجات العناية المهنية ، ورفع الطلبات بصيغة رسمية تعزز فرص القبول ، وإبلاغ الطرف الثاني بالمستجدات دورياً.</p>
                          </section>

                          <section>
                            <h3 className="font-black text-gold mb-0.5 text-[10.5px]">المادة (5): التزامات الطرف الثاني</h3>
                            <p className="pr-2">يلتزم الطرف الثاني بتقديم كافة المستندات والبيانات الصحيحة ، التعاون مع الطرف الأول لاستكمال النواقص ، والالتزام بسداد الأتعاب المستحقة وفقاً لأحكام العقد.</p>
                          </section>

                          <section>
                            <h3 className="font-black text-gold mb-0.5 text-[10.5px]">المادة (6): المستحقات المالية والأتعاب</h3>
                            <p>
                              {isRescheduling
                                ? 'لا تستحق أتعاب الطرف الأول إلا بعد صدور قرار الموافقة على إعادة جدولة المنتجات التمويلية وإتمام الإجراءات ذات العلاقة. وفي حال صدور القرار يستحق الطرف الأول أتعاباً مقطوعة قدرها: 2,000 ريال سعودي فقط.'
                                : 'لا تستحق أتعاب الطرف الأول إلا بعد صدور قبول طلب الإعفاء وإصدار خطاب المخالصة المالية ، وفي حال قبول طلب الإعفاء ، يستحق الطرف الأول أتعاباً مقطوعة قدرها (4%) من إجمالي المبالغ المعفاة فعلياً'
                              }
                            </p>
                            <p className="mt-1 font-black text-[#dc2626] text-[9px]">"وفي حال عدم قبول الطلب، لا يحق للطرف الأول المطالبة بأي أتعاب"</p>
                          </section>

                          <section>
                            <h3 className="font-black text-gold mb-0.5 text-[10.5px]">المادة (7): مدة العقد</h3>
                            <p className="pr-2">يبدأ العمل بهذا العقد من تاريخ توقيعه ، ويستمر سارياً حتى قبول طلب الإعفاء ، ما لم يتم إنهاؤه باتفاق مكتوب بين الطرفين أو وفقاً للأنظمة.</p>
                          </section>

                          <section>
                            <h3 className="font-black text-gold mb-0.5 text-[10.5px]">المادة (8): سند لأمر وإقرار دين واجب النفاذ</h3>
                            <p className="mb-1.5">
                              اتفق الطرفان على أن يُعد هذا العقد بمثابة سندٍ لأمرٍ واجب النفاذ وفقًا لأحكام نظام الأوراق التجارية ونظام التنفيذ السعودي ،ويقر الطرف الثاني إقرارًا صريحًا ونهائيًا بالتزامه بسداد أتعاب الطرف الأول بنسبة (4%) من إجمالي مبالغ المنتجات التمويلية التي يتم إعفاؤه منها، وذلك فور قبول طلب الإعفاء واستلام خطاب المخالصة المالية.
                            </p>
                            <div className="bg-brand/5 dark:bg-white/5 p-2 rounded-lg border border-brand/10 dark:border-white/10 space-y-0.5 text-[9px]">
                              <p><strong>• رقم السند:</strong> {sub.id}</p>
                              <p><strong>• قيمة السند:</strong> {isRescheduling ? '2,000 ريال سعودي' : 'تمثل نسبة (4%) من إجمالي مبالغ المنتجات التمويلية المعفاة فعليًا'}</p>
                              <p><strong>• تاريخ الاستحقاق:</strong> {isRescheduling ? 'فور صدور الموافقة على طلب إعادة الجدولة' : 'فور قبول طلب الإعفاء واستلام خطاب المخالصة المالية الصادر من الجهة المختصة'}</p>
                            </div>
                          </section>

                          <section>
                            <h3 className="font-black text-gold mb-0.5 text-[10.5px]">المادة (9): أحكام عامة</h3>
                            <p className="pr-2">يخضع العقد لأنظمة المملكة العربية السعودية. لا يُعد أي تعديل نافذاً إلا إذا كان مكتوباً وموقعاً من الطرفين.</p>
                          </section>

                          <section>
                            <h3 className="font-black text-gold mb-0.5 text-[10.5px]">المادة (10): الإقرار والتنازل عن الدفوع</h3>
                            <p className="pr-2">يُقر الطرف الثاني إقراراً صريحاً ونهائياً بما يلي:</p>
                            <PdfNumberedList items={acknowledgmentItems} className="space-y-0.5 pr-2" />
                          </section>

                          <section>
                            <h3 className="font-black text-gold mb-0.5 text-[10.5px]">المادة (11): الإقرار والقبول النهائي</h3>
                            <p className="pr-2">يُقر الطرف الثاني بما يلي: اطلاعه الكامل على العقد وفهمه لآثاره، صحة التفويض الممنوح، صحة احتساب الأتعاب، وأن هذا الإقرار حجة قاطعة وملزمة أمام جميع الجهات القضائية والتنفيذية.</p>
                          </section>

                          <section>
                            <h3 className="font-black text-gold mb-0.5 text-[10.5px]">المادة (12): التفويض</h3>
                            <div className="pr-2 space-y-2 text-justify leading-relaxed">
                              <p>أقر أنا الموقع أدناه وبكامل أهليتي المعتبرة شرعاً ونظاماً بأنني قد فوضت شركة ريفانس المالية ، سجل تجاري رقم 7038821125 تفويضاً كاملاً غير مشروط بمراجعة كافة الجهات الحكومية والخاصة والجهات التمويلية (البنوك والمصارف وشركات التمويل) وشركة المعلومات الائتمانية (سمة)، وذلك للاطلاع على كافة بياناتي الائتمانية والتمويلية والطبية.</p>
                              <p>كما يشمل هذا التفويض حق تقديم طلبات الإعفاء من المديونيات ، أو طلبات إعادة الجدولة ، أو تسوية الالتزامات واستلام خطابات المخالصة أو قرارات الإعفاء ، ومتابعة كافة الإجراءات المتعلقة بملفي لدى البنك المركزي السعودي وكافة اللجان القضائية والرقابية.</p>
                              <p>ويعد هذا التفويض سارياً من تاريخ توقيعه وحتى انتهاء الغرض الذي أعد من أجله أو قيامي بإلغائه رسمياً عبر القنوات المعتمدة لدى الشركة، مع التزامي بكافة النتائج والآثار القانونية المترتبة على هذا التفويض.</p>
                            </div>
                          </section>
                        </div>

                        {/* Signatures Section */}
                        <div className="mt-8 pt-4 border-t-2 border-[#22042C] grid grid-cols-2 gap-6 relative">
                          <div className="text-right space-y-2">
                            <p className="font-black text-[10px] text-[#22042C] dark:text-white underline underline-offset-2">ختم وتوقيع الطرف الأول</p>
                            <div className="h-36 flex items-center justify-center relative overflow-hidden">
                              <img src={rifansStampImg} alt="First Party Stamp" className="h-full w-auto object-contain mix-blend-multiply" />
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            <p className="font-black text-[10px] text-[#22042C] dark:text-white underline underline-offset-2">توقيع الطرف الثاني (العميل)</p>
                            <div className="h-28 bg-gray-50/50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/10 flex items-center justify-center relative overflow-hidden">
                              {selectedContract.signed_at ? (
                                <div className="flex flex-col items-center gap-1">
                                  {selectedContract.signature_data ? (
                                    <img src={selectedContract.signature_data} alt="توقيع العميل" className="h-16 object-contain" />
                                  ) : (
                                    <CheckCircle className="text-green-500" size={20} />
                                  )}
                                  <span className="text-[7px] text-muted font-bold">
                                    {sub.data?.firstName} {sub.data?.middleName} {sub.data?.lastName}
                                  </span>
                                  <span className="text-[6px] text-muted">
                                    {new Date(selectedContract.signed_at).toLocaleString('ar-SA')}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-1 text-muted/40">
                                  <PenTool size={20} />
                                  <span className="text-[9px] font-bold italic">بانتظار التوقيع...</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Footer Notice */}
                        <div className="mt-6 text-right border-t border-gray-100 dark:border-white/10 pt-3">
                          <p className="text-[8px] text-muted font-bold">هذه الوثيقة صادرة عن النظام الإلكتروني لشركة ريفانس المالية وهي ملزمة قانوناً بمجرد التوقيع عليها.</p>
                          <div className="flex justify-between items-center text-[7px] text-gray-400 mt-1.5">
                            <span>رقم المرجع: {sub.id}</span>
                            <span className="font-bold">رقم العقد: {selectedContract.file_number}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
              <div className="p-3 sm:p-5 border-t border-gold/10 bg-gray-50 dark:bg-black/20 flex items-center justify-end gap-2 print-hidden">
                <Button variant="outline" onClick={() => setSelectedContract(null)} className="text-[10px] sm:text-xs h-7 sm:h-9">إغلاق</Button>
                <Button 
                  variant="outline" 
                  
                  onClick={() => window.print()} 
                  className="text-[10px] sm:text-xs h-7 sm:h-9 border-gold/30 text-brand dark:text-gold gap-1.5 hover:bg-gold/5"
                >
                  <Printer size={12} />
                  طباعة العقد
                </Button>
                <Button 
                  disabled={isDownloading}
                  onClick={handleDownloadPdf} 
                  className="bg-brand text-gold gap-1.5 text-[10px] sm:text-xs h-7 sm:h-9 shadow-lg shadow-brand/20"
                >
                  <Download size={12} />
                  {isDownloading ? 'جاري التحميل...' : 'تحميل العقد'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal for Sending Contract */}
      <AnimatePresence>
        {isConfirmingSendContract && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brand/60 backdrop-blur-md" 
              onClick={() => setIsConfirmingSendContract(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-[#12031a] rounded-[32px] shadow-2xl overflow-hidden p-8 text-right"
            >
              <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 text-gold">
                <PenTool size={40} />
              </div>
              <h3 className="text-xl font-bold text-brand dark:text-white mb-4">تأكيد إرسال العقد</h3>
              <p className="text-muted mb-8">هل ترغب بإرسال العقد للعميل؟</p>
              
              <div className="flex items-center gap-4">
                <Button 
                  onClick={handleConfirmSendContract}
                  className="flex-1 bg-brand text-gold py-4 rounded-2xl font-bold shadow-lg shadow-brand/20"
                >
                  إرسال
                </Button>
                <Button 
                  onClick={() => setIsConfirmingSendContract(false)}
                  variant="outline"
                  className="flex-1 py-4 rounded-2xl font-bold border-gray-200"
                >
                  إلغاء
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal for Sending Invoice */}
      <AnimatePresence>
        {isConfirmingSendInvoice && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brand/60 backdrop-blur-md" 
              onClick={() => setIsConfirmingSendInvoice(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-[#12031a] rounded-[32px] shadow-2xl overflow-hidden p-8 text-right"
            >
              <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 text-gold">
                <FileText size={40} />
              </div>
              <h3 className="text-xl font-bold text-brand dark:text-white mb-4">تأكيد إرسال الفاتورة</h3>
              <p className="text-muted mb-8">هل ترغب بإرسال فاتورة الطلب للعميل؟ سيتم احتساب الأتعاب تلقائياً حسب نوع الخدمة.</p>
              
              <div className="flex items-center gap-4">
                <Button 
                  onClick={handleConfirmSendInvoice}
                  className="flex-1 bg-gold text-brand py-4 rounded-2xl font-bold shadow-lg shadow-gold/20"
                >
                  إرسال الفاتورة
                </Button>
                <Button 
                  onClick={() => setIsConfirmingSendInvoice(false)}
                  variant="outline"
                  className="flex-1 py-4 rounded-2xl font-bold border-gray-200"
                >
                  إلغاء
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Stat Popup */}
      <AnimatePresence>
        {statPopup && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={() => setStatPopup(null)}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 bg-white dark:bg-[#12031a] rounded-2xl border border-gold/20 shadow-2xl w-full max-w-md max-h-[70vh] flex flex-col overflow-hidden"
              dir="rtl"
            >
              <div className="p-4 border-b border-gold/10 flex items-center justify-between bg-brand text-white rounded-t-2xl">
                <h3 className="text-sm font-bold">{statPopup.label} ({statPopup.items.length})</h3>
                <button onClick={() => setStatPopup(null)} className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20"><X size={14} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {statPopup.items.length === 0 ? (
                  <div className="text-center text-muted text-sm py-8">لا توجد عناصر</div>
                ) : (
                  statPopup.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-brand text-gold flex items-center justify-center font-bold text-[10px]">
                          {(item.name || '؟')[0]}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-brand dark:text-white">{item.name}</div>
                          {item.type && <div className="text-[9px] text-muted">{item.type === 'waive_request' ? 'إعفاء' : item.type === 'rescheduling_request' ? 'جدولة' : item.type}</div>}
                        </div>
                      </div>
                      <div className="text-[9px] text-muted">{new Date(item.date || '').toLocaleDateString('ar-SA')}</div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Message Toast */}
      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[210] bg-emerald-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-bold"
          >
            <CheckCircle size={24} />
            تم ارسال العقد للعميل بنجاح
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper Components
const MenuCard = ({ icon, label, description, onClick, color, badge }: { icon: React.ReactNode, label: string, description: string, onClick: () => void, color: string, badge?: number }) => (
  <button 
    onClick={onClick}
    className="relative p-2 sm:p-2.5 md:p-3.5 bg-white dark:bg-[#12031a] rounded-[10px] sm:rounded-[14px] md:rounded-[20px] border border-gold/10 hover:border-gold/40 hover:shadow-2xl transition-all group text-right flex flex-col items-start gap-1.5 overflow-hidden"
  >
    <div className={`absolute top-0 right-0 w-1 h-full bg-${color}-500 opacity-0 group-hover:opacity-100 transition-all`}></div>
    <div className={`w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-md sm:rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <div>
      <h3 className="text-[10px] sm:text-xs md:text-sm font-bold text-brand dark:text-white group-hover:text-gold transition-colors flex items-center gap-1">
        {label}
        {badge ? (
          <span className="bg-rose-500 text-white text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-full">{badge}</span>
        ) : null}
      </h3>
      <p className="text-[7px] sm:text-[8px] md:text-[10px] text-muted mt-0.5 leading-relaxed">{description}</p>
    </div>
    <div className="mt-0.5 sm:mt-1 md:mt-1.5 flex items-center gap-1 text-gold font-bold text-[7px] sm:text-[8px] md:text-[9px] opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
      فتح القسم
      <ChevronLeft size={8} />
    </div>
  </button>
);

const StatCard = ({ icon, label, value, color, onClick }: { icon: React.ReactNode, label: string, value: number, color: string, onClick?: () => void }) => (
  <div className={`p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl border border-gold/10 bg-white dark:bg-[#06010a] hover:border-gold/30 hover:shadow-lg transition-all group overflow-hidden relative ${onClick ? 'cursor-pointer active:scale-[0.97]' : ''}`} onClick={onClick}>
    <div className={`absolute top-0 right-0 w-1 h-full bg-${color}-500 opacity-0 group-hover:opacity-100 transition-all`}></div>
    <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 mb-1.5 sm:mb-2 md:mb-3">
      <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <span className="text-[8px] sm:text-[10px] font-bold text-muted uppercase tracking-tight">{label}</span>
    </div>
    <div className="text-base sm:text-xl md:text-2xl font-black text-brand dark:text-white tracking-tight">{typeof value === 'number' ? formatAmount(value) : value}</div>
  </div>
);

const NavButton = ({ active, onClick, icon, label, badge }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, badge?: number }) => (
  <button 
    onClick={onClick}
    className={`flex items-center justify-between w-full p-2.5 rounded-xl transition-all group ${
      active 
        ? 'bg-brand text-gold shadow-lg translate-x-[-4px]' 
        : 'text-muted hover:bg-gold/5 hover:text-brand dark:hover:text-gold'
    }`}
  >
    <div className="flex items-center gap-3">
      <div className={`transition-transform group-hover:scale-110 ${active ? 'text-gold' : 'text-muted group-hover:text-gold'}`}>
        {icon}
      </div>
      <span className="text-xs sm:text-sm font-bold">{label}</span>
    </div>
    {badge ? (
      <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">{badge}</span>
    ) : (
      <ChevronLeft size={14} className={`opacity-0 group-hover:opacity-100 transition-all ${active ? 'opacity-100' : ''}`} />
    )}
  </button>
);

const InfoItem = ({ icon, label, value, isLtr, isBold }: { icon: React.ReactNode, label: string, value: any, isLtr?: boolean, isBold?: boolean }) => (
  <div className="p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl md:rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-right">
    <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 mb-1 sm:mb-1.5 md:mb-2 text-muted justify-start">
      {icon}
      <span className="text-[7px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </div>
    <div className={`text-[10px] sm:text-xs text-right ${isBold ? 'font-bold text-brand dark:text-gold sm:text-sm' : 'text-brand dark:text-white'} ${isLtr ? 'font-mono' : ''}`} dir={isLtr ? 'ltr' : 'rtl'}>
      {value || '---'}
    </div>
  </div>
);

export default AdminDashboard;
