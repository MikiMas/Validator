export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabaseClient";
import { doc, getDoc } from "firebase/firestore";
import WaitlistForm from "./WaitlistForm";

export default async function Landing({ params }: any) {
  const { data, error } = await supabase
    .from("ideas")
    .select("landing")
    .eq("slug", params.slug)
    .single();

  if (error || !data) {
    return <div className="p-10 text-center">Landing no encontrada</div>;
  }

  const landing = (data as any).landing;

  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-3xl mx-auto w-full">
        {/* HERO */}
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
          {landing.heroTitle}
        </h1>
        <p className="text-xl text-slate-600 mb-12 leading-relaxed">
          {landing.heroDescription}
        </p>

        {/* WAITLIST SECTION */}
        <div className="w-full max-w-md bg-slate-50 p-8 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-bold mb-2">{landing.waitlistTitle || "Únete a la lista de espera"}</h2>
          <p className="text-slate-600 mb-6">{landing.waitlistOffer}</p>

          <WaitlistForm slug={params.slug} />
        </div>
      </div>

      <footer className="p-6 text-center text-sm text-slate-400">
        <p>&copy; {new Date().getFullYear()} {landing.heroTitle}. All rights reserved.</p>
      </footer>
    </main>
  );
}