import React from "react";
import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

const GRADIENT_COLORS = ["#FFFEF7", "#F5F3FF", "#EDE9FE"];

export function GradientBackground({ children, style }) {
  return (
    <LinearGradient
      colors={GRADIENT_COLORS}
      style={[styles.gradient, style]}
      locations={[0, 0.5, 1]}
    >
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {children}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
});
