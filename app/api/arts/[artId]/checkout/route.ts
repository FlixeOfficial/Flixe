import { NextResponse } from "next/server";

import { db } from "@/lib/db";

import authOptions from "@/app/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";

interface Session {
    user?: {
        email: string;
    };
}

const contractAddress = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS;

export async function POST(
    req: Request,
    { params }: { params: { flixId: string } }
) {
    const { flixId } = params;

    try {
        const session: Session | null = await getServerSession(authOptions);

        const values = await req.json();

        if (
          !session?.user?.email ||
          (values.userId.toLowerCase() !== session.user.email.toLowerCase() &&
            values.userId.toLowerCase() !== contractAddress?.toLowerCase())
        ) {
          return new NextResponse('Unauthorized', { status: 401 });
        }

        if (
          values.userId.toLowerCase() !== session.user.email.toLowerCase() &&
          values.userId.toLowerCase() === contractAddress?.toLowerCase()
        ) {
          values.userId = session.user.email.toLowerCase();
        }

        const flix = await db.flix.findUnique({
            where: {
                id: params.flixId,
                isPublished: true,
            },
            include: {
                flixSaleDetails: true,
                episodes: true,
            },
        });

        if (!flix) {
            return new NextResponse("Not found", { status: 404 });
        }

        if (flix?.userId.toLowerCase() === session.user.email.toLowerCase()) {
          return new NextResponse('Already purchased', { status: 400 });
        }

        if (flix.flixSaleDetails) {
            await db.flixSaleDetails.delete({
                where: { id: flix.flixSaleDetails.id },
            });
        }

        const updatedFlix = await db.flix.update({
            where: {
                id: flixId,
                isPublished: true,
            },
            data: values,
        });

        return NextResponse.json(updatedFlix);
    } catch (error) {
        console.log("[FLIX_ID_CHECKOUT]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
