import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
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
import random1 from '@/assets/avatars/rand1.jpg';

import { AppText } from '@/components/AppText';
import { useProfileQuery, useUpdateProfileMutation, useUploadPhotoMutation } from '@/components/profilehelper';



/* ------------------------------------------------------------------
   Constants
-------------------------------------------------------------------*/
const STATUS_TOP = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 8 : 16;
const RANDOM_POOL = [random1, /* random2, random3 */];
const INPUT_BG = '#E6F3E6';
const BACKDROP = '#EAF8E5';
const CARD_RAD = 16; 

/* ------------------------------------------------------------------
   Component
-------------------------------------------------------------------*/
export default function ProfileEditScreen() {
  /* ----------------------------- queries & mutations ----------------------------- */
  const { data: user, isLoading: profileLoading } = useProfileQuery();
  const updateProfile = useUpdateProfileMutation();
  const { mutateAsync: uploadPhoto, isPending: uploadPending } = useUploadPhotoMutation();

  /* ----------------------------- avatar ----------------------------- */
  const [avatarUri, setAvatarUri] = useState<string | null>(null); // server URL or local URI

  /* ----------------------------- profile ---------------------------- */
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [genderPrefilled, setGenderPrefilled] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  /* ----------------------------- farm ------------------------------- */
  const [farmName, setFarmName] = useState('');
  const [address, setAddress] = useState('');
  const [farmSize, setFarmSize] = useState('');
  const [crops, setCrops] = useState('');
  const [experience, setExperience] = useState('');
  const [about, setAbout] = useState('');

  /* ------ choose ONE placeholder for the life of the component ------ */
  const randomPlaceholder = useRef(
    RANDOM_POOL[Math.floor(Math.random() * RANDOM_POOL.length)],
  );

  /* ----------------------------- hydrate state ---------------------- */
  useEffect(() => {
    if (!user) return;

    // The API returns only a relative path for the avatar. Pre‑pend the server base if needed.
   
     const resolvedAvatar = user.user.profilePhoto ?
      user.user.profilePhoto
      : null;
    setAvatarUri(resolvedAvatar);

    if (user.user.gender) {
      setGender(user.user.gender);
      setGenderPrefilled(true);
    }

    setFirstName(user.user.firstName ?? '');
    setLastName(user.user.lastName ?? '');
    setEmail(user.user.email ?? '');
    setPhone(user.user.phone ? String(user.user.phone) : user.user.phone ?? '');

    setFarmName(user.user.farmName ?? '');
    setAddress(user.user.address ?? '');
    setFarmSize(String(user.user.farmSize ?? ''));
    setCrops(user.crops ?? '');
    setExperience(String(user.user.experience ?? ''));
    setAbout(user.user.aboutMe ?? '');
  }, [user]);

  const [avatarFailed, setAvatarFailed] = useState(false);

  

  /* ----------------------------- actions ---------------------------- */
  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (res.canceled) return; // user backed out

    const localUri = res.assets[0].uri;
    setAvatarUri(localUri); // quick local preview

    try {
      const remoteUrl = await uploadPhoto(localUri);
     
      setAvatarUri(remoteUrl); // swap to CDN URL
    } catch (err) {
      console.error('[Profile] Upload failed', err);

    }
  };

  const save = async () => {
    try {

      const payload = {
        firstName,
        lastName,
        gender,
        phone,
        address,
        farmName,
        farmSize: farmSize.trim() ? Number(farmSize) : undefined,
        // crops,
        experience: experience.trim() ? Number(experience) : undefined,
        aboutMe: about,
      } as const;



      await updateProfile.mutateAsync(payload);
      router.back();
    } catch (err) {
      console.warn('[Profile] failed to save', err);
    }
  };

  /* ----------------------------- render ----------------------------- */
  if (profileLoading) {
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
              <Image
                source={
                  avatarUri && !avatarFailed
                     ? { uri: avatarUri }
                    : randomPlaceholder.current
                }
                resizeMode='cover'
                onError={() => setAvatarFailed(true)}
                style={styles.avatar}
              />
            </TouchableOpacity>
            <AppText style={styles.changeText}>
              {uploadPending ? 'Uploading…' : 'Change photo'}
            </AppText>

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

            <AppText style={styles.label}>First Name</AppText>
            <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />

            <AppText style={styles.label}>Last Name</AppText>
            <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />


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
            <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={uploadPending}>
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
    // resizeMode: 'cover',
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
