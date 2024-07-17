// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.0.0/contracts/token/ERC721/ERC721.sol";

struct MarketItem {
    uint256 tokenId;
    address payable seller;
    address payable owner;
    uint256 price;
    bool sold;
}

interface IMarketplace {
    // Fetches details of an NFT from the marketplace
    function getNFTStatusPrice(
        uint256 tokenId
    ) external view returns (string memory status, uint256 currentPrice);
}

contract LoanVault {
    IMarketplace marketplace;

    // State variables, mappings
    address private immutable owner;
    uint64 public loanId;
    uint32 public immutable feePTRCent;

    mapping(uint256 => Loan) public pendingLoans;
    mapping(uint256 => Loan) public activeLoans;
    uint96[] private pendingLoanIds;
    uint96[] private activeLoanIds;

    mapping(address => mapping(uint256 => bool)) public nftCollateralStatus;

    struct Loan {
        IERC721[] nfts; // Array of NFT contracts
        uint224[] nftIds; // Array of NFT IDs
        bool paidOff;
        bool loanActive;
        address borrower;
        uint96 requestedAmount;
        address lender;
        uint96 toPay;
        uint64 timeStart;
        uint64 timeEnd;
        uint96 id;
        string tokenURI;
    }

    enum LoanStatus {
        NonExistent, // 0 - Default value for non-existing loans
        Pending, // 1 - Loan has been proposed but not accepted
        Active, // 2 - Loan is active and money has been lent
        PaidOff, // 3 - Loan has been fully repaid
        Defaulted // 4 - Loan was not repaid in time and has been liquidated
    }

    // Events for emitting when certain things happen
    event PostedLoan(address proposer, uint256 id, string tokenURI);
    event CeaseLoan(address retractor, uint256 id);
    event AcceptedLoan(
        address borrower,
        address lender,
        uint256 amnt,
        uint256 id
    );
    event LoanPaid(address borrower, uint256 id);
    event LoanDefaulted(address borrower, address lender, uint256 id);

    modifier onlyOwner() {
        require(msg.sender == owner, "LoanVault: Caller is not the owner");
        _;
    }

    // To check if the loan corresponding to the id passed in is a valid active loan
    modifier validActiveLoan(uint96 _id) {
        require(
            activeLoans[_id].id == _id,
            "LoanVault: Invalid or inactive loan"
        );
        _;
    }

    constructor(
        address marketplaceAddress,
        address _contractOwner,
        uint32 _feePTRCent
    ) {
        marketplace = IMarketplace(marketplaceAddress);
        owner = _contractOwner;
        feePTRCent = _feePTRCent; // 0.25%
    }

    // Retrieves the current market price of a specific NFT using its token ID.
    function getNFTPrice(uint256 tokenId) public view returns (uint256) {
        (string memory status, uint256 price) = marketplace.getNFTStatusPrice(
            tokenId
        );
        require(
            keccak256(abi.encodePacked(status)) !=
                keccak256(abi.encodePacked("Rent")) &&
                keccak256(abi.encodePacked(status)) !=
                keccak256(abi.encodePacked("None")),
            "NFT is not eligible for collateral"
        );
        require(price > 0, "NFT price is zero");
        return price;
    }

    // Returns the fee pTRCentage set for the contract.
    function _fee() public view returns (uint256) {
        return feePTRCent;
    }

    // Returns the address of the contract's owner.
    function _owner() public view returns (address) {
        return owner;
    }

    // Provides access to the details of a pending loan by its index.
    function accessPending(uint256 _index) public view returns (Loan memory) {
        return pendingLoans[_index];
    }

    // Provides access to the details of an active loan by its index.
    function accessActive(uint256 _index) public view returns (Loan memory) {
        return activeLoans[_index];
    }

    // Allows the owner to withdraw all TFUEL stored in the contract.
    function withdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    // Internal function used to transfer the NFT to the lender upon loan default.
    function liquidateLoan(uint96 _id) internal {
        Loan memory liqLoan = activeLoans[_id];
        for (uint256 i = 0; i < liqLoan.nfts.length; i++) {
            liqLoan.nfts[i].transferFrom(
                address(this),
                liqLoan.lender,
                liqLoan.nftIds[i]
            );
            nftCollateralStatus[address(liqLoan.nfts[i])][
                liqLoan.nftIds[i]
            ] = false;
        }
        emit LoanDefaulted(liqLoan.borrower, liqLoan.lender, _id);
        delete activeLoans[_id];
    }

    // Check if an NFT is used as collateral
    function isCollateral(
        address nftContract,
        uint256 tokenId
    ) public view returns (bool) {
        return nftCollateralStatus[nftContract][tokenId];
    }

    /**************************  BORROWER FUNCTIONS  **************************/

    function propose(
        IERC721[] calldata _nfts,
        uint224[] calldata _nftIds,
        uint96 _reqAmnt,
        uint96 _toPay,
        uint64 _duration,
        string calldata _tokenURI
    ) external {
        require(
            _nfts.length > 0 && _nfts.length == _nftIds.length,
            "Mismatched NFTs and IDs"
        );
        require(
            _reqAmnt > 0 && _toPay > _reqAmnt,
            "Invalid request or payback amount"
        );

        for (uint256 i = 0; i < _nftIds.length; i++) {
            require(
                !nftCollateralStatus[address(_nfts[i])][_nftIds[i]],
                "NFT is already used as collateral"
            );
            address currentOwner = _nfts[i].ownerOf(_nftIds[i]);
            require(
                isNFTApproved(_nfts[i], _nftIds[i], currentOwner),
                "Transfer not approved"
            );
            _nfts[i].transferFrom(currentOwner, address(this), _nftIds[i]);
            nftCollateralStatus[address(_nfts[i])][_nftIds[i]] = true;
        }

        Loan memory newLoan = Loan({
            nfts: _nfts,
            nftIds: _nftIds,
            paidOff: false,
            loanActive: false,
            borrower: msg.sender,
            lender: address(0),
            requestedAmount: _reqAmnt,
            toPay: _toPay,
            timeStart: 0,
            timeEnd: _duration * 1 days,
            id: ++loanId,
            tokenURI: _tokenURI
        });
        pendingLoans[loanId] = newLoan;
        pendingLoanIds.push(loanId);
        emit PostedLoan(msg.sender, loanId, _tokenURI);
    }

    function isNFTApproved(
        IERC721 nft,
        uint224 nftId,
        address nftOwner
    ) public view returns (bool) {
        return (nft.getApproved(nftId) == address(this) ||
            nft.isApprovedForAll(nftOwner, address(this)));
    }

    // Borrower Functions

    // Borrower should be able to retract a proposed loan before it's accepted
    function retract(uint96 _id) external {
        require(activeLoans[_id].id != _id, "Loan is already active!");
        require(
            pendingLoans[_id].borrower == msg.sender,
            "Can only retract your loans!"
        );

        for (uint256 i = 0; i < pendingLoans[_id].nfts.length; i++) {
            pendingLoans[_id].nfts[i].transferFrom(
                address(this),
                pendingLoans[_id].borrower,
                pendingLoans[_id].nftIds[i]
            );
        }
        removeLoanId(pendingLoanIds, _id);
        delete pendingLoans[_id];
        emit CeaseLoan(msg.sender, _id);
    }

    // Borrower should be able to pay off loan
    function payInFull(uint96 _id) external payable validActiveLoan(_id) {
        require(
            activeLoans[_id].borrower == msg.sender,
            "Can only pay off your own loans!"
        );
        require(msg.value >= activeLoans[_id].toPay, "Must pay loan in full!");

        uint256 profit = activeLoans[_id].toPay -
            activeLoans[_id].requestedAmount;
        uint256 poolFee = (profit * feePTRCent) / 100;

        payable(activeLoans[_id].lender).transfer(
            activeLoans[_id].toPay - poolFee
        );

        for (uint256 i = 0; i < activeLoans[_id].nfts.length; i++) {
            nftCollateralStatus[address(activeLoans[_id].nfts[i])][
                activeLoans[_id].nftIds[i]
            ] = false;
            activeLoans[_id].nfts[i].transferFrom(
                address(this),
                activeLoans[_id].borrower,
                activeLoans[_id].nftIds[i]
            );
        }

        delete activeLoans[_id];
        emit LoanPaid(msg.sender, _id);
    }

    // Lender Functions

    // Lender should be able to lend to a borrower
    function acceptLoan(uint96 _loanId) external payable {
        require(
            activeLoans[_loanId].id != _loanId,
            "Loan has already been accepted!"
        );
        Loan storage accepting = pendingLoans[_loanId];
        require(accepting.borrower != address(0), "Loan has been retracted!");
        require(
            msg.sender != accepting.borrower,
            "Borrower cannot be the lender of their own loan!"
        );
        require(
            msg.value >= accepting.requestedAmount,
            "You need to loan out the full amount!"
        );

        payable(accepting.borrower).transfer(accepting.requestedAmount);
        makeLoanActive(_loanId);
        removeLoanId(pendingLoanIds, _loanId);
        activeLoanIds.push(_loanId);
    }

    // Lender should be able to liquidate defaulted loans
    function liquidate(uint96 _id) external validActiveLoan(_id) {
        Loan storage loan = activeLoans[_id];
        require(
            block.timestamp > loan.timeEnd && !loan.paidOff,
            "Loan period still active or loan paid off!"
        );
        require(msg.sender == loan.lender, "Not lender");

        for (uint256 i = 0; i < loan.nfts.length; i++) {
            loan.nfts[i].transferFrom(
                address(this),
                loan.lender,
                loan.nftIds[i]
            );
        }
        loan.loanActive = false;
        removeLoanId(activeLoanIds, _id);
        emit LoanDefaulted(
            activeLoans[_id].borrower,
            activeLoans[_id].lender,
            _id
        );
        delete activeLoans[_id];
    }

    // Internal functions
    function createLoan(
        IERC721[] calldata _nfts,
        uint224[] calldata _nftIds,
        uint96 _reqAmnt,
        uint96 _toPay,
        uint64 _duration,
        string memory _tokenURI
    ) internal {
        Loan memory newLoan = Loan({
            nfts: _nfts,
            nftIds: _nftIds,
            paidOff: false,
            loanActive: false,
            borrower: msg.sender,
            lender: address(0),
            requestedAmount: _reqAmnt,
            toPay: _toPay,
            timeStart: 0,
            timeEnd: _duration * 1 days,
            id: ++loanId,
            tokenURI: _tokenURI
        });

        pendingLoans[loanId] = newLoan;
        emit PostedLoan(msg.sender, loanId, _tokenURI);
    }

    function makeLoanActive(uint96 _loanId) internal {
        Loan storage loan = pendingLoans[_loanId];
        activeLoans[_loanId] = Loan({
            nfts: loan.nfts,
            nftIds: loan.nftIds,
            borrower: loan.borrower,
            lender: msg.sender,
            requestedAmount: loan.requestedAmount,
            toPay: loan.toPay,
            timeStart: uint64(block.timestamp),
            timeEnd: loan.timeEnd + uint64(block.timestamp),
            id: _loanId,
            paidOff: false,
            loanActive: true,
            tokenURI: loan.tokenURI
        });

        delete pendingLoans[_loanId];
        emit AcceptedLoan(
            loan.borrower,
            msg.sender,
            loan.requestedAmount,
            _loanId
        );
    }

    function listPendingLoanIds() public view returns (uint96[] memory) {
        return pendingLoanIds;
    }

    function listActiveLoanIds() public view returns (uint96[] memory) {
        return activeLoanIds;
    }

    function getTotalActiveLoans() public view returns (uint256) {
        return activeLoanIds.length;
    }

    function getTotalPendingLoans() public view returns (uint256) {
        return pendingLoanIds.length;
    }

    function getMyActiveLoanIdsAsBorrower()
        public
        view
        returns (uint96[] memory)
    {
        uint256 count = 0;
        for (uint256 i = 0; i < activeLoanIds.length; i++) {
            if (activeLoans[activeLoanIds[i]].borrower == msg.sender) {
                count++;
            }
        }

        uint96[] memory myLoans = new uint96[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < activeLoanIds.length; i++) {
            if (activeLoans[activeLoanIds[i]].borrower == msg.sender) {
                myLoans[index] = activeLoanIds[i];
                index++;
            }
        }

        return myLoans;
    }

    function getMyActiveLoanIdsAsLender()
        public
        view
        returns (uint96[] memory)
    {
        uint256 count = 0;
        for (uint256 i = 0; i < activeLoanIds.length; i++) {
            if (activeLoans[activeLoanIds[i]].lender == msg.sender) {
                count++;
            }
        }

        uint96[] memory myLoans = new uint96[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < activeLoanIds.length; i++) {
            if (activeLoans[activeLoanIds[i]].lender == msg.sender) {
                myLoans[index] = activeLoanIds[i];
                index++;
            }
        }

        return myLoans;
    }

    function removeLoanId(uint96[] storage array, uint96 _id) internal {
        uint length = array.length;
        for (uint i = 0; i < length; i++) {
            if (array[i] == _id) {
                array[i] = array[length - 1];
                array.pop();
                break;
            }
        }
    }

    function getLoanTokenURI(
        uint96 _loanId
    ) public view returns (string memory) {
        // Check if the loan is active and return the token URI
        if (activeLoans[_loanId].id == _loanId) {
            return activeLoans[_loanId].tokenURI;
        }
        // Check if the loan is pending and return the token URI
        if (pendingLoans[_loanId].id == _loanId) {
            return pendingLoans[_loanId].tokenURI;
        }
        // If no matching loan is found, revert the transaction to indicate error
        revert("LoanVault: No such loan exists");
    }

    function getLoanStatus(uint96 _loanId) public view returns (LoanStatus) {
        // Check if the loan is in the active loans mapping and if it is active or paid off
        if (activeLoans[_loanId].id == _loanId) {
            if (
                activeLoans[_loanId].loanActive && !activeLoans[_loanId].paidOff
            ) {
                return LoanStatus.Active;
            } else if (
                !activeLoans[_loanId].loanActive && activeLoans[_loanId].paidOff
            ) {
                return LoanStatus.PaidOff;
            } else if (
                !activeLoans[_loanId].loanActive &&
                !activeLoans[_loanId].paidOff
            ) {
                return LoanStatus.Defaulted;
            }
        }

        // Check if the loan is in the pending loans mapping
        if (pendingLoans[_loanId].id == _loanId) {
            return LoanStatus.Pending;
        }

        // If no matching loan is found in either mapping, return NonExistent
        return LoanStatus.NonExistent;
    }

    function getLoanDetails(
        uint96 _loanId
    )
        public
        view
        returns (
            LoanStatus status,
            address borrower,
            address lender,
            uint96 requestedAmount,
            uint96 toPay,
            uint64 startTime,
            uint64 endTime,
            string memory tokenURI
        )
    {
        Loan memory loan = activeLoans[_loanId].id == _loanId
            ? activeLoans[_loanId]
            : pendingLoans[_loanId];
        require(loan.id == _loanId, "LoanVault: No such loan exists");
        return (
            getLoanStatus(_loanId),
            loan.borrower,
            loan.lender,
            loan.requestedAmount,
            loan.toPay,
            loan.timeStart,
            loan.timeEnd,
            loan.tokenURI
        );
    }
}
