"use client";

import { useState } from "react";

export default function ThankYouClient({
  position,
  code,
}: {
  position: number | null;
  code: string | null;
}) {
  const [copied, setCopied] = useState(false);

  if (!code) return null;

  const link =
    typeof window !== "undefined"
      ? `${window.location.origin}/waitlist?ref=${code}`
      : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div
      style={{
        marginTop: 14,
        padding: 14,
        borderRadius: 14,
        border: "1px solid rgba(59,233,240,0.30)",
        background: "rgba(59,233,240,0.10)",
      }}
    >
      <div style={{ lineHeight: 1.4 }}>
        <div style={{ fontWeight: 800, fontSize: 15 }}>🎉 Du er skrevet op!</div>
        <div style={{ color: "#A7B0C0", fontSize: 13, marginTop: 6 }}>
          {position != null && (
            <>
              Din plads i køen: <strong style={{ color: "white" }}>{position}</strong>
              <br />
            </>
          )}
          <span style={{ color: "#6B7690", fontSize: 12 }}>
            Vi giver lyd når dit område åbner.
          </span>
        </div>

        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontSize: 11, color: "#6B7690", marginBottom: 6 }}>
            Del dit referral-link og hop køen over:
          </div>
          <div
            style={{
              fontSize: 11,
              background: "rgba(0,0,0,0.30)",
              padding: "8px 10px",
              borderRadius: 8,
              wordBreak: "break-all",
              color: "#A7B0C0",
              fontFamily: "monospace",
            }}
          >
            {link}
          </div>
          <button
            type="button"
            onClick={handleCopy}
            style={{
              marginTop: 8,
              width: "100%",
              height: 38,
              borderRadius: 10,
              border: "1px solid rgba(59,233,240,0.40)",
              background: copied ? "rgba(59,233,240,0.20)" : "rgba(59,233,240,0.08)",
              color: "white",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {copied ? "✓ Kopieret!" : "Kopiér link"}
          </button>
        </div>
      </div>
    </div>
  );
}
