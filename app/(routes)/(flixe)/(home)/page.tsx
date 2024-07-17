import { redirect } from "next/navigation";
import authOptions from "@/app/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { WalletConnection } from "@/components/wallet-connection";
import BubbleText from "@/components/bubbleText";
import { HoverImages } from "./_components/hoverImages";
import DetailsPage from './_components/detailsPage';

interface Session {
  user?: {
    email: string;
  };
}

export default async function Home() {
  const session: Session | null = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return (
      <main className="flex flex-col items-center justify-between h-[100vh] md:pt-[4.6rem] md:pb-0 px-4 py-4">
        {/* ---- Grain */}
        <div className="absolute inset-0 z-40 pointer-events-none">
          <div
            style={{
              backgroundImage:
                'url("https://assets-global.website-files.com/66036f769a7419920900d178/6607c78193f891e481d6a097_grain-slow.gif")',
              backgroundRepeat: "repeat",
              backgroundSize: "auto",
              width: "100%",
              height: "100%",
            }}
            className="opacity-4 mix-blend-normal grain"
          />
        </div>

        <div className="flex-col gap-0 hidden md:flex">
          {/* Hero Component */}
          <div className="relative bg-[#4224ff] rounded-b-md rounded-t-[2rem] overflow-hidden w-[98vw] h-[92vh] min-h-[1000px]">
            {/* ---- Video */}
            <video
              src="https://framerusercontent.com/assets/FLBxqz4iuJBqu6uz8D8Ju2Tuzno.mp4"
              loop
              autoPlay
              playsInline
              muted
              className="w-full h-full rounded-none block object-cover bg-[#4224ff] object-center z-10"
            ></video>

            {/* ---- Filter */}
            <div className="absolute top-0 left-0 w-full h-full bg-[#4224ff] opacity-50 z-20"></div>

            {/* ---- Content */}
            <div className="flex flex-col items-center justify-center gap-4 z-30 absolute top-0 left-0 w-full h-full text-white">
              <h1 className="text-5xl font-black text-center leading-relaxed tracking-widest mb-4 z-30 font-trap">
                <span className="text-7xl">Supercharge your</span>
                <br /> <BubbleText text="Creative Spark" />
                {/* <span className="bubbl-gradient text-6xl font-medium font-blackOpsOne">
                Flixe
              </span> */}
              </h1>
              <div className="text-center font-medium text-xl">
                Explore <WalletConnection text="flixe!" />
              </div>
            </div>
          </div>

          {/* Hover Images */}
          <HoverImages />

          {/* Details Page */}
          <div className="col-span-full text-center mt-[10vh]">
            <h2 className="text-9xl font-black text-primary mb-6 font-trap">
              Flixe Features
            </h2>
          </div>
          <DetailsPage />
        </div>

        <div className="md:hidden">
          {/* Hero Component */}
          <div className="relative bg-[#4224ff] rounded-b-md rounded-t-[2rem] overflow-hidden w-full h-[96.5vh]">
            {/* ---- Video */}
            <video
              src="https://framerusercontent.com/assets/FLBxqz4iuJBqu6uz8D8Ju2Tuzno.mp4"
              loop
              autoPlay
              playsInline
              muted
              className="w-full h-full rounded-none block object-cover bg-[#4224ff] object-center z-10"
            ></video>

            {/* ---- Filter */}
            <div className="absolute top-0 left-0 w-full h-full bg-[#4224ff] opacity-50 z-20"></div>

            {/* ---- Content */}
            {/* <div className="flex flex-col items-center justify-center gap-4 z-30 absolute top-0 left-0 w-full h-full text-white">
              <h1 className="font-black text-center leading-relaxed tracking-widest mb-4 z-30 font-trap">
                <span className="text-2xl font-bold">Welcome to Flixe</span>
                <p className="mt-2 text-sm text-left">
                  Flixe is currently best experienced on a desktop environment.
                  <br />
                  Please visit us from a computer to fully explore the vibrant
                  world of Flixe.
                </p>
              </h1>
            </div> */}
            <div className="flex flex-col items-center justify-center z-30 absolute top-0 left-0 w-full h-full text-white p-4">
              <h1 className="text-3xl font-bold mb-2">Welcome to Flixe</h1>
              <p className="text-center text-lg">
                Experience the full capabilities of Flixe from a desktop.
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  } else {
    return redirect("/cines");
  }
}
