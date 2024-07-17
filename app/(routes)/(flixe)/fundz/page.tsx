"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreateLoanProposal from "./_components/proposeLoan";
import LendLoan from "./_components/lendLoan";
import { Separator } from "@/components/ui/separator";
import Crowdfunding from "./crowdfunding";
import CreateCampaign from "./_components/create-campaign";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
    const searchParams = useSearchParams();
  const tab = searchParams.get('tab'); // Read the 'tab' query parameter from the URL

  // State to manage the current active tab
  const [activeTab, setActiveTab] = useState(tab || "proposals");

  // Effect to update the active tab when the URL changes
  useEffect(() => {
    if (tab) {
      setActiveTab(tab);
    }
  }, [tab]);

  // Function to change tabs and update the URL
  const handleTabChange = (newTab: any) => {
    setActiveTab(newTab);
    router.push(`/fundz?tab=${newTab}`);
  };

  return (
    <main className="flex min-h-screen flex-row">
      <Tabs
        defaultValue={activeTab}
        className="flex w-full"
        onValueChange={handleTabChange}
      >
        <div className="relative flex min-h-screen pr-8">
          <div className="sticky top-[6rem] border overflow-auto bg-card shadow rounded-lg max-h-96 w-64">
            <TabsList className="flex flex-col w-full bg-transparent space-y-2 -p-2">
              <h2 className="text-lg font-semibold py-2 text-foreground/30 bg-background w-full text-center">
                Funding
              </h2>
              <div className="flex flex-col space-y-1 w-full p-2">
                {/* Updated TabsTrigger to use handleTabChange */}
                <TabsTrigger
                  value="proposals"
                  className="w-full justify-start px-4 py-3 hover:bg-muted border border-card data-[state=active]:border-border font-bold"
                  onClick={() => handleTabChange("proposals")}
                >
                  Loan Proposals
                </TabsTrigger>
                <TabsTrigger
                  value="new_proposal"
                  className="w-full justify-start px-4 py-3 hover:bg-muted border border-card data-[state=active]:border-border font-bold"
                  onClick={() => handleTabChange("new_proposal")}
                >
                  Propose Loan
                </TabsTrigger>
              </div>

              <Separator className="my-4" />

              <div className="flex flex-col space-y-1 w-full p-2">
                <TabsTrigger
                  value="campaigns"
                  className="w-full justify-start px-4 py-3 hover:bg-muted border border-card data-[state=active]:border-border font-bold"
                  onClick={() => handleTabChange("campaigns")}
                >
                  Fund Campaigns
                </TabsTrigger>
                <TabsTrigger
                  value="new_campaign"
                  className="w-full justify-start px-4 py-3 hover:bg-muted border border-card data-[state=active]:border-border font-bold"
                  onClick={() => handleTabChange("new_campaign")}
                >
                  Create Campaign
                </TabsTrigger>
              </div>
            </TabsList>
          </div>
        </div>

        <div className="flex-grow overflow-hidden mt-6">
          <TabsContent
            value="proposals"
            className="border-none p-0 outline-none"
          >
            <LendLoan />
          </TabsContent>
          <TabsContent
            value="new_proposal"
            className="border-none p-0 outline-none"
          >
            <CreateLoanProposal />
          </TabsContent>
          <TabsContent
            value="campaigns"
            className="border-none p-0 outline-none"
          >
            <Crowdfunding />
          </TabsContent>
          <TabsContent
            value="new_campaign"
            className="flex flex-col h-full border-none p-0"
          >
            <CreateCampaign />
          </TabsContent>
        </div>
      </Tabs>
    </main>
  );
}
