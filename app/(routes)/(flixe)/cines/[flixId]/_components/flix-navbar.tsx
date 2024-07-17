import { Episode, Flix, UserProgress } from "@prisma/client";

import { FlixMobileSidebar } from "./flix-mobile-sidebar";

interface FlixNavbarProps {
  flix: Flix & {
    episodes: (Episode & {
      userProgress: UserProgress[] | null;
    })[];
  };
  progressCount: number;
}

export const FlixNavbar = ({ flix, progressCount }: FlixNavbarProps) => {
  return (
    <div className="p-4 border-b h-full flex items-center bg-primary shadow-sm">
      <FlixMobileSidebar flix={flix} progressCount={progressCount} />
    </div>
  );
};
