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

export function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(null);
  const [error, setError] = useState("");

  const handleSignUp = async () => {
    setError("");
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    setLoading(true);
    const { error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { name: name.trim() } },
    });
    setLoading(false);
    if (err) {
      setError(err.message ?? "Sign up failed");
      return;
    }
    // User will be redirected by auth state listener
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
            <Text className="text-2xl font-bold text-gray-800">Create Account</Text>
            <Text className="text-gray-500 mt-1">Join Family Alarms</Text>
          </View>

          <Card className="mb-6">
            <Input
              label="Name"
              value={name}
              onChangeText={setName}
              placeholder="Your name"
            />
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
              placeholder="At least 6 characters"
              secureTextEntry
            />

            {error ? (
              <Text className="text-danger text-sm mb-4">{error}</Text>
            ) : null}

            <Button title="Sign Up" onPress={handleSignUp} loading={loading} />

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
              onPress={() => navigation.navigate("Login")}
              className="mt-6"
            >
              <Text className="text-center text-accent font-medium">
                Already have an account? Sign in
              </Text>
            </TouchableOpacity>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}
