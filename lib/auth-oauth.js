import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "./supabase";

WebBrowser.maybeCompleteAuthSession(); // required for web only

/**
 * Parse access_token and refresh_token from OAuth redirect URL and set the session.
 * @param {string} url - The redirect URL (e.g. com.familyalarms://auth/callback#access_token=...)
 * @returns {Promise<{ data?: { session }, error?: Error }>}
 */
export async function createSessionFromUrl(url) {
  if (!url) return { data: null, error: null };
  const { params, errorCode } = QueryParams.getQueryParams(url);
  if (errorCode) return { data: null, error: new Error(errorCode) };
  const { access_token, refresh_token } = params;
  if (!access_token) return { data: null, error: null };
  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token: refresh_token ?? "",
  });
  if (error) return { data: null, error };

  // Apple only returns full_name on first sign-in. Update profile if present.
  const user = data?.session?.user;
  const fullName = user?.user_metadata?.full_name;
  if (user && fullName) {
    const name = String(fullName).trim();
    if (name) {
      await supabase.auth.updateUser({ data: { full_name: name } });
      await supabase
        .from("profiles")
        .update({ name, updated_at: new Date().toISOString() })
        .eq("id", user.id);
    }
  }

  return { data, error };
}

const DEMO_MODE = process.env.EXPO_PUBLIC_DEMO_MODE === "true";
const DEMO_PARENT_EMAIL = "demo-parent@familyalarms.app";
const DEMO_CHILD_EMAIL = "demo-child@familyalarms.app";
const DEMO_PASSWORD = "Demo123456";

export async function signInAsDemoParent() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: DEMO_PARENT_EMAIL,
    password: DEMO_PASSWORD,
  });
  return { data, error };
}

export async function signInAsDemoChild() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: DEMO_CHILD_EMAIL,
    password: DEMO_PASSWORD,
  });
  return { data, error };
}

export async function switchDemoUser(currentRole) {
  await supabase.auth.signOut();
  if (currentRole === "parent") return signInAsDemoChild();
  return signInAsDemoParent();
}

export { DEMO_MODE };

/**
 * Sign in with OAuth provider (apple | google).
 * In demo mode, signs in as demo parent (no OAuth setup required).
 */
export async function signInWithOAuth(provider) {
  if (DEMO_MODE) return signInAsDemoParent();

  const redirectTo = makeRedirectUri({ scheme: "com.familyalarms", path: "auth/callback" });
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });
  if (error) return { data: null, error };
  if (!data?.url) return { data: null, error: new Error("No OAuth URL returned") };

  const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (res.type === "success" && res.url) {
    return createSessionFromUrl(res.url);
  }

  return { data: null, error: null }; // user cancelled
}
