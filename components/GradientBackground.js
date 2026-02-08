import React from "react";
import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

const GRADIENT_COLORS = ["#FBF9F4", "#FAF8F6", "#E0ECF8"];

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
