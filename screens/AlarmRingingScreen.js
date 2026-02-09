import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { GradientBackground } from "../components/GradientBackground";
import { Button } from "../components/Button";
import { generateMathProblem } from "../lib/mathProblem";

export function AlarmRingingScreen({ navigation, route }) {
  const alarmId = route?.params?.alarmId;
  const { user } = useAuth();
  const [alarm, setAlarm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mathProblem, setMathProblem] = useState(null);
  const [answer, setAnswer] = useState("");
  const [wrongAnswer, setWrongAnswer] = useState(false);

  useEffect(() => {
    if (!alarmId) {
      setLoading(false);
      return;
    }
    const fetchAlarm = async () => {
      const { data, error } = await supabase
        .from("alarms")
        .select("*")
        .eq("id", alarmId)
        .eq("child_id", user?.id)
        .single();
      if (error || !data) {
        setAlarm(null);
      } else {
        setAlarm(data);
        if (data.proof_of_awake_required) {
          setMathProblem(generateMathProblem());
        }
      }
      setLoading(false);
    };
    fetchAlarm();
  }, [alarmId, user?.id]);

  const handleDismiss = async () => {
    if (!alarm) return;

    if (alarm.proof_of_awake_required && mathProblem) {
      const num = parseInt(answer.trim(), 10);
      if (num !== mathProblem.answer) {
        setWrongAnswer(true);
        setAnswer("");
        setMathProblem(generateMathProblem());
        return;
      }
    }

    await supabase
      .from("alarms")
      .update({ status: "triggered", updated_at: new Date().toISOString() })
      .eq("id", alarm.id)
      .eq("child_id", user?.id);

    navigation.goBack();
  };

  if (loading) {
    return (
      <GradientBackground>
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Loading...</Text>
        </View>
      </GradientBackground>
    );
  }

  if (!alarm) {
    return (
      <GradientBackground>
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-gray-600 text-center mb-4">
            Alarm not found or already dismissed.
          </Text>
          <Button title="Go back" onPress={() => navigation.goBack()} />
        </View>
      </GradientBackground>
    );
  }

  const needsProof = alarm.proof_of_awake_required && mathProblem;

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 justify-center px-6 pb-24">
          <Text className="text-4xl text-center mb-2">⏰</Text>
          <Text className="text-2xl font-bold text-gray-800 text-center mb-1">
            {alarm.label || "Alarm"}
          </Text>
          <Text className="text-gray-500 text-center mb-8">
            {new Date(alarm.alarm_time).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>

          {needsProof ? (
            <View className="mb-6">
              <Text className="text-gray-600 font-medium mb-2 text-center">
                Solve this to turn off the alarm:
              </Text>
              <Text className="text-3xl font-bold text-gray-800 text-center mb-4">
                {mathProblem.question} = ?
              </Text>
              <TextInput
                value={answer}
                onChangeText={(t) => {
                  setAnswer(t);
                  setWrongAnswer(false);
                }}
                placeholder="Your answer"
                keyboardType="number-pad"
                placeholderTextColor="#9CA3AF"
                className={`border-2 rounded-xl px-4 py-4 text-xl text-center ${
                  wrongAnswer ? "border-danger" : "border-gray-200"
                }`}
                autoFocus
              />
              {wrongAnswer && (
                <Text className="text-danger text-sm mt-2 text-center">
                  Try again! New problem above.
                </Text>
              )}
            </View>
          ) : (
            <Text className="text-gray-500 text-center mb-6">
              Tap below to dismiss the alarm.
            </Text>
          )}

          <Button
            title={needsProof ? "Submit" : "Dismiss alarm"}
            onPress={handleDismiss}
          />
        </View>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}
