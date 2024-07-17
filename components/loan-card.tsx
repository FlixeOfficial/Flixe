import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { daysLeft } from "@/lib/daysLeft";
import { fetchIPFSJson } from "@/service/pinataService";
import { Skeleton } from "@/components/ui/skeleton";
import LoanVaultInteraction from "@/contracts/interaction/LoanVault";

interface LoanCardProps {
  loanId: string;
}

const fetchLoanData = async (loanId: any) => {
  const LoanVault = LoanVaultInteraction();
  const tokenURI = await LoanVault.getLoanTokenURI(loanId);
  const data1 = await fetchIPFSJson(tokenURI);
  const data2 = await LoanVault.getLoanDetails(loanId);
  const data = { ...data1, borrower: data2.borrower, lender: data2.lender, status: data2.status };
  console.log("data: ", data);
  return data;
};

const LoanCardSkeleton = () => {
  return (
    <div className="group hover:shadow-sm w-full rounded-3xl bg-card cursor-pointer hover:bg-card max-w-sm max-h-[18rem]">
      <Skeleton className="w-full aspect-[16/9] rounded-t-3xl max-h-[200px]" />
      <div className="p-4 space-y-4 mx-3">
        <Skeleton className="h-6 w-3/4 rounded" />
        <div className="flex justify-between items-center space-x-2">
          <Skeleton className="h-4 w-1/4 rounded" />
          <Skeleton className="h-4 w-1/2 rounded" />
        </div>
      </div>
    </div>
  );
};

const LoanCard: React.FC<LoanCardProps> = ({ loanId }) => {
  const router = useRouter();

  const { data, error } = useSWR(loanId, () => fetchLoanData(loanId));

  // if (error) return <div>Failed to load</div>;
  if (!data) return <LoanCardSkeleton />;

  const handleCardClick = () => {
    if (!data) return;
    const loanData = {
      ...data,
      remainingDays,
    };
    const loanDataStringified = JSON.stringify(loanData, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    );

    localStorage.setItem(`loanData-${loanId}`, loanDataStringified);
    router.push(`/fundz/loan/${loanId}/${encodeURIComponent(data.title || '')}`);
  };

  const price = data.price;
  const remainingDays = daysLeft(Number(data.deadline));

  return (
    <div
      className="group hover:shadow-sm w-full rounded-3xl bg-card cursor-pointer hover:bg-card max-w-sm max-h-[18rem]"
      onClick={handleCardClick}
    >
      <div className="relative">
        <Image
          src={data ? data.imageUrl : ""}
          alt={`Selected thumbnail`}
          className={`w-full object-cover rounded-t-3xl max-h-[200px] min-h-[200px]`}
          width={150}
          height={50}
          layout="responsive"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex flex-col justify-end h-full p-5 space-y-3">
            <p className="text-muted dark:text-primary mb-2 text-sm">
              {data?.shortDescription || "Loading..."}
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col p-4 space-y-4 mx-3">
        <div>
          <h3 className="text-xl font-bold text-primary leading-6 truncate">
            {data?.title || "Loading..."}
          </h3>
        </div>

        <div className="flex justify-between items-center space-x-2">
          <div className="flex items-center">
            <h4 className="text-sm font-semibold text-[#6ca987]">
              <span className="text-primary font-medium">Need&nbsp;</span>
              {price ? price : 70} TFUEL
            </h4>
          </div>
          <div className="flex items-center">
            <h4 className="text-sm font-semibold text-foreground">
              {remainingDays}
              <span className="text-sm text-primary truncate">
                &nbsp;{remainingDays > 1 ? "Day Left" : "Days Left"}
              </span>
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanCard;
