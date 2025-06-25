import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE;

// 🔐 Enable 2FA API Call
const enable2FAApi = async (method: 'email' | 'authenticator', token: string) => {
  const res = await fetch(`${API_BASE}/api/auth/2fa/enable`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ method }),
  });

  if (!res.ok) throw new Error('Enable 2FA failed');
  return res.json();
};

// 🔐 Verify 2FA OTP API Call
const verify2FAApi = async (otp: string, token: string): Promise<any> => {
  const res = await fetch(`${API_BASE}/api/auth/2fa/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ code: otp }),
  });

  const text = await res.text();
  let data: any;

  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  if (!res.ok) {
    console.error('Request failed:', data);
    throw new Error(
      typeof data === 'string'
        ? `HTTP ${res.status} – ${data}`
        : data.message || `HTTP ${res.status}`
    );
  }

  return data;
};

// ✅ Hook to enable 2FA with profile cache update
export const useEnable2FA = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (method: 'email' | 'authenticator') => enable2FAApi(method, token),

    onSuccess: (_data, method) => {
      queryClient.setQueryData(['profile'], (old: any) => ({
        ...old,
        twoFactorEnabled: false,
        twoFactorMethod: method,
      }));
    },

    onError: (err: any) => {
      Toast.show({
        type: 'error',
        text1: '2FA Setup Failed',
        text2: err?.message || 'Unexpected error',
      });
    },
  });
};

// ✅ Hook to verify 2FA with profile update and cache refresh
export const useVerify2FA = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (otp: string) => verify2FAApi(otp, token),

    onSuccess: () => {
      queryClient.setQueryData(['profile'], (old: any) => ({
        ...old,
        twoFactorEnabled: true,
      }));
      Toast.show({
        type: 'success',
        text1: '2FA Enabled',
        text2: 'Two-Factor Authentication is now active.',
      });
    },

    onError: (err: any) => {
      Toast.show({
        type: 'error',
        text1: '2FA Verification Failed',
        text2: err?.message || 'Invalid OTP or server error',
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};
