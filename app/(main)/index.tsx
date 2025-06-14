import maleAvatar from '@/assets/avatars/male.png';
import dailyTips from '@/assets/data/farmer_daily_tips.json';
import { AppText } from '@/components/AppText';
import { Feather, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Image,
  Keyboard,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';


/* ----- constants ----- */
const STATUS_TOP = Platform.OS === 'android'
  ? (StatusBar.currentHeight ?? 24) + 8
  : 16;
const user = { name: 'Janith', avatar: maleAvatar };



export default function WelcomeScreen() {
  const [query, setQuery] = useState('');
  const randomTip = useMemo(
    () => dailyTips[Math.floor(Math.random() * dailyTips.length)],
    [],
  );

  function submitSearch() {
    if (!query.trim()) return;
    Keyboard.dismiss();
    router.push(`/search?query=${encodeURIComponent(query.trim())}`);
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        {/* ---------- Header Row ---------- */}
        <View style={styles.headerRow}>
          <Image source={user.avatar} style={styles.avatar} />
          <View style={styles.greetingCol}>
            <AppText style={styles.greeting}>Hello {user.name},</AppText>
            <AppText style={styles.welcome}>Welcome!</AppText>
          </View>
        </View>

        {/* ---------- Daily Tip ---------- */}
        <View style={styles.tipCard}>
          <AppText style={styles.tipTitle}>Daily Tip</AppText>
          <AppText style={styles.tipBody}>{randomTip.body}</AppText>
        </View>

        {/* ---------- Search ---------- */}
        <View style={styles.searchBox}>
          <Feather name="search" size={18} color="#777" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search anything…"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={submitSearch}
            returnKeyType="search"
          />
        </View>

        {/* ---------- Quick Links ---------- */}
        <AppText style={styles.section}>Quick Links</AppText>
        <View style={styles.grid}>
          {links.map((item) => (
            <TouchableOpacity
              key={item.title}
              style={styles.card}
              onPress={() => router.push(item.path)}
            >
              {item.icon}
              <AppText style={styles.cardTitle}>{item.title}</AppText>
              <AppText style={styles.cardDesc}>{item.desc}</AppText>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ----- Quick‑link data ----- */
const links = [
  { title: 'News', path: '/news', desc: 'Latest agri news', icon: <Feather name="book-open" size={26} color="#2E7D32" /> },
  { title: 'Weather', path: '/weather', desc: 'Forecast & alerts', icon: <MaterialCommunityIcons
              name="weather-partly-cloudy" size={26} color="#2E7D32" /> },
  { title: 'Market Prices', path: '/market', desc: 'Crop price updates', icon: <MaterialIcons name="price-change" size={26} color="#2E7D32" /> },
  { title: 'Farming Tips', path: '/tips', desc: 'Daily tips & guides', icon: <MaterialCommunityIcons name="lightbulb" size={26} color="#2E7D32" /> },
  { title: 'Task Manager', path: '/tasks', desc: 'Your to‑dos', icon: <Feather name="check-circle" size={26} color="#2E7D32" /> },
  { title: 'Community', path: '/community', desc: 'Chat & forum', icon: <Feather name="users" size={26} color="#2E7D32" /> },
];

/* ----- Styles ----- */
const BACKDROP = '#EAF8E5';
const CARD_BG  = '#FFF';

const styles = StyleSheet.create({
  screen:    { flex: 1, backgroundColor: BACKDROP, paddingTop: STATUS_TOP },
  container: { padding: 24, paddingBottom: 80 },

  /* header row */
  headerRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar:      { width: 72, height: 72, borderRadius: 36, marginRight: 16 },
  greetingCol: {},
  greeting:    { fontSize: 20, fontWeight: '700', color: '#1B5E20' },
  welcome:     { fontSize: 15, color: '#1B5E20' },

  /* tip card */
  tipCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tipTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6, color: '#2E7D32' },
  tipBody:  { fontSize: 14, color: '#555' },

  /* search */
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 48,
    marginBottom: 24,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15 },

  section: { fontSize: 18, fontWeight: '700', marginBottom: 12, color: '#1B5E20' },

  /* grid */
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: '48%',
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  
  },
  cardTitle: { fontSize: 15, fontWeight: '700', marginTop: 12, color: '#1B5E20' },
  cardDesc:  { fontSize: 12, color: '#555', marginTop: 4, textAlign: 'center' },
});
