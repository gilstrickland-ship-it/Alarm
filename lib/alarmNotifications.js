import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ALARM_CHANNEL_ID = "alarms";
const SCHEDULED_ALARMS_KEY = "@alarm_scheduled_ids";

/**
 * Request notification permissions and set up Android channel.
 * Call once on app init.
 */
export async function setupAlarmNotifications() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(ALARM_CHANNEL_ID, {
      name: "Alarms",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      sound: "default",
    });
  }
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

/**
 * Compute next occurrence dates for an alarm (for repeating or one-time).
 * Returns array of Date objects to schedule.
 */
function getNextOccurrences(alarm) {
  const alarmTime = new Date(alarm.alarm_time);
  const repeatDays = alarm.repeat_pattern
    ? alarm.repeat_pattern.split(",").map((d) => parseInt(d, 10))
    : null;

  const now = new Date();
  const occurrences = [];
  const maxOccurrences = 8; // Stay under iOS 64 notification limit

  if (!repeatDays || repeatDays.length === 0) {
    if (alarmTime > now) {
      occurrences.push(alarmTime);
    }
    return occurrences;
  }

  const hour = alarmTime.getHours();
  const minute = alarmTime.getMinutes();

  for (let dayOffset = 0; dayOffset < 60 && occurrences.length < maxOccurrences; dayOffset++) {
    const d = new Date(now);
    d.setDate(d.getDate() + dayOffset);
    d.setHours(hour, minute, 0, 0);
    if (d > now && repeatDays.includes(d.getDay())) {
      occurrences.push(new Date(d));
    }
  }

  return occurrences.slice(0, maxOccurrences);
}

/**
 * Schedule a notification for one alarm occurrence.
 */
async function scheduleOne(alarm, date, identifier) {
  const title = alarm.label || "Alarm";
  const body = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const trigger = {
    type: Notifications.SchedulableTriggerInputTypes.DATE,
    date,
    channelId: ALARM_CHANNEL_ID,
  };
  await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title: `⏰ ${title}`,
      body,
      sound: "default",
      data: { alarmId: alarm.id },
    },
    trigger,
  });
}

/**
 * Schedule local notifications for an approved alarm (for the child's device).
 */
export async function scheduleAlarmNotification(alarm) {
  if (alarm.status !== "approved") return;
  const occurrences = getNextOccurrences(alarm);
  if (occurrences.length === 0) return;

  const stored = await getScheduledIds();
  const prefix = `alarm-${alarm.id}-`;
  const alreadyScheduled = Object.keys(stored).some((k) => k.startsWith(prefix) || k === `alarm-${alarm.id}`);

  if (alreadyScheduled) return;

  const ids = {};
  for (let i = 0; i < occurrences.length; i++) {
    const id = occurrences.length === 1 ? `alarm-${alarm.id}` : `${prefix}${i}`;
    await scheduleOne(alarm, occurrences[i], id);
    ids[id] = true;
  }
  await saveScheduledIds({ ...stored, ...ids });
}

/**
 * Cancel all scheduled notifications for an alarm.
 */
export async function cancelAlarmNotification(alarmId) {
  const stored = await getScheduledIds();
  const toRemove = Object.keys(stored).filter(
    (k) => k === `alarm-${alarmId}` || k.startsWith(`alarm-${alarmId}-`)
  );
  for (const id of toRemove) {
    await Notifications.cancelScheduledNotificationAsync(id);
    delete stored[id];
  }
  await saveScheduledIds(stored);
}

async function getScheduledIds() {
  try {
    const json = await AsyncStorage.getItem(SCHEDULED_ALARMS_KEY);
    return json ? JSON.parse(json) : {};
  } catch {
    return {};
  }
}

async function saveScheduledIds(obj) {
  await AsyncStorage.setItem(SCHEDULED_ALARMS_KEY, JSON.stringify(obj));
}

/**
 * Sync local notifications with approved alarms for the current user (as child).
 * Call when HomeScreen loads alarms. Cancels orphaned notifications and schedules any missing.
 */
export async function syncAlarmNotifications(alarms, currentUserId) {
  const myApproved = (alarms || []).filter(
    (a) => a.child_id === currentUserId && a.status === "approved"
  );

  const stored = await getScheduledIds();
  const validPrefixes = new Set(myApproved.map((a) => `alarm-${a.id}`));

  for (const key of Object.keys(stored)) {
    const alarmId = key.replace(/^alarm-/, "").replace(/-\d+$/, "");
    if (!validPrefixes.has(`alarm-${alarmId}`)) {
      await Notifications.cancelScheduledNotificationAsync(key);
      delete stored[key];
    }
  }
  await saveScheduledIds(stored);

  for (const alarm of myApproved) {
    await scheduleAlarmNotification(alarm);
  }
}
