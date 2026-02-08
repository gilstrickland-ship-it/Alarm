import React from "react";
import { View, TextInput, Text } from "react-native";

export function Input({
  value,
  onChangeText,
  placeholder,
  label,
  secureTextEntry = false,
  keyboardType = "default",
  error,
  autoCapitalize = "sentences",
  className = "",
}) {
  return (
    <View className={`mb-4 ${className}`}>
      {label && (
        <Text className="text-gray-600 font-medium mb-2">{label}</Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        className={`border-2 rounded-xl px-4 py-3 text-base ${
          error ? "border-danger" : "border-gray-200"
        } focus:border-gray-400`}
      />
      {error && <Text className="text-danger text-sm mt-1">{error}</Text>}
    </View>
  );
}
