import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import {
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import guidesJson from '@/assets/data/farmer_how_to_guides.json';
import { AppText } from '@/components/AppText';

/* ────────────────────────────────────────────────────────
   Guide Detail Screen  (/guide/[id])
   Displays a single how‑to guide with full content
──────────────────────────────────────────────────────── */

const STATUS_TOP = Platform.OS === 'android'
  ? (StatusBar.currentHeight ?? 24) + 8
  : 16;

export default function GuideDetailScreen() {
  const { id } = useLocalSearchParams();
  const numericId = Number(id);

  // Find guide by id
  const guide = useMemo(
    () => guidesJson.find((g) => g.id === numericId),
    [numericId]
  );

  if (!guide) {
    return (
      <SafeAreaView style={styles.centered}>
        <AppText style={styles.notFound}>Guide not found.</AppText>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <AppText style={styles.backText}>Go Back</AppText>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <Image
          source={{
            uri: `https://source.unsplash.com/seed/${guide.id}/600x400?${encodeURIComponent(
              guide.category
            )}`,
          }}
          style={styles.hero}
        />

        {/* Title & Category */}
        <AppText style={styles.category}>{guide.category}</AppText>
        <AppText style={styles.title}>{guide.title}</AppText>
        <AppText style={styles.summary}>{guide.summary}</AppText>

        {/* Steps */}
        <AppText style={styles.sectionHeading}>Steps</AppText>
        {guide.steps.map((step, index) => (
          <View key={index} style={styles.stepRow}>
            <AppText style={styles.stepIndex}>{index + 1}</AppText>
            <AppText style={styles.stepText}>{step}</AppText>
          </View>
        ))}

        {/* Tips */}
        <AppText style={styles.sectionHeading}>Pro Tips</AppText>
        {guide.tips.map((tip, idx) => (
          <View key={idx} style={styles.tipRow}>
            <Ionicons name="bulb" size={18} color="#4C794C" style={{ marginRight: 8 }} />
            <AppText style={styles.tipText}>{tip}</AppText>
          </View>
        ))}
      </ScrollView>

      {/* Back floating button */}
      <TouchableOpacity style={styles.fab} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

/* ────────────────────────────────────────────────────────
   Styles
──────────────────────────────────────────────────────── */
const CARD_RAD = 16;
const BACKDROP = '#fff';

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BACKDROP, paddingTop: STATUS_TOP },
  scroll: { padding: 16, paddingBottom: 80 },
  hero: {
    width: '100%',
    height: 200,
    borderRadius: CARD_RAD,
    marginBottom: 16,
  },
  category: { fontSize: 14, fontWeight: '600', color: '#4C794C', marginBottom: 4 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12, color: '#222' },
  summary: { fontSize: 16, color: '#555', marginBottom: 20, lineHeight: 22 },
  sectionHeading: { fontSize: 18, fontWeight: '700', marginVertical: 12, color: '#222' },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  stepIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EAF8E5',
    textAlign: 'center',
    textAlignVertical: 'center',
    marginRight: 8,
    fontWeight: '700',
    color: '#4C794C',
  },
  stepText: { flex: 1, fontSize: 15, color: '#444', lineHeight: 22 },
  tipRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  tipText: { flex: 1, fontSize: 15, color: '#444', lineHeight: 22 },
  fab: {
    position: 'absolute',
    top: STATUS_TOP + 8,
    left: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4C794C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFound: { fontSize: 18, marginBottom: 20 },
  backBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#4C794C',
    borderRadius: CARD_RAD,
  },
  backText: { color: '#fff', fontSize: 16 },
});
