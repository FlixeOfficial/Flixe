"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fromWei } from 'web3-utils';

interface DonationData {
  [0]: string[]; // Addresses
  [1]: number[]; // Donation amounts in Wei
}

interface DonationTableProps {
  donationData: DonationData;
}

interface Donation {
  address: string;
  amount: string;
}

const DonationTable: React.FC<DonationTableProps> = ({ donationData }) => {
  // Map donation data to an array of Donation objects
  const donations: Donation[] = donationData[0].map(
    (address, index): Donation => ({
      address,
      amount: `${fromWei(Number(donationData[1][index]), 'ether')} TFUEL`,
    })
  );

  return (
    <Table>
      {/* <TableCaption>List of Donations</TableCaption> */}
      <TableHeader className="mx-10">
        <TableRow>
          <TableHead className="text-center">No.</TableHead>
          <TableHead className="text-center">Address</TableHead>
          <TableHead className="text-center">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {donations.length > 0 ? (
          donations.map((donation, index) => (
            <TableRow key={`${donation.address}-${index}`}>
              <TableCell className="text-center">{index + 1}</TableCell>
              <TableCell className="text-center">{donation.address}</TableCell>
              <TableCell className="text-center">{donation.amount}</TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={3} className="text-center">
              No donors yet. Be the first one!
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default DonationTable;
