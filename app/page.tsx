import Link from "next/link";

export default function Home() {
return (
<main className="min-h-screen bg-black text-white flex items-center justify-center">
<div className="text-center">
<p className="text-sm tracking-[0.4em] text-white/50 mb-4">
WELCOME TO
</p>

    <h1 className="text-7xl font-black tracking-tight">
      LASGIDI
    </h1>

    <p className="mt-4 text-white/60 max-w-md mx-auto">
      A living Lagos. Your character. Your money. Your hustle. Your story.
    </p>

    <Link
      href="/game"
      className="inline-flex mt-8 px-8 py-4 rounded-full bg-white text-black font-semibold hover:bg-white/90 transition"
    >
      Enter Lasgidi
    </Link>
  </div>
</main>

);
}