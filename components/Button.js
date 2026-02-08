import React from "react";
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";

export function Button({
  onPress,
  title,
  variant = "primary",
  disabled = false,
  loading = false,
  className = "",
  textClassName = "",
}) {
  const variants = {
    primary: "bg-primary",
    success: "bg-success",
    danger: "bg-danger",
    outline: "border-2 border-gray-300 bg-transparent",
  };

  const textVariants = {
    primary: "text-white",
    success: "text-white",
    danger: "text-white",
    outline: "text-gray-800",
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      className={`py-4 px-6 rounded-2xl ${variants[variant]} ${disabled ? "opacity-50" : ""} ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === "outline" ? "#1A1A1A" : "#fff"} />
      ) : (
        <Text
          className={`text-center font-bold text-lg ${textVariants[variant]} ${textClassName}`}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
