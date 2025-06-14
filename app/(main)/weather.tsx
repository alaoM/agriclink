import { AppText } from '@/components/AppText';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
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

const STATUS_TOP = Platform.OS === 'android'
  ? (StatusBar.currentHeight ?? 24) + 8   // 8‑px extra spacing
  : 16;
/* ------------------------------------------------------------------
   Dummy weather payload – replace with real API response
-------------------------------------------------------------------*/
const mock = {
  condition: 'Cloudy', // Sunny | Rainy | Cloudy | Thunderstorm | Snow
  tempC: 28,
  humidity: 60,
  wind: 15,
  precip: 0,
  alerts: ['Protect your crops: High UV Index'],
  daily: [
    { day: 'Tomorrow', high: 26, low: 18, icon: '🌤️' },
    { day: 'Wednesday', high: 25, low: 17, icon: '☁️' },
    { day: 'Thursday', high: 27, low: 19, icon: '🌧️' },
    { day: 'Friday', high: 24, low: 16, icon: '🌦️' },
  ],
};

const INITIAL_COORDS = { latitude: 6.5, longitude: 3.3 }; // Lagos fallback

/* ------------------------------------------------------------------
   Main Component
-------------------------------------------------------------------*/
export default function WeatherScreen() {
  const [coords, setCoords] = useState(INITIAL_COORDS);
  const [date, setDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [data, setData] = useState<typeof mock | null>(null);
  const [loading, setLoading] = useState(true);

  /* Permissions + initial fetch */
  useEffect(() => { requestLocation(); }, []);
  useEffect(() => { fetchWeather(); }, [coords, date]);

  async function requestLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
      setCoords(loc.coords);
    }
  }

  async function fetchWeather() {
    setLoading(true);
    // TODO: replace with real fetch using coords + date
    await new Promise(r => setTimeout(r, 700));
    setData(mock);
    setLoading(false);
  }

  const theme = useMemo(() => getTheme(data?.condition ?? 'Sunny'), [data]);

  if (loading || !data) {
    return (
      <SafeAreaView style={styles.loaderBox}>
        <AppText style={styles.loaderText}>Loading weather…</AppText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.flex1}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={theme.gradient}
        style={styles.flex1}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* ---------------- Top Filter Row ---------------- */}
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
            onChange={(_, d) => { setShowPicker(false); if (d) setDate(d); }}
          />
        )}

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Animated hero */}
          <View style={styles.animWrapper}>
            <LottieView
              source={theme.lottie}
              autoPlay
              loop
              style={styles.lottie}
            />
            <AppText style={styles.bigTemp}>{data.tempC}°C</AppText>
            <AppText style={styles.condition}>{data.condition}</AppText>
          </View>

          {/* Metrics */}
          <View style={styles.metricsRow}>
            <Metric label="Humidity" value={`${data.humidity}%`} />
            <Metric label="Wind" value={`${data.wind} km/h`} />
            <Metric label="Precip" value={`${data.precip}%`} />
          </View>

          {/* Daily forecast */}
          <AppText style={styles.sectionHeading}>Next 4 Days</AppText>
          {data.daily.map((d) => (
            <View key={d.day} style={styles.dailyRow}>
              <AppText style={styles.dailyDay}>{d.day}</AppText>
              <AppText style={styles.dailyIcon}>{d.icon}</AppText>
              <AppText style={styles.dailyTemp}>{d.high}° / {d.low}°</AppText>
            </View>
          ))}

          {/* Alerts */}
          {data.alerts.length > 0 && (
            <View style={styles.alertBox}>
              {data.alerts.map((a) => (
                <AppText key={a} style={styles.alertText}>{a}</AppText>
              ))}
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

/* ------------------------------------------------------------------
   Metric chip
-------------------------------------------------------------------*/
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricChip}>
      <AppText style={styles.metricLabel}>{label}</AppText>
      <AppText style={styles.metricValue}>{value}</AppText>
    </View>
  );
}

/* ------------------------------------------------------------------
   Theme helper
-------------------------------------------------------------------*/
function getTheme(condition: string) {
  switch (condition) {
    case 'Rainy':
      return { gradient: ['#495461', '#485563', '#29323c'] as const, lottie: require('@/assets/lottie/rain.json') };
    case 'Cloudy':
      return { gradient: ['#757F9A', '#D7DDE8'] as const, lottie: require('@/assets/lottie/cloudy.json') };
    case 'Thunderstorm':
      return { gradient: ['#141E30', '#243B55'] as const, lottie: require('@/assets/lottie/storm.json') };
    case 'Snow':
      return { gradient: ['#83a4d4', '#b6fbff'] as const, lottie: require('@/assets/lottie/snow.json') };
    default:
      return { gradient: ['#56CCF2', '#2F80ED'] as const, lottie: require('@/assets/lottie/sunny.json') };
  }
}

/* ------------------------------------------------------------------
   Styles
-------------------------------------------------------------------*/
const styles = StyleSheet.create({
  flex1: { flex: 1 },
  loaderBox: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#56CCF2' },
  loaderText: { color: '#FFF', fontSize: 18, fontWeight: '600' },

  /* top row */
  searchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: STATUS_TOP,
  },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  dateText: { color: '#FFF', marginLeft: 8, fontSize: 14 },
  locationBtn: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 24,
    padding: 10,
  },

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
