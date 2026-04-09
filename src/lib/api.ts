import { supabase } from '@/integrations/supabase/client';

// Helper to get current user ID from localStorage
const getCurrentUserId = (): string | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr).id;
  } catch { return null; }
};

// ---- REQUESTS ----
export const submitRequest = async (requestData: any) => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('غير مسجل الدخول');

  const newRequest = {
    id: Date.now().toString(),
    user_id: userId,
    type: requestData.type || 'general',
    details: requestData.details || '',
    data: requestData.data || {},
    files: requestData.files || [],
    status: 'pending',
  };

  const { data, error } = await supabase.from('requests').insert(newRequest).select().single();
  if (error) throw error;

  // Create notification
  await supabase.from('notifications').insert({
    id: `NOT-${Date.now()}`,
    user_id: userId,
    submission_id: newRequest.id,
    title: 'تم استلام طلبك',
    message: `تم استلام طلبك بنجاح وهو قيد المراجعة الآن. نوع الطلب: ${newRequest.type}`,
    type: 'new_request',
  });

  return data;
};

export const saveDraftRequest = async (requestData: any) => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('غير مسجل الدخول');

  // Check if draft already exists for this user and type
  const { data: existing } = await supabase
    .from('requests')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'draft')
    .eq('type', requestData.type || 'general')
    .maybeSingle();

  if (existing) {
    // Update existing draft
    const { data, error } = await supabase
      .from('requests')
      .update({
        details: requestData.details || '',
        data: requestData.data || {},
        files: requestData.files || [],
      })
      .eq('id', existing.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Create new draft
  const newDraft = {
    id: `DRAFT-${Date.now()}`,
    user_id: userId,
    type: requestData.type || 'general',
    details: requestData.details || '',
    data: requestData.data || {},
    files: requestData.files || [],
    status: 'draft',
  };

  const { data, error } = await supabase.from('requests').insert(newDraft).select().single();
  if (error) throw error;
  return data;
};

export const getMyRequests = async () => {
  const userId = getCurrentUserId();
  if (!userId) return [];
  const { data } = await supabase.from('requests').select('*').eq('user_id', userId).neq('status', 'cancelled').order('created_at', { ascending: false });
  return (data || []).map(r => ({ ...r, userId: r.user_id, timestamp: r.created_at }));
};

export const deleteRequest = async (requestId: string) => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('غير مسجل الدخول');
  const { error } = await supabase.from('requests').update({ status: 'cancelled' }).eq('id', requestId).eq('user_id', userId);
  if (error) throw error;
};

export const getMyNotifications = async () => {
  const userId = getCurrentUserId();
  if (!userId) return [];
  const { data } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  return data || [];
};

export const markAllNotificationsRead = async () => {
  const userId = getCurrentUserId();
  if (!userId) return;
  await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
};

export const getMyContracts = async () => {
  const userId = getCurrentUserId();
  if (!userId) return [];
  const { data } = await supabase.from('contracts').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  return data || [];
};

export const getProfile = async () => {
  const userId = getCurrentUserId();
  if (!userId) return null;
  const { data } = await supabase.from('app_users').select('*').eq('id', userId).single();
  return data;
};

export const updateProfile = async (profileData: any) => {
  const userId = getCurrentUserId();
  if (!userId) return;
  await supabase.from('app_users').update({
    full_name: profileData.fullName,
    first_name: profileData.firstName,
    middle_name: profileData.middleName,
    last_name: profileData.lastName,
    phone: profileData.phone || profileData.mobile,
    national_id: profileData.national_id || profileData.nationalId,
    file_number: profileData.fileNumber,
    job_status: profileData.jobStatus,
    salary: profileData.salary,
    age: profileData.age,
    region: profileData.region,
    city: profileData.city,
    bank: profileData.bank,
    products: profileData.products || [],
    documents: profileData.documents || [],
  }).eq('id', userId);
};

export const uploadDocument = async (file: File) => {
  const ext = file.name.split('.').pop() || 'pdf';
  const fileName = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const { data, error } = await supabase.storage.from('uploads').upload(fileName, file);
  if (error) throw error;
  const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
  return { fileName: file.name, filePath: urlData.publicUrl };
};

