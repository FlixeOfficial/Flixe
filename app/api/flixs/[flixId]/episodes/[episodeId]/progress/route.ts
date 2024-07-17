import { NextResponse } from "next/server";

import { db } from "@/lib/db";

import authOptions from "@/app/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";

interface Session {
  user?: {
    email: string;
  };
}

export async function PUT(
  req: Request,
  { params }: { params: { flixId: string; episodeId: string } }
) {
  try {
    const session: Session | null = await getServerSession(authOptions);
    const { isCompleted } = await req.json();

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userProgress = await db.userProgress.upsert({
      where: {
        userId_episodeId: {
          userId: session.user.email.toLowerCase(),
          episodeId: params.episodeId,
        },
      },
      update: {
        isCompleted,
      },
      create: {
        userId: session.user.email.toLowerCase(),
        episodeId: params.episodeId,
        isCompleted,
      },
    });

    return NextResponse.json(userProgress);
  } catch (error) {
    console.log("[EPISODE_ID_PROGRESS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
