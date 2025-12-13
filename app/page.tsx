import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050B18",
        color: "white",
        display: "flex",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div style={{ width: "100%", maxWidth: 520 }}>
        {/* Top glow / hero */}
        <div
          style={{
            borderRadius: 24,
            padding: 20,
            border: "1px solid rgba(255,255,255,0.06)",
            background:
              "radial-gradient(1200px 600px at 50% 0%, rgba(59,233,240,0.16), rgba(255,0,229,0.10) 40%, rgba(5,11,24,0) 70%), rgba(255,255,255,0.02)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
            <Image
              src="/loonies-logo.png"
              alt="Loonies logo"
              width={160}
              height={50}
              priority
              style={{ filter: "drop-shadow(0 0 18px rgba(59,233,240,0.25))" }}
            />
          </div>

          <p
            style={{
              textAlign: "center",
              color: "#6B7690",
              fontSize: 12,
              marginTop: 8,
              letterSpacing: 0.3,
            }}
          >
            Hyperlokalt fællesskab
          </p>

          <h1
            style={{
              textAlign: "center",
              fontSize: 30,
              lineHeight: 1.1,
              marginTop: 18,
              marginBottom: 10,
            }}
          >
            Spontane møder med dine naboer.
          </h1>

          <p style={{ textAlign: "center", color: "#A7B0C0", lineHeight: 1.6, margin: 0 }}>
            Loonies gør det nemt at mødes lokalt - til kaffe, gåture, træning eller meget mere.
            <br />
            <strong>Ingen dating. Ingen støj.</strong>
          </p>

          {/* CTA */}
          <div style={{ display: "flex", justifyContent: "center", marginTop: 18 }}>
            <Link
              href="/waitlist"
              style={{
                width: "100%",
                maxWidth: 360,
                height: 52,
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                textDecoration: "none",
                background: "linear-gradient(90deg, #3BE9F0, #FF00E5)",
                color: "white",
              }}
            >
              Skriv mig på ventelisten
            </Link>
          </div>

          <p
            style={{
              textAlign: "center",
              color: "#6B7690",
              fontSize: 12,
              marginTop: 10,
              marginBottom: 0,
            }}
          >
            Åbner ved 100 tilmeldte. Vi spammer ikke.
          </p>
        </div>

        {/* Benefits */}
        <section style={{ marginTop: 18, display: "grid", gap: 12 }}>
          {[
            {
              title: "Nemt at tage initiativ",
              text: "Vælg en mikro-aktivitet og find en ny ven på få sekunder.",
            },
            {
              title: "Trygt og lokalt",
              text: "Fokus på fællesskab i dit område - ikke en dating-app.",
            },
            {
              title: "Byg et stærkere naboskab",
              text: "Små møder i hverdagen → større fællesskab over tid.",
            },
          ].map((b) => (
            <div
              key={b.title}
              style={{
                borderRadius: 18,
                padding: 14,
                border: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <div style={{ fontWeight: 800, marginBottom: 4 }}>{b.title}</div>
              <div style={{ color: "#A7B0C0", lineHeight: 1.5 }}>{b.text}</div>
            </div>
          ))}
        </section>

        {/* Footer micro */}
        <div style={{ marginTop: 18, textAlign: "center", color: "#6B7690", fontSize: 12 }}>
          Tip: Del dit referral-link efter signup for at åbne hurtigere.
        </div>
      </div>
    </main>
  );
}
