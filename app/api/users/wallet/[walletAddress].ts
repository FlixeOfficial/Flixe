import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma/prismadb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  try {
    const { walletAddress } = req.query;

    if (!walletAddress || typeof walletAddress !== 'string') {
      throw new Error('Invalid wallet address');
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        walletAddress: walletAddress.toLowerCase(),
      },
    });

    if (!existingUser) {
      throw new Error('User not found');
    }

    return res.status(200).json({ ...existingUser });
  } catch (error) {
    return res.status(400).end();
  }
}
