import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { GradientBackground } from "../components/GradientBackground";
import { Card } from "../components/Card";

export function OnboardingScreen({ navigation }) {
  const { profile, updateProfile } = useAuth();
  const [name, setName] = useState(profile?.name ?? "");
  const [role, setRole] = useState(profile?.role ?? "child");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleComplete = async () => {
    setError("");
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    setLoading(true);
    const { error: err } = await updateProfile({ name: name.trim(), role, onboarding_completed: true });
    setLoading(false);
    if (err) {
      setError(err.message ?? "Update failed");
      return;
    }
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="items-center mb-8">
            <Text className="text-5xl mb-2">👋</Text>
            <Text className="text-2xl font-bold text-gray-800">Almost there!</Text>
            <Text className="text-gray-500 mt-1">Set up your profile</Text>
          </View>

          <Card className="mb-6">
            <Input
              label="Your name"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Alice"
            />

            <Text className="text-gray-600 font-medium mb-2">I am a...</Text>
            <View className="flex-row gap-3 mb-6">
              <TouchableOpacity
                onPress={() => setRole("parent")}
                className={`flex-1 py-4 rounded-2xl border-2 ${
                  role === "parent" ? "border-primary bg-primary/10" : "border-gray-200"
                }`}
              >
                <Text className="text-center text-lg font-semibold">
                  👨‍👩‍👧 Parent
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setRole("child")}
                className={`flex-1 py-4 rounded-2xl border-2 ${
                  role === "child" ? "border-primary bg-primary/10" : "border-gray-200"
                }`}
              >
                <Text className="text-center text-lg font-semibold">
                  👧 Child
                </Text>
              </TouchableOpacity>
            </View>

            {error ? (
              <Text className="text-danger text-sm mb-4">{error}</Text>
            ) : null}

            <Button title="Continue" onPress={handleComplete} loading={loading} />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}
