import React from "react";
import { View, Text, Image } from "react-native";

export function Avatar({ name, avatarUrl, size = 48, badge, badgeColor }) {
  const initials = name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  return (
    <View className="relative">
      <View
        className="rounded-full bg-gray-200 items-center justify-center overflow-hidden"
        style={{ width: size, height: size }}
      >
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={{ width: size, height: size }}
          />
        ) : (
          <Text
            className="font-semibold text-gray-600"
            style={{ fontSize: size * 0.4 }}
          >
            {initials}
          </Text>
        )}
      </View>
      {badge != null && (
        <View
          className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full items-center justify-center px-1"
          style={{
            backgroundColor: badgeColor || "#EF4444",
          }}
        >
          <Text className="text-white text-xs font-bold">{badge}</Text>
        </View>
      )}
    </View>
  );
}
