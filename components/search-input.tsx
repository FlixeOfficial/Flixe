"use client";

import qs from "query-string";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";

export const SearchInput = () => {
  const [value, setValue] = useState("");
  const debouncedValue = useDebounce(value);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentGenreId = searchParams.get("genreId");

  useEffect(() => {
    const url = qs.stringifyUrl(
      {
        url: pathname,
        query: {
          genreId: currentGenreId,
          title: debouncedValue,
        },
      },
      { skipEmptyString: true, skipNull: true }
    );

    router.push(url);
  }, [debouncedValue, currentGenreId, router, pathname]);

  return (
    <div className="relative">
      <Search className="h-4 w-4 absolute top-3 left-3 text-muted-foreground dark:text-muted-foreground" />
      <Input
        onChange={(e) => setValue(e.target.value)}
        value={value}
        className="w-full md:w-[300px] md:focus:w-[350px] pl-9 pr-3 py-2 rounded-full border bg-card text-card-foreground placeholder-muted-foreground focus:outline-none focus-visible:ring-2 focus-vissible:border-red focus-visible:ring-background focus:border-primary dark:bg-card dark:border-border dark:text-card-foreground dark:placeholder-muted-foreground dark:focus-visible:ring-background transition-all duration-300 ease-in-out"
        placeholder="Search for Cines"
      />
    </div>
  );
};
