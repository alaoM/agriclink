import Slider from '@react-native-community/slider';
import { router } from 'expo-router';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import * as Yup from 'yup';



import femaleAvatar from '@/assets/avatars/female.png';
import maleAvatar from '@/assets/avatars/male.png';
import { default as random1 } from '@/assets/avatars/rand1.jpg';
import { AppText } from '@/components/AppText';
import { TwoFAMethodSelector } from '@/components/TwoFAMethodSelector';
import TwoFAModal from '@/components/TwoFAModal';
import { useAuth } from '@/contexts/AuthContext';
import { FontScaleContext } from '@/contexts/FontScaleContext';
import { useEnable2FA } from '@/hooks/useEnable2FA';
import { usePushPreference } from '@/hooks/usePush';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useProfileQuery } from '../../components/profilehelper';

const RANDOM_POOL = [femaleAvatar, maleAvatar, random1];
const API_BASE = process.env.EXPO_PUBLIC_API_BASE;

// Schema
const passwordSchema = Yup.object().shape({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword: Yup.string()
    .required('New password is required')
    .min(8, 'Min 8 characters')
    .matches(/[a-z]/, 'Need a lowercase letter')
    .matches(/[A-Z]/, 'Need an uppercase letter')
    .matches(/\d/, 'Need a number')
    .matches(/[^a-zA-Z0-9]/, 'Include a special character')
    .notOneOf(
      [Yup.ref('currentPassword')],
      'New password must be different from current password',
    ),
  confirmPassword: Yup.string()
    .required('Confirm password is required')
    .oneOf([Yup.ref('newPassword')], 'Passwords must match'),
});

export default function SettingsScreen() {
  const { token, signOut } = useAuth()
  const { data: user, isLoading: profileLoading } = useProfileQuery();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(passwordSchema),

  });

 
  const { scale, setScale } = useContext(FontScaleContext);
  const randomPlaceholder = useRef(
    RANDOM_POOL[Math.floor(Math.random() * RANDOM_POOL.length)],
  );
  const [avatarFailed, setAvatarFailed] = useState(false);

  const current2FAMethod = user?.user.twoFactorMethod as 'email' | 'authenticator';
  const isAlreadyEnabled = user?.user.twoFactorEnabled;

  const [avatarUri, setAvatarUri] = useState<string | null>(null); // server URL or local URI
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [isChanging, setIsChanging] = useState(false);

  const [show2FA, setShow2FA] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);


  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);






  const onSubmit = (values: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    changePassword.mutate({ currentPassword: values.currentPassword, newPassword: values.newPassword });
  };



  // Mutation hook


