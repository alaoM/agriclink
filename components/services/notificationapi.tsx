import { useMutation } from '@tanstack/react-query';

// store token or preference server‑side
export const useSavePushSettings = () =>
  useMutation({
    mutationFn: async (payload: { enabled: boolean; expoToken?: string }) => {
      const res = await fetch('https://api.example.com/settings/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Cannot update push settings');
    },
  });
