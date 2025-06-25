/* app/(main)/community/chat.tsx
   --------------------------------------------------------------- */
import { AppText } from '@/components/AppText';
import ImageViewer from '@/components/ImageViewer';
import SwipeableRow from '@/components/SwipeableRow';
import { Feather, Ionicons } from '@expo/vector-icons';
import { launchImageLibraryAsync } from 'expo-image-picker';
import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Reanimated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';

/* ---------- demo helpers ---------- */
const you = 'You';
const avatar = (u: string) => `https://i.pravatar.cc/100?u=${u}`;
const now = Date.now();
type Reaction = { emoji: string; users: Set<string> };
type Msg = {
  id: string; sender: string; ts: number;
  text?: string; image?: string; replyTo?: Msg | null; reactions: Reaction[];
};
const mock: Msg[] = Array.from({ length: 20 }).map((_, i) => ({
  id: `${i + 1}`,
  sender: i % 3 === 0 ? you : i % 2 ? 'Alex' : 'Janith',
  ts: now - (20 - i) * 3600 * 1000,
  text: `Mock message #${i + 1}`,
  reactions: [],
}));

/* ---------- main component ---------- */
export default function CommunityChat() {
  const [msgs, setMsgs] = useState<Msg[]>(mock);
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<Msg | null>(null);
  const [pickerMsg, setPickerMsg] = useState<Msg | null>(null);
  const [viewerUri, setViewerUri] = useState<string | null>(null);
  console.log('viewerUri rendered', viewerUri)
  const listRef = useRef<FlatList<Msg>>(null);

  /* scroll to bottom on mount */
  useEffect(() => { requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true })); }, []);

  /* ---------- send helpers ---------- */
  const pushMsg = (m: Partial<Msg>) => {
    const newMsg: Msg = { id: Date.now().toString(), sender: you, ts: Date.now(), reactions: [], replyTo, ...m };
    setMsgs(prev => [...prev, newMsg]);
    setReplyTo(null);
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };
  const sendText = () => { if (text.trim()) pushMsg({ text: text.trim() }); setText(''); };
  const sendImage = async () => {

   const res = await launchImageLibraryAsync({
      mediaTypes: ['images'], 
      aspect: [4, 3],
      quality: 1,
});
    if (!res.canceled) pushMsg({ image: res.assets[0].uri });
  };

  /* ---------- reaction toggle ---------- */
  const toggleReaction = (msg: Msg, emoji: string) => {
    setMsgs(prev =>
      prev.map(m => {
        if (m.id !== msg.id) return m;
        const list = [...m.reactions];
        const idx = list.findIndex(r => r.emoji === emoji);
        const mine = you;
        if (idx === -1) list.push({ emoji, users: new Set([mine]) });
        else {
          const users = new Set(list[idx].users);
          users.has(mine) ? users.delete(mine) : users.add(mine);
          users.size ? (list[idx] = { emoji, users }) : list.splice(idx, 1);
        }
        return { ...m, reactions: list };
      }),
    );
  };

  /* ---------- date header helper ---------- */
  const dayLabel = (ts: number) => {
    const d = new Date(ts), t = new Date(), ONE = 864e5;
    const diff = Math.floor((t.setHours(0, 0, 0, 0) - d.setHours(0, 0, 0, 0)) / ONE);
    return diff === 0 ? 'Today' : diff === 1 ? 'Yesterday'
      : d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
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

  /* ---------- row renderer ---------- */
  const renderMsg = ({ item, index }: { item: Msg; index: number }) => {
    const prev = msgs[index - 1];
    const showDate = !prev || dayLabel(prev.ts) !== dayLabel(item.ts);
    const isMine = item.sender === you;

    return (
      <>
        {showDate && (
          <View style={styles.dateBar}>
            <AppText style={styles.dateTxt}>{dayLabel(item.ts)}</AppText>
          </View>
        )}

        <View style={[styles.row, isMine && styles.rowRev]}>
          {!isMine && <Image source={{ uri: avatar(item.sender) }} style={styles.avatar} />}

          {/* bubble wrapped with SwipeableRow for incoming msgs */}
          {isMine ? (
            <Bubble item={item} isMine    onImagePress={setViewerUri} />
          ) : (
            <SwipeableRow
              renderLeftActions={ReplySlide}
              onSwipeOpen={(dir) => dir === 'right' && setReplyTo(item)}
              threshold={50}
            >
              <Bubble
                item={item}
                isMine={false}
                onImagePress={ setViewerUri}
                onLongPress={() => setPickerMsg(item)}
                toggleReaction={toggleReaction}
              />
            </SwipeableRow>
          )}

          {!isMine && (
            <TouchableOpacity onPress={() => setPickerMsg(item)} style={styles.smileBtn}>
              <Feather name="smile" size={18} color="#888" />
            </TouchableOpacity>
          )}
        </View>
      </>
    );
  };

  /* ---------- emoji picker ---------- */
  const EMOJIS = ['👍', '❤️', '😂', '🙏', '🎉'];
  const EmojiPicker = () =>
    pickerMsg && (
      <View style={styles.picker}>
        {EMOJIS.map((e) => (
          <TouchableOpacity key={e} style={styles.pickerEmoji}
            onPress={() => { toggleReaction(pickerMsg, e); setPickerMsg(null); }}>
            <AppText style={{ fontSize: 20 }}>{e}</AppText>
          </TouchableOpacity>
        ))}
        <TouchableOpacity onPress={() => setPickerMsg(null)} style={styles.pickerClose}>
          <Feather name="x" size={16} color="#555" />
        </TouchableOpacity>
      </View>
    );

  /* ---------- UI ---------- */
  return (
    <KeyboardAvoidingView style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>

          <FlatList
            ref={listRef}
            data={msgs}
            renderItem={renderMsg}
            keyExtractor={(m) => m.id}
            onEndReachedThreshold={0.02}
            onEndReached={() => {/* load older here if real backend */ }}
            contentContainerStyle={{ paddingVertical: 8, paddingBottom: 90 }}
          />

          <EmojiPicker />

          {replyTo && (
            <View style={styles.replyBar}>
              <AppText numberOfLines={1} style={styles.replyTxt}>
                Replying to {replyTo.sender === you ? 'yourself' : replyTo.sender}:{' '}
                {replyTo.text ?? '📷 Image'}
              </AppText>
              <TouchableOpacity onPress={() => setReplyTo(null)}>
                <Feather name="x" size={18} color="#555" />
              </TouchableOpacity>
            </View>
          )}

          {/* input */}
          <View style={styles.inRow}>
            <TouchableOpacity onPress={sendImage} style={styles.clipBtn}>
              <Feather name="image" size={22} color="#2E7D32" />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Message…"
              value={text}
              onChangeText={setText}
              onSubmitEditing={sendText}
              returnKeyType="send"
            />
            <TouchableOpacity onPress={sendText} style={styles.sendBtn}>
              <Ionicons name="send" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* full‑screen preview */}
          {
            viewerUri && <ImageViewer uri={viewerUri} onClose={() => setViewerUri(null)} />
          }
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

/* ---------- bubble component (memoised) ---------- */
const Bubble = React.memo(function Bubble({
  item, isMine, onImagePress, onLongPress, toggleReaction,
}: {
  item: Msg; isMine: boolean;
  onImagePress?: (uri: string) => void;
  onLongPress?: () => void;
  toggleReaction?: (m: Msg, e: string) => void;
}) { 
  return (
    <View style={[styles.bubble, isMine ? styles.bOut : styles.bIn]}>
      {item.replyTo && (
        <AppText style={styles.replyTxtSmall}>
          Reply to {item.replyTo.sender === you ? 'You' : item.replyTo.sender}:{' '}
          {item.replyTo.text ?? '📷 Image'}
        </AppText>
      )}

      {item.image ? (
        <Pressable onPress={() => { onImagePress?.(item.image!)}}>
          <Image source={{ uri: item.image }} style={styles.img} />
        </Pressable>
      ) : (
        <AppText style={styles.msg}>{item.text}</AppText>
      )}

      <AppText style={styles.time}>
        {new Date(item.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </AppText>

      {item.reactions.length > 0 && (
        <View style={styles.reactRow}>
          {item.reactions.map((r) => (
            <TouchableOpacity key={r.emoji}
              onPress={() => toggleReaction?.(item, r.emoji)} style={styles.reactChip}>
              <AppText>{r.emoji}</AppText>
              <AppText style={styles.reactCount}>{r.users.size}</AppText>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
});

/* ---------- styles ---------- */
const GREEN = '#2E7D32', GRAY = '#F1F1F1', WHITE = '#FFF';
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: WHITE }, inner: { flex: 1, paddingHorizontal: 8 },
  row: { flexDirection: 'row', marginVertical: 4, alignItems: 'flex-end' },
  rowRev: { flexDirection: 'row-reverse' }, avatar: { width: 32, height: 32, borderRadius: 16, marginHorizontal: 6 },

  bubble: { maxWidth: '75%', padding: 10, borderRadius: 14 },
  bIn: { backgroundColor: GRAY, borderTopLeftRadius: 0 },
  bOut: { backgroundColor: '#C8E6C9', borderTopRightRadius: 0 },

  msg: { fontSize: 15, color: '#333' }, time: { fontSize: 10, color: '#666', marginTop: 4, alignSelf: 'flex-end' },
  reactRow: { flexDirection: 'row', marginTop: 6 },
  reactChip: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: WHITE,
    borderRadius: 12, paddingVertical: 2, paddingHorizontal: 6, marginRight: 4
  },
  reactCount: { fontSize: 11, marginLeft: 4 },

  smileBtn: { padding: 6 }, img: { width: 160, height: 100, borderRadius: 8 },

  dateBar: { alignItems: 'center', marginVertical: 8 },
  dateTxt: {
    fontSize: 12, color: '#666', backgroundColor: '#E0E0E0', paddingHorizontal: 12,
    paddingVertical: 2, borderRadius: 10
  },

  replyTxtSmall: {
    fontSize: 11, color: '#555', marginBottom: 4, borderLeftWidth: 2,
    borderLeftColor: GREEN, paddingLeft: 6
  },

  replyBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: GRAY,
    marginHorizontal: 4, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6
  },
  replyTxt: { flex: 1, fontSize: 13, color: '#333' },

  inRow: {
    flexDirection: 'row', alignItems: 'center', margin: 4, backgroundColor: GRAY,
    borderRadius: 20, paddingHorizontal: 10
  },
  clipBtn: { padding: 6 }, input: { flex: 1, fontSize: 16, paddingVertical: 6 },
  sendBtn: { backgroundColor: GREEN, borderRadius: 18, padding: 8, marginLeft: 6 },

  picker: {
    position: 'absolute', bottom: 80, alignSelf: 'center', flexDirection: 'row',
    backgroundColor: WHITE, borderRadius: 24, paddingVertical: 8, paddingHorizontal: 12,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 4
  },
  pickerEmoji: { padding: 6 }, pickerClose: { padding: 6, marginLeft: 4 },

  replySlide: {
    width: 60, height: '100%', backgroundColor: GREEN,
    justifyContent: 'center', alignItems: 'center'
  },
});
