import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQuery } from "@tanstack/react-query";


const API_BASE = process.env.EXPO_PUBLIC_API_BASE;

export function useProfileQuery() {
     const { token } = useAuth();
    return useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const res = await fetch(`${API_BASE}/api/auth/profile
`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Failed to fetch profile');
            return res.json();
        },
    });
}

export function useUpdateProfileMutation() {
    const { token } = useAuth();

    return useMutation({
        mutationFn: async (payload: any) => {
            const res = await fetch(`${API_BASE}/api/auth/update-profile
`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error('Failed to update profile');
        },
    });
}

export function useUploadPhotoMutation() {
    const { token } = useAuth();

    return useMutation({
        mutationFn: async (uri: string) => {
            const form = new FormData();

            const filename = uri.split('/').pop() || 'photo.jpg';
            const ext = filename.split('.').pop();
            const type = `image/${ext === 'jpg' ? 'jpeg' : ext}`;

            form.append('avatar', {
                uri,
                name: filename,
                type,
            } as any); // React Native needs `as any` for FormData file

            const res = await fetch(`${API_BASE}/api/auth/upload-photo`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: form,
            }); 
            if (!res.ok) {
                const errorText = await res.text();
                console.error('Upload failed:', errorText);
                throw new Error('Failed to upload photo');
            }

            const json = await res.json(); 
            return json.url; 
        },
    });
}