// ---- ADMIN ----
export const getAdminSubmissions = async () => {
  const { data: requests } = await supabase.from('requests').select('*').order('created_at', { ascending: false });
  if (!requests) return [];
  
  const userIds = [...new Set(requests.map(r => r.user_id))];
  const { data: users } = await supabase.from('app_users').select('id, full_name, email, phone, national_id').in('id', userIds);
  const userMap = new Map((users || []).map(u => [u.id, u]));
  
  return requests.map(r => {
    const u = userMap.get(r.user_id);
    return {
      ...r,
      userId: r.user_id,
      user_name: u?.full_name || 'عميل غير معروف',
      user_email: u?.email || '',
      user_phone: u?.phone || '',
      user_national_id: u?.national_id || '',
      timestamp: r.created_at,
    };
  });
};

export const getAdminUsers = async () => {
  const { data } = await supabase.from('app_users').select('*').neq('role', 'admin');
  return (data || []).map(u => ({
    ...u,
    name: u.full_name,
    fileNumber: u.file_number,
    nationalId: u.national_id,
    mobile: u.phone,
    jobStatus: u.job_status,
  }));
};

export const getAdminNotifications = async () => {
  const { data: notifications } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
  if (!notifications) return [];
  
  const userIds = [...new Set(notifications.map(n => n.user_id))];
  const { data: users } = await supabase.from('app_users').select('id, full_name').in('id', userIds);
  const userMap = new Map((users || []).map(u => [u.id, u.full_name]));
  
  return notifications.map(n => ({ ...n, user_name: userMap.get(n.user_id) || 'غير معروف' }));
};

export const getAdminContracts = async () => {
  const { data: contracts } = await supabase.from('contracts').select('*').order('created_at', { ascending: false });
  if (!contracts) return [];
  
  const userIds = [...new Set(contracts.map(c => c.user_id))];
  const { data: users } = await supabase.from('app_users').select('id, full_name').in('id', userIds);
  const userMap = new Map((users || []).map(u => [u.id, u.full_name]));

  return contracts.map(c => ({
    ...c,
    file_number: c.submission_id,
    user_name: userMap.get(c.user_id) || 'غير معروف',
  }));
};

export const updateSubmissionStatus = async (id: string, status: string, comment?: string) => {
  await supabase.from('requests').update({ status }).eq('id', id);
  
  const userId = getCurrentUserId();
  await supabase.from('request_history').insert({
    id: `HIST-${Date.now()}`,
    request_id: id,
    status,
    comment: comment || `Status changed to ${status}`,
    changed_by: userId,
  });

  // Get request to find the owner
  const { data: req } = await supabase.from('requests').select('user_id').eq('id', id).single();
  if (req) {
    let title = 'تحديث في حالة طلبك';
    let message = `تم تغيير حالة طلبك رقم ${id} إلى: ${status}`;
    if (status === 'processing') { title = 'طلبك تحت المراجعة'; message = 'بدأ فريقنا في مراجعة طلبك.'; }
    else if (status === 'completed') { title = 'اكتملت معالجة الطلب'; message = 'تهانينا، تم الانتهاء من معالجة طلبك بنجاح.'; }
    else if (status === 'rejected') { title = 'تم رفض الطلب'; message = comment || 'نعتذر، لم يتم قبول طلبك.'; }

    await supabase.from('notifications').insert({
      id: `NOT-${Date.now()}`,
      user_id: req.user_id,
      submission_id: id,
      title,
      message,
      type: 'status_change',
    });
  }
};

export const getSubmissionHistory = async (id: string) => {
  const { data: history } = await supabase.from('request_history').select('*').eq('request_id', id).order('created_at', { ascending: false });
  if (!history) return [];
  
  const changerIds = [...new Set(history.map(h => h.changed_by).filter(Boolean))];
  let userMap = new Map();
  if (changerIds.length > 0) {
    const { data: users } = await supabase.from('app_users').select('id, full_name').in('id', changerIds);
    userMap = new Map((users || []).map(u => [u.id, u.full_name]));
  }
  
  return history.map(h => ({ ...h, changed_by_name: userMap.get(h.changed_by) || 'مدير' }));
};

export const sendContract = async (userId: string, submissionId: string) => {
  const contractId = `CON-${Date.now()}`;
  const { data: req } = await supabase.from('requests').select('type').eq('id', submissionId).single();
  
  await supabase.from('contracts').insert({
    id: contractId,
    submission_id: submissionId,
    user_id: userId,
    type: req?.type || 'general',
  });

  await supabase.from('requests').update({ status: 'contract_signature' }).eq('id', submissionId);

  await supabase.from('notifications').insert({
    id: `NOT-${Date.now()}`,
    user_id: userId,
    submission_id: submissionId,
    title: 'عقد جديد بانتظار التوقيع',
    message: 'تم إصدار عقد جديد لطلبك، يرجى المراجعة والتوقيع الإلكتروني.',
    type: 'contract',
  });

  return contractId;
};

