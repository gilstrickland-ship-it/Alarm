import "./global.css";
import React, { useEffect } from "react";
import * as Linking from "expo-linking";
import * as Notifications from "expo-notifications";
import Toast from "react-native-toast-message";
import { NavigationContainer, createNavigationContainerRef } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { View, Text, ActivityIndicator } from "react-native";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { DemoProvider } from "./context/DemoContext";
import { LinkingProvider } from "./context/LinkingContext";
import { createSessionFromUrl } from "./lib/auth-oauth";
import { setupAlarmNotifications } from "./lib/alarmNotifications";

import { LoginScreen } from "./screens/LoginScreen";
import { SignUpScreen } from "./screens/SignUpScreen";
import { OnboardingScreen } from "./screens/OnboardingScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { CreateAlarmScreen } from "./screens/CreateAlarmScreen";
import { EditAlarmScreen } from "./screens/EditAlarmScreen";
import { LinkFamilyScreen } from "./screens/LinkFamilyScreen";
import { AlarmRequestsScreen } from "./screens/AlarmRequestsScreen";
import { AlarmRingingScreen } from "./screens/AlarmRingingScreen";
import { NotificationsScreen } from "./screens/NotificationsScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { ConfirmationToast } from "./components/ConfirmationToast";

const toastConfig = {
  confirmation: ({ text1, hide, props }) => (
    <ConfirmationToast text1={text1} hide={hide} props={props} />
  ),
};

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const navigationRef = createNavigationContainerRef();

function MainTabs() {
  const { profile } = useAuth();
  const isParent = profile?.role === "parent";

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E5E7EB",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        tabBarActiveTintColor: "#6366F1",
        tabBarInactiveTintColor: "#9CA3AF",
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: "Home", tabBarIcon: () => <Text>⏰</Text> }}
      />
      {!isParent && (
        <Tab.Screen
          name="Requests"
          component={AlarmRequestsScreen}
          options={{ tabBarLabel: "Requests", tabBarIcon: () => <Text>📋</Text> }}
        />
      )}
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarLabel: "Settings", tabBarIcon: () => <Text>⚙️</Text> }}
      />
    </Tab.Navigator>
  );
}

function OAuthRedirectHandler() {
  const url = Linking.useURL();
  useEffect(() => {
    if (url) {
      createSessionFromUrl(url).catch((err) => {
        console.warn("OAuth redirect session error:", err?.message);
      });
    }
  }, [url]);
  return null;
}

function AppNavigator() {
  const { user, profile, loading, needsOnboarding } = useAuth();

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View className="flex-1 items-center justify-center bg-white">
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
      </Stack.Navigator>
    );
  }

  if (needsOnboarding) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="CreateAlarm" component={CreateAlarmScreen} />
      <Stack.Screen name="EditAlarm" component={EditAlarmScreen} />
      <Stack.Screen name="LinkFamily" component={LinkFamilyScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="AlarmRinging" component={AlarmRingingScreen} />
    </Stack.Navigator>
  );
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function NotificationSetup() {
  useEffect(() => {
    setupAlarmNotifications().catch((err) =>
      console.warn("Alarm notification setup:", err?.message)
    );

    const navigateToAlarm = (alarmId) => {
      if (alarmId && navigationRef.isReady()) {
        navigationRef.navigate("AlarmRinging", { alarmId });
      }
    };

    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        const alarmId = response.notification.request.content.data?.alarmId;
        if (alarmId) {
          setTimeout(() => navigateToAlarm(alarmId), 500);
        }
      }
    });

    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const alarmId = response.notification.request.content.data?.alarmId;
        navigateToAlarm(alarmId);
      }
    );
    return () => sub.remove();
  }, []);
  return null;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <DemoProvider>
          <NotificationSetup />
          <OAuthRedirectHandler />
          <LinkingProvider>
            <NavigationContainer ref={navigationRef}>
              <AppNavigator />
              <Toast config={toastConfig} />
              <StatusBar style="dark" />
            </NavigationContainer>
          </LinkingProvider>
        </DemoProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
