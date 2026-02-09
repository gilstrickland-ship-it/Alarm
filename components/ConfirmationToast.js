import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export function ConfirmationToast({ text1, hide, props = {} }) {
  const { onConfirm, onCancel, confirmText, cancelText, destructive } = props;

  const handleCancel = () => {
    hide();
    onCancel?.();
  };

  const handleConfirm = () => {
    hide();
    onConfirm?.();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.message} numberOfLines={2}>
        {text1}
      </Text>
      <View style={styles.buttons}>
        <TouchableOpacity onPress={handleCancel} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>{cancelText || "Cancel"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleConfirm}
          style={[styles.confirmBtn, destructive && styles.destructiveBtn]}
        >
          <Text style={styles.confirmBtnText}>{confirmText || "Confirm"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    minWidth: 280,
    maxWidth: "95%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  message: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 16,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  cancelText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "600",
  },
  confirmBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#6366F1",
    borderRadius: 8,
  },
  destructiveBtn: {
    backgroundColor: "#EF4444",
  },
  confirmBtnText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
