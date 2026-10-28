import { CURRENCY_CODE, MYT_TIMEZONE } from "@eztix/shared";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-16 text-center">
      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1 text-xs font-medium tracking-wide text-emerald-400">
        EzTix Ticketing Platform · {CURRENCY_CODE} · {MYT_TIMEZONE}
      </span>
      <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
        Fair, Reliable Event Ticketing for Malaysia
      </h1>
      <p className="mt-4 max-w-2xl text-base text-slate-400">
        True first-in, first-out virtual waiting rooms and interactive real-time
        seating maps for concerts, comedy nights, theatre, and sports across
        Malaysia.
      </p>
    </main>
  );
}
