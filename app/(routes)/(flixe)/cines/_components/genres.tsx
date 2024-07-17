"use client";

import { Genre } from "@prisma/client";
import {
  FcEngineering,
  FcFilmReel,
  FcMultipleDevices,
  FcMusic,
  FcOldTimeCamera,
  FcSalesPerformance,
  FcSportsMode
} from "react-icons/fc";
import { IconType } from "react-icons";

import { GenreItem } from "./genre-item";

interface GenresProps {
  items: Genre[];
}

const iconMap: Record<Genre["name"], IconType> = {
  "All Flix": FcMultipleDevices,
  "Music": FcMusic,
  "Photography": FcOldTimeCamera,
  "Fitness": FcSportsMode,
  "Accounting": FcSalesPerformance,
  "Computer Science": FcMultipleDevices,
  "Filming": FcFilmReel,
  "Engineering": FcEngineering,
};

export const Genres = ({
  items,
}: GenresProps) => {
  const allGenre = { id: "all", name: "All" };
  const genres = [allGenre, ...items];

  return (
    <div className="flex items-center gap-x-2 overflow-x-auto">
      {genres.map((item) => (
        <GenreItem
          key={item.id}
          label={item.name}
          icon={iconMap[item.name]}
          value={item.id}
        />
      ))}
    </div>
  )
}
