import { Genre, Flix } from "@prisma/client";

import { FlixCard } from "@/components/flix-card";

type FlixWithProgressWithGenre = Flix & {
  genre: Genre | null;
  episodes: { id: string }[];
  // progress: number | null;
};

interface FlixsListProps {
  items: FlixWithProgressWithGenre[];
}

export const FlixsList = ({ items }: FlixsListProps) => {
  return (
    <div>
      {items.length === 0 && (
        <div className="text-center text-sm text-muted-foreground mt-10">
          No flixs found
        </div>
      )}
      
      <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
        {items.map((item) => (
          <FlixCard
            key={item.id}
            id={item.id}
            title={item.title}
            imageUrl={item.imageUrl!}
            episodesLength={item.episodes.length}
            price={item.price!}
            // progress={item.progress}
            genre={item?.genre?.name!}
          />
        ))}
      </div>
    </div>
  );
};
