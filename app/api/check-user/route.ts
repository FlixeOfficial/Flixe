import prisma from "@/lib/prisma/prismadb";
import { NextResponse } from "next/server";

interface CheckUserRequestBody {
    walletAddress: string;
}

export async function POST(request: Request) {
    try {
        const { walletAddress } = (await request.json()) as any;

        if (!walletAddress) {
            return new NextResponse("wallet address error", { status: 400 });
        }
        // Check if the wallet address already exists
        const existingUser = await prisma.user.findFirst({
          where: {
            id: {
              equals: walletAddress.toLowerCase(),
              mode: 'insensitive',
            },
          },
        });

        const name = existingUser ? existingUser?.name : "annonimous";
        // Return a boolean value indicating whether the user exists or not
        const userExists: boolean = !!existingUser;
        return NextResponse.json({ userExists, name }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}
