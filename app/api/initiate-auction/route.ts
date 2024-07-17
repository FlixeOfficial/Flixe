import AdwareInteraction from '@/contracts/interaction/AdwareInteraction';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const adwareInteraction = AdwareInteraction();

    // Get current billboard details
    const currentDetails = await adwareInteraction.getCurrentBillboardDetails();

    // Check if the current time is past the auction end time
    if (Math.floor(Date.now() / 1000) >= currentDetails.auctionEndTime) {
      // If the auction has ended, initiate a new auction
      const result = await adwareInteraction.initiateNewBillboardAuction();
      return NextResponse.json({ success: true, message: 'New auction initiated', result });
    } else {
      return NextResponse.json({ success: false, message: 'Auction is still ongoing' });
    }
  } catch (error) {
    console.error('Error in auction check:', error);
    return new NextResponse(null, { status: 500, statusText: 'Internal Server Error' });
  }
}