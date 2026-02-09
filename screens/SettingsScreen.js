import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Switch } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useDemo } from "../context/DemoContext";
import { DEMO_MODE } from "../lib/auth-oauth";
import { GradientBackground } from "../components/GradientBackground";
import { Card } from "../components/Card";
import { Avatar } from "../components/Avatar";
import { showError } from "../lib/toast";

export function SettingsScreen({ navigation }) {
  const { profile, signOut } = useAuth();
  const { switchUser, switching } = useDemo();
  const [switchValue, setSwitchValue] = useState(profile?.role === "parent");

  useEffect(() => {
    setSwitchValue(profile?.role === "parent");
  }, [profile?.role]);

  const handleDemoSwitch = async (value) => {
    if (!DEMO_MODE || switching) return;
    setSwitchValue(value);
    const targetRole = value ? "parent" : "child";
    const currentRole = profile?.role;
    if (targetRole === currentRole) return;
    const { error } = await switchUser(currentRole);
    if (error) {
      setSwitchValue(!value);
      showError(error.message ?? "Failed to switch user");
    }
  };

  return (
    <GradientBackground>
      <View className="flex-row items-center justify-between px-4 py-3 mb-2">
        <View className="w-10" />
        <Text className="text-xl font-bold text-gray-800">Settings</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-4 pb-8">
        <Card className="mb-4">
          <View className="flex-row items-center gap-4">
            <Avatar name={profile?.name} avatarUrl={profile?.avatar_url} size={64} />
            <View>
              <Text className="text-xl font-bold text-gray-800">
                {profile?.name}
              </Text>
              <Text className="text-gray-500 capitalize">{profile?.role}</Text>
            </View>
          </View>
        </Card>

        <Card onPress={() => navigation.navigate("LinkFamily")} className="mb-3">
          <Text className="font-semibold text-gray-800">
            {profile?.role === "parent" ? "Link children" : "Link parents"}
          </Text>
          <Text className="text-gray-500 text-sm mt-1">
            Manage family connections
          </Text>
        </Card>

        {DEMO_MODE && (
          <Card className="mb-3">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="font-semibold text-gray-800">Demo mode</Text>
                <Text className="text-gray-500 text-sm mt-1">
                  Switch to {profile?.role === "parent" ? "child" : "parent"} view
                </Text>
              </View>
              <Switch
                value={switchValue}
                onValueChange={handleDemoSwitch}
                disabled={switching}
                trackColor={{ false: "#E5E7EB", true: "#2C2C2E" }}
                thumbColor="#fff"
              />
            </View>
            <Text className="text-gray-400 text-xs mt-2">
              {switchValue ? "Viewing as Parent" : "Viewing as Child"}
            </Text>
          </Card>
        )}

        <TouchableOpacity
          onPress={signOut}
          className="mt-6 py-4 rounded-2xl bg-danger items-center"
        >
          <Text className="text-white font-bold">Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </GradientBackground>
  );
}
