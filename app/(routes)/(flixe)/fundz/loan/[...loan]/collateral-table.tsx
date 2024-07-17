"use client";

// import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// import MarketplaceInteraction from "@/contracts/interaction/MarketplaceInteraction";

interface CollateralTableProps {
  NFTData: Collateral[];
}

interface Collateral {
  label: string;
  value: string;
  // link?: string;
}

const CollateralTable: React.FC<CollateralTableProps> = ({ NFTData }) => {
  // const [collaterals, setCollaterals] = useState<Collateral[]>([]);
  // const marketplace = MarketplaceInteraction();

  // useEffect(() => {
  //   // Perform the async operation inside useEffect
  //   const fetchURIs = async () => {
  //     const updatedCollaterals = await Promise.all(
  //       NFTData.map(async (item) => {
  //         const artURI = await marketplace.tokenURI(Number(item.value));
  //         return { ...item, link: artURI };
  //       })
  //     );

  //     setCollaterals(updatedCollaterals);
  //   };

  //   fetchURIs();
  // }, [NFTData]);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">No.</TableHead>
          <TableHead className="text-center">Name</TableHead>
          <TableHead className="text-center">ID</TableHead>
          <TableHead className="text-center">Link</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {NFTData.length > 0 ? (
          NFTData.map((collateral, index) => (
            <TableRow key={`${collateral.value}-${index}`}>
              <TableCell className="text-center">{index + 1}</TableCell>
              <TableCell className="text-center">{collateral.label}</TableCell>
              <TableCell className="text-center">{collateral.value}</TableCell>
              <TableCell className="text-center">
                <a
                  href={`/artistry/${collateral.value}/${collateral.label}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button>View</button>
                </a>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={4} className="text-center">
              {" "}
              {/* Update colSpan */}
              No data available.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default CollateralTable;
