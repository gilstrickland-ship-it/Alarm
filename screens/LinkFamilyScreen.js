import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useLinking } from "../context/LinkingContext";
import { supabase } from "../lib/supabase";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { GradientBackground } from "../components/GradientBackground";
import { Card } from "../components/Card";

function generateCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function LinkFamilyScreen({ navigation }) {
  const { profile, user } = useAuth();
  const { linkedChildren, linkedParents, refetch } = useLinking();
  const [myCode, setMyCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const createInvite = async () => {
    if (!user) return;
    setCreating(true);
    const code = generateCode();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    const { error } = await supabase.from("family_invites").insert({
      code,
      inviter_id: user.id,
      inviter_role: profile?.role ?? "child",
      expires_at: expiresAt.toISOString(),
    });
    setCreating(false);
    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
    setMyCode(code);
  };

  const joinWithCode = async () => {
    if (!joinCode.trim() || !user) return;
    setLoading(true);
    const { data: invite, error: inviteErr } = await supabase
      .from("family_invites")
      .select("*")
      .eq("code", joinCode.trim().toUpperCase())
      .gt("expires_at", new Date().toISOString())
      .single();
    setLoading(false);
    if (inviteErr || !invite) {
      Alert.alert("Invalid Code", "This invite code is invalid or expired.");
      return;
    }
    if (invite.inviter_id === user.id) {
      Alert.alert("Oops", "You can't join your own invite.");
      return;
    }
    const parentId = invite.inviter_role === "parent" ? invite.inviter_id : user.id;
    const childId = invite.inviter_role === "child" ? invite.inviter_id : user.id;
    const { error } = await supabase.from("parent_child").insert({
      parent_id: parentId,
      child_id: childId,
    });
    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
    await refetch();
    setJoinCode("");
    Alert.alert("Success", "You're now linked!");
  };

  const shareCode = () => {
    if (myCode) {
      Share.share({
        message: `Join my Family Alarms! Use code: ${myCode}`,
        title: "Family Alarms Invite",
      });
    }
  };

  return (
    <GradientBackground>
      <View className="flex-row items-center px-4 py-3 mb-2">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <Text className="text-xl font-bold text-gray-800">←</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800 flex-1">
          {profile?.role === "parent" ? "Link your child" : "Link your parent"}
        </Text>
      </View>
      <ScrollView className="flex-1 px-4 pb-8">
        <Card className="mb-4">
          <Text className="text-gray-600 font-medium mb-2">Create invite code</Text>
        <Button
          title={myCode ? `Code: ${myCode}` : "Generate code"}
          onPress={myCode ? shareCode : createInvite}
          loading={creating}
          variant="outline"
        />
          {myCode && (
            <TouchableOpacity onPress={shareCode} className="mt-3">
              <Text className="text-primary text-center font-medium">Share code</Text>
            </TouchableOpacity>
          )}
        </Card>

        <Card className="mb-4">
          <Text className="text-gray-600 font-medium mb-2">Or join with a code</Text>
          <Input
            value={joinCode}
            onChangeText={setJoinCode}
            placeholder="Enter 6-character code"
            autoCapitalize="characters"
          />
          <Button title="Join" onPress={joinWithCode} loading={loading} />
        </Card>

        <Card>
          <Text className="text-gray-600 font-medium mb-3">
            {profile?.role === "parent" ? "Linked children" : "Linked parents"}
          </Text>
          {(profile?.role === "parent" ? linkedChildren : linkedParents).length ===
          0 ? (
            <Text className="text-gray-400">No one linked yet</Text>
          ) : (
            (profile?.role === "parent" ? linkedChildren : linkedParents).map(
              (p) => (
                <View
                  key={p.id}
                  className="flex-row items-center justify-between py-3 border-b border-gray-100"
                >
                  <Text className="text-lg font-medium">{p.name}</Text>
                </View>
              )
            )
          )}
        </Card>
      </ScrollView>
    </GradientBackground>
  );
}
