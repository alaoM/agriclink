import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';


/* ------------------------------------------------------
   Local fallback avatars (adjust paths or alias to taste)
---------------------------------------------------------*/
import femaleAvatar from '@/assets/avatars/female.png';
import maleAvatar from '@/assets/avatars/male.png';
import { default as random1, default as random2, default as random3 } from '@/assets/avatars/rand1.jpg';
import { AppText } from '@/components/AppText';

const STATUS_TOP = Platform.OS === 'android'
  ? (StatusBar.currentHeight ?? 24) + 8
  : 16;

const RANDOM_POOL = [random1, random2, random3];

export default function ProfileEditScreen() {
  /* ----------------------------- avatar ----------------------------- */
  const [avatarUri, setAvatarUri] = useState(null);     // uri string from backend or picker

  /* ----------------------------- profile ---------------------------- */
  const [gender, setGender] = useState(null);           // 'male' | 'female' | null
  const [genderPrefilled, setGenderPrefilled] = useState(false);
  const [name, setName]     = useState('');
  const [email, setEmail]   = useState('');
  const [phone, setPhone]   = useState('');

  /* ----------------------------- farm ------------------------------- */
  const [farmName,   setFarmName]   = useState('');
  const [address,    setAddress]    = useState('');
  const [farmSize,   setFarmSize]   = useState('');
  const [crops,      setCrops]      = useState('');
  const [experience, setExperience] = useState('');
  const [about,      setAbout]      = useState('');

  /* ----------------------------- ui state --------------------------- */
  const [loading, setLoading] = useState(true);

  /** Fetch profile on mount */
  useEffect(() => {
    (async () => {
      try {
        // 👉 Replace with your real endpoint / SDK call
        const res  = await fetch('https://api.example.com/profile');
        const data = await res.json();

        /* ---- hydrate state from backend ---- */
        if (data.avatar)  setAvatarUri(data.avatar);
        if (data.gender) {
          setGender(data.gender);
          setGenderPrefilled(true);
        }

        setName(data.name ?? '');
        setEmail(data.email ?? '');
        setPhone(data.phone ?? '');

        setFarmName(data.farmName ?? '');
        setAddress(data.address ?? '');
        setFarmSize(String(data.farmSize ?? ''));
        setCrops(data.crops ?? '');
        setExperience(String(data.experience ?? ''));
        setAbout(data.about ?? '');
      } catch (err) {
        console.warn('[Profile] failed to load', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ------ choose ONE placeholder for the life of the component ------ */
  const randomPlaceholder = useRef(
    RANDOM_POOL[Math.floor(Math.random() * RANDOM_POOL.length)],
  );

  /** Decide which image <Image/> will finally render
   * 1. backend or user‑picked photo
   * 2. gender default (male/female)
   * 3. fixed random placeholder
   */
  const avatarSource = useMemo(() => {
    if (avatarUri) {
      return { uri: avatarUri };
    }
    if (gender === 'male')   return maleAvatar;
    if (gender === 'female') return femaleAvatar;
    return randomPlaceholder.current; // local asset -> no {uri}
  }, [avatarUri, gender]);

  /* ----------------------------- actions ---------------------------- */

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
    });
    if (!res.canceled) {
      setAvatarUri(res.assets[0].uri);
    }
  };

  const save = async () => {
    const payload = {
      avatar: avatarUri,
      gender,
      name,
      email,
      phone,
      farmName,
      address,
      farmSize,
      crops,
      experience,
      about,
    };

    try {
      // 👉 Replace with your real PUT/PATCH call
      await fetch('https://api.example.com/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      router.back();
    } catch (err) {
      console.warn('[Profile] failed to save', err);
    }
  };

  /* ----------------------------- render ----------------------------- */

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={[styles.flex1, styles.center]}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex1}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.card}>
            {/* ---------- Avatar ---------- */}
            <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper}>
              <Image source={avatarSource} style={styles.avatar} />
            </TouchableOpacity>
            <AppText style={styles.changeText}>Change photo</AppText>

            {/* ---------- Gender selector ---------- */}
            <View style={styles.genderRow}>
              <TouchableOpacity
                style={[styles.genderBtn, gender === 'male' && styles.genderBtnActive]}
                onPress={() => {
                  if (!genderPrefilled || gender === 'male') setGender('male');
                }}
              >
                <AppText
                  style={[styles.genderText, gender === 'male' && styles.genderTextActive]}
                >
                  Male
                </AppText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.genderBtn, gender === 'female' && styles.genderBtnActive]}
                onPress={() => {
                  if (!genderPrefilled || gender === 'female') setGender('female');
                }}
              >
                <AppText
                  style={[styles.genderText, gender === 'female' && styles.genderTextActive]}
                >
                  Female
                </AppText>
              </TouchableOpacity>
            </View>

            {/* ---------- Personal Details ---------- */}
            <AppText style={styles.section}>Personal Details</AppText>

            <AppText style={styles.label}>Full Name</AppText>
            <TextInput style={styles.input} value={name} onChangeText={setName} />

            <AppText style={styles.label}>Email</AppText>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <AppText style={styles.label}>Phone</AppText>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            {/* ---------- Farm Information ---------- */}
            <AppText style={styles.section}>Farm Information</AppText>

            <AppText style={styles.label}>Farm Name</AppText>
            <TextInput style={styles.input} value={farmName} onChangeText={setFarmName} />

            <AppText style={styles.label}>Farm Location / Address</AppText>
            <TextInput
              style={[styles.input, styles.multiline]}
              value={address}
              onChangeText={setAddress}
              multiline
            />

            <AppText style={styles.label}>Farm Size (hectares)</AppText>
            <TextInput
              style={styles.input}
              value={farmSize}
              onChangeText={setFarmSize}
              keyboardType="numeric"
            />

            <AppText style={styles.label}>Primary Crops</AppText>
            <TextInput
              style={styles.input}
              value={crops}
              onChangeText={setCrops}
              placeholder="e.g. Maize, Cassava"
            />

            <AppText style={styles.label}>Years of Experience</AppText>
            <TextInput
              style={styles.input}
              value={experience}
              onChangeText={setExperience}
              keyboardType="numeric"
            />

            <AppText style={styles.label}>About Farmer (optional)</AppText>
            <TextInput
              style={[styles.input, styles.multiline]}
              value={about}
              onChangeText={setAbout}
              multiline
              numberOfLines={4}
              placeholder="Tell us a bit about your farming journey…"
            />

            {/* ---------- Save ---------- */}
            <TouchableOpacity style={styles.saveBtn} onPress={save}>
              <AppText style={styles.saveText}>Save Changes</AppText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
            {/* Back floating button */}
      <TouchableOpacity style={styles.fab} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

