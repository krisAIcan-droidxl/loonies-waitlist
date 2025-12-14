import crypto from "crypto";
import { supabaseServer } from "./supabase-server";

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
  subtitle: "Spontane møder med folk i dit område - helt lokalt. Ingen dating. Ingen støj.",
  openGoal: 100,
};

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

export async function getTotalStats() {
  const supabase = supabaseServer();

  const { count, error } = await supabase
    .from("waitlist_signups")
    .select("*", { count: "exact", head: true });

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
  building: string;
  interests: string[];
  referred_by?: string | null;
}) {
  const supabase = supabaseServer();
  const referral_code = makeReferralCode();

  const { data, error } = await supabase
    .from("waitlist_signups")
    .insert({
      area: "gronttorvet",
      first_name: params.first_name.trim(),
      email: params.email.trim(),
      building: params.building.trim(),
      interests: params.interests,
      referral_code,
      referred_by: params.referred_by ?? null,
    })
    .select("id, created_at, referral_code, building")
    .single();

  if (error) {
    console.error("WAITLIST INSERT ERROR:", {
      message: (error as any).message,
      details: (error as any).details,
      hint: (error as any).hint,
      code: (error as any).code,
      payload: {
        email: params.email,
        building: params.building,
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

  // position i køen pr. bygning (mere meningsfuldt end global)
  const { count, error: countErr } = await supabase
    .from("waitlist_signups")
    .select("*", { count: "exact", head: true })
    .eq("building", data.building)
    .lte("created_at", data.created_at);

  if (countErr) {
    console.error("WAITLIST POSITION ERROR:", {
      message: (countErr as any).message,
      details: (countErr as any).details,
      hint: (countErr as any).hint,
      code: (countErr as any).code,
    });
  }

  return {
    ok: true as const,
    position: count ?? null,
    referral_code: data.referral_code,
  };
}
