import crypto from "crypto";
import { supabaseServer } from "./supabase-server";

// ============================================================================
// EDITABLE CONFIG
// ============================================================================

/**
 * Area/zone constant for all signups.
 * This is stored in the DB `area` column.
 */
export const WAITLIST_AREA = "valby";

/**
 * Buildings list – kept for potential future use, but not shown in UI.
 * Waitlist is now open for everyone without building requirement.
 */
export const BUILDINGS = [
  "Syren Hus",
  "Hortensia Hus",
  "Lathyrus Hus",
  "Rhododendron Hus",
  "Ranunkel Hus",
  "Verbena Hus (karréen)",
  "Spirea Hus",
  "Hibiscus Hus",
  "Røllike Hus",
  "Primula Hus",
  "Astilbe Hus",
  "Amaryllis Hus",
  "Astrantia Hus",
  "Geranium Rækkerne",
  "Verbena Hus Tårnet",
  "Akeleje Hus",
  "Magnolia Hus",
  "Bofællesskabet Spir",
  "Kamelia Hus",
  "Asters Rækkerne",
  "Fresia Hus",
  "Hosta Hus",
  "Dahlia Hus",
  "Torveporten",
  "Iris Hus",
  "Filippa Haven",
] as const;

export type Building = (typeof BUILDINGS)[number];

/**
 * Interests – optional multi-select checkboxes
 */
export const INTERESTS = [
  "Kaffe",
  "Gåtur",
  "Træning",
  "Brætspil",
  "Mad",
  "Andet",
] as const;

export const WAITLIST_COPY = {
  title: "Loonies - Early Access",
  subtitle:
    "Spontane møder med folk i dit område - helt lokalt. Ingen dating. Ingen støj.",
};

// ============================================================================
// HELPERS
// ============================================================================

function makeReferralCode() {
  return crypto.randomBytes(6).toString("base64url").slice(0, 8).toUpperCase();
}

type SupabaseErrorLike = {
  message?: string;
  details?: string | null;
  hint?: string | null;
  code?: string | null;
};

function isProbablyDuplicate(err: SupabaseErrorLike) {
  const msg = (err?.message ?? "").toLowerCase();
  const code = (err?.code ?? "").toLowerCase();
  return (
    code === "23505" || // postgres unique violation
    msg.includes("duplicate") ||
    msg.includes("unique") ||
    msg.includes("violates unique constraint")
  );
}

// ============================================================================
// PUBLIC API
// ============================================================================

export async function getTotalStats() {
  const supabase = supabaseServer();

  const { count, error } = await supabase
    .from("waitlist_signups")
    .select("*", { count: "exact", head: true })
    .eq("area", WAITLIST_AREA);

  if (error) {
    console.error("WAITLIST COUNT ERROR:", {
      message: (error as any).message,
      details: (error as any).details,
      hint: (error as any).hint,
      code: (error as any).code,
    });
    return { count: 0 };
  }

  return { count: count ?? 0 };
}

export async function createSignup(params: {
  first_name: string;
  email: string;
  interests: string[];
  referred_by?: string | null;
}) {
  const supabase = supabaseServer();
  const referral_code = makeReferralCode();

  const { data, error } = await supabase
    .from("waitlist_signups")
    .insert({
      area: WAITLIST_AREA,
      first_name: params.first_name.trim(),
      email: params.email.trim().toLowerCase(),
      building: null, // Always null - open for everyone
      interests: params.interests.length > 0 ? params.interests : null,
      referral_code,
      referred_by: params.referred_by ?? null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("WAITLIST INSERT ERROR:", {
      message: (error as any).message,
      details: (error as any).details,
      hint: (error as any).hint,
      code: (error as any).code,
      payload: {
        email: params.email,
        interestsCount: params.interests?.length ?? 0,
      },
    });

    if (isProbablyDuplicate(error as any)) {
      return { ok: false as const, reason: "duplicate" as const };
    }

    return {
      ok: false as const,
      reason: "insert_failed" as const,
      message: (error as any).message ?? "Insert failed",
    };
  }

  if (!data?.id) {
    return {
      ok: false as const,
      reason: "no_id" as const,
      message: "Insert succeeded but no ID returned",
    };
  }

  // ============================================================================
  // BULLETPROOF POSITION CALCULATION via RPC
  // ============================================================================
  // Call the SQL function `waitlist_position(uuid)` which returns an integer.
  // This guarantees the position matches the DB's row_number() ordering.
  const { data: posData, error: posError } = await supabase.rpc(
    "waitlist_position",
    { p_signup_id: data.id }
  );

  if (posError) {
    console.error("WAITLIST POSITION RPC ERROR:", {
      message: (posError as any).message,
      details: (posError as any).details,
      hint: (posError as any).hint,
      code: (posError as any).code,
      signup_id: data.id,
    });
    // Position calculation failed, but insert succeeded
    return {
      ok: true as const,
      position: null,
      referral_code,
    };
  }

  return {
    ok: true as const,
    position: posData ?? null,
    referral_code,
  };
}
