"use client";

import qs from "query-string";
import { IconType } from "react-icons";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

interface GenreItemProps {
  label: string;
  value?: string;
  icon?: IconType;
}

export const GenreItem = ({
  label,
  value,
  icon: Icon,
}: GenreItemProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentGenreId = searchParams.get("genreId");
  const currentTitle = searchParams.get("title");

  const isSelected =
    !currentGenreId && value === "all" ? true : currentGenreId === value;

  const onClick = () => {
    let newQuery = {
      title: currentTitle,
      genreId: isSelected || value === "all" ? null : value,
    };

    const url = qs.stringifyUrl(
      {
        url: pathname,
        query: newQuery,
      },
      { skipNull: true, skipEmptyString: true }
    );

    router.push(url);
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "py-1 px-3 text-sm rounded-full flex items-center gap-x-1 transition",
        "border bg-card text-card-foreground hover:bg-secondary",
        "dark:border-dark-foreground dark:bg-card dark:text-card-foreground/90 dark:hover:bg-secondary",
        isSelected &&
          "bg-primary/60 text-primary-foreground hover:bg-primary/70 dark:bg-primary/90 dark:text-primary-foreground dark:hover:bg-primary/70"
      )}
      type="button"
    >
      {Icon && <Icon size={20} />}
      <div className="truncate">{label}</div>
    </button>
  );
};