const changePassword = useMutation({
  mutationFn: async ({
    currentPassword,
    newPassword,
  }: {
    currentPassword: string;
    newPassword: string;
  }) => {
    setIsChanging(true);

    try {
      const response = await axios.post(
        `${API_BASE}/api/auth/change-password`,
        { currentPassword, newPassword },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Password change failed');
    }
  },
  onSuccess: () => {
    Alert.alert('Success', 'Password changed successfully.');
    reset();
    setIsChanging(false);
    signOut()
  },
  onError: (error: any) => {
    setIsChanging(false);
    Alert.alert('Error', error.message || 'Current password is incorrect or request failed.');
  },
});





  useEffect(() => {
    if (!user) return;

    const resolvedAvatar = user.user.profilePhoto ?
      user.user.profilePhoto
      : null;
    setAvatarUri(resolvedAvatar);
    setFirstName(user.user.firstName ?? '');
    setLastName(user.user.lastName ?? '');
    setEmail(user.user.email ?? '');


  }, [user]);

  /*  const toggleNotifications = async (value) => {
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
   }; */
  const { enabled: notificationsEnabled, toggle: toggleNotifications, loading: notifBusy } =
    usePushPreference(user?.user.notificationsEnabled);

  // ▼▼ 2FA state
  /* ---------- 2FA state ---------- */
  const [selectedMethod, setSelectedMethod] =
    useState<'email' | 'authenticator'>('email');
  const [modalVisible, setModalVisible] = useState(false);
  const [authData, setAuthData] = useState<{ qrCode?: string; secret?: string }>(
    {},
  );

  /* ---------- react-query mutation (no params) ---------- */
  const enable2FA = useEnable2FA();

  /* ---------- helper ---------- */
  const startSetup = () => {
    enable2FA.mutate(selectedMethod, {
      onSuccess: (data) => {
        // email ⇒ { message }, authenticator ⇒ { qrCode, secret }
        if (selectedMethod === 'authenticator') {
          setAuthData({ qrCode: data.qrCode, secret: data.secret });
        } else {
          setAuthData({});
        }
        setModalVisible(true); // open pop-up
      },
      onError: () =>
        Alert.alert('2FA Error', 'Unable to start two-factor setup.'),
    });
  };

  if (profileLoading) {
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
                  avatarUri && !avatarFailed
                    ? { uri: avatarUri }
                    : randomPlaceholder.current
                }
                resizeMode='cover'
                onError={() => setAvatarFailed(true)}
                style={styles.avatar}
              />
            </View>
            <AppText style={styles.name}>{firstName} {lastName}</AppText>
            <AppText style={styles.email}>{email}</AppText>
            {/* <AppText style={styles.phone}>{phone}</AppText> */}
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
              disabled={notifBusy}
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

          {/* --- 2FA Section --- */}
          <TouchableOpacity
            onPress={() => setShow2FA(prev => !prev)}
            style={styles.sectionToggle}
          >
            <AppText style={styles.label}>Two-Factor Authentication</AppText>
            <Ionicons name={show2FA ? 'chevron-up' : 'chevron-down'} size={20} />
          </TouchableOpacity>

          {show2FA && (
            <>
              <View style={{ marginTop: 14 }}>
                <TwoFAMethodSelector
                  currentMethod={selectedMethod}
                  onSelect={setSelectedMethod}
                />
              </View>

              <AppText style={{ textAlign: "right", fontSize: 12, color: isAlreadyEnabled ? '#4CAF50' : '#D32F2F' }}>
                {isAlreadyEnabled
                  ? `Enabled via ${current2FAMethod}`
                  : 'Currently disabled'}
              </AppText>

              <TouchableOpacity
                style={[styles.button, { marginTop: 12 }]}
                onPress={startSetup}
                disabled={enable2FA.isPending}
              >
                <AppText style={styles.buttonText}>
                  {enable2FA.isPending ? 'Starting…' : 'Set up 2FA'}
                </AppText>
              </TouchableOpacity>
            </>
          )}

          {/* --- Change Password Section --- */}
          <TouchableOpacity
            onPress={() => setShowChangePassword(prev => !prev)}
            style={[styles.sectionToggle, { marginTop: 20 }]}
          >
            <AppText style={styles.label}>Change Password</AppText>
            <Ionicons name={showChangePassword ? 'chevron-up' : 'chevron-down'} size={20} />
          </TouchableOpacity>

          {showChangePassword && (
            <>
              <Controller
                control={control}
                name="currentPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <TextInput
                      placeholder="Current Password"
                      secureTextEntry={!showCurrentPassword}
                      style={styles.input}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}

                    />
                    <TouchableOpacity
                      style={{ position: 'absolute', right: 16, top: 22 }}
                      onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      <Ionicons
                        name={showCurrentPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color="#999"
                      />
                    </TouchableOpacity>
                    {errors.currentPassword && (
                      <AppText style={{ color: 'red', marginTop: 4 }}>
                        {errors.currentPassword.message}
                      </AppText>
                    )}
                  </View>
                )}
              />

              <Controller
                control={control}
                name="newPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <TextInput
                      placeholder="New Password"
                      secureTextEntry={!showNewPassword}
                      style={styles.input}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                    <TouchableOpacity
                      style={{ position: 'absolute', right: 16, top: 22 }}
                      onPress={() => setShowNewPassword(!showNewPassword)}
                    >
                      <Ionicons
                        name={showNewPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color="#999"
                      />
                    </TouchableOpacity>
                    {errors.newPassword && (
                      <AppText style={{ color: 'red', marginTop: 4 }}>
                        {errors.newPassword.message}
                      </AppText>
                    )}
                  </View>
                )}
              />
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <TextInput
                      placeholder="Confirm New Password"
                      secureTextEntry={!showNewPassword}
                      style={styles.input}

                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                    {errors.confirmPassword && (
                      <AppText style={{ color: 'red', marginTop: 4 }}>
                        {errors.confirmPassword.message}
                      </AppText>
                    )}
                  </View>
                )}
              />


              <TouchableOpacity
                style={[styles.button, { marginTop: 12 }]}
                onPress={handleSubmit(onSubmit)}
                disabled={isChanging}
              >
                <AppText style={styles.buttonText}>
                  {isChanging ? 'Updating…' : 'Change Password'}
                </AppText>
              </TouchableOpacity>
            </>
          )}


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
            signOut()
            router.replace('/login');
          }}
        >
          <AppText style={styles.logoutText}>Log Out</AppText>
        </TouchableOpacity>
      </ScrollView>
      {/* Modal */}
      <TwoFAModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        method={selectedMethod}
        qrCode={authData.qrCode}
        secret={authData.secret}
      />
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
    // resizeMode: 'cover',
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
  input: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    borderColor: '#DDD',
    borderWidth: 1,
    fontSize: 14,
  },
  sectionToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },


});
