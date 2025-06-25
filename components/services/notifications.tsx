import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';

export async function requestPushPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function registerForPushToken() {
  if (!Constants.isDevice) throw new Error('Must use real device');

  const granted = await requestPushPermissions();
  if (!granted) throw new Error('Permission not granted');

  const { data } = await Notifications.getExpoPushTokenAsync();
  return data; // e.g. ExponentPushToken[...] 
}


export function scheduleLocalReminder(date: Date, title: string, body: string) {
  return Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: date,           // absolute date
  });
}

