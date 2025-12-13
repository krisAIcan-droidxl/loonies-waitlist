import Image from "next/image";
import { redirect } from "next/navigation";
import ThankYouClient from "./ThankYouClient";
import {
  BUILDINGS,
  INTERESTS,
  WAITLIST_COPY,
  getTotalStats,
  createSignup,
} from "@/lib/waitlist";

export const dynamic = "force-dynamic";

type SearchParams = {
  ref?: string | string[];
  success?: string | string[];
  error?: string | string[];
  pos?: string | string[];
  code?: string | string[];
};

function firstString(v: string | string[] | undefined) {
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v[0] ?? "";
  return "";
}

export default async function WaitlistPage(props: {
  searchParams: Promise<SearchParams> | SearchParams;
}) {
  const searchParams = await props.searchParams;

  const stats = await getTotalStats();

  // Referral from query: ?ref=XXXX
  const refRaw = firstString(searchParams?.ref);
  const referredBy = refRaw.trim().toUpperCase() || null;

  // UI status from redirect query params
  const success = firstString(searchParams?.success) === "1";
  const error = firstString(searchParams?.error); // "validation" | "duplicate" | "unknown"
  const pos = firstString(searchParams?.pos);
  const code = firstString(searchParams?.code);

  async function action(formData: FormData): Promise<void> {
    "use server";

    const first_name = String(formData.get("first_name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const building = String(formData.get("building") ?? "").trim();
    const interests = formData.getAll("interests").map(String);

    if (!first_name || !email || !building) {
      redirect("/waitlist?error=validation");
    }

    const result = await createSignup({
      first_name,
      email,
      building,
      interests,
      referred_by: referredBy,
    });

    if (!result.ok) {
      const reason = result.reason ?? "unknown";
      redirect(`/waitlist?error=${encodeURIComponent(reason)}`);
    }

    const qp = new URLSearchParams();
    qp.set("success", "1");
    if (result.position != null) qp.set("pos", String(result.position));
    if (result.referral_code) qp.set("code", result.referral_code);
    if (referredBy) qp.set("ref", referredBy);

    redirect(`/waitlist?${qp.toString()}`);
  }

  return (
    <main
      style={{
        background: "#050B18",
        minHeight: "100vh",
        color: "white",
        padding: 24,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Image
              src="/loonies-logo.png"
              alt="Loonies logo"
              width={160}
              height={50}
              priority
              style={{
                filter: "drop-shadow(0 0 14px rgba(59,233,240,0.28))",
              }}
            />
          </div>

          <p
            style={{
              color: "#6B7690",
              fontSize: 12,
              marginTop: 6,
              letterSpacing: 0.3,
            }}
          >
            Hyperlokalt fællesskab
          </p>

          <h1 style={{ fontSize: 26, marginTop: 18, marginBottom: 6 }}>
            {WAITLIST_COPY.title}
          </h1>

          <p style={{ color: "#A7B0C0", lineHeight: 1.5, margin: 0 }}>
            {WAITLIST_COPY.subtitle}
          </p>

          <p style={{ color: "#6B7690", marginTop: 10, marginBottom: 0 }}>
            {stats.count} på ventelisten · Åbner ved {WAITLIST_COPY.openGoal}
          </p>
        </div>

        {/* Status banner */}
        {(success || error) && (
          <div
            style={{
              marginTop: 14,
              padding: 12,
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.10)",
              background: success
                ? "rgba(59,233,240,0.10)"
                : "rgba(255,0,229,0.10)",
            }}
          >
            {success ? (
              <div style={{ lineHeight: 1.4 }}>
                <div style={{ fontWeight: 800 }}>Du er skrevet op ✅</div>
                <div style={{ color: "#A7B0C0", fontSize: 13, marginTop: 6 }}>
                  {pos ? (
                    <>
                      Din plads: <strong style={{ color: "white" }}>{pos}</strong>
                      <br />
                    </>
                  ) : null}
                  {code ? (
                    <>
                      Din referral-kode:{" "}
                      <strong style={{ color: "white" }}>{code}</strong>
                    </>
                  ) : (
                    "Tak! Vi giver lyd når dit område åbner."
                  )}
                </div>
              </div>
            ) : (
              <div style={{ lineHeight: 1.4 }}>
                <div style={{ fontWeight: 800 }}>Kunne ikke oprette</div>
                <div style={{ color: "#A7B0C0", fontSize: 13, marginTop: 6 }}>
                  {error === "duplicate"
                    ? "Den email er allerede skrevet op."
                    : error === "validation"
                      ? "Udfyld venligst alle felter."
                      : "Noget gik galt. Prøv igen."}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Form card */}
        <section
          style={{
            background: "#0B1326",
            borderRadius: 16,
            padding: 16,
            marginTop: 18,
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <form action={action}>
            <label style={{ display: "block", marginBottom: 10 }}>
              <div
                style={{
                  fontSize: 12,
                  color: "#A7B0C0",
                  marginBottom: 6,
                }}
              >
                Fornavn
              </div>
              <input
                name="first_name"
                required
                placeholder="Dit fornavn"
                style={{
                  width: "100%",
                  height: 48,
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "white",
                  padding: "0 14px",
                  outline: "none",
                }}
              />
            </label>

            <label style={{ display: "block", marginBottom: 10 }}>
              <div
                style={{
                  fontSize: 12,
                  color: "#A7B0C0",
                  marginBottom: 6,
                }}
              >
                Email
              </div>
              <input
                name="email"
                type="email"
                required
                placeholder="din@email.dk"
                style={{
                  width: "100%",
                  height: 48,
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "white",
                  padding: "0 14px",
                  outline: "none",
                }}
              />
            </label>

            <label style={{ display: "block", marginBottom: 10 }}>
              <div
                style={{
                  fontSize: 12,
                  color: "#A7B0C0",
                  marginBottom: 6,
                }}
              >
                Hvilken bygning bor du i?
              </div>
              <select
                name="building"
                required
                defaultValue=""
                style={{
                  width: "100%",
                  height: 48,
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "white",
                  padding: "0 14px",
                  outline: "none",
                }}
              >
                <option value="" disabled>
                  Vælg bygning
                </option>
                {BUILDINGS.map((b) => (
                  <option key={b} value={b} style={{ color: "black" }}>
                    {b}
                  </option>
                ))}
              </select>
            </label>

            <div style={{ marginTop: 14 }}>
              <div
                style={{
                  fontSize: 12,
                  color: "#A7B0C0",
                  marginBottom: 8,
                }}
              >
                Hvad kunne du finde på at mødes om?
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                {INTERESTS.map((x) => (
                  <label
                    key={x}
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "rgba(255,255,255,0.02)",
                    }}
                  >
                    <input name="interests" type="checkbox" value={x} />
                    <span>{x}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              style={{
                width: "100%",
                height: 52,
                borderRadius: 14,
                border: "none",
                marginTop: 16,
                fontWeight: 800,
                cursor: "pointer",
                background: "linear-gradient(90deg, #3BE9F0, #FF00E5)",
                color: "white",
              }}
            >
              Skriv mig op
            </button>

            <p
              style={{
                color: "#6B7690",
                fontSize: 12,
                textAlign: "center",
                marginTop: 10,
              }}
            >
              Vi spammer ikke. Kun når dit område åbner.
            </p>

            {/* Optional: still renders client-side "confetti" etc */}
            <ThankYouClient goal={WAITLIST_COPY.openGoal} />

            {referredBy ? (
              <p
                style={{
                  color: "#6B7690",
                  fontSize: 12,
                  marginTop: 12,
                  textAlign: "center",
                }}
              >
                Referral registreret: <strong>{referredBy}</strong>
              </p>
            ) : null}
          </form>
        </section>
      </div>
    </main>
  );
}
