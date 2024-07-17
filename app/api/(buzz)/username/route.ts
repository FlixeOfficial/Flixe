import authOptions from "@/app/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { db } from '@/lib/db'
import { UsernameValidator } from '@/lib/validators/username'
import { z } from 'zod'

interface Session {
  user?: {
    email: string;
  };
}


export async function PATCH(req: Request) {
  try {
  const session: Session | null = await getServerSession(authOptions);

    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { name } = UsernameValidator.parse(body)

    // check if username is taken
    const username = await db.user.findFirst({
      where: {
        username: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });

    if (username) {
      return new Response('Username is taken', { status: 409 })
    }

    // update username
    await db.user.update({
      where: {
        id: session?.user?.email,
      },
      data: {
        username: name,
      },
    })

    return new Response('OK')
  } catch (error) {
    (error)

    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 400 })
    }

    return new Response(
      'Could not update username at this time. Please try later',
      { status: 500 }
    )
  }
}
