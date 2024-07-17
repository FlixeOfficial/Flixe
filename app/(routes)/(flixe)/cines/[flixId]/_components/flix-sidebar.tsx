import { Episode, Flix, UserProgress } from "@prisma/client";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { FlixProgress } from "@/components/flix-progress";

import { FlixSidebarItem } from "./flix-sidebar-item";

import authOptions from "@/app/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";

interface Session {
  user?: {
    email: string;
  };
}

interface FlixSidebarProps {
  flix: Flix & {
    episodes: (Episode & {
      userProgress: UserProgress[] | null;
    })[];
  };
  progressCount: number;
}

export const FlixSidebar = async ({
  flix,
  progressCount,
}: FlixSidebarProps) => {
  const session: Session | null = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return redirect("/");
  }

  // const purchase = await db.purchase.findUnique({
  //   where: {
  //     userId_flixId: {
  //       userId: session.user.email,
  //       flixId: flix.id,
  //     },
  //   },
  // });

  return (
    <div className="h-full flex flex-col overflow-y-auto shadow-sm">
      <div className="p-8 flex flex-col">
        <h1 className="font-semibold text-3xl m-auto">{flix.title}</h1>
        {/* {purchase && (
          <div className="mt-10">
            <FlixProgress variant="success" value={progressCount} />
          </div>
        )} */}
      </div>
      <div className="flex flex-col gap-1 w-full mx-auto">
        {flix.episodes.map((episode, index) => {

          let cardStyle = "";
          if (index === 0) {
            cardStyle = "rounded-t-xl";
          } else if (index === flix.episodes.length - 1) {
            cardStyle = "rounded-b-xl";
          }

          return (
            <FlixSidebarItem
              id={episode.id}
              key={episode.id}
              imageUrl={episode.imageUrl}
              label={episode.title}
              shortDescription={episode.shortdescription}
              isCompleted={!!episode.userProgress?.[0]?.isCompleted}
              flixId={flix.id}
              isLocked={!episode.isFree}
              cardStyle={cardStyle}
            />
          );
        })}
      </div>
    </div>
  );
};
