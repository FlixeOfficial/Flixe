import { db } from "@/lib/db";
import { redirect } from "next/navigation";

const FlixIdPage = async ({
  params
}: {
  params: { flixId: string; }
}) => {
  const flix = await db.flix.findUnique({
    where: {
      id: params.flixId,
    },
    include: {
      episodes: {
        where: {
          isPublished: true,
        },
        orderBy: {
          position: "asc"
        }
      }
    }
  });

  if (!flix) {
    return redirect("/");
  }

  return redirect(`/cines/${flix.id}/episodes/${flix.episodes[0].id}`);
}
 
export default FlixIdPage;