import { AppText } from '@/components/AppText';
import { useAuth } from '@/contexts/AuthContext';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import LottieView from 'lottie-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

/* ------------------------------------------------------------------
   Constants & helpers
-------------------------------------------------------------------*/
const STATUS_TOP = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 8 : 16;
const INITIAL_COORDS = { latitude: 6.5, longitude: 3.3 }; // Lagos fallback
const API_BASE = process.env.EXPO_PUBLIC_API_BASE;

async function fetchWeatherByCoords(token: string, lat: number, lon: number) {


  const r = await fetch(`${API_BASE}/api/weather/coordinates?lat=${lat}&lon=${lon}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) throw new Error('Network response was not ok');
  return await r.json();
}

/* Map backend → UI data shape */
function mapApi(api: any) {
  const today = api.forecast?.[0];
  return {
    condition: today?.description.includes('rain') ? 'Rainy' : today?.description.includes('cloud') ? 'Cloudy' : 'Sunny',
    tempC: Math.round(today?.temperature.max),
    humidity: today?.humidity ?? 0,
    wind: today?.wind ?? 0,
    precip: today?.description.includes('rain') ? 70 : 0,
    alerts: [],
    daily: api.forecast?.slice(1, 5).map((d: any, i: number) => ({
      day: i === 0 ? 'Tomorrow' : new Date(d.date).toLocaleDateString('en-US', { weekday: 'long' }),
      high: Math.round(d.temperature.max),
      low: Math.round(d.temperature.min),
      icon: d.description.includes('rain') ? '🌧️' : d.description.includes('cloud') ? '☁️' : '🌤️',
    })) ?? [],
  } as const;
}

/* ------------------------------------------------------------------
   Component
-------------------------------------------------------------------*/
export default function WeatherScreen() {
  const { token } = useAuth();
  const [coords, setCoords] = useState(INITIAL_COORDS);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  // React Query fetch based on coords
  const { data: api, isLoading, refetch } = useQuery({
    queryKey: ['weather', coords.latitude, coords.longitude],
    queryFn: () => fetchWeatherByCoords(token, coords.latitude, coords.longitude),
    staleTime: 1000 * 60 * 30,
  });

  const data = api ? mapApi(api) : null;
  const theme = useMemo(() => getTheme(data?.condition ?? 'Sunny'), [data]);

  /* Ask location permission on mount */
  useEffect(() => {
    requestLocation();
  }, []);

  async function requestLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
      setCoords(loc.coords);
      refetch();
    }
  }

 
  if (isLoading || !data) {
    return (
      <SafeAreaView style={styles.loaderBox}>
        <AppText style={styles.loaderText}>Loading weather…</AppText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.flex1}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={theme.gradient} style={styles.flex1} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        {/* top row */}
        <View style={styles.searchRow}>
          <TouchableOpacity style={styles.dateBtn} onPress={() => setShowPicker(true)}>
            <Feather name="calendar" size={18} color="#FFF" />
            <AppText style={styles.dateText}>{date.toDateString()}</AppText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.locationBtn} onPress={requestLocation}>
            <Feather name="map-pin" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>

        {showPicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_, d) => {
              setShowPicker(false);
              if (d) setDate(d);
            }}
          />
        )}

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* hero */}
          <View style={styles.animWrapper}>
            <LottieView source={theme.lottie} autoPlay loop style={styles.lottie} />
            <AppText style={styles.bigTemp}>{data.tempC}°C</AppText>
            <AppText style={styles.condition}>{data.condition}</AppText>
          </View>

          {/* metrics */}
          <View style={styles.metricsRow}>
            <Metric label="Humidity" value={`${data.humidity}%`} />
            <Metric label="Wind" value={`${data.wind} km/h`} />
            <Metric label="Precip" value={`${data.precip}%`} />
          </View>

          {/* daily */}
          <AppText style={styles.sectionHeading}>Next 4 Days</AppText>
          {data.daily.map((d) => (
            <View key={d.day} style={styles.dailyRow}>
              <AppText style={styles.dailyDay}>{d.day}</AppText>
              <AppText style={styles.dailyIcon}>{d.icon}</AppText>
              <AppText style={styles.dailyTemp}>{d.high}° / {d.low}°</AppText>
            </View>
          ))}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricChip}>
      <AppText style={styles.metricLabel}>{label}</AppText>
      <AppText style={styles.metricValue}>{value}</AppText>
    </View>
  );
}

function getTheme(condition: string) {
  switch (condition) {
    case 'Rainy':
      return { gradient: ['#495461', '#485563', '#29323c'] as const, lottie: require('@/assets/lottie/rain.json') };
    case 'Cloudy':
      return { gradient: ['#757F9A', '#D7DDE8'] as const, lottie: require('@/assets/lottie/cloudy.json') };
    default:
      return { gradient: ['#56CCF2', '#2F80ED'] as const, lottie: require('@/assets/lottie/sunny.json') };
  }
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  loaderBox: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#56CCF2' },
  loaderText: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  searchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: STATUS_TOP },
  dateBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12 },
  dateText: { color: '#FFF', marginLeft: 8, fontSize: 14 },
  locationBtn: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 24, padding: 10 },
  scroll: { padding: 24, paddingBottom: 80 },
  animWrapper: { alignItems: 'center', marginBottom: 32 },
  lottie: { width: 150, height: 150 },
  bigTemp: { fontSize: 56, fontWeight: '700', color: '#FFF', marginTop: -20 },
  condition: { fontSize: 20, color: '#FFF', marginTop: 4 },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 24 },
  metricChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '30%',
  },
  metricLabel: { color: '#FFF', fontSize: 12 },
  metricValue: { color: '#FFF', fontSize: 16, fontWeight: '600', marginTop: 4 },

  sectionHeading: { color: '#FFF', fontSize: 18, fontWeight: '600', marginBottom: 12 },
  dailyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.3)',
  },
  dailyDay: { color: '#FFF', fontSize: 14, flex: 1 },
  dailyIcon: { fontSize: 18, color: '#FFF' },
  dailyTemp: { color: '#FFF', fontSize: 14 },

  alertBox: {
    marginTop: 24,
    backgroundColor: 'rgba(255,255,255,0.25)',
    padding: 16,
    borderRadius: 12,
  },
  alertText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
});
