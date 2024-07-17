"use client";

import { CheckCircle, Lock, PlayCircle, PauseCircle, Ban } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import Image from "next/image";

interface FlixSidebarItemProps {
  id: string;
  label: string;
  imageUrl: string | null;
  shortDescription: string | null;
  isCompleted: boolean;
  flixId: string;
  isLocked: boolean;
  cardStyle: string;
}

export const FlixSidebarItem = ({
  id,
  label,
  imageUrl,
  shortDescription,
  isCompleted,
  flixId,
  isLocked,
  cardStyle,
}: FlixSidebarItemProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = pathname?.includes(id);
  const Icon = isLocked ? Lock : isCompleted ? CheckCircle : isActive ? PauseCircle : PlayCircle;

  const onClick = () => {
    router.push(`/cines/${flixId}/episodes/${id}`);
  };

  // Limit content to 300 characters
  const trimContent = (content: string | null): string => {
    if(!content) return "";
    return content.length > 300 ? content.substring(0, 297) + "..." : content;
  };

  const shortDes = trimContent(shortDescription);

  return (
    <button
    onClick={onClick}
    className={`flex items-start ${cardStyle} dark:bg-card border hover:text-lightPrimary transition-all group`} 
    >
      <div className="relative w-1/4 h-48 mr-4">
        {imageUrl && (
          <div className="relative h-full rounded-md overflow-hidden">
            <Image
              src={imageUrl}
              alt={label}
              layout="fill"
              objectFit="cover"
              className="rounded-md"
            />
          </div>
        )}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent dark:to-card rounded-md"></div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="p-2 bg-[#00000057] rounded-full bg-opacity-10 backdrop-blur-sm pointer-events-none border">          
          <Icon
            size={26}
            className={cn(
              "dark:text-primary",
              isActive && "dark:text-primary border-2-primary",
              isCompleted && "dark:text-primary"
            )}
          />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-start p-5 pl-10">
        <h1 className="text-2xl dark:text-primary mb-2 text-left font-bold tracking-wider">
          {label}
        </h1>
        <p className="text-md dark:text-muted-foreground max-w-2xl text-left">
          {shortDes}
        </p>
      </div>
    </button>
  );
};
