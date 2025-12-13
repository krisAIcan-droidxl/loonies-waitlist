"use client";

import { useFormStatus } from "react-dom";

export default function ThankYouClient({ goal }: { goal: number }) {
  const { pending, data }: any = useFormStatus();

  if (pending) return <p className="text-sm text-gray-400 text-center mt-3">Sender…</p>;
  if (!data) return null;

  if (data.ok === false && data.reason === "duplicate") {
    return (
      <p className="text-sm text-gray-400 text-center mt-3">
        Du står allerede på ventelisten.
      </p>
    );
  }

  if (data.ok !== true) {
    return (
      <p className="text-sm text-gray-400 text-center mt-3">
        Noget gik galt. Prøv igen.
      </p>
    );
  }

  const link =
    typeof window !== "undefined"
      ? `${window.location.origin}/waitlist?ref=${data.referral_code}`
      : "";

  return (
    <div className="mt-4 rounded-xl border border-cyan-400/30 bg-cyan-400/10 p-4 text-center">
      <p className="font-bold mb-1">🎉 Du er på listen</p>
      <p className="text-sm text-gray-300">
        Du er nr. <strong>{data.position}</strong> i køen.
        <br />
        Vi åbner ved <strong>{goal}</strong>.
      </p>

      <p className="text-xs text-gray-400 mt-3">Del dit link:</p>
      <div className="mt-1 text-xs break-all rounded-lg bg-black/30 p-2">{link}</div>
    </div>
  );
}
