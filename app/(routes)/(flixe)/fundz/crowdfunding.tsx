"use client";

import React from "react";
import useSWR from "swr";
import DisplayCampaigns from "@/components/DisplayCampaigns";
import { Button } from "@/components/ui/button";
import { PlusCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import CrowdFundingInteraction from "@/contracts/interaction/CrowdFundingInteraction";

interface Campaign {
  id: number;
  name: string;
}

// Define a fetcher function for SWR
const fetchCampaigns = async () => {
  const crowdFunding = CrowdFundingInteraction();
  const data = await crowdFunding.getCampaigns();
  return data;
};

const Crowdfunding: React.FC = () => {
  const {
    data: campaigns,
    error,
    mutate,
  } = useSWR<Campaign[]>("campaigns", fetchCampaigns, {
    revalidateOnFocus: false, // Optionally, disable revalidation on focus
  });
  const isLoading = !campaigns && !error;

  const handleRefresh = async () => {
    await mutate(); // Re-fetch data
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between bg-card border rounded-md px-4 py-2 -mt-2">
        <div className="flex-1 flex flex-row justify-between">
          <h1 className="text-3xl font-bold tracking-wider">
            All{" "}
            <span className="font-bold text-[#6ca987]">
              Crowdfunding Campaigns
            </span>
          </h1>
          <div className="flex flex-row gap-3">
            <p className="self-center font-bold">({campaigns?.length || 0})</p>
            <Button
              onClick={handleRefresh}
              className="self-center font-bold"
              variant="ghost"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            {/* <Link href="/fundz/crowdfunding/create" passHref>
              <Button className="font-bold">
                <PlusCircle className="h-4 w-4 mr-2" />
                New Campaign
              </Button>
            </Link> */}
          </div>
        </div>
      </div>
      <DisplayCampaigns isLoading={isLoading} campaigns={campaigns || []} />
    </div>
  );
};

export default Crowdfunding;
