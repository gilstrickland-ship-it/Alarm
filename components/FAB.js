import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

export function FAB({ onPress, icon = "+" }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={styles.fab}
    >
      <Text style={styles.icon}>{icon}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1F2937",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  icon: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "300",
  },
});
