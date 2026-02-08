import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { supabase } from "../lib/supabase";
import { signInWithOAuth } from "../lib/auth-oauth";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { GradientBackground } from "../components/GradientBackground";
import { Card } from "../components/Card";

export function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(null);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    if (!password) {
      setError("Please enter your password");
      return;
    }
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (err) {
      setError(err.message ?? "Login failed");
      return;
    }
  };

  const handleOAuth = async (provider) => {
    setError("");
    setOauthLoading(provider);
    const { error: err } = await signInWithOAuth(provider);
    setOauthLoading(null);
    if (err) setError(err.message ?? `${provider} sign-in failed`);
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
            <Text className="text-5xl mb-2">⏰</Text>
            <Text className="text-2xl font-bold text-gray-800">Family Alarms</Text>
            <Text className="text-gray-500 mt-1">Sign in to continue</Text>
          </View>

          <Card className="mb-6">
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
            />

            {error ? (
              <Text className="text-danger text-sm mb-4">{error}</Text>
            ) : null}

            <Button title="Sign In" onPress={handleLogin} loading={loading} />

            <View className="flex-row items-center my-6">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="mx-4 text-gray-500 text-sm">or continue with</Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>

            <Button
              title="Sign in with Apple"
              onPress={() => handleOAuth("apple")}
              loading={oauthLoading === "apple"}
              disabled={!!oauthLoading}
              className="mb-3 bg-black"
              textClassName="text-white"
            />
            <Button
              title="Sign in with Google"
              onPress={() => handleOAuth("google")}
              loading={oauthLoading === "google"}
              variant="outline"
              disabled={!!oauthLoading}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate("SignUp")}
              className="mt-6"
            >
              <Text className="text-center text-accent font-medium">
                Don't have an account? Sign up
              </Text>
            </TouchableOpacity>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}
