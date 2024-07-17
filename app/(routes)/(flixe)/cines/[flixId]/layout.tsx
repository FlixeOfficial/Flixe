import { redirect } from "next/navigation";

import { db } from "@/lib/db";

import authOptions from "@/app/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";

interface Session {
    user?: {
        email: string;
    };
}

const FlixLayout = async ({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { flixId: string };
}) => {
    const session: Session | null = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return redirect("/");
    }

    const flix = await db.flix.findUnique({
        where: {
            id: params.flixId,
        },
        include: {
            episodes: {
                where: {
                    isPublished: true,
                },
                include: {
                    userProgress: {
                        where: {
                            userId: session.user.email.toLowerCase(),
                        },
                    },
                },
                orderBy: {
                    position: "asc",
                },
            },
        },
    });

    if (!flix) {
        return redirect("/");
    }

    // const progressCount = await getProgress(session.user.email, flix.id);

    return (
        <div className="h-full">
            {/* <div className="h-[80px] md:pl-80 fixed inset-y-0 w-full z-50">
                <FlixNavbar flix={flix} progressCount={progressCount} />
            </div> */}
            {/* <div className="hidden md:flex h-full w-80 flex-col fixed inset-y-0 z-50">
                <FlixSidebar flix={flix} progressCount={progressCount} />
            </div> */}
            <main className="h-full">{children}</main>
        </div>
    );
};

export default FlixLayout;
