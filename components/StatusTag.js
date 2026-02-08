import React from "react";
import { View, Text } from "react-native";

const STATUS_STYLES = {
  pending: { bg: "#FEF3C7", text: "#92400E" },
  approved: { bg: "#D1FAE5", text: "#065F46" },
  declined: { bg: "#FEE2E2", text: "#991B1B" },
  triggered: { bg: "#DBEAFE", text: "#1E40AF" },
  missed: { bg: "#F3F4F6", text: "#374151" },
};

export function StatusTag({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <View
      className="px-3 py-1 rounded-lg"
      style={{ backgroundColor: style.bg }}
    >
      <Text
        className="font-semibold text-sm capitalize"
        style={{ color: style.text }}
      >
        {status}
      </Text>
    </View>
  );
}
