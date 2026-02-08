import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { GradientBackground } from "../components/GradientBackground";
import { Card } from "../components/Card";

export function NotificationsScreen({ navigation }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(50);
      setNotifications(data ?? []);
    };
    fetch();
  }, [user?.id]);

  return (
    <GradientBackground>
      <View className="flex-row items-center justify-between px-4 py-3 mb-2">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <Text className="text-xl font-bold text-gray-800">←</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Notifications</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-4 pb-8">
        {notifications.length === 0 ? (
          <Card>
            <Text className="text-gray-500 text-center py-8">
              No notifications yet
            </Text>
          </Card>
        ) : (
          notifications.map((n) => (
            <Card key={n.id} className="mb-3">
              <Text className="font-semibold text-gray-800">{n.title}</Text>
              {n.body && (
                <Text className="text-gray-500 mt-1">{n.body}</Text>
              )}
              <Text className="text-gray-400 text-sm mt-2">
                {new Date(n.created_at).toLocaleString()}
              </Text>
            </Card>
          ))
        )}
      </ScrollView>
    </GradientBackground>
  );
}
