import localFont from "next/font/local";

import Header from "@/components/header";
import "@/styles/globals.css";
import type { Metadata } from "next";
import { Chivo_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import NextAuthProvider from "@/components/NextAuthProvider";
import Providers from "@/components/Providers";

import authOptions from "@/app/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import Home from "./(routes)/(flixe)/(home)/page";
import HomeHeader from '@/components/home-header';

import { Analytics } from "@vercel/analytics/react";

interface Session {
  user?: {
    email: string;
  };
}

const trap = localFont({
  src: [
    {
      path: './fonts/Trap/Trap-Light.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: './fonts/Trap/Trap-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/Trap/Trap-Medium.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/Trap/Trap-SemiBold.otf',
      weight: '600',
      style: 'normal',
    },
    {
      path: './fonts/Trap/Trap-Bold.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/Trap/Trap-ExtraBold.otf',
      weight: '800',
      style: 'normal',
    },
    {
      path: './fonts/Trap/Trap-Black.otf',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: "--font-trap",
})

const chivoMono = Chivo_Mono({ weight: "variable", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Flixe",
  description: "Flixe - Revolutionizing the Creator Economy",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session: Session | null = await getServerSession(authOptions);

  return (
    <html lang="en" className={trap.variable}>
      <body className={chivoMono.className}>
        <Providers>
          <NextAuthProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              {!session?.user?.email ? (
                <>
                  <HomeHeader />
                  <Home />
                </>
              ) : (
                <>
                  <Header />
                  <div className="mt-[4.5rem] sm:max-w-[90%] min-[2300px]:max-w-[80%] m-auto">
                    {children}
                  </div>
                </>
              )}
              <Analytics />
              {/* <div className="absolute inset-0 bg-dot-neutral-800 pointer-events-none select-none z-[-1]"></div> */}
              <Toaster />
            </ThemeProvider>
          </NextAuthProvider>
        </Providers>
      </body>
    </html>
  );
}
