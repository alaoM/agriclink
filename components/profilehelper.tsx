import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";


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
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: any) => {
            const res = await fetch(`${API_BASE}/api/auth/update-profile`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error('Failed to update profile');
            return res.json(); // return the new profile
        },
        // Optimistically update the profile
        onMutate: async (newProfile) => {
            await queryClient.cancelQueries({ queryKey: ['profile'] });

            const previousProfile = queryClient.getQueryData(['profile']);

            queryClient.setQueryData(['profile'], (old: any) => ({
                ...old,
                ...newProfile, // optimistic merge
            }));

            return { previousProfile };
        },
        // Rollback on error
        onError: (err, _newProfile, context) => {
            if (context?.previousProfile) {
                queryClient.setQueryData(['profile'], context.previousProfile);
            }
        },
        // Refetch after success to sync with backend
        onSuccess: (data) => {
            queryClient.setQueryData(['profile'], data); // final update
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
    });
}


export function useUploadPhotoMutation() {
    const { token } = useAuth();
    const queryClient = useQueryClient();

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
            } as any);

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

            return json?.profile.profilePhoto;
        },

        onMutate: async (uri) => {
            await queryClient.cancelQueries({ queryKey: ['profile'] });
            const previousProfile = queryClient.getQueryData(['profile']) || {};

            queryClient.setQueryData(['profile'], (old: any) => ({
                ...old,
                profilePhoto: uri,
            }));

            return { previousProfile };
        },

        onError: (err, _uri, context) => {
            if (context?.previousProfile) {
                queryClient.setQueryData(['profile'], context.previousProfile);
            }
            Toast.show({ type: 'error', text1: 'Upload failed', text2: err.message });
        },

        onSuccess: (photoUrl) => {
            queryClient.setQueryData(['profile'], (old: any) => ({
                ...old,
                profilePhoto: photoUrl,
            }));
            // Toast.show({ type: 'success', text1: 'Photo updated!' });
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
    });
}


