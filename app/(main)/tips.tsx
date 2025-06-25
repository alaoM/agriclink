import { router } from 'expo-router';
import { useMemo } from 'react';
import { Image, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';

import tipsJson from '@/assets/data/farmer_daily_tips.json';
import guidesJson from '@/assets/data/farmer_how_to_guides.json';
import { AppText } from '@/components/AppText';

// ───────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────
const STATUS_TOP = Platform.OS === 'android'
  ? (StatusBar.currentHeight ?? 24) + 8 // 8‑px extra spacing on Android
  : 16;

/**
 * Deterministically pick `count` items per calendar‑day
 * using a tiny seeded pseudo‑random shuffle.
 */
function getDailySelection(array: [], count: any) {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  let value = seed;
  const random = () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
  const clone = array.slice();
  for (let i = clone.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone.slice(0, count);
}

// ───────────────────────────────────────────────────
// Tips Screen Component
// ───────────────────────────────────────────────────
export default function TipsScreen() {
  // Pick 5 tips and 10 guides for the current day
  const tipsToday = useMemo(() => getDailySelection(tipsJson, 5), []);
  const guidesToday = useMemo(() => getDailySelection(guidesJson, 10), []);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Daily Tips */}
        <AppText style={styles.heading}>Daily Tips</AppText>
        {tipsToday.map((tip: any) => (
          <View key={tip.id} style={styles.card}>
            <AppText style={styles.title}>{tip.title}</AppText>
            <AppText style={styles.description}>{tip.body}</AppText>
          </View>
        ))}

        {/* How‑To Guides */}
        <AppText style={styles.heading}>How‑To Guides</AppText>
        {guidesToday.map((guide: any) => (
          <TouchableOpacity
            key={guide.id}
            style={styles.guideCard}
            onPress={() => router.push(`/guide/${guide.id}`)}
          >
            <Image
              source={{
                uri: `https://source.unsplash.com/seed/${guide.id}/150x150?${encodeURIComponent(
                  guide.category
                )}`,
              }}
              style={styles.guideImage}
            />
            <View style={styles.guideText}>
              <AppText style={styles.title}>{guide.title}</AppText>
              {/* Using the summary field for a short preview */}
              <AppText style={styles.description}>{guide.summary}</AppText>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// ───────────────────────────────────────────────────
// Styles
// ───────────────────────────────────────────────────
const CARD_RAD = 16;
const BACKDROP = '#fff';

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BACKDROP, paddingTop: STATUS_TOP },
  scroll: { flexGrow: 1, padding: 16, paddingBottom: 60 },
  heading: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  card: {
    backgroundColor: '#EAF8E5',
    borderWidth: 1,
    borderColor: '#D1EFD1',
    borderRadius: CARD_RAD,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 2,
  },
  guideCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  guideImage: { width: 60, height: 60, borderRadius: 8, marginRight: 16 },
  guideText: { flex: 1 },
  title: { fontSize: 16, fontWeight: '700' },
  description: { fontSize: 14, color: '#666', marginTop: 6 },
});
