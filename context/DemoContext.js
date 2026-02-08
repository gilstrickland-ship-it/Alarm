import React, { createContext, useContext, useState } from "react";
import { switchDemoUser } from "../lib/auth-oauth";

const DemoContext = createContext({});

export function DemoProvider({ children }) {
  const [switching, setSwitching] = useState(false);

  const switchUser = async (currentRole) => {
    setSwitching(true);
    const { error } = await switchDemoUser(currentRole);
    setSwitching(false);
    return { error };
  };

  return (
    <DemoContext.Provider value={{ switchUser, switching }}>
      {children}
    </DemoContext.Provider>
  );
}

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (!context) return { switchUser: () => ({ error: null }), switching: false };
  return context;
};
