import React from "react";
import LoanCard from "./loan-card";
// import { loader } from '../assets';

interface Props {
  isLoading: boolean;
  loans: string[];
  filter: "browse" | "my_loans" | "pending" | "funded";
}

const DisplayLoans: React.FC<Props> = ({ isLoading, loans }) => {
  return (
    <div>
      <div className="flex flex-wrap gap-[26px]">
        {/* {isLoading && (
          <img src={loader} alt="loader" className="w-[100px] h-[100px] object-contain" />
        )} */}

        {!isLoading && loans.length === 0 && (
          <p className="font-epilogue font-semibold text-[14px] leading-[30px] text-[#818183]">
            You have not created any campaigns yet
          </p>
        )}

        {!isLoading &&
          loans.length > 0 &&
          loans.map((loanId, index) => (
            <LoanCard key={index} loanId={loanId} />
          ))}
      </div>
    </div>
  );
};

export default DisplayLoans;
