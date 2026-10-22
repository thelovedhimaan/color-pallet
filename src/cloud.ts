import type { SupabaseClient, User } from "@supabase/supabase-js";
import { validatePalette } from "./palette-utils";
import type { Palette } from "./types";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const cloudConfigured = Boolean(url && anonKey);
let clientPromise: Promise<SupabaseClient | null> | null = null;

export function getSupabase() {
  if (!cloudConfigured) return Promise.resolve(null);
  if (!clientPromise) clientPromise = import("@supabase/supabase-js").then(({ createClient }) => createClient(url!, anonKey!, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  }));
  return clientPromise;
}

export type Account = Pick<User, "id" | "email" | "user_metadata">;

export async function signInWithGoogle() {
  const supabase = await getSupabase();
  if (!supabase) throw new Error("Cloud accounts are not configured yet.");
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}${window.location.pathname}` },
  });
  if (error) throw error;
}

export async function signOut() {
  const supabase = await getSupabase();
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function loadUserPalettes(userId: string): Promise<Palette[]> {
  const supabase = await getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase.from("palettes").select("data").eq("user_id", userId).order("updated_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((row) => row.data).filter(validatePalette);
}

export async function saveUserPalettes(userId: string, palettes: Palette[]) {
  const supabase = await getSupabase();
  if (!supabase || !palettes.length) return;
  const { error } = await supabase.from("palettes").upsert(palettes.map((palette) => ({
    id: palette.id,
    user_id: userId,
    data: palette,
    updated_at: palette.updatedAt,
  })), { onConflict: "user_id,id" });
  if (error) throw error;
}

export async function removeUserPalette(id: string) {
  const supabase = await getSupabase();
  if (!supabase) return;
  const { error } = await supabase.from("palettes").delete().eq("id", id);
  if (error) throw error;
}

export async function publishPalette(userId: string, palette: Palette): Promise<string> {
  const supabase = await getSupabase();
  if (!supabase) throw new Error("Cloud sharing is not configured yet.");
  const { data, error } = await supabase.from("shared_palettes").insert({ owner_id: userId, palette }).select("id").single();
  if (error) throw error;
  return data.id as string;
}

export async function loadSharedPalette(id: string): Promise<Palette | null> {
  const supabase = await getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.from("shared_palettes").select("palette").eq("id", id).maybeSingle();
  if (error) throw error;
  return data && validatePalette(data.palette) ? data.palette : null;
}
