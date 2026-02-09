import React, { useState } from "react";
import {
  TouchableOpacity,
  Text,
  Modal,
  Pressable,
  View,
  StyleSheet,
} from "react-native";

export function InfoTip({ message, size = 18 }) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        className="w-6 h-6 rounded-full bg-gray-200 items-center justify-center"
      >
        <Text style={{ fontSize: size - 4 }} className="text-gray-600">
          i
        </Text>
      </TouchableOpacity>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setVisible(false)}
        >
          <Pressable style={styles.tooltip} onPress={(e) => e.stopPropagation()}>
            <Text className="text-gray-800 text-base">{message}</Text>
            <Pressable
              onPress={() => setVisible(false)}
              className="mt-4 py-2 px-4 rounded-xl bg-accent self-end"
            >
              <Text className="text-white font-medium">Got it</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  tooltip: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    maxWidth: 320,
  },
});