/* ------------------------------------------------------------------ */
/* Styles */
/* ------------------------------------------------------------------ */

const INPUT_BG = '#E6F3E6';
const BACKDROP = '#EAF8E5';
const CARD_RAD = 16;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BACKDROP },
  flex1: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: CARD_RAD,
    padding: 20,
  },

  /* ---------- avatar ---------- */
  avatarWrapper: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 52,
    padding: 2,
    overflow: 'hidden',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    resizeMode: 'cover',
  },
  changeText: {
    marginBottom: 16,
    textAlign: 'center',
    color: '#2E7D32',
  },

  /* ---------- gender ---------- */
  genderRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  genderBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    marginHorizontal: 8,
  },
  genderBtnActive: {
    backgroundColor: '#C8E6C9',
    borderColor: '#4CAF50',
  },
  genderText: {
    fontSize: 14,
    color: '#444',
  },
  genderTextActive: {
    color: '#1B5E20',
    fontWeight: '700',
  },

  /* ---------- typography / inputs ---------- */
  section: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 8,
    color: '#1B5E20',
  },
  label: { fontSize: 14, marginBottom: 4, color: '#444' },
  input: {
    height: 48,
    backgroundColor: INPUT_BG,
    borderRadius: 6,
    paddingHorizontal: 14,
    fontSize: 16,
    marginBottom: 8,
  },
  multiline: { textAlignVertical: 'top' },
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

  /* ---------- save button ---------- */
  saveBtn: {
    marginTop: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
