"use client";

import Image from "next/image";
import { DarkModeToggle } from "@/components/dark-mode-toggle";
import { WalletConnection } from "./wallet-connection";
import Link from "next/link";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import Confetti from "react-confetti";
import { useRouter } from "next/navigation";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isStudioPage, setIsStudioPage] = useState(
    pathname?.startsWith("/studio")
  );

  const logoRef = useRef<HTMLDivElement | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiOpacity, setConfettiOpacity] = useState(1);

  const menuItems = isStudioPage
    ? [
      "/studio/cines",
      "/studio/adware",
      "/studio/profile",
    ]
    : ["/cines", "/buzz/post", "/fundz", "/flixpass"];

  const isActive = (path: string) => {
    return pathname.startsWith(path) ? "text-primary text-bold" : "";
  };

  const handleToggle = (event: React.MouseEvent) => {
    if (logoRef.current) {
      const toggleConfetti = event.type === "mousedown";
      logoRef.current.classList.toggle("scale-90", toggleConfetti);
      setShowConfetti(toggleConfetti);
      setConfettiOpacity(toggleConfetti ? 1 : 0);
    }
  };

  const handleNavigation = async (url: string, isStudio: boolean) => {
    await router.push(url);
    setIsStudioPage(isStudio);
  };

  return (
    <>
      {showConfetti && (
        <Confetti style={{ opacity: confettiOpacity }} numberOfPieces={200} />
      )}

      <div className="fixed top-3 left-0 right-0 mx-auto h-12 xl:max-w-[65vw] w-[120vw] lg:max-w-[80vw] md:max-w-[90vw] sm:max-w-[95vw] bg-[#27272733] bg-opacity-50 backdrop-filter backdrop-blur-lg overflow-hidden rounded-2xl border border-border/40 flex justify-between px-1.5 items-center z-50">
        {/* Left Section */}
        <div className="flex gap-4 xl:gap-20">
          <div
            ref={logoRef}
            className="transform transition-transform duration-200 cursor-pointer flex gap-1 items-center"
            onMouseDown={handleToggle}
            onMouseUp={handleToggle}
            onMouseLeave={handleToggle}
          >
            <Image src="/flixe.svg" alt="logo" width={30} height={30} className='ml-[6px]' />
            <span className="text-[.7rem] font-bold text-yellow-600 dark:text-yellow-100">
              beta
            </span>
          </div>

          <Tabs
            defaultValue={isStudioPage ? "studio" : "oasis"}
            className="w-[300px]"
          >
            <TabsList className="backdrop-blur-md border border-border/40 font-bold text-muted-foreground hover:text-primary bg-transparent">
              <TabsTrigger
                value="oasis"
                className="py-1 px-2 rounded-sm data-[state=active]:bg-foreground/5"
                onClick={() => handleNavigation("/cines", false)}
              >
                <a>Oasis</a>
              </TabsTrigger>
              <TabsTrigger
                value="studio"
                className="py-1 px-2 rounded-sm data-[state=active]:bg-foreground/5"
                onClick={() => handleNavigation("/studio/cines", true)}
              >
                <a>Studio</a>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Middle Section */}
        <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-5 font-semibold text-md ">
          {menuItems.map((item) => (
            <Link key={item} href={item}>
              <Button
                variant="ghost"
                className={`text-muted-foreground hover:text-primary/90 font-semibold text-md capitalize hover:bg-transparent ${isActive(
                  item
                )}`}
              >
                {item.split("/").pop()}
              </Button>
            </Link>
          ))}
        </div>

        {/* Right Section */}
        <div className="flex gap-3">
          <WalletConnection />
          <DarkModeToggle />
        </div>
      </div>
    </>
  );
}
