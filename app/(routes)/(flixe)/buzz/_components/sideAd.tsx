"use client";

import {
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import Image from "next/image";
import AdwareInteraction from "@/contracts/interaction/AdwareInteraction";
import { fetchIPFSJson } from "@/service/pinataService";
import { fromWei } from 'web3-utils';

interface Campaign {
  bidderAddress: string;
  bidAmount: string;
  adDetailsURL: string;
  button: string;
  imageUrl: string;
  price: string;
  title: string;
  url: string;
}

export default function SideAd() {
  const adwareInteraction = AdwareInteraction();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    const fetchTopBids = async () => {
      try {
        // Fetch the bids as before
        const bids = await Promise.all(
          [2, 0, 1].map((index) => adwareInteraction.yesterdayBids(index))
        );

        // Fetch campaign data for each bid and merge it
        const bidsWithCampaignData = await Promise.all(
          bids.map(async (bid) => {
            const campaign = await fetchIPFSJson(bid.adDetailsURL);

            // Convert bid amount from wei to TFUEL
            const bidAmountInTFUEL = fromWei(
              bid.bidAmount
              , 'ether');

            // Return a new object that combines the bid with the campaign data
            return {
              ...bid,
              bidAmount: bidAmountInTFUEL,
              ...campaign,
            };
          })
        );

        setCampaigns(bidsWithCampaignData); // Update your state with the new data
      } catch (err) {
        console.error(err);
      }
    };

    fetchTopBids();
  }, [adwareInteraction]);

  return campaigns && campaigns.length !== 0 ? (
    <div className="w-full bg-card border rounded-2xl">
      <h1 className='p-2 pb-0 pl-4 text-xl text-primary/80'>Ad Zone</h1>
      <div className="relative overflow-hidden">
        {campaigns.map((campaign) => {
          return (
            <Link
              href={campaign.url}
              className="block"
              target="_blank"
              rel="noopener noreferrer"
              draggable={false}
            >
              <div className="border rounded-md p-2 font-medium flex flex-col gap-8 relative m-auto">
                {/* This 'group' class now applies to the children of this div only */}
                <div className="group w-full rounded-3xl bg-card cursor-pointer hover:bg-card">
                  <div className="relative">
                    {campaign.imageUrl && (
                      <div className="aspect-w-6 aspect-h-3 w-full">
                        <Image
                          src={campaign.imageUrl}
                          alt={`Selected thumbnail`}
                          className={`object-cover rounded-sm`}
                          style={{ pointerEvents: "none" }}
                          layout="fill"
                        />
                      </div>
                    )}
                  </div>
                  {/* Hover effects are now scoped to this card only */}
                  <div className="hidden group-hover:flex flex-row justify-between absolute bottom-0 inset-x-0">
                    <div className="bg-background/20 backdrop-blur-xl px-4 py-2 m-8 h-12 rounded-2xl flex items-center justify-center">
                      <h4 className="text-sm font-semibold text-primary">
                        {campaign.title || "Give a title to your billboard"}
                      </h4>
                    </div>

                    {/* The button will also show on hover inside this group */}
                    {/* <div className="flex justify-between flex-wrap space-y-2 px-4 py-2 m-8 h-12 rounded-2xl">
                      <div className="flex flex-col items-start">
                        <ClientButton
                          url={campaign.url}
                          buttonLabel={campaign.button}
                        />
                      </div>
                    </div> */}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  ) : (
    <div className='bg-card border rounded-2xl p-4 m-auto text-center min-h-[30rem] flex items-center justify-center'>
      <h1>Participate in our daily billboards auction to get your Ad featured here!</h1>
    </div>
  );
}
