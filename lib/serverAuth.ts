import prisma from "@/lib/prisma/prismadb";
import authOptions from "@/app/api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";

interface Session {
    user?: {
        email: string;
    };
}

const serverAuth = async () => {
    const session: Session | null = await getServerSession(authOptions);

    if (!session?.user?.email) {
        throw new Error("Not signed in");
    }

    const currentUser = await prisma.user.findUnique({
        where: {
            walletAddress: session.user.email.toLowerCase(),
        },
    });

    if (!currentUser) {
        throw new Error("No user with this id");
    }

    return { currentUser };
};

export default serverAuth;
