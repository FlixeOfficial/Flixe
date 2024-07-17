import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import authOptions from "@/app/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { Banner } from "@/components/banner";
import { TitleForm } from "./_components/title-form";
import { DescriptionForm } from "./_components/description-form";
import { ImageForm } from "./_components/image-form";
import { GenreForm } from "./_components/flix-form";
import { PriceForm } from "./_components/price-form";
import { EpisodesForm } from "./_components/episodes-form";
import { Actions } from "./_components/actions";
import { NftForm } from "./_components/nft-form";
import { ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { BudgetForm } from './_components/budget-form';
import { FinanceForm } from './_components/finance-type';
import { CastCrewForm } from './_components/castNcrew';

interface Session {
  user?: {
    email: string;
  };
}

const FlixIdPage = async ({ params }: { params: { flixId: string } }) => {
  const session: Session | null = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return redirect("/");
  }

  const flix = await db.flix.findUnique({
    where: {
      id: params.flixId,
      userId: session.user.email.toLowerCase(),
    },
    include: {
      episodes: {
        orderBy: {
          position: "asc",
        },
      },
      flixSaleDetails: true,
      finance: true,
    },
  });

  if (!flix) {
    return redirect("/");
  }

  const financeData = flix.finance || {
    castAndCrew: [],
    budget: 0,
    financeType: '',
  };

  const genres = await db.genre.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const requiredFields = [
    flix.title,
    flix.description,
    flix.imageUrl,
    flix.genreId,
    flix.episodes.some((episode) => episode.isPublished),
  ];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;

  const completionText = `(${completedFields}/${totalFields})`;

  const isComplete = requiredFields.every(Boolean);

  return (
    <div className="p-4 flex flex-col gap-6">
      {!flix.isPublished && (
        <Banner
          variant="warning-bottom"
          label="This flix is unpublished and not yet ready for public eyes!"
        />
      )}

      <div className="flex items-center justify-between bg-card border rounded-md px-4 py-2">
        <div className="flex items-center flex-row justify-center align-middle">
          <Link
            href={`/studio/cines`}
            className="text-sm hover:opacity-75 transition -ml-4 -my-2 mr-4 rounded-l-md bg-background/30 hover:bg-background/70"
          >
            <ArrowLeft className="h-4 w-4 mx-4 my-4" />
          </Link>
          <Separator orientation="vertical" />
          <div className="font-medium flex flex-col gap-4">
            <h1 className="text-3xl font-bold tracking-wider">
              Setup{" "}
              <span className="font-bold text-[#8b7ad0]">{flix.title}</span>
            </h1>
          </div>
        </div>
        <Actions
          disabled={!isComplete || !flix.isNFT}
          flixId={params.flixId}
          isPublished={flix.isPublished}
          completionText={completionText}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2 border-border/90 rounded-md">
        <div>
          <div className="flex items-center gap-x-2">
            <h2 className="text-xl font-bold">Flix Details</h2>
          </div>
          <TitleForm initialData={flix} flixId={flix.id} />
          <DescriptionForm initialData={flix} flixId={flix.id} />
          <GenreForm
            initialData={flix}
            flixId={flix.id}
            options={genres.map((genre) => ({
              label: genre.name,
              value: genre.id,
            }))}
          />
          <div className='bg-card border rounded-lg p-4 flex flex-col gap-4 mt-6'>
            <div>
              <div className="flex items-center gap-x-2 font-bold">
                <h2 className="text-xl">Budget</h2>
              </div>
              <BudgetForm initialData={{ budget: financeData.budget ?? 0 }} flixId={flix.id} />
            </div>
            <div>
              <div className="flex items-center gap-x-2 font-bold">
                <h2 className="text-xl">Finance Type</h2>
              </div>
              {/* @ts-ignore */}
              <FinanceForm initialData={financeData} flixId={flix.id} />
            </div>
            <div>
              <div className="flex items-center gap-x-2 font-bold">
                <h2 className="text-xl">Cast & Crew</h2>
              </div>
              {/* @ts-ignore */}
              <CastCrewForm initialData={{ castAndCrew: financeData.castAndCrew ?? [] }} flixId={flix.id} />
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-x-2 font-bold">
              <h2 className="text-xl">Flix episodes</h2>
            </div>
            <EpisodesForm initialData={flix} flixId={flix.id} />
          </div>
          <div>
            <div className="flex items-center gap-x-2 font-bold">
              <h2 className="text-xl">Flix as NFT</h2>
            </div>
            <NftForm
              initialData={flix}
              flixId={flix.id}
              isComplete={isComplete}
            />
            <PriceForm initialData={flix} flixId={flix.id} />
          </div>
          <ImageForm initialData={flix} flixId={flix.id} />
        </div>
      </div>
    </div>
  );
};

export default FlixIdPage;