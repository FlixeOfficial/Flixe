import Image from "next/image";
import Link from "next/link";

import { formatPrice } from "@/lib/format";
import { FlixProgress } from "@/components/flix-progress";
import { Separator } from "./ui/separator";

interface FlixCardProps {
  id: string;
  title: string;
  imageUrl: string;
  episodesLength: number;
  price: number;
  // progress: number | null;
  genre: string;
}

export const FlixCard = ({
  id,
  title,
  imageUrl,
  episodesLength,
  price,
  // progress,
  genre,
}: FlixCardProps) => {
  return (
    <Link href={`/cines/${id}`}>
      <div className="group hover:shadow-sm border rounded-lg p-2 h-full transition-all duration-300 transform hover:scale-105 overflow-hidden hover:bg-card hover:p-0">
        <div className="relative w-full aspect-[16/9] rounded-md overflow-hidden">
          <Image
            width={150}
            height={50}
            layout="responsive"
            className="w-full aspect-[16/9] object-cover"
            alt={title}
            src={imageUrl}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex flex-col justify-end h-full p-5 space-y-2">
            <div className="text-xl font-bold text-secondary dark:text-card-foreground line-clamp-2">
              {title}
            </div>
            <div className="flex flex-row gap-2">
              <p className="text-sm text-secondary dark:text-card-foreground font-medium">
                {genre}
              </p>
              <div className="flex items-center h-full">
                {" "}
                {/* This is your parent container */}
                <Separator
                  orientation="vertical"
                  className="h-[50%] bg-muted-foreground mx-auto"
                />
              </div>

              <div className="flex items-center gap-x-3 text-sm">
                <div className="flex items-center gap-x-2 text-secondary dark:text-card-foreground">
                  <span>
                    {episodesLength}
                    {episodesLength === 1 ? " Episode" : " Episodes"}
                  </span>
                </div>
              </div>
            </div>

            {/* {progress !== null ? (
                            <FlixProgress
                                variant={
                                    progress === 100 ? "success" : "default"
                                }
                                size="sm"
                                value={progress}
                            />
                        ) : ( */}
            <p className="text-md font-semibold text-secondary dark:text-card-foreground">
              {price !== null ? formatPrice(price) : "Not For Sale"}
            </p>
            {/* )} */}
          </div>
        </div>
      </div>
    </Link>
  );
};
