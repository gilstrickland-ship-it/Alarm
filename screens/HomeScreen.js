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
import { syncAlarmNotifications } from "../lib/alarmNotifications";
import { GradientBackground } from "../components/GradientBackground";
import { Card } from "../components/Card";
import { Avatar } from "../components/Avatar";
import { StatusTag } from "../components/StatusTag";
import { FAB } from "../components/FAB";
import { ScreenHeader } from "../components/ScreenHeader";
import { AlarmDetailDrawer } from "../components/AlarmDetailDrawer";
import { Button } from "../components/Button";
import { showError, showConfirmation } from "../lib/toast";

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
  const [drawerAlarm, setDrawerAlarm] = useState(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const fetchAlarms = async () => {
    const { data } = await supabase
      .from("alarms")
      .select("*")
      .order("alarm_time", { ascending: true })
      .limit(20);
    const list = data ?? [];
    setAlarms(list);
    if (user?.id) {
      syncAlarmNotifications(list, user.id).catch((e) =>
        console.warn("Sync alarm notifications:", e?.message)
      );
    }
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

  const getChildName = (childId) =>
    linkedChildren.find((c) => c.id === childId)?.name || "Child";

  const toggleSelect = (alarmId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(alarmId)) next.delete(alarmId);
      else next.add(alarmId);
      return next;
    });
  };

  const handleAlarmPress = (alarm) => {
    if (isParent) {
      if (selectionMode) {
        toggleSelect(alarm.id);
      } else {
        setDrawerAlarm(alarm);
      }
    }
  };

  const handleDeleteAlarm = async (alarmId) => {
    const { error } = await supabase
      .from("alarms")
      .delete()
      .eq("id", alarmId)
      .eq("parent_id", user.id);
    if (error) showError(error.message);
    else await fetchAlarms();
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    showConfirmation(
      `Delete ${selectedIds.size} alarm${selectedIds.size > 1 ? "s" : ""}?`,
      {
        confirmText: "Delete",
        cancelText: "Cancel",
        destructive: true,
        onConfirm: async () => {
          for (const id of selectedIds) {
            await supabase
              .from("alarms")
              .delete()
              .eq("id", id)
              .eq("parent_id", user.id);
          }
          setSelectedIds(new Set());
          setSelectionMode(false);
          await fetchAlarms();
        },
      }
    );
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  return (
    <GradientBackground>
      <ScreenHeader
        title="Family Alarms"
        user={profile}
        rightIcons={
          <View className="flex-row items-center">
            {isParent && alarms.length > 0 && (
              <TouchableOpacity
                onPress={() =>
                  selectionMode ? exitSelectionMode() : setSelectionMode(true)
                }
                className="p-2"
              >
                <Text className="text-base font-medium text-gray-700">
                  {selectionMode ? "Cancel" : "Select"}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => navigation.navigate("Notifications")}
              className="p-2"
            >
              <Text className="text-xl">🔔</Text>
            </TouchableOpacity>
          </View>
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
            <TouchableOpacity
              key={alarm.id}
              onPress={() => handleAlarmPress(alarm)}
              activeOpacity={0.8}
            >
              <Card
                className={`mb-3 ${selectionMode && selectedIds.has(alarm.id) ? "border-2 border-accent bg-accent/5" : ""}`}
              >
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-row items-center flex-1">
                    {isParent && selectionMode && (
                      <View className="w-6 h-6 rounded-full border-2 mr-3 items-center justify-center border-gray-300">
                        {selectedIds.has(alarm.id) && (
                          <View className="w-3 h-3 rounded-full bg-accent" />
                        )}
                      </View>
                    )}
                    <View className="flex-1">
                      <Text className="font-bold text-lg text-gray-800">
                        {alarm.label || "Alarm"}
                      </Text>
                    </View>
                  </View>
                  <StatusTag status={alarm.status} />
                </View>
                <Text className="text-gray-500 mb-2">
                  {new Date(alarm.alarm_time).toLocaleString()}
                </Text>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-gray-400">
                    {alarm.is_mandatory ? "Mandatory" : "Optional"}
                    {isParent && (
                      <Text className="text-gray-400"> • {getChildName(alarm.child_id)}</Text>
                    )}
                  </Text>
                  {!selectionMode && isParent && (
                    <Text className="text-gray-700 font-medium">→</Text>
                  )}
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {isParent && selectionMode && selectedIds.size > 0 && (
        <View className="absolute bottom-24 left-4 right-4">
          <Button
            title={`Delete selected (${selectedIds.size})`}
            variant="danger"
            onPress={handleDeleteSelected}
          />
        </View>
      )}
      {isParent && !selectionMode && (
        <FAB onPress={() => navigation.navigate("CreateAlarm")} />
      )}
      <AlarmDetailDrawer
        visible={!!drawerAlarm}
        alarm={drawerAlarm}
        childName={drawerAlarm ? getChildName(drawerAlarm.child_id) : null}
        onClose={() => setDrawerAlarm(null)}
        onEdit={(alarm) => navigation.navigate("EditAlarm", { alarm })}
        onDelete={handleDeleteAlarm}
      />
    </GradientBackground>
  );
}
