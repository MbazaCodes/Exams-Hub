// ── ExamHub × TSID Integration ────────────────────────────────
// TSID (Tanzania Student ID System) — github.com/MbazaCodes/Student-Tanzania
// TSID Supabase project: zleyuyalkygjmjuymzjb
//
// ExamHub reads student profiles from TSID via cross-project REST calls.
// No private keys are shared — only public anon-key queries on public data.

import { supabase } from "./supabase";

// ── TSID project credentials (read-only public anon key) ───────
const TSID_URL     = "https://zleyuyalkygjmjuymzjb.supabase.co";
const TSID_ANON    = import.meta.env.VITE_TSID_ANON_KEY as string;

export interface TSIDProfile {
  id:             string;
  tsid:           string;
  first_name:     string;
  middle_name:    string | null;
  last_name:      string;
  gender:         string | null;
  date_of_birth:  string | null;
  photo_url:      string | null;
  school_id:      string | null;
  student_status: string;
  qr_code:        string | null;
  school?: {
    school_name: string;
    region:      string;
    district:    string | null;
  };
}

// ── Fetch student profile from TSID by TSID number ─────────────
export async function fetchTSIDProfile(tsid: string): Promise<{ data: TSIDProfile | null; error: string | null }> {
  if (!TSID_ANON) {
    return { data: null, error: "VITE_TSID_ANON_KEY not set in .env" };
  }

  const clean = tsid.toUpperCase().trim();
  if (!clean.startsWith("TSID")) {
    return { data: null, error: "Invalid TSID format — must start with TSID" };
  }

  try {
    const res = await fetch(
      `${TSID_URL}/rest/v1/students?tsid=eq.${clean}&select=*,schools(school_name,region,district)&limit=1`,
      {
        headers: {
          "apikey":        TSID_ANON,
          "Authorization": `Bearer ${TSID_ANON}`,
          "Content-Type":  "application/json",
        },
      }
    );

    if (!res.ok) {
      return { data: null, error: `TSID lookup failed: ${res.statusText}` };
    }

    const rows = await res.json() as TSIDProfile[];
    if (!rows?.length) {
      return { data: null, error: "TSID number not found in the Tanzania Student ID system." };
    }

    return { data: rows[0], error: null };
  } catch (e: unknown) {
    return { data: null, error: e instanceof Error ? e.message : "Network error" };
  }
}

// ── Login with TSID number + password ──────────────────────────
export async function loginWithTSID(
  tsid:     string,
  password: string
): Promise<{ error?: string }> {
  const clean = tsid.toUpperCase().trim();

  // 1. Call Edge Function to look up email for this TSID
  const { data: lookup, error: fnErr } = await supabase.functions.invoke("tsid-login", {
    body: { tsid: clean },
  });

  if (fnErr)           return { error: fnErr.message };
  if (lookup?.error)   return { error: lookup.error };
  if (!lookup?.email)  return { error: "Account not found for this TSID." };

  // 2. Sign in with email + password
  const { error: authErr } = await supabase.auth.signInWithPassword({
    email:    lookup.email,
    password,
  });

  if (authErr) return { error: "Incorrect password. Try again." };
  return {};
}

// ── Link TSID to existing ExamHub account ──────────────────────
export async function linkTSID(
  userId:  string,
  tsid:    string
): Promise<{ error?: string; profile?: TSIDProfile }> {
  const clean = tsid.toUpperCase().trim();

  // 1. Fetch from TSID to verify it exists
  const { data: tsidProfile, error: fetchErr } = await fetchTSIDProfile(clean);
  if (fetchErr || !tsidProfile) {
    return { error: fetchErr ?? "TSID not found" };
  }

  // 2. Link in ExamHub
  const fullName = [tsidProfile.first_name, tsidProfile.middle_name, tsidProfile.last_name]
    .filter(Boolean).join(" ");

  const { data, error: linkErr } = await supabase.rpc("link_tsid_to_account", {
    p_user_id:   userId,
    p_tsid:      clean,
    p_tsid_name: fullName,
    p_tsid_dob:  tsidProfile.date_of_birth || null,
  });

  if (linkErr)      return { error: linkErr.message };
  if (data?.error)  return { error: data.error };

  return { profile: tsidProfile };
}

// ── Sync profile from TSID into ExamHub ────────────────────────
export async function syncFromTSID(userId: string, tsid: string): Promise<{ error?: string }> {
  const { data: tsidProfile, error: fetchErr } = await fetchTSIDProfile(tsid);
  if (fetchErr || !tsidProfile) return { error: fetchErr ?? "TSID not found" };

  const fullName = [tsidProfile.first_name, tsidProfile.middle_name, tsidProfile.last_name]
    .filter(Boolean).join(" ");

  const { error } = await supabase.rpc("sync_from_tsid", {
    p_user_id: userId,
    p_tsid:    tsid,
    p_name:    fullName,
    p_photo:   tsidProfile.photo_url   || null,
    p_school:  tsidProfile.school?.school_name || null,
    p_dob:     tsidProfile.date_of_birth || null,
  });

  if (error) return { error: error.message };
  return {};
}

// ── Format TSID for display ────────────────────────────────────
export function formatTSID(tsid: string): string {
  return tsid.toUpperCase().replace(/^TSID(\d{8})$/, "TSID-$1");
}

// ── Validate TSID format ───────────────────────────────────────
export function isValidTSID(tsid: string): boolean {
  return /^TSID\d{8}$/i.test(tsid.trim());
}