export const getSubmission = async (id: string) => {
  const { data: req } = await supabase.from('requests').select('*').eq('id', id).single();
  if (!req) return null;
  
  const { data: contracts } = await supabase.from('contracts').select('*').eq('submission_id', id).limit(1);
  const contract = contracts && contracts.length > 0 ? contracts[0] : null;
  
  return {
    ...req,
    userId: req.user_id,
    signature_data: contract?.signature_data || null,
    signed_at: contract?.signed_at || null,
    timestamp: req.created_at,
  };
};

export const submitSignature = async (submissionId: string, signatureData: string) => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('غير مسجل الدخول');
  
  const { data: contracts } = await supabase.from('contracts')
    .select('*')
    .eq('submission_id', submissionId)
    .eq('user_id', userId)
    .limit(1);
  
  if (!contracts || contracts.length === 0) throw new Error('العقد غير موجود');
  
  await supabase.from('contracts').update({
    signature_data: signatureData,
    signed_at: new Date().toISOString(),
  }).eq('id', contracts[0].id);

  await supabase.from('requests').update({ status: 'executing' }).eq('id', submissionId);
};

export const notifyAdminContractSigned = async (submissionId: string, contractPdfFile?: { fileName: string; filePath: string }) => {
  const userId = getCurrentUserId();
  if (!userId) return;

  const { data: user } = await supabase.from('app_users').select('full_name, phone, national_id, email').eq('id', userId).single();
  const { data: req } = await supabase.from('requests').select('*').eq('id', submissionId).single();

  const files = contractPdfFile ? [contractPdfFile] : [];

  await supabase.functions.invoke('notify-admin', {
    body: {
      requestData: {
        id: submissionId,
        type: 'contract_signed',
        details: `قام العميل بتوقيع العقد رقم ${submissionId} بنجاح`,
        data: req?.data || {},
        files,
      },
      userData: {
        fullName: user?.full_name || 'غير محدد',
        phone: user?.phone || 'غير محدد',
        national_id: user?.national_id || 'غير محدد',
        email: user?.email || 'غير محدد',
      },
    },
  });
};

// ---- INVOICES ----
export const getMyInvoices = async () => {
  const userId = getCurrentUserId();
  if (!userId) return [];
  const { data } = await supabase.from('invoices').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  return data || [];
};

export const getAdminInvoices = async () => {
  const { data: invoices } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
  if (!invoices) return [];
  
  const userIds = [...new Set(invoices.map((inv: any) => inv.user_id))];
  const { data: users } = await supabase.from('app_users').select('id, full_name').in('id', userIds);
  const userMap = new Map((users || []).map(u => [u.id, u.full_name]));

  return invoices.map((inv: any) => ({
    ...inv,
    user_name: userMap.get(inv.user_id) || 'غير معروف',
  }));
};

export const sendInvoice = async (userId: string, submissionId: string) => {
  const invoiceId = `INV-${Date.now()}`;
  const { data: req } = await supabase.from('requests').select('type, data').eq('id', submissionId).single();
  
  const reqData = req?.data as Record<string, any> || {};
  const products = reqData?.products || [];
  const totalDebt = Array.isArray(products) ? products.reduce((acc: number, p: any) => acc + (Number(p.amount) || 0), 0) : 0;
  
  const type = req?.type || 'general';
  let percentage = 4; // default waive
  if (type === 'rescheduling_request' || type === 'scheduling_request') {
    percentage = 0; // fixed amount
  } else if (type === 'seized_amounts_request') {
    percentage = 1;
  }
  
  const amount = type === 'rescheduling_request' || type === 'scheduling_request' 
    ? 2000 
    : Math.round(totalDebt * percentage / 100);

  await supabase.from('invoices').insert({
    id: invoiceId,
    submission_id: submissionId,
    user_id: userId,
    type,
    amount,
    percentage,
    total_debt: totalDebt,
    status: 'pending',
  });

  await supabase.from('notifications').insert({
    id: `NOT-${Date.now()}-inv`,
    user_id: userId,
    submission_id: submissionId,
    title: 'فاتورة جديدة',
    message: 'تم إصدار فاتورة جديدة لطلبك، يرجى المراجعة.',
    type: 'invoice',
  });

  return invoiceId;
};

export const getInvoiceBySubmission = async (submissionId: string) => {
  const { data } = await supabase.from('invoices').select('*').eq('submission_id', submissionId).order('created_at', { ascending: false }).limit(1);
  return data && data.length > 0 ? data[0] : null;
};