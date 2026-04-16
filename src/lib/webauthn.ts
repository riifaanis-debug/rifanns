import { startRegistration, startAuthentication, browserSupportsWebAuthn, platformAuthenticatorIsAvailable } from '@simplewebauthn/browser';
import { supabase } from '@/integrations/supabase/client';

const getRpID = () => window.location.hostname;
const getOrigin = () => window.location.origin;

export const isBiometricSupported = async (): Promise<boolean> => {
  if (!browserSupportsWebAuthn()) return false;
  try {
    return await platformAuthenticatorIsAvailable();
  } catch {
    return false;
  }
};

export const registerBiometric = async (
  userId: string,
  userName: string,
  deviceName?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!(await isBiometricSupported())) {
      return { success: false, error: 'جهازك لا يدعم البصمة أو التعرف على الوجه' };
    }

    // 1) Get options from server
    const { data: options, error: optsErr } = await supabase.functions.invoke(
      'webauthn-register-options',
      { body: { userId, userName, rpID: getRpID() } }
    );
    if (optsErr || !options || options.error) {
      return { success: false, error: options?.error || 'فشل بدء التسجيل' };
    }

    // 2) Trigger browser prompt
    const attResp = await startRegistration({ optionsJSON: options });

    // 3) Send to server for verification
    const { data: verifyResp, error: verifyErr } = await supabase.functions.invoke(
      'webauthn-register-verify',
      {
        body: {
          userId,
          response: attResp,
          expectedOrigin: getOrigin(),
          rpID: getRpID(),
          deviceName: deviceName || navigator.userAgent.slice(0, 50),
        },
      }
    );

    if (verifyErr || !verifyResp?.success) {
      return { success: false, error: verifyResp?.error || 'فشل التحقق من البصمة' };
    }

    // Mark in localStorage that this user has biometric enabled
    const enabledUsers = JSON.parse(localStorage.getItem('biometric_enabled_users') || '[]');
    if (!enabledUsers.includes(userId)) {
      enabledUsers.push(userId);
      localStorage.setItem('biometric_enabled_users', JSON.stringify(enabledUsers));
    }
    localStorage.setItem('last_biometric_user', userId);

    return { success: true };
  } catch (err: any) {
    console.error('registerBiometric error', err);
    if (err?.name === 'NotAllowedError') {
      return { success: false, error: 'تم إلغاء عملية التسجيل' };
    }
    return { success: false, error: err?.message || 'فشل تسجيل البصمة' };
  }
};

export const loginWithBiometric = async (): Promise<{ success: boolean; user?: any; error?: string }> => {
  try {
    if (!(await isBiometricSupported())) {
      return { success: false, error: 'الجهاز لا يدعم البصمة' };
    }

    // 1) Get auth options
    const { data: options, error: optsErr } = await supabase.functions.invoke(
      'webauthn-auth-options',
      { body: { rpID: getRpID() } }
    );
    if (optsErr || !options || options.error) {
      return { success: false, error: options?.error || 'فشل بدء تسجيل الدخول' };
    }

    // 2) Trigger browser prompt
    const authResp = await startAuthentication({ optionsJSON: options });

    // 3) Verify with server
    const { data: verifyResp, error: verifyErr } = await supabase.functions.invoke(
      'webauthn-auth-verify',
      {
        body: {
          response: authResp,
          expectedOrigin: getOrigin(),
          rpID: getRpID(),
        },
      }
    );

    if (verifyErr || !verifyResp?.success) {
      return { success: false, error: verifyResp?.error || 'فشل التحقق من البصمة' };
    }

    if (verifyResp.user?.id) {
      localStorage.setItem('last_biometric_user', verifyResp.user.id);
    }

    return { success: true, user: verifyResp.user };
  } catch (err: any) {
    console.error('loginWithBiometric error', err);
    if (err?.name === 'NotAllowedError') {
      return { success: false, error: 'تم إلغاء عملية تسجيل الدخول' };
    }
    return { success: false, error: err?.message || 'فشل تسجيل الدخول بالبصمة' };
  }
};

export const getUserCredentials = async (userId: string) => {
  const { data, error } = await supabase
    .from('webauthn_credentials')
    .select('id, device_name, device_type, last_used_at, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data || [];
};

export const deleteCredential = async (credentialDbId: string, userId: string) => {
  const { error } = await supabase
    .from('webauthn_credentials')
    .delete()
    .eq('id', credentialDbId);

  if (!error) {
    // Check if any creds remain
    const remaining = await getUserCredentials(userId);
    if (remaining.length === 0) {
      const enabledUsers = JSON.parse(localStorage.getItem('biometric_enabled_users') || '[]');
      const filtered = enabledUsers.filter((id: string) => id !== userId);
      localStorage.setItem('biometric_enabled_users', JSON.stringify(filtered));
    }
  }
  return !error;
};

export const hasBiometricEnabledLocally = (): boolean => {
  const lastUser = localStorage.getItem('last_biometric_user');
  const enabledUsers = JSON.parse(localStorage.getItem('biometric_enabled_users') || '[]');
  return !!lastUser && enabledUsers.includes(lastUser);
};
