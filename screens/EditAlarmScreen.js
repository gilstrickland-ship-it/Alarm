import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAuth } from "../context/AuthContext";
import { useLinking } from "../context/LinkingContext";
import { supabase } from "../lib/supabase";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { GradientBackground } from "../components/GradientBackground";
import { Card } from "../components/Card";
import { InfoTip } from "../components/InfoTip";
import { showError, showSuccess } from "../lib/toast";

const SOUNDS = ["default", "gentle", "upbeat", "nature"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function EditAlarmScreen({ navigation, route }) {
  const alarm = route?.params?.alarm;
  const { user } = useAuth();
  const { linkedChildren } = useLinking();

  const [childId, setChildId] = useState(null);
  const [alarmTime, setAlarmTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [label, setLabel] = useState("");
  const [isMandatory, setIsMandatory] = useState(false);
  const [sound, setSound] = useState("default");
  const [repeatDays, setRepeatDays] = useState([]);
  const [proofOfAwakeRequired, setProofOfAwakeRequired] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (alarm) {
      setChildId(alarm.child_id);
      setAlarmTime(new Date(alarm.alarm_time));
      setLabel(alarm.label || "");
      setIsMandatory(alarm.is_mandatory ?? false);
      setSound(alarm.sound || "default");
      setProofOfAwakeRequired(alarm.proof_of_awake_required ?? false);
      if (alarm.repeat_pattern) {
        setRepeatDays(
          alarm.repeat_pattern.split(",").map((d) => parseInt(d, 10))
        );
      }
    }
  }, [alarm]);

  const toggleDay = (i) => {
    setRepeatDays((d) =>
      d.includes(i) ? d.filter((x) => x !== i) : [...d, i].sort((a, b) => a - b)
    );
  };

  const handleSave = async () => {
    if (!user || !childId || !alarm?.id) {
      showError("Missing alarm data.");
      return;
    }
    setLoading(true);
    const alarmTimeDate = new Date(alarmTime);
    const requestExpiresAt = isMandatory
      ? null
      : new Date(Date.now() + 30 * 60 * 1000).toISOString();
    const repeatPattern =
      repeatDays.length > 0 ? repeatDays.join(",") : null;

    const { error } = await supabase
      .from("alarms")
      .update({
        child_id: childId,
        alarm_time: alarmTimeDate.toISOString(),
        repeat_pattern: repeatPattern,
        label: label.trim() || null,
        is_mandatory: isMandatory,
        status: isMandatory ? "approved" : "pending",
        sound,
        request_expires_at: requestExpiresAt,
        proof_of_awake_required: proofOfAwakeRequired,
        updated_at: new Date().toISOString(),
      })
      .eq("id", alarm.id)
      .eq("parent_id", user.id);

    setLoading(false);
    if (error) {
      showError(error.message);
      return;
    }
    showSuccess("Alarm updated.", "Saved!");
    navigation.goBack();
  };

  if (!alarm || linkedChildren.length === 0) {
    return (
      <GradientBackground>
        <View className="flex-1 p-6 justify-center">
          <Card>
            <Text className="text-xl text-gray-600 text-center mb-4">
              Invalid alarm or no children linked.
            </Text>
            <Button title="Go Back" onPress={() => navigation.goBack()} />
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
        <Text className="text-xl font-bold text-gray-800 flex-1">
          Edit alarm
        </Text>
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

          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-gray-600 font-medium">Proof of awake</Text>
            <InfoTip
              message="When enabled, your child must solve a simple math problem to turn off the alarm. This helps ensure they're actually awake and alert."
            />
          </View>
          <View className="flex-row gap-3 mb-6">
            <TouchableOpacity
              onPress={() => setProofOfAwakeRequired(false)}
              className={`flex-1 py-3 rounded-xl border-2 ${
                !proofOfAwakeRequired ? "border-accent bg-accent/10" : "border-gray-200"
              }`}
            >
              <Text className="text-center font-medium">Off</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setProofOfAwakeRequired(true)}
              className={`flex-1 py-3 rounded-xl border-2 ${
                proofOfAwakeRequired ? "border-accent bg-accent/10" : "border-gray-200"
              }`}
            >
              <Text className="text-center font-medium">On</Text>
            </TouchableOpacity>
          </View>

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

          <Button
            title="Save changes"
            onPress={handleSave}
            loading={loading}
          />
        </Card>
      </ScrollView>
    </GradientBackground>
  );
}
