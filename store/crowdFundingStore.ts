import create from 'zustand';
import CrowdFundingInteraction from '@/contracts/interaction/CrowdFundingInteraction';

// Define your store type
interface CrowdFundingStore {
  createCampaign: (args: any) => Promise<any>;
  donateToCampaign: (id: number, amount: number) => Promise<any>;
  getDonators: (id: number) => Promise<any>;
  getCampaigns: () => Promise<any>;
}

const useCrowdFundingStore = create<CrowdFundingStore>((set) => {
  const crowdFunding = CrowdFundingInteraction();
  
  const createCampaign = async (args: any) => {
    console.log('args: ', args);
    try {
      return await crowdFunding.createCampaign(args);
    } catch (error) {
      console.error("Couldn't create the campaign", error);
      throw error;
    }
  };

  const donateToCampaign = async (id: number, amount: number) => {
    try {
      return await crowdFunding.donateToCampaign(id, amount);
    } catch (error) {
      console.error("Couldn't donate to the campaign", error);
      throw error;
    }
  };

  const getDonators = async (id: number) => {
    try {
      return await crowdFunding.getDonators(id);
    } catch (error) {
      console.error("Couldn't get the donators", error);
      throw error;
    }
  };

  const getCampaigns = async () => {
    try {
      return await crowdFunding.getCampaigns();
    } catch (error) {
      console.error("Couldn't get the campaigns", error);
      throw error;
    }
  };

  return {
    createCampaign,
    donateToCampaign,
    getDonators,
    getCampaigns,
  };
});

export default useCrowdFundingStore;