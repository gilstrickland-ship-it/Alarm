import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { scheduleAlarmNotification, cancelAlarmNotification } from "../lib/alarmNotifications";
import { GradientBackground } from "../components/GradientBackground";
import { Card } from "../components/Card";
import { Button } from "../components/Button";

export function AlarmRequestsScreen({ navigation }) {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = async () => {
    if (!user?.id) {
      setRequests([]);
      return;
    }
    const { data } = await supabase
      .from("alarms")
      .select("*")
      .eq("child_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    const withParent = await Promise.all(
      (data ?? []).map(async (a) => {
        const { data: p } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", a.parent_id)
          .single();
        return { ...a, parentName: p?.name };
      })
    );
    setRequests(withParent);
  };

  useEffect(() => {
    fetchRequests();
  }, [user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRequests();
    setRefreshing(false);
  };

  const respond = async (alarmId, approved, alarm) => {
    if (!user?.id) return;
    await supabase
      .from("alarms")
      .update({ status: approved ? "approved" : "declined" })
      .eq("id", alarmId)
      .eq("child_id", user.id);
    if (approved) {
      scheduleAlarmNotification({ ...alarm, status: "approved" }).catch((e) =>
        console.warn("Schedule alarm notification:", e?.message)
      );
    } else {
      cancelAlarmNotification(alarmId).catch((e) =>
        console.warn("Cancel alarm notification:", e?.message)
      );
    }
    await fetchRequests();
  };

  return (
    <GradientBackground>
      <View className="flex-row items-center justify-between px-4 py-3 mb-2">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <Text className="text-xl font-bold text-gray-800">←</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Alarm requests</Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1 px-4 pb-8"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text className="text-gray-500 mb-6">
          Respond within 30 minutes or they'll auto-approve
        </Text>

        {requests.length === 0 ? (
          <Card>
            <Text className="text-gray-500 text-center py-8">
              No pending requests
            </Text>
          </Card>
        ) : (
          requests.map((req) => (
            <Card key={req.id} className="mb-4">
              <Text className="font-bold text-lg text-gray-800 mb-1">
                {req.label || "Alarm"}
              </Text>
              <Text className="text-gray-500 mb-2">
                {new Date(req.alarm_time).toLocaleString()}
              </Text>
              <Text className="text-sm text-gray-400 mb-4">
                From {req.parentName || "Parent"}
              </Text>
              <View className="flex-row gap-3">
                <Button
                  title="Approve"
                  variant="success"
                  onPress={() => respond(req.id, true, req)}
                  className="flex-1"
                />
                <Button
                  title="Decline"
                  variant="danger"
                  onPress={() => respond(req.id, false, req)}
                  className="flex-1"
                />
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </GradientBackground>
  );
}
