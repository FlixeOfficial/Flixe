import serverAuth from "@/lib/serverAuth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    if (request.method !== "GET") {
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 405 }
        );
    }

    try {
        const { currentUser } = await serverAuth();

        return NextResponse.json(currentUser, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 400 }
        );
    }
}
