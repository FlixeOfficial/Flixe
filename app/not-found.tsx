import NightSky from "@/components/nightSky";
import { Meteors } from "@/components/meteors";
import Link from "next/link";

export default async function Home() {
  return (
    <main className="flex flex-col items-center justify-between h-[100vh] -mt-[4.5rem] ">
      <div className="flex flex-col items-center justify-center gap-4 z-10 h-full text-white">
        <h1 className="text-9xl font-bold text-center leading-tight tracking-tighter mb-4">
          Whoops!
          <span className="text-8xl"> </span>
          <span className="flixe-gradient text-9xl font-bold px-1">404</span>
          <span className="text-8xl"> </span>
          <span className="text-8xl"> </span>
          Lost in Space
        </h1>

        <div className="text-center font-semibold text-xl">
          <Link href="/cines">Escape the Void</Link>
        </div>
      </div>
      <NightSky />
      <Meteors number={1} />
    </main>
  );
}
