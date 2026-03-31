
export interface User {
  id: string | number;
  national_id: string;
  phone: string;
  role?: 'admin' | 'user';
  login_time?: string | Date;
}

export interface AuthResponse {
  user: any;
  token?: string;
}

export interface ServiceItem {
  id: string; // Added ID for routing
  name: string;
  description: string;
  tags: string;
  link: string;
}

export interface StatItem {
  value: number;
  label: string;
  suffix?: string;
}

export interface TestimonialItem {
  title: string;
  text: string;
  stars: number;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface TimelineItem {
  title: string;
  text: string;
  stars?: number;
}

export interface PerformanceItem {
  label: string;
  value: number; // 0-100
  displayValue: string;
}

export interface ProductItem {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  recommended?: boolean;
}

export interface UserProduct {
  id: number;
  type: string;
  amount: string;
  accountNumber?: string;
}

export interface UserDocument {
  id: number;
  type: string;
  fileName: string;
  date: string;
  filePath?: string;
}

export interface SubmissionHistory {
  id: string;
  submission_id: string;
  action: string;
  note?: string;
  admin_name?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  submission_id?: string;
  title: string;
  message: string;
  type: 'status_update' | 'payment_reminder' | 'system' | 'contract_signature';
  is_read: number;
  created_at: string;
  user_name?: string; // For admin view
}

export interface Contract {
  id: string;
  submission_id: string;
  user_id: string;
  signature_data?: string;
  signed_at?: string;
  created_at: string;
  user_name?: string;
  file_number?: string;
  type?: string;
}

export interface UserProfile {
  id?: string;
  fullName: string;
  firstName?: string;
  middleName?: string;
  fatherName?: string;
  lastName?: string;
  nationalId: string;
  mobile: string;
  fileNumber?: string;
  email?: string;
  jobStatus?: string;
  salary?: number;
  joinDate: string;
  serviceType?: string;
  age?: string;
  region?: string;
  city?: string;
  bank?: string;
  products?: UserProduct[];
  documents?: UserDocument[];
}

export interface CustomerRequest {
  id: string;
  type: string;
  date: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  description: string;
}
