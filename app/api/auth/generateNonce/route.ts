import prisma from '@/lib/prisma/prismadb';
import crypto from 'crypto';
import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';

interface CryptoNonceResponse {
  nonce: string;
  expires: string;
}

async function upsertUserWithNonce(
  name: string,
  walletAddress: string,
  nonce: string,
  expires: Date,
  retries = 3,
  delay = 1000
): Promise<void> {
  try {
    await prisma.user.upsert({
      where: { walletAddress },
      create: {
        id: walletAddress.toLowerCase(),
        name,
        email: walletAddress.toLowerCase(),
        username: walletAddress.toLowerCase(),
        walletAddress: walletAddress.toLowerCase(),
        loginNonce: {
          create: {
            nonce,
            expires,
          },
        },
      },
      update: {
        loginNonce: {
          upsert: {
            create: {
              nonce,
              expires,
            },
            update: {
              nonce,
              expires,
            },
          },
        },
      },
    });
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return await upsertUserWithNonce(
        name,
        walletAddress,
        nonce,
        expires,
        retries - 1,
        delay
      );
    } else {
      throw error;
    }
  }
}

export async function POST(request: Request) {
  const { walletAddress, name } = (await request.json()) as any;

  const nonce = crypto.randomBytes(32).toString('hex');
  const expires = new Date(new Date().getTime() + 1000 * 60 * 60);

  try {
    await upsertUserWithNonce(name, walletAddress, nonce, expires);
    return NextResponse.json(
      {
        nonce,
        expires: expires.toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle specific Prisma errors
      switch (error.code) {
        case 'P2002': // Unique constraint violation
          return NextResponse.json(
            {
              error: 'A user with this wallet address already exists.',
            },
            { status: 409 }
          );
        default:
          return NextResponse.json(
            {
              error:
                'Default Error Failed to generate nonce. Please try again later.',
            },
            { status: 500 }
          );
      }
    } else {
      // Handle other errors
      return NextResponse.json(
        {
          error: 'Failed to generate nonce. Please try again later.',
        },
        { status: 500 }
      );
    }
  }
}
