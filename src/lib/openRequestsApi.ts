import { supabase } from '@/integrations/supabase/client';

export type OpenFieldType = 'text' | 'choice' | 'dropdown' | 'amount' | 'number' | 'date' | 'attachment';
export type NumberLocale = 'ar' | 'en';
export type DateCalendar = 'gregorian' | 'hijri';

export interface OpenRequestField {
  id: string;
  label: string;
  type: OpenFieldType;
  required?: boolean;
  options?: string[]; // for choice / dropdown
  numberLocale?: NumberLocale; // for number / amount
  dateCalendar?: DateCalendar; // for date
  placeholder?: string;
}

export interface OpenRequestRecord {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  fields: OpenRequestField[];
  answers: Record<string, any>;
  attachments: any[];
  status: 'pending' | 'submitted' | 'closed';
  created_by?: string | null;
  created_at: string;
  submitted_at?: string | null;
  updated_at: string;
}

const getCurrentUserId = (): string | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try { return JSON.parse(userStr).id; } catch { return null; }
};

// Admin creates a new open request for a client
export const createOpenRequest = async (params: {
  userId: string;
  title: string;
  description?: string;
  fields: OpenRequestField[];
  createdBy?: string;
}) => {
  const id = `OR-${Date.now()}`;
  const { error } = await supabase.from('open_requests').insert({
    id,
    user_id: params.userId,
    title: params.title,
    description: params.description || null,
    fields: params.fields as any,
    answers: {},
    attachments: [],
    status: 'pending',
    created_by: params.createdBy || null,
  });
  if (error) throw error;

  // Notification for the client
  await supabase.from('notifications').insert({
    id: `NOT-${Date.now()}-or`,
    user_id: params.userId,
    submission_id: id,
    title: 'طلب مفتوح جديد',
    message: `وصلك طلب جديد بعنوان: ${params.title}. يرجى الدخول لقسم "الطلبات المفتوحة" لتعبئة البيانات.`,
    type: 'system',
  });

  return id;
};

// Client: list my open requests
export const getMyOpenRequests = async (): Promise<OpenRequestRecord[]> => {
  const userId = getCurrentUserId();
  if (!userId) return [];
  const { data } = await supabase
    .from('open_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return (data || []) as any;
};

// Admin: list all
export const getAdminOpenRequests = async (): Promise<OpenRequestRecord[]> => {
  const { data } = await supabase
    .from('open_requests')
    .select('*')
    .order('created_at', { ascending: false });
  return (data || []) as any;
};

// Client submits answers
export const submitOpenRequestAnswers = async (
  id: string,
  answers: Record<string, any>,
  attachments: any[] = [],
) => {
  const { error } = await supabase
    .from('open_requests')
    .update({
      answers: answers as any,
      attachments: attachments as any,
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (error) throw error;

  // Admin notification in-app (stored under the user for visibility; admin dashboard
  // reads ALL notifications via getAdminNotifications, so user_id here is fine)
  const userStr = localStorage.getItem('user');
  const userId = userStr ? JSON.parse(userStr).id : 'unknown';
  await supabase.from('notifications').insert({
    id: `NOT-${Date.now()}-ors`,
    user_id: userId,
    submission_id: id,
    title: 'تم إرسال طلب مفتوح',
    message: 'قام العميل بتعبئة وإرسال الطلب المفتوح.',
    type: 'status_update',
  });
};
