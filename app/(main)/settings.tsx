import Slider from '@react-native-community/slider';
import { router } from 'expo-router';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';

import femaleAvatar from '@/assets/avatars/female.png';
import maleAvatar from '@/assets/avatars/male.png';
import { default as random1, default as random2, default as random3 } from '@/assets/avatars/rand1.jpg';
import { AppText } from '@/components/AppText';
import { FontScaleContext } from '@/contexts/FontScaleContext';

const RANDOM_POOL = [femaleAvatar, maleAvatar, random1, random2, random3];

export default function SettingsScreen() {
  const { scale, setScale } = useContext(FontScaleContext);
  const randomPlaceholder = useRef(
    RANDOM_POOL[Math.floor(Math.random() * RANDOM_POOL.length)],
  );
  const [avatarFailed, setAvatarFailed] = useState(false);

  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [user, setUser] = useState({
    avatar: null,
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('https://api.example.com/settings');
        const data = await res.json();

        setNotificationsEnabled(Boolean(data.notificationsEnabled));
        setTwoFAEnabled(Boolean(data.twoFAEnabled));
        setUser({
          avatar: data.avatar || null,
          name: data.name,
          email: data.email,
          phone: data.phone,
        });
      } catch (err) {
        console.warn('[Settings] failed to load', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleNotifications = async (value) => {
    setNotificationsEnabled(value);
    try {
      await fetch('https://api.example.com/settings/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: value }),
      });
    } catch (err) {
      console.warn('[Settings] notifications update failed', err);
    }
  };

  const toggleTwoFA = async (value) => {
    if (value) {
      router.push('/setup-2fa');
      return;
    }

    setTwoFAEnabled(false);
    try {
      await fetch('https://api.example.com/settings/2fa', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: false }),
      });
    } catch (err) {
      console.warn('[Settings] 2FA disable failed', err);
      setTwoFAEnabled(true);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Profile */}
        <AppText style={styles.sectionHeader}>Profile</AppText>
        <View style={styles.card}>
          <View style={styles.profileCenter}>
            <View style={styles.avatarWrapper}>
              <Image
                source={
                  user.avatar && !avatarFailed
                    ? { uri: user.avatar }
                    : randomPlaceholder.current
                }
                onError={() => setAvatarFailed(true)}
                style={styles.avatar}
              />
            </View>
            <AppText style={styles.name}>{user.name}</AppText>
            <AppText style={styles.email}>{user.email}</AppText>
            <AppText style={styles.phone}>{user.phone}</AppText>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/profile-edit')}
          >
            <AppText style={styles.buttonText}>Edit Profile</AppText>
          </TouchableOpacity>
        </View>

        {/* Preferences */}
        <AppText style={styles.sectionHeader}>Preferences</AppText>
        <View style={styles.card}>
          <View style={styles.row}>
            <AppText style={styles.label}>Notifications</AppText>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
            />
          </View>
            <View style={[styles.row, { marginTop: 16 }]}>
            <AppText style={styles.label}>Font size</AppText>
          </View>
          <Slider 
            minimumValue={0.8}
            maximumValue={1.4}
            step={0.05}
            value={scale}
            onValueChange={setScale}
          />
          <AppText style={styles.smallCenter}>{`${Math.round(
            scale * 100,
          )}%`}</AppText>
        </View>

        {/* Security */}
        <AppText style={styles.sectionHeader}>Security</AppText>
        <View style={styles.card}>
          <View style={styles.row}>
            <AppText style={styles.label}>Two‑Factor Authentication</AppText>
            <Switch value={twoFAEnabled} onValueChange={toggleTwoFA} />
          </View>
        </View>

        {/* Support */}
        <AppText style={styles.sectionHeader}>Support</AppText>
        <View style={styles.card}>
          <TouchableOpacity style={styles.link}>
            <AppText style={styles.linkText}>Help Center</AppText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.link}>
            <AppText style={styles.linkText}>Report a Problem</AppText>
          </TouchableOpacity>
        </View>

        {/* Legal */}
        <AppText style={styles.sectionHeader}>Legal</AppText>
        <View style={styles.card}>
          <TouchableOpacity style={styles.link}>
            <AppText style={styles.linkText}>Terms of Service</AppText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.link}>
            <AppText style={styles.linkText}>Privacy Policy</AppText>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            // TODO: implement logout
          }}
        >
          <AppText style={styles.logoutText}>Log Out</AppText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ------------------------------------------------------------------ */
/* Styles */
/* ------------------------------------------------------------------ */

const BACKDROP = '#EAF8E5';
const CARD_BG = '#FFF';

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BACKDROP },
  container: { padding: 20, paddingBottom: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  sectionHeader: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
    color: '#2E7D32',
  },

  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  profileCenter: {
    alignItems: 'center',
    marginBottom: 12,
  },

  avatarWrapper: {
    width: 104,
    height: 104,
    borderRadius: 52,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#ccc',
    marginBottom: 10,
  },

  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 52,
    resizeMode: 'cover',
  },

  name: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  email: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginTop: 2,
  },
  phone: {
    fontSize: 14,
    color: '#444',
    textAlign: 'center',
    marginTop: 2,
  },

  label: {
    fontSize: 14,
    color: '#444',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },

  button: {
    marginTop: 16,
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },

  link: {
    paddingVertical: 12,
    borderBottomColor: '#EEE',
    borderBottomWidth: 1,
  },
  linkText: {
    fontSize: 16,
    color: '#2E7D32',
  },
  smallCenter: { textAlign: 'right', fontSize: 12, marginTop: 4 },


  logoutButton: {
    marginTop: 24,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    borderRadius: 10,
  },
  logoutText: {
    color: '#D32F2F',
    fontSize: 16,
    fontWeight: '700',
  },
});
