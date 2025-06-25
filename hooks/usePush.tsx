import { useSavePushSettings } from '@/components/services/notificationapi';
import { registerForPushToken } from '@/components/services/notifications';
import { useState } from 'react';
 
export function usePushPreference(initialEnabled = false) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const saveMutation = useSavePushSettings();

  const toggle = async (value: boolean) => {
    setEnabled(value); // UI is optimistic

    try {
      if (value) {
        const expoToken = await registerForPushToken();
        await saveMutation.mutateAsync({ enabled: true, expoToken });
      } else {
        await saveMutation.mutateAsync({ enabled: false });
      }
    } catch (err) {
      console.warn('[push] failed', err);
      setEnabled(!value); // roll back UI
    }
  };

  return { enabled, toggle, loading: saveMutation.isPending };
}
