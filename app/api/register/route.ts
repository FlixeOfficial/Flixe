import prisma from "@/lib/prisma/prismadb";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

function isPrismaClientKnownRequestError(
    error: unknown
): error is Prisma.PrismaClientKnownRequestError {
    return (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        "meta" in error
    );
}

export async function POST(request: Request) {
    try {
        const { walletAddress, username, name } = await request.json();
        // Create a new user with the wallet address, username, and name
        if (!walletAddress || !username || !name) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const user = await prisma.user.create({
          data: {
            id: walletAddress.toLowerCase(),
            walletAddress: walletAddress.toLowerCase(),
            username,
            name,
            email: walletAddress.toLowerCase(),
          },
        });

        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        if (
            isPrismaClientKnownRequestError(error) &&
            error.code === "P2002" &&
            error.meta?.target === "User_username_key"
        ) {
            NextResponse.json({ error: "User already exist" }, { status: 400 });
        } else {
            return NextResponse.json(
                { error: "Something went wrong" },
                { status: 500 }
            );
        }
    }
}
