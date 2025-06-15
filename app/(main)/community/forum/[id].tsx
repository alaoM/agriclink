/* app/(main)/forum/[id].tsx
   ------------------------------------------------------------ */
import { AppText } from '@/components/AppText';
import ImageViewer from '@/components/ImageViewer';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type Msg = {
  id: string;
  sender: string;
  ts: number;
  text?: string;
  image?: string;
};

const you = 'You';
const avatar = (u: string) => `https://i.pravatar.cc/100?u=${u}`;

export default function TopicChat() {
  /* -------- routing -------- */
  const { id, title } = useLocalSearchParams<{ id: string; title?: string }>();
  const router = useRouter();

  /* -------- local state -------- */
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [viewerUri, setViewerUri] = useState<string | null>(null);
  const listRef = useRef<FlatList<Msg>>(null);

  /* -------- helpers -------- */
  const pushMsg = (m: Partial<Msg>) => {
    const msg: Msg = { id: Date.now().toString(), sender: you, ts: Date.now(), ...m };
    setMsgs((prev) => [...prev, msg]);
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    setText('');
  };

  /* -------- render row -------- */
  const renderRow = ({ item }: { item: Msg }) => {
    const isMine = item.sender === you;
    return (
      <View style={[styles.row, isMine && styles.rowRev]}>
        {!isMine && <Image source={{ uri: avatar(item.sender) }} style={styles.avatar} />}
        <Pressable
          style={[styles.bubble, isMine ? styles.bOut : styles.bIn]}
          onLongPress={() => {}}
        >
          {item.image ? (
            <Pressable onPress={() => setViewerUri(item.image!)}>
              <Image source={{ uri: item.image }} style={styles.img} />
            </Pressable>
          ) : (
            <AppText>{item.text}</AppText>
          )}
        </Pressable>
      </View>
    );
  };

  /* -------- UI -------- */
  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      {/* -------- custom header -------- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color="#2E7D32" />
        </TouchableOpacity>
        <AppText style={styles.headerTitle}>{title ?? 'Forum Topic ' + id}</AppText>
      </View>

      {/* -------- message list -------- */}
      <FlatList
        ref={listRef}
        data={msgs}
        renderItem={renderRow}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ paddingVertical: 8, paddingBottom: 80 }}
      />

      {/* -------- input row -------- */}
      <View style={styles.inRow}>
        <TextInput
          style={styles.input}
          placeholder="Write a message…"
          value={text}
          onChangeText={setText}
          onSubmitEditing={() => pushMsg({ text })}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={styles.sendBtn}
          onPress={() => pushMsg({ text })}
          disabled={!text.trim()}
        >
          <Ionicons name="send" size={16} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* -------- fullscreen image viewer -------- */}
      {viewerUri && <ImageViewer uri={viewerUri} onClose={() => setViewerUri(null)} />}
    </KeyboardAvoidingView>
  );
}

/* -------- styles -------- */
const GREEN = '#2E7D32',
  GRAY = '#F1F1F1',
  WHITE = '#FFF';

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: WHITE },

  /* header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#DDD',
  },
  backBtn: { marginRight: 6 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#222' },

  /* list rows */
  row: { flexDirection: 'row', paddingHorizontal: 12, marginVertical: 4 },
  rowRev: { flexDirection: 'row-reverse' },
  avatar: { width: 28, height: 28, borderRadius: 14, marginHorizontal: 6 },
  bubble: { maxWidth: '78%', padding: 10, borderRadius: 14 },
  bIn: { backgroundColor: GRAY, borderTopLeftRadius: 0 },
  bOut: { backgroundColor: '#C8E6C9', borderTopRightRadius: 0 },

  img: { width: 160, height: 100, borderRadius: 8 },

  /* input */
  inRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GRAY,
    borderRadius: 24,
    margin: 8,
    paddingHorizontal: 14,
  },
  input: { flex: 1, fontSize: 16, paddingVertical: 8 },
  sendBtn: {
    backgroundColor: GREEN,
    borderRadius: 20,
    padding: 10,
    marginLeft: 8,
  },
});
