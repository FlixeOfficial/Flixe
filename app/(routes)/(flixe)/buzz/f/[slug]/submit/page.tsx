import { Editor } from "@/components/BuzzEditor";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

interface pageProps {
  params: {
    slug: string;
  };
}

const page = async ({ params }: pageProps) => {
  const subreddit = await db.subreddit.findFirst({
    where: {
      name: params.slug,
    },
  });

  if (!subreddit) return notFound();

  return (
    <div className="flex flex-col items-start gap-6">
      {/* heading */}
      <div className="border-b pb-5">
        <div className="-ml-2 -mt-2 flex flex-wrap items-baseline text-3xl">
          <h3 className="ml-2 mt-2 text-3xl font-semibold leading-6 text-primary">
            Create Post
          </h3>
          <p className="ml-2 mt-1 truncate text-xl text-primary-80">
            in f/{params.slug}
          </p>
        </div>
      </div>

      {/* form */}
      <Editor subredditId={subreddit.id} />

      <div className="w-full flex justify-end">
        <Button type="submit" form="subreddit-post-form">
          Post
        </Button>
      </div>
    </div>
  );
};

export default page;
