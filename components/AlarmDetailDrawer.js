import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import { Button } from "./Button";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function AlarmDetailDrawer({
  visible,
  alarm,
  childName,
  onClose,
  onEdit,
  onDelete,
}) {
  if (!alarm) return null;

  const repeatDays = alarm.repeat_pattern
    ? alarm.repeat_pattern.split(",").map((d) => parseInt(d, 10))
    : [];

  const handleDelete = () => {
    onClose();
    onDelete?.(alarm.id);
  };

  const handleEdit = () => {
    onClose();
    onEdit?.(alarm);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.drawer} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <Text className="text-xl font-bold text-gray-800 mb-2">
            {alarm.label || "Alarm"}
          </Text>
          <Text className="text-gray-500 mb-1">
            {new Date(alarm.alarm_time).toLocaleString()}
          </Text>
          {childName && (
            <Text className="text-sm text-gray-400 mb-4">For {childName}</Text>
          )}
          <View className="flex-row flex-wrap gap-2 mb-4">
            <View className="px-3 py-1 rounded-full bg-gray-100">
              <Text className="text-sm text-gray-600">
                {alarm.is_mandatory ? "Mandatory" : "Optional"}
              </Text>
            </View>
            {alarm.proof_of_awake_required && (
              <View className="px-3 py-1 rounded-full bg-accent/20">
                <Text className="text-sm text-gray-700">Proof of awake</Text>
              </View>
            )}
            {repeatDays.length > 0 && (
              <View className="px-3 py-1 rounded-full bg-gray-100">
                <Text className="text-sm text-gray-600">
                  {repeatDays.map((d) => DAYS[d]).join(", ")}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.actions}>
            <Button
              title="Edit"
              variant="outline"
              onPress={handleEdit}
              className="flex-1 mr-2"
            />
            <Button
              title="Delete"
              variant="danger"
              onPress={handleDelete}
              className="flex-1"
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  drawer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#D1D5DB",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  actions: {
    flexDirection: "row",
    marginTop: 8,
  },
});
