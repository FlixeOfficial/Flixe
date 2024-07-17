import React from "react";
import { v4 as uuidv4 } from "uuid";
import FundCard from "./fund-card";
// import { loader } from '../assets';

interface Props {
  isLoading: boolean;
  campaigns: any[];
}

const DisplayCampaigns: React.FC<Props> = ({ isLoading, campaigns }) => {
  return (
    <div>
      <div className="flex flex-wrap gap-[26px]">
        {/* {isLoading && (
          <img src={loader} alt="loader" className="w-[100px] h-[100px] object-contain" />
        )} */}

        {!isLoading && campaigns.length === 0 && (
          <p className="font-epilogue font-semibold text-[14px] leading-[30px] text-[#818183]">
            You have not created any campaigns yet
          </p>
        )}

        {!isLoading &&
          campaigns.length > 0 &&
          campaigns.map((campaign, index) => (
            <FundCard key={index} {...campaign} id={index} />
          ))}
      </div>
    </div>
  );
};

export default DisplayCampaigns;
