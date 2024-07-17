import React from "react";

interface CountBoxProps {
  title: string;
  value: number;
}

const CountBox = ({ title, value }: CountBoxProps) => {
  return (
    <div className="flex flex-col items-center w-[150px]">
      <h4 className="font-epilogue font-bold text-[30px] text-primary p-3 rounded-t-[10px] w-full text-center truncate">
        {value}
      </h4>
      <p className="font-epilogue font-bold text-sm text-[#808191] px-3 py-2 -mt-3 w-full rouned-b-[10px] text-center">
        {title}
      </p>
    </div>
  );
};

export default CountBox;
