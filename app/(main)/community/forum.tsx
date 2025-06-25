import { AppText } from '@/components/AppText';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import {
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import type { ImagePickerAsset } from 'expo-image-picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    Image,
    Modal,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { io, Socket } from 'socket.io-client';

/* -------------------------------------------------- */
/* Types                                              */
/* -------------------------------------------------- */
export interface Forum {
  _id: string;
  topic: string;
  description: string;
  image: string; // fully‑qualified URL or ""
  createdAt: string;
  memberCount: number;
}

export interface CreateForumPayload {
  topic: string;
  description: string;
  image?: { uri: string; name: string; type: string };
}

/* -------------------------------------------------- */
/* Constants & helpers                                */
/* -------------------------------------------------- */
const API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';
const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL ?? API_BASE;

const withAuth = (token: string | null | undefined, init: RequestInit = {}): RequestInit => ({
  ...init,
  headers: {
    Accept: 'application/json',
    ...(init.headers ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  },
});

const normaliseImage = (img: string): string =>
  !img ? '' : img.startsWith('http') ? img : `${API_BASE}/${img.replace(/^\/?/, '')}`;

/* -------------------------------------------------- */
/* API calls                                          */
/* -------------------------------------------------- */
const getForums = async (token: string | null): Promise<Forum[]> => {
  const res = await fetch(`${API_BASE}/api/forum/get`, withAuth(token));
  if (!res.ok) throw new Error('Failed to load forums');
  const data: unknown = await res.json();
  if (!data || typeof data !== 'object' || !Array.isArray((data as any).forums))
    throw new Error('Unexpected API response');

  return (data as any).forums.map((f: any): Forum => ({
    _id: f._id,
    topic: f.topic ?? '',
    description: f.description ?? '',
    image: normaliseImage(f.image ?? ''),
    createdAt: f.createdAt ?? '',
    memberCount: Number(f.memberCount ?? 0),
  }));
};

const createForum = async (
  token: string,
  payload: CreateForumPayload,
): Promise<Forum> => {
  const form = new FormData();
  form.append('topic', payload.topic);
  form.append('description', payload.description);
  if (payload.image) form.append('image', payload.image as unknown as Blob);

  const res = await fetch(`${API_BASE}/api/forum/create`, withAuth(token, { method: 'POST', body: form }));
  if (!res.ok) throw new Error(await res.text());
  const forum: any = await res.json();
  return {
    _id: forum._id,
    topic: forum.topic ?? '',
    description: forum.description ?? '',
    image: normaliseImage(forum.image ?? ''),
    createdAt: forum.createdAt ?? new Date().toISOString(),
    memberCount: Number(forum.memberCount ?? 0),
  };
};

export const joinForum = (id: string, token: string) =>
  fetch(`${API_BASE}/api/forum/join/${id}`, withAuth(token, { method: 'POST' }));

export const leaveForum = (id: string, token: string) =>
  fetch(`${API_BASE}/api/forum/leave/${id}`, withAuth(token, { method: 'POST' }));

/* -------------------------------------------------- */
/* Socket hook                                        */
/* -------------------------------------------------- */
const useForumsSocket = (token: string | null | undefined) => {
  const qc = useQueryClient();

  useEffect(() => {
    if (!token) return; // wait until auth token is ready

    const socket: Socket = io(SOCKET_URL, { auth: { token } });

    socket.emit('join', 'forums');

    socket.on('forum:new', (forum: any) => {
      qc.setQueryData<Forum[]>(['forums', token], (prev = []) => [
        {
          _id: forum._id,
          topic: forum.topic ?? '',
          description: forum.description ?? '',
          image: normaliseImage(forum.image ?? ''),
          createdAt: forum.createdAt ?? new Date().toISOString(),
          memberCount: Number(forum.memberCount ?? 0),
        },
        ...prev,
      ]);
    });

    socket.on('forum:update', (forum: any) => {
      qc.setQueryData<Forum[]>(['forums', token], (prev = []) =>
        prev.map((f) => (f._id === forum._id ? { ...f, ...forum } : f)),
      );
    });

    // Optionally refetch on reconnect
    socket.on('connect', () => qc.invalidateQueries({ queryKey: ['forums', token] }));

    return () => socket.disconnect();
  }, [token, qc]);
};

/* -------------------------------------------------- */
/* Component                                          */
/* -------------------------------------------------- */
export default function ForumScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();

  /* Listen for real‑time updates */
  useForumsSocket(token);

  const {
    data: forums = [],
    isLoading,
    isError,
  } = useQuery<Forum[], Error>({
    queryKey: ['forums', token],
    queryFn: () => getForums(token),
    enabled: !!token,
  });

  /* ---------- form state ---------- */
  const [modalVisible, setModalVisible] = useState(false);
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<CreateForumPayload['image'] | null>(null);

  const formIncomplete = topic.trim() === '' || description.trim() === '';

  const createMutation = useMutation<Forum, Error, CreateForumPayload>({
    mutationFn: (p) => createForum(token!, p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['forums', token] });
      resetForm();
    },
  });

  const resetForm = () => {
    setModalVisible(false);
    setTopic('');
    setDescription('');
    setImage(null);
  };

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== 'granted') return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      const a: ImagePickerAsset = result.assets[0];
      setImage({
        uri: a.uri,
        name: a.fileName ?? 'upload.jpg',
        type: a.mimeType ?? 'image/jpeg',
      });
    }
  };

  const handleSubmit = () => {
    if (formIncomplete || !token) return;
    createMutation.mutate({ topic: topic.trim(), description, image: image ?? undefined });
  };

  /* -------------------------------------------------- */
  /* Render                                             */
  /* -------------------------------------------------- */
  return (
    <View style={styles.container}>
      {isLoading && <AppText>Loading forums…</AppText>}
      {isError && <AppText>Couldn’t load forums.</AppText>}

      <FlatList
        data={forums}
        keyExtractor={(i) => i._id}
        contentContainerStyle={{ paddingVertical: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/forum/${item._id}`)}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <AppText style={styles.avatarLetter}>{(item.topic || 'X')[0].toUpperCase()}</AppText>
              </View>
            )}

            <View style={{ flex: 1 }}>
              <View style={styles.row}>
                <AppText style={styles.title}>{item.topic || 'Untitled'}</AppText>
                <AppText style={styles.badge}>{item.memberCount} members</AppText>
              </View>
              <AppText numberOfLines={2} style={styles.desc}>{item.description}</AppText>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* FAB */}
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.fab}>
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      {/* CREATE MODAL */}
      <Modal transparent visible={modalVisible} animationType="slide">
        <View style={styles.backdrop}>
          <View style={styles.modal}>
            <AppText style={styles.modalTitle}>Create Forum Topic</AppText>

            {image && (
              <TouchableOpacity onPress={pickImage} style={styles.previewWrap}>
                <Image source={{ uri: image.uri }} style={styles.preview} />
              </TouchableOpacity>
            )}

            <TextInput
              placeholder="Topic name"
              value={topic}
              onChangeText={setTopic}
              style={styles.input}
            />
            <TextInput
              placeholder="Short description (max 120 chars)"
              value={description}
              onChangeText={(t) => t.length <= 120 && setDescription(t)}
              multiline
              style={[styles.input, { height: 80 }]}
            />
            <AppText style={styles.charCount}>{description.length}/120</AppText>

            <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
              <AppText style={{ color: '#FFF' }}>{image ? 'Change image' : 'Add image'}</AppText>
            </TouchableOpacity>

            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={resetForm} style={styles.modalBtn}>
                <AppText>Cancel</AppText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit}
                style={[styles.modalBtn, styles.modalConfirm, (createMutation.isPending || formIncomplete) && styles.modalConfirmDisabled]}
                disabled={createMutation.isPending || formIncomplete}
              >
                <AppText style={{ color: '#FFF' }}>{createMutation.isPending ? 'Creating…' : 'Create'}</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* -------------------------------------------------- */
/* Styles                                             */
/* -------------------------------------------------- */
const GREEN = '#2E7D32';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 12 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#F1F1F1',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
    alignItems: 'center',
  },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarLetter: { color: '#fff', fontSize: 20, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 16, color: '#333', fontWeight: '600' },
  badge: { fontSize: 12, color: '#555' },
  desc: { fontSize: 13, color: '#666' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: GREEN,
    borderRadius: 30,
    padding: 14,
    elevation: 3,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 24,
  },
  modal: { backgroundColor: '#FFF', width: '100%', borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  previewWrap: { alignSelf: 'center', marginBottom: 12 },
  preview: { width: 120, height: 120, borderRadius: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  charCount: { alignSelf: 'flex-end', marginBottom: 12, color: '#888' },
  imageBtn: {
    backgroundColor: GREEN,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  modalBtns: { flexDirection: 'row', justifyContent: 'flex-end' },
  modalBtn: { padding: 10 },
  modalConfirm: {
    backgroundColor: GREEN,
    borderRadius: 6,
    paddingHorizontal: 16,
    marginLeft: 8,
  },
  modalConfirmDisabled: { backgroundColor: '#A9A9A9', opacity: 0.8 },
});
