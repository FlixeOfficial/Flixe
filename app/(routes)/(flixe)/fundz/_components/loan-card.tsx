import React, { useEffect, useState } from "react";
import { daysLeft } from "@/lib/daysLeft";
import Image from "next/image";
import { fetchIPFSJson } from "@/service/pinataService";
import BigNumber from "bignumber.js";
import { useRouter } from "next/navigation";
import { fromWei } from 'web3-utils';

interface LoanCardProps {
  owner: string;
  target: number;
  deadline: BigNumber;
  amountCollected: number;
  campaignURI: string;
  id: number;
}

const LoanCard: React.FC<LoanCardProps> = ({
  owner,
  target,
  deadline,
  amountCollected,
  campaignURI,
  id,
}) => {
  const [data, setData] = useState<{
    endDate: string;
    story: string;
    title: string;
    storyOneline: string;
    imageUrl: string;
  } | null>(null);

  const price = fromWei(target, 'ether');
  const remainingDays = daysLeft(Number(deadline));
  const collected = fromWei(Number(amountCollected), 'ether');

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetchIPFSJson(campaignURI);
        setData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [campaignURI]);

  const handleCardClick = () => {
    const campaignData = {
      ...data,
      owner: owner,
      amountCollected: collected,
      remainingDays: remainingDays,
    };
    // Store your data in localStorage
    localStorage.setItem(`campaignData-${id}`, JSON.stringify(campaignData));
    // Navigate to your desired route
    router.push(
      `/fundz/funding${id}/${encodeURIComponent(data?.title || "")}`
    );
  };

  return !data ? (
    <div
      className="group hover:shadow-sm w-full rounded-3xl bg-card cursor-pointer hover:bg-card max-w-md max-h-md"
      onClick={handleCardClick}
    >
      <div className="relative">
        <Image
          src="https://utfs.io/f/f7fed7cb-37ab-4adf-bd74-12885043d1b6-gvfqrp.webp"
          alt={`Selected thumbnail`}
          className={`w-full object-cover rounded-t-3xl max-h-[250px]`}
          width={150}
          height={50}
          layout="responsive"
        />
      </div>
      <div className="flex flex-col p-4 space-y-4 mx-3">
        <div>
          <h3 className="text-2xl font-bold text-primary leading-6 truncate">
            Loan for a Modern ART
          </h3>
        </div>

        <div className="flex justify-between items-center space-x-2">
          <div className="flex items-center">
            <h4 className="text-xl font-semibold text-[#6ca987]">
              {collected ? collected : 0} TFUEL
              <span className="text-md text-foreground truncate">
                <span className="text-gray-400 font-medium">
                  &nbsp;raised of&nbsp;
                </span>
                {price}
                &nbsp;TFUEL
              </span>
            </h4>
          </div>
          <div className="flex items-center">
            <h4 className="text-xl font-semibold text-foreground">
              {remainingDays}
              <span className="text-md text-gray-400 truncate">
                &nbsp;{remainingDays > 1 ? "Day Left" : "Days Left"}
              </span>
            </h4>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div> Loading </div>
  );
};

export default LoanCard;
