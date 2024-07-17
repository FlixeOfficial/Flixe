import { Menu } from "lucide-react";
import { Episode, Flix, UserProgress } from "@prisma/client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { FlixSidebar } from "./flix-sidebar";

interface FlixMobileSidebarProps {
  flix: Flix & {
    episodes: (Episode & {
      userProgress: UserProgress[] | null;
    })[];
  };
  progressCount: number;
}

export const FlixMobileSidebar = ({
  flix,
  progressCount,
}: FlixMobileSidebarProps) => {
  return (
    <Sheet>
      <SheetTrigger className="md:hidden pr-4 hover:opacity-75 transition">
        <Menu />
      </SheetTrigger>
      <SheetContent side="left" className="p-0 bg-primary w-72">
        <FlixSidebar flix={flix} progressCount={progressCount} />
      </SheetContent>
    </Sheet>
  );
};
