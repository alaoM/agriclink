// things to fix
// 1. Text and image sender too far from the bottom of the screen on android. I did nt verify on ios
// 2. Reply to message only works on local, when i send close the forum and come back, i cannot find the reply aspect
// 3. Grouping of messaging accorfing to testerday, todat, 2 days ago etc not working
// 4. on Click of image, it should display the image bigger
// 5. there is a socket to check for typing state. I havent added it too socket.emit('typing', true);  // true when typing
// socket.emit('typing', false); // false when stopped
// socket.emit('forum_typing', {
//   forumId: forumId,
//   isTyping: true  // or false
// });
// 6. instead of using useEffect to fetch which reloads every time i mount the compoen, i have been using react query for other fetching like i used it to fetch weather conditions Here. Please translate the useEffect to react query if possible 



import { AppText } from '@/components/AppText';
import ImageViewer from '@/components/ImageViewer';
import SwipeableRow from '@/components/SwipeableRow';
import { useAuth } from '@/contexts/AuthContext';
import useForumSocket from '@/hooks/useForumSocket';
import { Feather, Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Reanimated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';

/* -------------------------------------------------- */
/* Constants                                          */
/* -------------------------------------------------- */
const STATUS_TOP = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 8 : 16;
const GREEN = '#2E7D32', GRAY = '#F1F1F1', BG = '#FFF';
const API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

/* -------------------------------------------------- */
/* Types                                              */
/* -------------------------------------------------- */
interface Msg {
  id: string;
  senderId: string;
  senderName: string;
  avatar?: string | null;
  ts: number;
  text?: string;
  image?: string | null;
  replyTo?: Msg | null;
  pending?: boolean;
}

/* -------------------------------------------------- */
/* Helpers                                            */
/* -------------------------------------------------- */
const makeMsg = (raw: any): Msg => ({
  id: raw._id,
  senderId: raw.user?._id ?? 'anon',
  senderName: raw.user?.username ?? raw.user?.email ?? 'Anon',
  avatar: raw.user?.profilePhoto ?? null,
  ts: new Date(raw.createdAt).getTime(),
  text: raw.content,
  image: raw.image,
  replyTo: null,
});



const groupMessagesByDate = (messages: Msg[]) => {
  const groups: { [date: string]: Msg[] } = {};
  for (const msg of messages) {
    const date = format(new Date(msg.ts), 'yyyy-MM-dd');
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
  }
  return Object.entries(groups).map(([date, data]) => ({ title: date, data }));
};




/* -------------------------------------------------- */
/* Component                                          */
/* -------------------------------------------------- */


export default function TopicChat() {
  const { id: forumId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { token, user } = useAuth();
  const { socket, isConnected } = useForumSocket();

  const listRef = useRef<FlatList<Msg>>(null);

  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<Msg | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [viewerUri, setViewerUri] = useState<string | null>(null);
  const [forumName, setForumName] = useState('');
  const [forumDesc, setForumDesc] = useState('');
  const [forumImage, setForumImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!forumId || !token) return;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/forum/get/messages/${forumId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json?.success) {
          const f = json.forum;
          setForumName(f.topic ?? 'Untitled Forum');
          setForumDesc(f.description ?? '');
          setForumImage(f.image ?? null);
          const formatted: Msg[] = json.messages.map(makeMsg);
          setMsgs(formatted);
        }
      } catch (err) {
        console.warn('[forum-meta]', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [forumId, token]);

  useEffect(() => {
    if (!socket || !forumId) return;
    socket.emit('join_forum', forumId);
    socket.emit('get_forum_history', forumId);

    const historyHandler = (history: any[]) => setMsgs(history.map(makeMsg));

    const msgHandler = (raw: any) => {
      setMsgs((prev) => [...prev, { ...makeMsg(raw), replyTo: prev.find((m) => m.id === raw.replyTo) ?? null }]);
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    };

    socket.on('forum_history', historyHandler);
    socket.on('forum_message', msgHandler);

    return () => {
      socket.emit('leave_forum', forumId);
      socket.off('forum_history', historyHandler);
      socket.off('forum_message', msgHandler);
    };
  }, [socket, forumId]);

  const sendMessage = async () => {
    if (!socket || (!text.trim() && !imageUri)) return;

    let imageUrl: string | null = null;
    if (imageUri) {
      const formData = new FormData();
      formData.append('image', { uri: imageUri, type: 'image/jpeg', name: 'chat.jpg' } as any);
      const res = await fetch(`${API_BASE}/api/forum/upload/chat-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const j = await res.json();
      imageUrl = j?.url ?? null;
    }

    const optimistic: Msg = {
      id: `temp-${Date.now()}`,
      senderId: user?.id ?? 'me',
      senderName: user?.username ?? user?.email ?? 'Me',
      // avatar: user?.profilePhoto ?? null,
      ts: Date.now(),
      text: text.trim() || undefined,
      image: imageUrl,
      replyTo,
      pending: true,
    };
    setMsgs((prev) => [...prev, optimistic]);
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));

    socket.emit('forum_message', {
      forumId,
      content: text.trim(),
      image: imageUrl,
      replyTo: replyTo?.id,
    });

    setText('');
    setReplyTo(null);
    setImageUri(null);
  };

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!res.canceled) setImageUri(res.assets[0].uri);
  };
   /* ---------- date header helper ---------- */
  const dayLabel = (ts: number) => {
    const d = new Date(ts), t = new Date(), ONE = 864e5;
    const diff = Math.floor((t.setHours(0, 0, 0, 0) - d.setHours(0, 0, 0, 0)) / ONE);
    return diff === 0 ? 'Today' : diff === 1 ? 'Yesterday'
      : d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const renderRow = ({ item }: { item: Msg }) => {
    const isMine = item.senderId === user?.id;
    const showDate = !item || dayLabel(item.ts) ;

    return (
      <>
      {/*  {showDate && (
                <View style={styles.dateBar}>
                  <AppText style={styles.dateTxt}>{dayLabel(item.ts)}</AppText>
                </View>
              )} */}
     
      <SwipeableRow
        renderLeftActions={ReplySlide}
        onSwipeOpen={(dir) => dir === 'right' && setReplyTo(item)}
        threshold={50}
      >
        <View style={[styles.row, isMine && styles.rowRev]}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <AppText style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
                {item.senderName[0]?.toUpperCase()}
              </AppText>
            </View>
          )}

          <Pressable
            style={[styles.bubble, isMine ? styles.bOut : styles.bIn]}
            onLongPress={() => setReplyTo(item)}
          >
            {item.replyTo && (
              <AppText style={styles.replyText} numberOfLines={1}>
                ↪ {item.replyTo.senderName}: {item.replyTo.text ?? 'image'}
              </AppText>
            )}
            {item.image ? (
              <Pressable onPress={() => setViewerUri(item.image!)}>
                <Image source={{ uri: item.image }} style={styles.img} />
              </Pressable>
            ) : (
              <AppText>{item.text}</AppText>
            )}
            {item.pending && <AppText style={styles.pending}>…</AppText>}
          </Pressable>
        </View>
      </SwipeableRow>
       </>
    );
  };

  /* ---------- swipe left‑action (slide in) ---------- */
  const ReplySlide = (_p: SharedValue<number>, dragX: SharedValue<number>) => {
    const rStyle = useAnimatedStyle(() => ({ transform: [{ translateX: dragX.value + 60 }] }));
    return (
      <Reanimated.View style={[styles.replySlide, rStyle]}>
        <Feather name="corner-up-left" size={22} color="#FFF" />
      </Reanimated.View>
    );
  };

   

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* header */}
      <View style={styles.headerWrap}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="chevron-back" size={28} color={GREEN} />
        </TouchableOpacity>
        {forumImage ? (
          <Image source={{ uri: forumImage }} style={styles.headerImg} />
        ) : (
          <View style={[styles.headerImg, styles.headerImgFallback]}>
            <AppText style={{ color: '#fff', fontWeight: '700' }}>{forumName[0]?.toUpperCase()}</AppText>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <AppText style={styles.headerTitle}>{forumName}</AppText>
          <AppText style={styles.headerDesc} numberOfLines={1}>{forumDesc}</AppText>
        </View>
        <View style={[styles.dot, isConnected ? styles.dotOn : styles.dotOff]} />
      </View>

      {loading && <ActivityIndicator style={{ marginTop: 20 }} color={GREEN} />}

      
        <FlatList
        ref={listRef}
        data={msgs}
        renderItem={renderRow}
        keyExtractor={(m) => m.id}
            onEndReachedThreshold={0.02}
            onEndReached={() => { }}

        contentContainerStyle={{ padding: 10, paddingBottom: 150 }}
      /> 

      {replyTo && (
        <View style={styles.replyBar}>
          <AppText numberOfLines={1} style={{ flex: 1 }}>
            Replying to <AppText style={{ fontWeight: '700' }}>{replyTo.senderName}</AppText>: {replyTo.text ?? 'image'}
          </AppText>
          <TouchableOpacity onPress={() => setReplyTo(null)}>
            <Ionicons name="close" size={18} color="#444" />
          </TouchableOpacity>
        </View>
      )}

      {imageUri && (
        <View style={{ marginHorizontal: 16, marginBottom: 4 }}>
          <Image source={{ uri: imageUri }} style={styles.img} />
        </View>
      )}

      <View style={styles.inRow}>
        <TouchableOpacity onPress={pickImage} style={{ padding: 4 }}>
          <Ionicons name="image" size={22} color={GREEN} />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Write a message…"
          value={text}
          onChangeText={setText}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.sendBtn, !(text.trim() || imageUri) && styles.sendBtnDisabled]}
          onPress={sendMessage}
          disabled={!(text.trim() || imageUri)}
        >
          <Ionicons name="send" size={16} color="#FFF" />
        </TouchableOpacity>
      </View>

      {viewerUri && <ImageViewer uri={viewerUri} onClose={() => setViewerUri(null)} />}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG, paddingTop: STATUS_TOP },
  headerWrap: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12,
    paddingVertical: 10, gap: 10, borderBottomColor: '#E0E0E0',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { paddingRight: 4 },
  headerImg: { width: 40, height: 40, borderRadius: 20, backgroundColor: GREEN },
  headerImgFallback: { justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#222' },
  headerDesc: { fontSize: 12, color: '#666' },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotOn: { backgroundColor: '#4CAF50' },
  dotOff: { backgroundColor: '#F44336' },
  row: { flexDirection: 'row', paddingHorizontal: 12, marginVertical: 4 },
  rowRev: { flexDirection: 'row-reverse' },
  avatar: { width: 28, height: 28, borderRadius: 14, marginHorizontal: 6 },
  avatarFallback: { backgroundColor: GREEN, justifyContent: 'center', alignItems: 'center' },
  bubble: { maxWidth: '78%', padding: 10, borderRadius: 14, position: 'relative' },
  bIn: { backgroundColor: GRAY, borderTopLeftRadius: 0 },
  bOut: { backgroundColor: '#C8E6C9', borderTopRightRadius: 0 },
  img: { width: 180, height: 120, borderRadius: 8 },
  pending: { position: 'absolute', bottom: 4, right: 8, fontSize: 10, color: '#555' },
  replyText: { fontSize: 12, color: '#555', marginBottom: 4, fontStyle: 'italic' },
  inRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: GRAY, borderRadius: 24,
    marginHorizontal: 8, marginBottom: 6, paddingHorizontal: 14, paddingVertical: 6,
  },
  input: { flex: 1, fontSize: 16, paddingVertical: 6, marginHorizontal: 8 },
  sendBtn: { backgroundColor: GREEN, borderRadius: 20, padding: 10 },
  sendBtnDisabled: { opacity: 0.4 },
  replyBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#EBEBEB', paddingHorizontal: 14, paddingVertical: 6,
    marginHorizontal: 8, borderRadius: 10,
  },
  replySlide: {
    width: 60, height: '100%',
    justifyContent: 'center', alignItems: 'center'
    
  },

   dateBar: { alignItems: 'center', marginVertical: 8 },
  dateTxt: {
    fontSize: 12, color: '#666', backgroundColor: '#E0E0E0', paddingHorizontal: 12,
    paddingVertical: 2, borderRadius: 10
  },
});
