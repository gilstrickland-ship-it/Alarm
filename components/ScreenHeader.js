import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Avatar } from "./Avatar";

export function ScreenHeader({
  title,
  onBack,
  rightIcons,
  user,
  notificationCount,
}) {
  return (
    <View className="flex-row items-center justify-between px-4 py-3 mb-4">
      <View className="flex-row items-center flex-1">
        {onBack && (
          <TouchableOpacity onPress={onBack} className="mr-3 p-2 -ml-2">
            <Text className="text-xl font-bold text-gray-800">←</Text>
          </TouchableOpacity>
        )}
        <Text className="text-xl font-bold text-gray-800 flex-1">{title}</Text>
      </View>
      <View className="flex-row items-center gap-2">
        {rightIcons}
        {user && (
          <Avatar
            name={user.name}
            avatarUrl={user.avatar_url}
            size={40}
            badge={notificationCount > 0 ? notificationCount : undefined}
            badgeColor="#EF4444"
          />
        )}
      </View>
    </View>
  );
}
