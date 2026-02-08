import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

const LinkingContext = createContext({});

export function LinkingProvider({ children }) {
  const { user, profile } = useAuth();
  const [linkedChildren, setLinkedChildren] = useState([]);
  const [linkedParents, setLinkedParents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLinks = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    if (profile?.role === "parent") {
      const { data } = await supabase
        .from("parent_child")
        .select("child_id")
        .eq("parent_id", user.id);
      const ids = data?.map((r) => r.child_id) ?? [];
      const children = [];
      for (const id of ids) {
        const { data: p } = await supabase.from("profiles").select("id, name, avatar_url").eq("id", id).single();
        if (p) children.push(p);
      }
      setLinkedChildren(children);
      setLinkedParents([]);
    } else {
      const { data } = await supabase
        .from("parent_child")
        .select("parent_id")
        .eq("child_id", user.id);
      const ids = data?.map((r) => r.parent_id) ?? [];
      const parents = [];
      for (const id of ids) {
        const { data: p } = await supabase.from("profiles").select("id, name, avatar_url").eq("id", id).single();
        if (p) parents.push(p);
      }
      setLinkedParents(parents);
      setLinkedChildren([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLinks();
  }, [user?.id, profile?.role]);

  const addLink = async (parentId, childId) => {
    const { error } = await supabase.from("parent_child").insert({
      parent_id: parentId,
      child_id: childId,
    });
    if (!error) await fetchLinks();
    return { error };
  };

  const removeLink = async (parentId, childId) => {
    const { error } = await supabase
      .from("parent_child")
      .delete()
      .eq("parent_id", parentId)
      .eq("child_id", childId);
    if (!error) await fetchLinks();
    return { error };
  };

  return (
    <LinkingContext.Provider
      value={{
        linkedChildren,
        linkedParents,
        loading,
        addLink,
        removeLink,
        refetch: fetchLinks,
      }}
    >
      {children}
    </LinkingContext.Provider>
  );
}

export const useLinking = () => {
  const context = useContext(LinkingContext);
  if (!context) throw new Error("useLinking must be used within LinkingProvider");
  return context;
};
