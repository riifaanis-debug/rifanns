import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';

interface User {
  id: string;
  fullName?: string;
  name?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  national_id?: string;
  nationalId?: string;
  role?: 'admin' | 'user';
}

interface AuthResponse {
  user: any;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (data: AuthResponse) => void;
  logout: () => void;
  isLoading: boolean;
  loginOrRegisterUser: (nationalId: string, phone: string) => Promise<User>;
  lookupOrCreateUser: (nationalId: string, phone: string) => Promise<User>;
  loginWithEmail: (email: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  loginWithApple: () => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const normalizeSaudiPhone = (phone: string): string => {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.length > 10) cleaned = cleaned.slice(-10);
  return cleaned;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedUser !== 'undefined' && savedToken && savedToken !== 'undefined') {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }

    // Listen for Supabase auth state changes (e.g. Google OAuth callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const supaUser = session.user;
        const email = supaUser.email || '';
        const fullName = supaUser.user_metadata?.full_name || supaUser.user_metadata?.name || email.split('@')[0];

        // Check if user exists in app_users
        const { data: existing } = await supabase
          .from('app_users')
          .select('*')
          .eq('email', email)
          .limit(1);

        let appUser: any;
        if (!existing || existing.length === 0) {
          // Create new app_users record
          const newUser = {
            id: supaUser.id,
            full_name: fullName,
            email,
            role: 'user',
          };
          const { data: inserted } = await supabase
            .from('app_users')
            .insert(newUser)
            .select()
            .single();
          appUser = inserted || newUser;
        } else {
          appUser = existing[0];
        }

        const userData: User = {
          id: appUser.id,
          fullName: appUser.full_name,
          name: appUser.full_name,
          email: appUser.email,
          phone: appUser.phone,
          national_id: appUser.national_id,
          role: appUser.role as 'admin' | 'user',
        };

        setUser(userData);
        setToken(session.access_token);
        localStorage.setItem('token', session.access_token);
        localStorage.setItem('user', JSON.stringify(userData));

        // Redirect based on role
        if (appUser.role === 'admin') {
          window.location.hash = '#/admin';
        } else {
          window.location.hash = '#/dashboard';
        }
      }
    });

    setIsLoading(false);
    return () => subscription.unsubscribe();
  }, []);

  const login = (data: AuthResponse) => {
    setUser(data.user);
    setToken(data.token || 'session');
    localStorage.setItem('token', data.token || 'session');
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.hash = '#/';
  };

  // Lookup or create user WITHOUT logging in (for OTP flow)
  const lookupOrCreateUser = async (nationalId: string, phone: string): Promise<User> => {
    const { data: existingUsers, error: lookupError } = await supabase
      .from('app_users')
      .select('*')
      .eq('national_id', nationalId)
      .limit(1);

    if (lookupError) throw new Error('خطأ في قاعدة البيانات');

    let appUser: any;

    if (!existingUsers || existingUsers.length === 0) {
      const newUser = {
        id: Date.now().toString(),
        full_name: `عميل ${nationalId.slice(-4)}`,
        email: '',
        phone: phone,
        national_id: nationalId,
        role: 'user',
      };
      const { data: inserted, error: insertError } = await supabase
        .from('app_users')
        .insert(newUser)
        .select()
        .single();

      if (insertError) throw new Error('خطأ في إنشاء الحساب');
      appUser = inserted;

      // Sync new contact to HubSpot (fire-and-forget)
      try {
        supabase.functions.invoke('hubspot-sync', {
          body: {
            action: 'upsert_contact',
            contact: {
              phone: appUser.phone,
              firstname: appUser.full_name,
              national_id: appUser.national_id,
            },
          },
        });
      } catch (e) {
        console.error('hubspot-sync (new contact) failed', e);
      }
    } else {
      appUser = existingUsers[0];
      if (appUser.phone !== phone) {
        await supabase.from('app_users').update({ phone }).eq('id', appUser.id);
        appUser.phone = phone;
      }
    }

    return {
      id: appUser.id,
      fullName: appUser.full_name,
      name: appUser.full_name,
      email: appUser.email,
      phone: appUser.phone,
      national_id: appUser.national_id,
      role: appUser.role as 'admin' | 'user',
    };
  };

  const loginOrRegisterUser = async (nationalId: string, phone: string): Promise<User> => {
    setIsLoading(true);
    try {
      const userData = await lookupOrCreateUser(nationalId, phone);
      login({ user: userData, token: `session-${userData.id}` });
      return userData;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithEmail = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      // Use server-side edge function for secure bcrypt password verification
      const { data, error } = await supabase.functions.invoke('verify-login', {
        body: { email, password },
      });

      if (error || !data?.success) {
        throw new Error(data?.error || 'بيانات الدخول غير صحيحة');
      }

      const userData: User = {
        id: data.user.id,
        fullName: data.user.fullName,
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone,
        national_id: data.user.national_id,
        role: data.user.role as 'admin' | 'user',
      };

      login({ user: userData, token: `session-${data.user.id}` });
      return userData;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<User> => {
    setIsLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });

      if (result.error) {
        throw new Error('فشل تسجيل الدخول بحساب Google');
      }

      // If redirected, the page will reload and we handle the session in useEffect
      // For now, throw a placeholder since the page will redirect
      throw new Error('جاري التحويل...');
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithApple = async (): Promise<User> => {
    setIsLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("apple", {
        redirect_uri: window.location.origin,
      });

      if (result.error) {
        throw new Error('فشل تسجيل الدخول بحساب Apple');
      }

      throw new Error('جاري التحويل...');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, loginOrRegisterUser, lookupOrCreateUser, loginWithEmail, loginWithGoogle, loginWithApple }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};