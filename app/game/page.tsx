"use client";

import dynamic from "next/dynamic";

const GameCanvas = dynamic(
() => import("../components/game/GameCanvas"),
{
ssr: false,
loading: () => (
<div className="h-screen bg-black text-white flex items-center justify-center">
Loading Lasgidi...
</div>
),
}
);

export default function GamePage() {
return (
<main className="h-screen w-screen overflow-hidden bg-black">
<GameCanvas />
</main>
);
}