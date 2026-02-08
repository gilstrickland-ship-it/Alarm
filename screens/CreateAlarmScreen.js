import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAuth } from "../context/AuthContext";
import { useLinking } from "../context/LinkingContext";
import { supabase } from "../lib/supabase";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { GradientBackground } from "../components/GradientBackground";
import { Card } from "../components/Card";

const SOUNDS = ["default", "gentle", "upbeat", "nature"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CreateAlarmScreen({ navigation }) {
  const { user } = useAuth();
  const { linkedChildren } = useLinking();
  const [childId, setChildId] = useState(null);
  const [alarmTime, setAlarmTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [label, setLabel] = useState("");
  const [isMandatory, setIsMandatory] = useState(false);
  const [sound, setSound] = useState("default");
  const [repeatDays, setRepeatDays] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleDay = (i) => {
    setRepeatDays((d) =>
      d.includes(i) ? d.filter((x) => x !== i) : [...d, i].sort((a, b) => a - b)
    );
  };

  const handleCreate = async () => {
    if (!user || !childId) {
      Alert.alert("Error", "Please select a child.");
      return;
    }
    setLoading(true);
    const alarmTimeDate = new Date(alarmTime);
    const requestExpiresAt = isMandatory
      ? null
      : new Date(Date.now() + 30 * 60 * 1000).toISOString();
    const repeatPattern =
      repeatDays.length > 0 ? repeatDays.join(",") : null;

    const { data: alarm, error } = await supabase
      .from("alarms")
      .insert({
        parent_id: user.id,
        child_id: childId,
        alarm_time: alarmTimeDate.toISOString(),
        repeat_pattern: repeatPattern,
        label: label.trim() || null,
        is_mandatory: isMandatory,
        status: isMandatory ? "approved" : "pending",
        sound,
        vibration: "default",
        request_expires_at: requestExpiresAt,
      })
      .select()
      .single();
    setLoading(false);
    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
    Alert.alert("Done!", "Alarm created.");
    navigation.goBack();
  };

  if (linkedChildren.length === 0) {
    return (
      <GradientBackground>
        <View className="flex-1 p-6 justify-center">
          <Card>
            <Text className="text-xl text-gray-600 text-center mb-4">
              Link a child first to set alarms for them.
            </Text>
            <Button
              title="Go to Link Family"
              onPress={() => navigation.navigate("LinkFamily")}
            />
          </Card>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <View className="flex-row items-center px-4 py-3 mb-2">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <Text className="text-xl font-bold text-gray-800">←</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800 flex-1">Set an alarm</Text>
      </View>
      <ScrollView className="flex-1 px-4 pb-24">
        <Card className="mb-4">
          <Text className="text-gray-600 font-medium mb-2">For</Text>
          <View className="flex-row flex-wrap gap-2 mb-6">
        {linkedChildren.map((c) => (
          <TouchableOpacity
            key={c.id}
            onPress={() => setChildId(c.id)}
            className={`px-4 py-2 rounded-xl border-2 ${
              childId === c.id ? "border-accent bg-accent/10" : "border-gray-200"
            }`}
          >
            <Text className="font-medium">{c.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
        </Card>

        <Card className="mb-4">
          <Text className="text-gray-600 font-medium mb-2">Time</Text>
          <TouchableOpacity
        onPress={() => setShowTimePicker(true)}
        className="border-2 border-gray-200 rounded-xl px-4 py-3 mb-6"
      >
        <Text className="text-xl font-bold">
          {alarmTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </TouchableOpacity>
      {showTimePicker && (
        <DateTimePicker
          value={alarmTime}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(e, d) => {
            setShowTimePicker(false);
            if (d) setAlarmTime(d);
          }}
        />
      )}

          <Input
            label="Label (optional)"
            value={label}
            onChangeText={setLabel}
            placeholder="e.g. Math Class"
          />

          <Text className="text-gray-600 font-medium mb-2">Mandatory?</Text>
          <View className="flex-row gap-3 mb-6">
        <TouchableOpacity
          onPress={() => setIsMandatory(false)}
          className={`flex-1 py-3 rounded-xl border-2 ${
            !isMandatory ? "border-accent bg-accent/10" : "border-gray-200"
          }`}
        >
          <Text className="text-center font-medium">Optional</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setIsMandatory(true)}
          className={`flex-1 py-3 rounded-xl border-2 ${
            isMandatory ? "border-accent bg-accent/10" : "border-gray-200"
          }`}
        >
          <Text className="text-center font-medium">Mandatory</Text>
        </TouchableOpacity>
          </View>

          <Text className="text-gray-600 font-medium mb-2">Repeat</Text>
          <View className="flex-row flex-wrap gap-2 mb-6">
        {DAYS.map((d, i) => (
          <TouchableOpacity
            key={d}
            onPress={() => toggleDay(i)}
            className={`w-12 h-12 rounded-xl border-2 items-center justify-center ${
              repeatDays.includes(i) ? "border-accent bg-accent/10" : "border-gray-200"
            }`}
          >
            <Text className="font-medium text-sm">{d}</Text>
          </TouchableOpacity>
        ))}
          </View>

          <Text className="text-gray-600 font-medium mb-2">Sound</Text>
          <View className="flex-row flex-wrap gap-2 mb-8">
        {SOUNDS.map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => setSound(s)}
            className={`px-4 py-2 rounded-xl border-2 ${
              sound === s ? "border-accent bg-accent/10" : "border-gray-200"
            }`}
          >
            <Text className="font-medium capitalize">{s}</Text>
          </TouchableOpacity>
        ))}
          </View>

          <Button title="Create alarm" onPress={handleCreate} loading={loading} />
        </Card>
      </ScrollView>
    </GradientBackground>
  );
}
