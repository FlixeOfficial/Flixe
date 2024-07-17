// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.0.0/contracts/token/ERC721/ERC721.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.0.0/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.0.0/contracts/utils/Counters.sol";

contract Marketplace is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    Counters.Counter private _itemsSold;

    uint256 platformFee = 2500;
    address payable _marketOwner;

    uint256 public constant discountInterval = 1800; // 30 minutes in seconds

    // Adjusted prices for different Flix Pass durations in TFUEL
    // - monthlyStandardPassPrice: 70 TFUEL (~$5.22)
    // - annualStandardPassPrice: 700 TFUEL (~$52.20)
    // - monthlyPremiumPassPrice: 140 TFUEL (~$10.44)
    // - annualPremiumPassPrice: 1400 TFUEL (~$104.40)
    // - rentAddOnDailyPrice: 25 TFUEL (~$1.87)

    uint256 public constant monthlyStandardPassPrice = 70 ether;
    uint256 public constant annualStandardPassPrice = 700 ether;
    uint256 public constant monthlyPremiumPassPrice = 140 ether;
    uint256 public constant annualPremiumPassPrice = 1400 ether;
    uint256 public constant rentAddOnDailyPrice = 25 ether;

    mapping(uint256 => MarketItem) private _idToMarketItem;
    mapping(uint256 => Auction) public auctions;

    mapping(address => uint256) private pendingWithdrawals;

    mapping(uint256 => Rental) private _rentals;

    mapping(address => FlixPass) private _standardPasses;
    mapping(address => FlixPass) private _premiumPasses;

    mapping(address => RentAddOn) private _rentAddOns;

    struct MarketItem {
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
        bool isArt;
    }

    struct Auction {
        IERC721 nft;
        uint256 tokenId;
        address payable seller;
        uint256 startingPrice;
        uint256 minimumPrice;
        uint256 discountRate;
        uint256 startAt;
        uint256 expiresAt;
    }

    event MarketItemCreated(
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold,
        bool isArt
    );

    struct Rental {
        uint256 tokenId;
        uint256 dailyPrice;
        bool isAvailableForNewRentals;
        address[] renters;
        RentalPeriod[] rentalPeriods;
    }

    struct FlixPass {
        address holder;
        uint256 validUntil;
    }

    struct RentalPeriod {
        uint256 start;
        uint256 end;
    }

    struct RentAddOn {
        address holder;
        uint256 validUntil;
        uint256 dailyPrice;
    }

    enum FlixPassDuration {
        Monthly,
        Annual
    }

    event NFTMinted(uint256 indexed tokenId);
    event NFTMintedAndListed(uint256 indexed tokenId);

    event AuctionPurchaseLog(
        uint256 indexed tokenId,
        address buyer,
        uint256 salePrice,
        uint256 feeAmount,
        uint256 sellerAmount
    );

    event NFTSetForRent(uint256 indexed tokenId, uint256 dailyPrice);
    event NFTrented(uint256 indexed tokenId, address renter, uint256 duration);

    event StandardPassPurchased(address indexed holder, uint256 duration);
    event PremiumPassPurchased(address indexed holder, uint256 duration);

    event RentAddOnPurchased(address indexed holder, uint256 validUntil);

    event StandardPassAccessChecked(
        uint256 indexed tokenId,
        address indexed user
    );
    event PremiumPassAccessChecked(
        uint256 indexed tokenId,
        address indexed user
    );

    event RentalPeriodSet(uint256 indexed tokenId, uint256 start, uint256 end);

    modifier onlyOwner() {
        require(
            msg.sender == _marketOwner,
            "Only the marketplace owner can execute this."
        );
        _;
    }

    // Initializes the contract, setting the market owner and NFT details.
    constructor(address _contractOwner) ERC721("FLIXE MARKETPLACE", "BBL") {
        _marketOwner = payable(_contractOwner);
    }

    // Allows the owner to set a new platform fee.
    function setPlatformFee(uint256 fee) public onlyOwner {
        platformFee = fee;
    }

    // Retrieves the current platform fee.
    function getPlatformFee() public view returns (uint256) {
        return platformFee;
    }

    // Mints a new NFT with a given URI.
    function mintNFT(
        string memory tokenURI,
        bool isArt
    ) public returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        _idToMarketItem[newTokenId] = MarketItem(
            newTokenId,
            payable(msg.sender),
            payable(msg.sender),
            0,
            false,
            isArt
        );
        emit NFTMinted(newTokenId);
        return newTokenId;
    }

    // Mints a new NFT and lists it for sale.
    
    // function mintAndListNFT(
    //     string memory tokenURI,
    //     uint256 price,
    //     bool isArt
    // ) public returns (uint256) {
    //     uint256 newTokenId = mintNFT(tokenURI, isArt);
    //     listNFTForSale(newTokenId, price);
    //     emit NFTMintedAndListed(newTokenId);
    //     return newTokenId;
    // }

    // Allows a user to list one of their NFTs for sale.
    function listNFTForSale(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, "You do not own this NFT.");
        require(price > 0, "Price must be at least 1 wei."); // Assuming "W" was a typo, changed to "wei" for clarity

        // Retrieve the current isArt value for the NFT
        bool currentIsArt = _idToMarketItem[tokenId].isArt;

        // Update the MarketItem with the new sale information, preserving the isArt value
        _idToMarketItem[tokenId] = MarketItem(
            tokenId,
            payable(msg.sender),
            payable(address(this)),
            price,
            false,
            currentIsArt // Preserve the isArt value
        );

        _transfer(msg.sender, address(this), tokenId);

        // Emit an updated event that includes the isArt information
        emit MarketItemCreated(
            tokenId,
            msg.sender,
            address(this),
            price,
            false,
            currentIsArt // Include the isArt value in the event
        );
    }

    // Allows the owner to relist their NFT with a new price.
    function relistNFT(uint256 tokenId, uint256 price) public {
        MarketItem storage item = _idToMarketItem[tokenId];
        require(
            item.owner == msg.sender,
            "Only item owner can perform this operation."
        );

        if (item.sold) {
            _itemsSold.decrement();
        }

        item.sold = false;
        item.price = price;
        item.seller = payable(msg.sender);
        item.owner = payable(address(this));

        _transfer(msg.sender, address(this), tokenId);
    }

    // Allows the seller to unlist their NFT, removing it from the sale.
    function unlistNFT(uint256 tokenId) public {
        MarketItem storage item = _idToMarketItem[tokenId];
        require(
            item.seller == msg.sender,
            "Only the seller can unlist the item."
        );
        require(!item.sold, "Item has already been sold.");
        _transfer(address(this), msg.sender, tokenId);
        item.tokenId = tokenId;
        item.seller = payable(msg.sender);
        item.owner = payable(msg.sender);
        item.price = 0;
        item.sold = false;
    }

    // Allows a user to purchase a listed NFT.
    function purchaseNFT(uint256 tokenId) public payable {
        MarketItem storage item = _idToMarketItem[tokenId];
        uint256 salePrice = item.price;

        require(msg.sender != item.seller, "You cannot purchase your own NFT.");
        require(
            msg.value == salePrice,
            "Please submit the asking price in order to complete the purchase."
        );

        uint256 feeAmount = platformFee > salePrice
            ? salePrice
            : (salePrice * platformFee) / 100_000;
        uint256 sellerAmount = salePrice - feeAmount;

        _transfer(address(this), msg.sender, tokenId);
        item.owner = payable(msg.sender);
        item.sold = true;
        _itemsSold.increment();
        pendingWithdrawals[_marketOwner] += feeAmount;
        pendingWithdrawals[item.seller] += sellerAmount;
    }

    // Allows a user to start an auction for their NFT.
    function startNFTAuction(
        uint256 tokenId,
        uint256 startPrice,
        uint256 minimumPrice,
        uint256 discountRate,
        uint256 duration
    ) public {
        require(ownerOf(tokenId) == msg.sender, "You do not own this NFT.");
        require(
            startPrice > minimumPrice,
            "Starting price must be higher than minimum price."
        );
        require(
            minimumPrice >= discountRate * (duration / discountInterval),
            "Minimum price too low to cover discount over auction duration."
        );

        Auction storage auction = auctions[tokenId];
        auction.nft = this;
        auction.tokenId = tokenId;
        auction.seller = payable(msg.sender);
        auction.startingPrice = startPrice;
        auction.minimumPrice = minimumPrice; // Set the minimum price
        auction.discountRate = discountRate;
        auction.startAt = block.timestamp;
        auction.expiresAt = block.timestamp + duration;

        _transfer(msg.sender, address(this), tokenId);
    }

    // Allows a user to cancel an ongoing auction.
    function cancelNFTAuction(uint256 tokenId) public {
        Auction storage auction = auctions[tokenId];
        require(
            auction.seller == msg.sender,
            "Only the seller can cancel the auction."
        );

        _transfer(address(this), auction.seller, tokenId);
        delete auctions[tokenId];
    }

    // Allows a user to purchase an NFT from an ongoing auction.
    function buyNFTFromAuction(uint256 tokenId) public payable {
        Auction storage auction = auctions[tokenId];
        uint256 salePrice = getAuctionPrice(tokenId);

        require(msg.value == salePrice, "Please send the exact sale price.");

        _transfer(address(this), msg.sender, tokenId);

        uint256 feeAmount = platformFee > salePrice
            ? salePrice
            : (salePrice * platformFee) / 100_000;
        uint256 sellerAmount = salePrice - feeAmount;

        pendingWithdrawals[_marketOwner] += feeAmount;
        pendingWithdrawals[auction.seller] += sellerAmount;

        delete auctions[tokenId];
        _idToMarketItem[tokenId].owner = payable(msg.sender);
        _idToMarketItem[tokenId].sold = true;
        _itemsSold.increment();

        // Emit the log event
        emit AuctionPurchaseLog(
            tokenId,
            msg.sender,
            salePrice,
            feeAmount,
            sellerAmount
        );
    }

    // Returns the current price of the NFT in an auction.
    function getAuctionPrice(uint256 tokenId) public view returns (uint256) {
        Auction storage auction = auctions[tokenId];
        uint256 intervalsElapsed = (block.timestamp - auction.startAt) /
            discountInterval;
        uint256 priceDrop = auction.discountRate * intervalsElapsed;
        uint256 currentPrice = auction.startingPrice - priceDrop;

        // Ensure the price does not drop below the minimum price
        if (currentPrice < auction.minimumPrice) {
            currentPrice = auction.minimumPrice;
        }

        return currentPrice;
    }

    // Allows the owner of an NFT to set it for rent.
    function listNFTForRent(uint256 tokenId, uint256 dailyPrice) public {
        require(ownerOf(tokenId) == msg.sender, "Not the owner of the NFT");

        // Check if the NFT is listed on any sale

        MarketItem storage itemForSale = _idToMarketItem[tokenId];
        require(
            itemForSale.owner != address(this),
            "NFT is currently listed for sale."
        );

        Auction storage auctionItem = auctions[tokenId];
        require(
            auctionItem.expiresAt < block.timestamp ||
                auctionItem.seller == address(0),
            "NFT is currently in an auction."
        );

        // Check if the NFT is already rented
        Rental storage existingRental = _rentals[tokenId];
        require(existingRental.tokenId == 0, "NFT is already set for rent.");

        Rental storage rental = _rentals[tokenId];
        rental.tokenId = tokenId;
        rental.dailyPrice = dailyPrice;

        emit NFTSetForRent(tokenId, dailyPrice);
    }

    // Allows the owner to unlist their NFT from future rental status while respecting ongoing rentals.
    function unlistNFTFromRental(uint256 tokenId) public {
        Rental storage rental = _rentals[tokenId];

        // Check if the caller is the owner of the NFT
        require(
            ownerOf(tokenId) == msg.sender,
            "Only the owner can unlist from rental."
        );

        require(rental.tokenId != 0, "This NFT is not listed for rent.");

        rental.dailyPrice = 0;

        rental.isAvailableForNewRentals = false;

        // The existing rental periods remain unchanged to respect ongoing rentals
        // No deletion of the rental record is performed
    }

    // Allows a user to rent an NFT if It's for Rent
    function rentNFT(uint256 tokenId, uint256 duration) public payable {
        Rental storage rental = _rentals[tokenId];
        MarketItem storage item = _idToMarketItem[tokenId];

        // Check if the NFT is available for new rentals
        require(
            rental.isAvailableForNewRentals,
            "This NFT is not available for new rentals."
        );

        // Check if the NFT is set for rent
        require(rental.tokenId != 0, "NFT is not available for rent");

        // Ensure the NFT is not currently listed for sale or auction
        require(
            item.owner != address(this),
            "NFT is currently listed for sale"
        );
        require(
            auctions[tokenId].tokenId == 0,
            "NFT is currently in an auction"
        );

        // Calculate total price based on the duration and daily price
        uint256 totalPrice = calculateRentalPrice(rental.dailyPrice, duration);

        require(msg.value >= totalPrice, "Insufficient funds to rent NFT");

        // Logic to handle funds transfer
        pendingWithdrawals[item.seller] += totalPrice;

        // Update rental status
        rental.renters.push(msg.sender);

        // Calculate and set the rental period
        uint256 rentalStart = block.timestamp;
        uint256 rentalEnd = rentalStart + (duration * 1 days); // Assuming duration is in days
        rental.rentalPeriods.push(RentalPeriod(rentalStart, rentalEnd));

        // Emit the event for renting an NFT
        emit NFTrented(tokenId, msg.sender, duration);
    }

    // Calculate rental price with possible discounts
    function calculateRentalPrice(
        uint256 dailyPrice,
        uint256 duration
    ) public pure returns (uint256) {
        uint256 totalPrice = dailyPrice * duration;

        // Implementing discount logic for longer durations
        if (duration > 180 days) {
            // Applying a 20% discount for rentals over 180 days
            totalPrice = (totalPrice * 80) / 100;
        } else if (duration > 30 days) {
            // Applying a 10% discount for rentals over 30 days
            totalPrice = (totalPrice * 90) / 100;
        }

        return totalPrice;
    }

    function checkNFTRentStatus(
        uint256 tokenId
    ) public view returns (Rental memory) {
        return _rentals[tokenId];
    }

    // Allows a user to purchase a Standard Pass
    function purchaseStandardPass(FlixPassDuration duration) public payable {
        require(!hasActivePass(msg.sender), "User already has an active pass");

        uint256 price;
        uint256 validUntil;

        if (duration == FlixPassDuration.Monthly) {
            price = monthlyStandardPassPrice;
            validUntil = block.timestamp + 30 days;
        } else if (duration == FlixPassDuration.Annual) {
            price = annualStandardPassPrice;
            validUntil = block.timestamp + 365 days;
        } else {
            revert("Invalid Standard Pass duration");
        }

        require(msg.value >= price, "Insufficient funds for Standard Pass");

        // Update Standard Pass details for the user
        FlixPass storage userPass = _standardPasses[msg.sender];
        userPass.holder = msg.sender;
        userPass.validUntil = validUntil;

        // Handle payment logic here
        pendingWithdrawals[_marketOwner] += msg.value;

        emit StandardPassPurchased(msg.sender, validUntil);
    }

    // Allows a user to purchase a Premium Pass
    function purchasePremiumPass(FlixPassDuration duration) public payable {
        require(!hasActivePass(msg.sender), "User already has an active pass");

        uint256 price;
        uint256 validUntil;

        if (duration == FlixPassDuration.Monthly) {
            price = monthlyPremiumPassPrice;
            validUntil = block.timestamp + 30 days;
        } else if (duration == FlixPassDuration.Annual) {
            price = annualPremiumPassPrice;
            validUntil = block.timestamp + 365 days;
        } else {
            revert("Invalid Premium Pass duration");
        }

        require(msg.value >= price, "Insufficient funds for Premium Pass");

        // Update Premium Pass details for the user
        FlixPass storage userPass = _premiumPasses[msg.sender];
        userPass.holder = msg.sender;
        userPass.validUntil = validUntil;

        // Handle payment logic here
        pendingWithdrawals[_marketOwner] += msg.value;

        emit PremiumPassPurchased(msg.sender, validUntil);
    }

    // Checks if user has any active pass
    function hasActivePass(address user) public view returns (bool) {
        if (
            _standardPasses[user].validUntil > block.timestamp ||
            _premiumPasses[user].validUntil > block.timestamp
        ) {
            return true;
        }
        return false;
    }

    // Get active pass details
    function getActivePass(
        address user
    ) internal view returns (FlixPass storage) {
        if (_premiumPasses[user].validUntil > block.timestamp) {
            return _premiumPasses[user];
        } else if (_standardPasses[user].validUntil > block.timestamp) {
            return _standardPasses[user];
        } else {
            revert("No active pass found.");
        }
    }

    // Allows a user to purchase a Rent Add-On
    function purchaseRentAddOn() public payable {
        require(hasActivePass(msg.sender), "No active pass for RentAddOn.");

        uint256 totalPrice = calculateRentAddOnCost(msg.sender);
        require(totalPrice > 0, "No remaining time on active pass.");
        require(msg.value >= totalPrice, "Insufficient funds for RentAddOn.");

        RentAddOn storage rentAddOn = _rentAddOns[msg.sender];
        rentAddOn.holder = msg.sender;
        rentAddOn.validUntil = getActivePass(msg.sender).validUntil;
        rentAddOn.dailyPrice = rentAddOnDailyPrice;

        emit RentAddOnPurchased(msg.sender, rentAddOn.validUntil);

        pendingWithdrawals[_marketOwner] += msg.value;
    }

    // Checks the status of a user's Rent AddOn
    function checkRentAddOnStatus(
        address user
    ) public view returns (bool isActive, uint256 validUntil) {
        RentAddOn storage rentAddOn = _rentAddOns[user];
        isActive =
            rentAddOn.holder == user &&
            rentAddOn.validUntil > block.timestamp;
        validUntil = rentAddOn.validUntil;
        return (isActive, validUntil);
    }

    // To Calculate Cost of RentAddOn
    function calculateRentAddOnCost(
        address user
    ) public view returns (uint256) {
        if (!hasActivePass(user)) return 0;
        FlixPass storage activePass = getActivePass(user);
        uint256 daysLeft = (activePass.validUntil - block.timestamp) / 1 days;
        return daysLeft * rentAddOnDailyPrice;
    }

    // Returns user's current pass typr
    function getCurrentPassType(
        address user
    ) public view returns (string memory) {
        if (_premiumPasses[user].validUntil > block.timestamp) {
            return "Premium";
        } else if (_standardPasses[user].validUntil > block.timestamp) {
            return "Standard";
        } else {
            return "None";
        }
    }

    function hasPremiumPass(address user) external view returns (bool) {
        return _premiumPasses[user].validUntil > block.timestamp;
    }

    // Checks if a user has access to a rented NFT via a Rent AddOn or within the rental period
    function checkRentNFTAccess(
        uint256 tokenId,
        address user
    ) public view returns (bool) {
        Rental storage rental = _rentals[tokenId];
        RentAddOn storage rentAddOn = _rentAddOns[user];
        bool hasActiveRentAddOn = (rentAddOn.holder == user &&
            rentAddOn.validUntil > block.timestamp);

        // Check if the user has an active Rent AddOn
        if (hasActiveRentAddOn && rental.tokenId != 0) {
            return true; // Rent AddOn holder has access to all rented NFTs
        }

        // Check if the user is a renter within the rental period
        for (uint256 i = 0; i < rental.renters.length; i++) {
            if (rental.renters[i] == user) {
                for (uint256 j = 0; j < rental.rentalPeriods.length; j++) {
                    if (
                        block.timestamp >= rental.rentalPeriods[j].start &&
                        block.timestamp <= rental.rentalPeriods[j].end
                    ) {
                        return true; // Renter has access within the rental period
                    }
                }
            }
        }

        return false; // No access
    }

    // Sets the rental period for an NFT, updating existing periods if overlapping
    function setRentalPeriod(
        uint256 tokenId,
        uint256 rentalStart,
        uint256 rentalEnd
    ) public {
        require(
            ownerOf(tokenId) == msg.sender,
            "Only the NFT owner can set rental period"
        );
        require(
            _idToMarketItem[tokenId].owner != address(this),
            "NFT is currently listed for sale"
        );
        require(
            auctions[tokenId].tokenId != tokenId ||
                block.timestamp > auctions[tokenId].expiresAt,
            "NFT is currently in an auction"
        );

        Rental storage rental = _rentals[tokenId];
        bool periodUpdated = false;

        for (uint256 i = 0; i < rental.rentalPeriods.length; i++) {
            if (
                rentalStart <= rental.rentalPeriods[i].end &&
                rentalEnd >= rental.rentalPeriods[i].start
            ) {
                // Update existing period if overlapping
                rental.rentalPeriods[i].start = rentalStart <
                    rental.rentalPeriods[i].start
                    ? rentalStart
                    : rental.rentalPeriods[i].start;
                rental.rentalPeriods[i].end = rentalEnd >
                    rental.rentalPeriods[i].end
                    ? rentalEnd
                    : rental.rentalPeriods[i].end;
                periodUpdated = true;
                break;
            }
        }

        if (!periodUpdated) {
            rental.rentalPeriods.push(RentalPeriod(rentalStart, rentalEnd));
        }

        emit RentalPeriodSet(tokenId, rentalStart, rentalEnd);
    }

    // Allows a user to withdraw their earnings or refunds.
    function withdrawFunds() public {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "No funds available for withdrawal.");
        require(
            address(this).balance >= amount,
            "Not enough funds in the contract."
        );

        pendingWithdrawals[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }

    // Returns all the avilable NFTs.
    function fetchAllNFTs() public view returns (MarketItem[] memory) {
        uint256 totalTokens = _tokenIds.current();
        MarketItem[] memory allItems = new MarketItem[](totalTokens);

        for (uint256 i = 1; i <= totalTokens; i++) {
            allItems[i - 1] = _idToMarketItem[i];
        }

        return allItems;
    }

    // Fetches all isArt NFTs owned by the caller, including those listed for sale
    function fetchMyOwnedIsArtNFTs() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _tokenIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        // First pass: Count the items
        for (uint256 i = 1; i <= totalItemCount; i++) {
            MarketItem storage currentItem = _idToMarketItem[i];
            if (
                currentItem.isArt &&
                (currentItem.owner == msg.sender ||
                    (currentItem.seller == msg.sender &&
                        currentItem.owner == address(this)))
            ) {
                itemCount++;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);

        // Second pass: Populate the items
        for (uint256 i = 1; i <= totalItemCount; i++) {
            MarketItem storage currentItem = _idToMarketItem[i];
            if (
                currentItem.isArt &&
                (currentItem.owner == msg.sender ||
                    (currentItem.seller == msg.sender &&
                        currentItem.owner == address(this)))
            ) {
                items[currentIndex] = currentItem;
                currentIndex++;
            }
        }

        return items;
    }

    // Fetches all available isArt NFTs
    function fetchAllAvailableIsArtNFTs()
        public
        view
        returns (MarketItem[] memory)
    {
        uint256 totalItemCount = _tokenIds.current();
        uint256 availableItemCount = 0;
        uint256 currentIndex = 0;

        // First, count all available isArt NFTs
        for (uint256 i = 1; i <= totalItemCount; i++) {
            if (
                _idToMarketItem[i].isArt &&
                !_idToMarketItem[i].sold &&
                _idToMarketItem[i].owner != address(0)
            ) {
                availableItemCount++;
            }
        }

        MarketItem[] memory availableItems = new MarketItem[](
            availableItemCount
        );
        for (uint256 i = 1; i <= totalItemCount; i++) {
            if (
                _idToMarketItem[i].isArt &&
                !_idToMarketItem[i].sold &&
                _idToMarketItem[i].owner != address(0)
            ) {
                uint256 currentId = i;
                MarketItem storage currentItem = _idToMarketItem[currentId];
                availableItems[currentIndex] = currentItem;
                currentIndex++;
            }
        }
        return availableItems;
    }

    // Fetches all NFTs marked as isArt, regardless of their sale status
    function fetchAllIsArtNFTs() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _tokenIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        // First, count all isArt NFTs
        for (uint256 i = 1; i <= totalItemCount; i++) {
            if (_idToMarketItem[i].isArt) {
                itemCount++;
            }
        }

        MarketItem[] memory isArtItems = new MarketItem[](itemCount);
        for (uint256 i = 1; i <= totalItemCount; i++) {
            if (_idToMarketItem[i].isArt) {
                uint256 currentId = i;
                MarketItem storage currentItem = _idToMarketItem[currentId];
                isArtItems[currentIndex] = currentItem;
                currentIndex++;
            }
        }
        return isArtItems;
    }

    // Return list of all NFTs currently on sale
    function fetchAllNFTsOnSale() public view returns (MarketItem[] memory) {
        uint256 totalTokens = _tokenIds.current();
        uint256 onSaleCount = 0;

        // First, determine the count of items on sale for proper memory allocation.
        for (uint256 i = 1; i <= totalTokens; i++) {
            if (
                _idToMarketItem[i].owner == address(this) &&
                !_idToMarketItem[i].sold
            ) {
                onSaleCount++;
            }
        }

        MarketItem[] memory itemsOnSale = new MarketItem[](onSaleCount);
        uint256 currentIndex = 0;
        for (uint256 i = 1; i <= totalTokens; i++) {
            if (
                _idToMarketItem[i].owner == address(this) &&
                !_idToMarketItem[i].sold
            ) {
                itemsOnSale[currentIndex] = _idToMarketItem[i];
                currentIndex++;
            }
        }

        return itemsOnSale;
    }

    // Returns a list of NFTs owned by a user.
    function fetchNFTsOwnedByUser(
        address user
    ) public view returns (MarketItem[] memory) {
        uint256 totalTokens = _tokenIds.current();
        uint256 ownershipCount = 0;

        for (uint256 i = 1; i <= totalTokens; i++) {
            if (_idToMarketItem[i].owner == user) {
                ownershipCount++;
            }
        }

        MarketItem[] memory itemsOwned = new MarketItem[](ownershipCount);
        uint256 index = 0;
        for (uint256 i = 1; i <= totalTokens; i++) {
            if (_idToMarketItem[i].owner == user) {
                itemsOwned[index] = _idToMarketItem[i];
                index++;
            }
        }
        return itemsOwned;
    }

    // Returns the details of an NFT.
    function fetchNFTDetails(
        uint256 tokenId
    ) public view returns (MarketItem memory) {
        return _idToMarketItem[tokenId];
    }

    // Function to check the status of an NFT (Auction, Rent, Fixed) along with it's price
    function getNFTStatusPrice(
        uint256 tokenId
    ) public view returns (string memory status, uint256 currentPrice) {
        // Check if the NFT is in an auction
        Auction storage auction = auctions[tokenId];
        if (auction.tokenId == tokenId && auction.expiresAt > block.timestamp) {
            return ("Auction", getAuctionPrice(tokenId));
        }

        // Check if the NFT is listed for rent
        Rental storage rental = _rentals[tokenId];
        if (rental.tokenId == tokenId) {
            return ("Rent", rental.dailyPrice);
        }

        // Check if the NFT is on a fixed sale
        MarketItem storage item = _idToMarketItem[tokenId];
        if (item.owner == address(this) && !item.sold) {
            return ("Fixed", item.price);
        }

        // If none of the above, the NFT is not currently on sale or rent
        return ("None", 0);
    }

    // Returns the total number of minted NFTs.
    function fetchNFTTotalCount() public view returns (uint256) {
        return _tokenIds.current();
    }

    // Retrieves the IDs of NFTs owned by a specific address that are not currently listed for sale.
    function fetchOwnedNFTsNotOnSale(
        address owner
    ) public view returns (uint256[] memory) {
        uint256 totalTokens = _tokenIds.current();
        uint256[] memory ownedTokensNotOnSale = new uint256[](totalTokens);
        uint256 tokenCount = 0;

        for (uint256 i = 1; i <= totalTokens; i++) {
            if (
                ownerOf(i) == owner && _idToMarketItem[i].owner != address(this)
            ) {
                ownedTokensNotOnSale[tokenCount] = i;
                tokenCount++;
            }
        }

        uint256[] memory resultTokens = new uint256[](tokenCount);
        for (uint256 i = 0; i < tokenCount; i++) {
            resultTokens[i] = ownedTokensNotOnSale[i];
        }

        return resultTokens;
    }

    // Retrieves the IDs of NFTs owned by a specific address that are currently listed for sale.
    function fetchOwnedNFTsOnSale(
        address owner
    ) public view returns (uint256[] memory) {
        uint256 totalTokens = _tokenIds.current();
        uint256[] memory ownedSaleTokens = new uint256[](totalTokens);
        uint256 saleTokenCount = 0;

        for (uint256 i = 1; i <= totalTokens; i++) {
            if (
                _idToMarketItem[i].seller == owner &&
                _idToMarketItem[i].owner == address(this) &&
                !_idToMarketItem[i].sold
            ) {
                ownedSaleTokens[saleTokenCount] = i;
                saleTokenCount++;
            }
        }

        uint256[] memory resultTokens = new uint256[](saleTokenCount);
        for (uint256 i = 0; i < saleTokenCount; i++) {
            resultTokens[i] = ownedSaleTokens[i];
        }

        return resultTokens;
    }

    // Retrieves the IDs of NFTs currently available for auction.
    function fetchNFTsOnAuction() public view returns (uint256[] memory) {
        uint256 totalTokens = _tokenIds.current();
        uint256[] memory auctionTokens = new uint256[](totalTokens);
        uint256 auctionCount = 0;

        for (uint256 i = 1; i <= totalTokens; i++) {
            if (auctions[i].tokenId == i) {
                auctionTokens[auctionCount] = i;
                auctionCount++;
            }
        }

        uint256[] memory resultTokens = new uint256[](auctionCount);
        for (uint256 i = 0; i < auctionCount; i++) {
            resultTokens[i] = auctionTokens[i];
        }

        return resultTokens;
    }

    function checkPendingWithdrawal(
        address user
    ) public view returns (uint256) {
        return pendingWithdrawals[user];
    }

    function getAuctionDetails(
        uint256 tokenId
    ) external view returns (Auction memory) {
        return auctions[tokenId];
    }

    function getNFTOwner(uint256 tokenId) public view returns (address) {
        MarketItem storage item = _idToMarketItem[tokenId];
        // Check if the NFT is currently held by the contract as part of a sale
        if (item.owner == address(this) && !item.sold) {
            return item.seller;
        } else {
            return ownerOf(tokenId);
        }
    }

    // Returns details about the active pass and rent add-on status
    function getPassDetails(address user) public view returns (string memory passType, uint256 remainingDays, bool rentAddOnActive) {
        // Initialize variables
        passType = "None";
        remainingDays = 0;
        rentAddOnActive = false;

        // Check for premium pass
        if (_premiumPasses[user].validUntil > block.timestamp) {
            passType = "Premium";
            remainingDays = (_premiumPasses[user].validUntil - block.timestamp) / 60 / 60 / 24; // Convert seconds to days
        }
        // Check for standard pass if no premium pass is active
        else if (_standardPasses[user].validUntil > block.timestamp) {
            passType = "Standard";
            remainingDays = (_standardPasses[user].validUntil - block.timestamp) / 60 / 60 / 24; // Convert seconds to days
        }

        // Check for active Rent Add-On
        RentAddOn storage rentAddOn = _rentAddOns[user];
        if (rentAddOn.holder == user && rentAddOn.validUntil > block.timestamp) {
            rentAddOnActive = true;
        }

        return (passType, remainingDays, rentAddOnActive);
    }
}
