import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (request.method !== "GET") {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 405 }
    );
  }

  try {
    const category = await db.category.findMany({
      where: {
        id: params.id,
      },
    });

    if (!category) {
      throw new Error("Category not found");
    }

    return NextResponse.json(category[0].name, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 400 }
    );
  }
}
