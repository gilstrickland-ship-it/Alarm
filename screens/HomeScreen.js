import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useLinking } from "../context/LinkingContext";
import { supabase } from "../lib/supabase";
import { GradientBackground } from "../components/GradientBackground";
import { Card } from "../components/Card";
import { Avatar } from "../components/Avatar";
import { StatusTag } from "../components/StatusTag";
import { FAB } from "../components/FAB";
import { ScreenHeader } from "../components/ScreenHeader";

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning!";
  if (h < 17) return "Good Afternoon!";
  return "Good Evening!";
};

export function HomeScreen({ navigation }) {
  const { user, profile } = useAuth();
  const { linkedChildren, linkedParents, loading, refetch } = useLinking();
  const [alarms, setAlarms] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAlarms = async () => {
    const { data } = await supabase
      .from("alarms")
      .select("*")
      .order("alarm_time", { ascending: true })
      .limit(20);
    setAlarms(data ?? []);
  };

  useEffect(() => {
    if (user?.id) fetchAlarms();
    else setAlarms([]);
  }, [user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    await fetchAlarms();
    setRefreshing(false);
  };

  const isParent = profile?.role === "parent";

  return (
    <GradientBackground>
      <ScreenHeader
        title="Family Alarms"
        user={profile}
        rightIcons={
          <TouchableOpacity
            onPress={() => navigation.navigate("Notifications")}
            className="p-2"
          >
            <Text className="text-xl">🔔</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        className="flex-1 px-4 pb-24"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text className="text-2xl font-bold text-gray-800 mb-1">
          {getGreeting()} {profile?.name && `${profile.name.split(" ")[0]} 👋`}
        </Text>
        <Text className="text-gray-500 mb-6">
          {isParent ? "Manage alarms for your family" : "Your upcoming alarms"}
        </Text>

        {isParent && linkedChildren.length > 0 && (
          <View className="mb-6">
            <Text className="text-gray-600 font-semibold mb-3">
              Your children
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12 }}
            >
              {linkedChildren.map((child) => (
                <TouchableOpacity key={child.id}>
                  <Avatar name={child.name} size={56} />
                  <Text className="text-center mt-2 font-medium text-sm">
                    {child.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <Text className="text-gray-600 font-semibold mb-3">
          {isParent ? "Recent alarms" : "Upcoming alarms"}
        </Text>

        {alarms.length === 0 ? (
          <Card>
            <Text className="text-gray-500 text-center py-4">
              No alarms yet.{" "}
              {isParent ? "Tap + to create one!" : "Wait for your parent to set one."}
            </Text>
          </Card>
        ) : (
          alarms.map((alarm) => (
            <Card key={alarm.id} className="mb-3">
              <View className="flex-row items-start justify-between mb-2">
                <Text className="font-bold text-lg text-gray-800">
                  {alarm.label || "Alarm"}
                </Text>
                <StatusTag status={alarm.status} />
              </View>
              <Text className="text-gray-500 mb-2">
                {new Date(alarm.alarm_time).toLocaleString()}
              </Text>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-gray-400">
                  {alarm.is_mandatory ? "Mandatory" : "Optional"}
                </Text>
                <Text className="text-gray-700 font-medium">→</Text>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {isParent && (
        <FAB onPress={() => navigation.navigate("CreateAlarm")} />
      )}
    </GradientBackground>
  );
}
