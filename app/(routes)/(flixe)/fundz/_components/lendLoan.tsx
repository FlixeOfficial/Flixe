"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import LoanVaultInteraction from "@/contracts/interaction/LoanVault";
import DisplayLoans from "@/components/DisplayLoans";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type LoanIds = string[];

// Define a fetcher function for SWR
const fetchLoans = async (filter: string) => {
  const LoanVault = LoanVaultInteraction();
  let data;
  switch (filter) {
    case "pending":
      data = await LoanVault.getMyActiveLoanIdsAsBorrower(); // Fetch my proposed loans
      break;
    case "funded":
      data = await LoanVault.getMyActiveLoanIdsAsLender(); // Fetch loans the user has funded
      break;
    case "browse":
    default:
      data = await LoanVault.listPendingLoanIds(); // Fetch all loans for browsing
  }
  const loanIds = data.map((loanId: number) => loanId.toString()); // Convert loan IDs to strings
  console.log("Formatted loanIds: ", loanIds);
  return loanIds; // This should match the LoanIds type
};

const Crowdfunding: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState("all");

  const {
    data: loans,
    error,
    mutate,
  } = useSWR<LoanIds>([`loans`, selectedTab], () => fetchLoans(selectedTab), {
    revalidateOnFocus: false,
  });

  const isLoading = !loans && !error;

  const handleChangeTab = (tabValue: string) => {
    setSelectedTab(tabValue);
  };

  const refreshData = () => {
    mutate(); // Re-fetch data
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between bg-card border rounded-md px-4 py-2 -mt-2">
        <div className="flex-1 flex flex-row justify-between">
          <h1 className="text-3xl font-bold tracking-wider capitalize">
            {selectedTab}{" "}
            <span className="font-bold text-[#6ca987]">Loan Proposals</span>
          </h1>
          <div className="flex flex-row gap-3">
            <p className="self-center font-bold">({loans?.length || 0})</p>
            <Button
              onClick={refreshData}
              className="self-center font-bold"
              variant="ghost"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>
      <Tabs defaultValue="browse" onValueChange={handleChangeTab}>
        <div className="flex items-center mb-[1rem]">
          <TabsList className="bg-card/50 text-xl">
            <TabsTrigger value="browse" className="text-[1rem]">
              Browse
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-[1rem]">
              Pending
            </TabsTrigger>
            <TabsTrigger value="funded" className="text-[1rem]">
              Funded
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="browse" className="border-none p-0 outline-none">
          <DisplayLoans
            isLoading={isLoading}
            loans={loans || []}
            filter="browse"
          />
        </TabsContent>
        <TabsContent value="pending" className="border-none p-0 outline-none">
          <DisplayLoans
            isLoading={isLoading}
            loans={loans || []}
            filter="pending"
          />
        </TabsContent>
        <TabsContent
          value="funded"
          className="flex flex-col h-full border-none p-0"
        >
          <DisplayLoans
            isLoading={isLoading}
            loans={loans || []}
            filter="funded"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Crowdfunding;
