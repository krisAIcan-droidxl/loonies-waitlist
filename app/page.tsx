import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function HomePage() {
  // Redirect root to waitlist directly for waitlist.looniesapp.dk
  redirect("/waitlist");
}
