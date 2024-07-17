// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

interface IMarketplace {
    function ownerOf(uint256 tokenId) external view returns (address);
    function hasPremiumPass(address user) external view returns (bool);
}

contract Adware {
    IMarketplace public marketplaceContract;

    struct Boost {
        uint256 totalBoostAmount;
        uint256 viewsLeft;
        uint256 amountPerView;
        bool isActive;
    }

    struct BillboardBidder {
        address bidderAddress;
        uint256 bidAmount;
        string adDetailsURL;
    }

    struct VideoAdvertisement {
        address advertiser;
        uint256 spotsRemaining;
        string adDetailsURL;
    }

    struct FlixPass {
        address holder;
        uint256 validUntil;
    }

    BillboardBidder[3] public todayBillboard;
    BillboardBidder[3] public yesterdayBillboard;
    VideoAdvertisement[] public videoAdsQueue;

    mapping(uint256 => Boost) private _nftBoosts;

    mapping(address => uint256) public pendingWithdrawals;

    uint256 public nextAuctionEndTime;
    address public platformWallet;
    uint256 public startingBidPrice;
    uint256 public videoAdSpotPrice;
    address public contractOwner;

    uint256 constant DAY_IN_SECONDS = 86400;
    uint256 constant PLATFORM_EARNINGS_PERCENTAGE = 20;

    event Boosted(
        uint256 indexed tokenId,
        uint256 totalBoostAmount,
        uint256 viewsLeft
    );
    event BoostClaimed(
        uint256 indexed tokenId,
        address claimer,
        uint256 amount
    );

    event BillboardBidPlaced(
        address indexed bidder,
        uint256 bidAmount,
        string adDetailsURL
    );
    event VideoAdSlotPurchased(address indexed advertiser, uint256 spots);
    event VideoAdPlayed(
        address indexed advertiser,
        uint256 spotsRemaining,
        string adDetailsURL
    );
    event AuctionResetEarly();

    event VideoAdResult(string message, address indexed contentCreator);

    modifier onlyWhileAuctionActive() {
        require(block.timestamp < nextAuctionEndTime, "Auction has ended");
        _;
    }

    modifier onlyWhenAuctionEnds() {
        require(block.timestamp >= nextAuctionEndTime, "Auction is ongoing");
        _;
    }

    modifier onlyContractOwner() {
        require(msg.sender == contractOwner, "Only owner can call this");
        _;
    }

    // Constructor to initialize the contract with initial values
    constructor(
        address _contractOwner,
        address _marketplaceAddress,
        uint256 _startingBidPrice,
        uint256 _videoAdSpotPrice
    ) {
        contractOwner = _contractOwner;
        marketplaceContract = IMarketplace(_marketplaceAddress);
        platformWallet = _contractOwner;
        nextAuctionEndTime = block.timestamp + DAY_IN_SECONDS;
        startingBidPrice = _startingBidPrice; // 140000000000000000000 | (140 x 10^18)  | 140 ETH ($6)
        videoAdSpotPrice = _videoAdSpotPrice; // 25000000000000000000  | (25 x 10^18) | 25 ETH ($1.5)
    }

    // Function to enable a creator to boost an NFT
    function boostNFT(
        uint256 tokenId,
        uint256 totalBoostAmount,
        uint256 totalViews
    ) public payable {
        require(
            marketplaceContract.ownerOf(tokenId) == msg.sender,
            "Only the NFT owner can boost it."
        );
        require(
            msg.value == totalBoostAmount,
            "Transfer the correct boost amount."
        );
        require(totalViews > 0, "Total views must be greater than 0.");
        require(!_nftBoosts[tokenId].isActive, "This NFT is already boosted.");

        uint256 platformShare = (totalBoostAmount * 10) / 100;
        uint256 amountForViewers = totalBoostAmount - platformShare;
        uint256 amountPerView = amountForViewers / totalViews;

        _nftBoosts[tokenId] = Boost({
            totalBoostAmount: amountForViewers,
            viewsLeft: totalViews,
            amountPerView: amountPerView,
            isActive: true
        });

        pendingWithdrawals[platformWallet] += platformShare;

        emit Boosted(tokenId, totalBoostAmount, totalViews);
    }

    // Function to check if an NFT is boosted
    function isNFTBoosted(
        uint256 tokenId
    ) public view returns (bool, uint256, uint256) {
        Boost storage boost = _nftBoosts[tokenId];
        return (boost.isActive, boost.totalBoostAmount, boost.viewsLeft);
    }

    // Function for viewers to claim their share of the boost rewards
    function claimBoostReward(uint256 tokenId) public {
        Boost storage boost = _nftBoosts[tokenId];
        require(boost.isActive, "This NFT is not boosted.");
        require(boost.viewsLeft > 0, "No more views left for rewards.");

        boost.viewsLeft -= 1;
        uint256 claimAmount = boost.amountPerView;

        if (boost.viewsLeft == 0) {
            boost.isActive = false;
        }

        // Ensure safe transfer to prevent the contract from getting stuck
        // due to a failing `transfer` call (consider using `call` with a gas limit).
        (bool success, ) = payable(msg.sender).call{value: claimAmount}("");
        require(success, "Failed to send TFUEL");

        emit BoostClaimed(tokenId, msg.sender, claimAmount);
    }

    function setMarketplaceContract(
        address _marketplaceAddress
    ) external onlyContractOwner {
        marketplaceContract = IMarketplace(_marketplaceAddress);
    }

    // Allows the contract owner to modify the starting bid price for billboard ads
    function modifyStartingBidPrice(
        uint256 _newAmount
    ) external onlyContractOwner {
        startingBidPrice = _newAmount;
    }

    // Allows the contract owner to modify the price for video ad slots
    function modifyVideoAdSpotPrice(
        uint256 _newPrice
    ) external onlyContractOwner {
        videoAdSpotPrice = _newPrice;
    }

    // Allows advertisers to bid for billboard ad slots while the auction is active
    function bidForBillboardAd(
        string memory _adDetailsURL
    ) external payable onlyWhileAuctionActive {
        require(
            msg.value >= startingBidPrice,
            "Bid is below the required amount"
        );

        address oustedBidderAddress;
        uint256 oustedBidAmount;

        for (uint256 i = 0; i < 3; i++) {
            if (msg.value > todayBillboard[i].bidAmount) {
                if (i == 0) {
                    oustedBidderAddress = todayBillboard[2].bidderAddress;
                    oustedBidAmount = todayBillboard[2].bidAmount;
                }

                for (uint256 j = 2; j > i; j--) {
                    todayBillboard[j] = todayBillboard[j - 1];
                }

                todayBillboard[i] = BillboardBidder({
                    bidderAddress: msg.sender,
                    bidAmount: msg.value,
                    adDetailsURL: _adDetailsURL
                });

                emit BillboardBidPlaced(msg.sender, msg.value, _adDetailsURL);
                break;
            }
        }

        if (oustedBidderAddress != address(0)) {
            pendingWithdrawals[oustedBidderAddress] += oustedBidAmount;
        }
    }

    // Initiates a new auction cycle for the billboard ad slots
    function initiateNewBillboardAuction() external onlyWhenAuctionEnds {
        for (uint256 i = 0; i < 3; i++) {
            yesterdayBillboard[i] = todayBillboard[i];
            delete todayBillboard[i];
        }
        nextAuctionEndTime = block.timestamp + DAY_IN_SECONDS;
    }

    // Re-Initiates a new auction cycle for the billboard ad slots before the 24hrs end
    function resetAuctionEarly() external onlyContractOwner {
        for (uint256 i = 0; i < 3; i++) {
            yesterdayBillboard[i] = todayBillboard[i];
            delete todayBillboard[i];
        }
        nextAuctionEndTime = block.timestamp + DAY_IN_SECONDS;

        emit AuctionResetEarly();
    }

    // Allows advertisers to buy video ad slots by paying the required amount
    function buyVideoAdSlots(
        uint256 spots,
        string memory _adDetailsURL
    ) external payable {
        uint256 totalCost = spots * videoAdSpotPrice;
        require(msg.value == totalCost, "Payment mismatch");

        VideoAdvertisement memory newAd = VideoAdvertisement({
            advertiser: msg.sender,
            spotsRemaining: spots,
            adDetailsURL: _adDetailsURL
        });

        videoAdsQueue.push(newAd);
        emit VideoAdSlotPurchased(msg.sender, spots);
    }

    // Check the availability and details of the next video ad
    function checkVideoAdAvailability(
        address contentCreator
    )
        external
        view
        returns (
            bool canDisplay,
            string memory status,
            uint256 calculatedAdCost,
            uint256 spotsRemaining,
            string memory adDetailsURL,
            address advertiser
        )
    {
        // No ads in the queue
        if (videoAdsQueue.length == 0) {
            return (false, "No ads available", 0, 0, "", address(0));
        }

        // Check if the content creator has a Premium Pass
        if (hasPremiumPass(contentCreator)) {
            return (false, "Valuable user", 0, 0, "", address(0));
        }

        // Retrieve the current advertisement from the queue
        VideoAdvertisement storage currentAd = videoAdsQueue[0];
        calculatedAdCost = currentAd.spotsRemaining * videoAdSpotPrice;

        return (
            true,
            "Ad available",
            calculatedAdCost,
            currentAd.spotsRemaining,
            currentAd.adDetailsURL,
            currentAd.advertiser
        );
    }

    // Handle the actual display and earnings distribution of the video ad
    function displayAdAndUpdateEarnings(
        address contentCreator,
        uint256 passedAdCost,
        uint256 spotsRemaining
    ) external {
        require(spotsRemaining > 0, "No spots available for the ad");

        // Calculate shares for the platform and content creator
        uint256 platformShare = (passedAdCost * PLATFORM_EARNINGS_PERCENTAGE) /
            100;
        uint256 contentCreatorShare = passedAdCost - platformShare;

        // Update the virtual balances
        pendingWithdrawals[platformWallet] += platformShare;
        pendingWithdrawals[contentCreator] += contentCreatorShare;

        // Decrement the spots remaining for the ad
        videoAdsQueue[0].spotsRemaining--;

        // Emit the event that the ad was played
        emit VideoAdPlayed(
            videoAdsQueue[0].advertiser,
            videoAdsQueue[0].spotsRemaining,
            videoAdsQueue[0].adDetailsURL
        );

        if (videoAdsQueue[0].spotsRemaining == 0) {
            // Remove the ad from the queue if there are no spots remaining
            videoAdsQueue[0] = videoAdsQueue[videoAdsQueue.length - 1];
            videoAdsQueue.pop();
        }

        // Emit the result of the ad display
        emit VideoAdResult("Ad displayed", contentCreator);
    }

    // Helper function to check if user has Premium pass
    function hasPremiumPass(address user) internal view returns (bool) {
        return marketplaceContract.hasPremiumPass(user);
    }

    // Checks the pending withdrawals (earnings) for a given address
    function checkPendingWithdrawal(
        address user
    ) external view returns (uint256) {
        return pendingWithdrawals[user];
    }

    // Allows users to withdraw their pending earnings
    function withdrawMyEarnings() external {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "No earnings to withdraw");
        pendingWithdrawals[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }

    // Retrieves all active video ads currently in queue
    function retrieveActiveAds()
        external
        view
        returns (VideoAdvertisement[] memory)
    {
        return videoAdsQueue;
    }

    // Retrieves details of the current billboard ad auction
    function getCurrentBillboardDetails()
        external
        view
        returns (
            uint256 auctionEndTime,
            uint256 baseBid,
            BillboardBidder[3] memory topThreeBids
        )
    {
        return (nextAuctionEndTime, startingBidPrice, todayBillboard);
    }

    // Retrieves all active video ads purchased by a specific user
    function retrieveSpecificUserAds(
        address user
    ) external view returns (VideoAdvertisement[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < videoAdsQueue.length; i++) {
            if (videoAdsQueue[i].advertiser == user) {
                count++;
            }
        }
        VideoAdvertisement[] memory userAds = new VideoAdvertisement[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < videoAdsQueue.length; i++) {
            if (videoAdsQueue[i].advertiser == user) {
                userAds[index] = videoAdsQueue[i];
                index++;
            }
        }
        return userAds;
    }

    // Return today top bit amount
    function listTodayTopBid() external view returns (uint256) {
        return todayBillboard[0].bidAmount;
    }
}
