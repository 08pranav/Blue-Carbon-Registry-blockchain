// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*
 Marketplace + Registry for NGOs, Companies, Trades, and Verification events.
 Stores hashes (IPFS) and minimal metadata on-chain.
 Uses CarbonCreditToken (ERC20) to mint credits to NGOs.

 NOTE: This is a simple single-contract design for localhost/dev.
 For production you'd separate concerns and add more security.
*/

import "./CarbonCreditToken.sol";

contract Marketplace {
    address public admin;
    CarbonCreditToken public token;
    uint256 public nextNgoId = 1;
    uint256 public nextCompanyId = 1;
    uint256 public nextTradeId = 1;

    enum VerificationStatus { None, Pending, Verified, Rejected }

    struct NGO {
        uint256 ngoId;
        address wallet;
        string name;
        VerificationStatus status;
        string documentsHash; // IPFS hash
        uint256 creditsAllocated;
        uint256 dateVerified; // timestamp
    }

    struct Company {
        uint256 companyId;
        address wallet;
        string name;
        string kycHash;
    }

    struct Trade {
        uint256 tradeId;
        address seller;
        address buyer;
        uint256 amount; // credits transferred
        uint256 price; // price in wei or token (for demo ETH)
        string pdfHash; // IPFS hash of generated pdf contract
        uint256 timestamp;
    }

    mapping(uint256 => NGO) public ngos;
    mapping(address => uint256) public ngoIdByWallet;

    mapping(uint256 => Company) public companies;
    mapping(address => uint256) public companyIdByWallet;

    mapping(uint256 => Trade) public trades;

    event NGORegistered(uint256 indexed ngoId, address indexed wallet, string name);
    event NGOStatusUpdated(uint256 indexed ngoId, VerificationStatus status, uint256 timestamp);
    event CreditsMinted(uint256 indexed ngoId, address indexed to, uint256 amount);
    event CompanyRegistered(uint256 indexed companyId, address indexed wallet, string name);
    event TradeExecuted(uint256 indexed tradeId, address indexed seller, address indexed buyer, uint256 amount, uint256 price, string pdfHash);

    modifier onlyAdmin() {
        require(msg.sender == admin, "only admin");
        _;
    }

    modifier onlyVerified(uint256 _ngoId) {
        require(ngos[_ngoId].status == VerificationStatus.Verified, "ngo not verified");
        _;
    }

    constructor(address tokenAddress) {
        admin = msg.sender;
        token = CarbonCreditToken(tokenAddress);
    }

    // NGO registers (off-chain proofs uploaded to IPFS; pass the hash)
    function registerNGO(address wallet, string calldata name, string calldata documentsHash) external returns (uint256) {
        require(ngoIdByWallet[wallet] == 0, "already registered");
        uint256 id = nextNgoId++;
        ngos[id] = NGO({ ngoId: id, wallet: wallet, name: name, status: VerificationStatus.Pending, documentsHash: documentsHash, creditsAllocated: 0, dateVerified: 0 });
        ngoIdByWallet[wallet] = id;
        emit NGORegistered(id, wallet, name);
        return id;
    }

    // Admin verifies NGO and optionally assigns credits on verification
    function verifyNGO(uint256 ngoId, VerificationStatus newStatus, uint256 creditsToAllocate) external onlyAdmin {
        require(newStatus == VerificationStatus.Verified || newStatus == VerificationStatus.Rejected, "invalid status");
        require(ngoId > 0 && ngoId < nextNgoId, "NGO does not exist");
        NGO storage n = ngos[ngoId];
        require(n.wallet != address(0), "Invalid NGO");
        n.status = newStatus;
        if (newStatus == VerificationStatus.Verified) {
            n.dateVerified = block.timestamp;
            if (creditsToAllocate > 0) {
                n.creditsAllocated += creditsToAllocate;
                // mint tokens to the NGO wallet via token contract
                token.mint(n.wallet, creditsToAllocate);
                emit CreditsMinted(ngoId, n.wallet, creditsToAllocate);
            }
        }
        emit NGOStatusUpdated(ngoId, newStatus, block.timestamp);
    }

    // Register a company that can buy credits
    function registerCompany(address wallet, string calldata name, string calldata kycHash) external returns (uint256) {
        require(companyIdByWallet[wallet] == 0, "company exists");
        uint256 id = nextCompanyId++;
        companies[id] = Company({ companyId: id, wallet: wallet, name: name, kycHash: kycHash });
        companyIdByWallet[wallet] = id;
        emit CompanyRegistered(id, wallet, name);
        return id;
    }

    // Execute a trade: seller must approve tokens to this contract or transfer beforehand.
    // For simplicity, we assume buyer pays in Ether and seller receives Ether.
    // This function transfers ERC20 tokens from seller to buyer and transfers ETH to seller.
    function executeTrade(address seller, address buyer, uint256 amount, string calldata pdfHash) external payable returns (uint256) {
        // buyer should send the payment as msg.value
        require(msg.value > 0, "payment required");
        require(amount > 0, "amount must be > 0");
        // Transfer tokens (credits) from seller to buyer: seller must approve this contract
        bool success = token.transferFrom(seller, buyer, amount);
        require(success, "token transfer failed");
        // Transfer payment in ETH to seller
        (bool sent, ) = seller.call{value: msg.value}("");
        require(sent, "payment send failed");
        uint256 tid = nextTradeId++;
        trades[tid] = Trade({ tradeId: tid, seller: seller, buyer: buyer, amount: amount, price: msg.value, pdfHash: pdfHash, timestamp: block.timestamp });
        emit TradeExecuted(tid, seller, buyer, amount, msg.value, pdfHash);
        return tid;
    }

    // Allow admin to change admin
    function setAdmin(address newAdmin) external onlyAdmin {
        admin = newAdmin;
    }

    // Helper view functions
    function getNgoById(uint256 id) external view returns (NGO memory) {
        return ngos[id];
    }

    function getCompanyById(uint256 id) external view returns (Company memory) {
        return companies[id];
    }

    function getTradeById(uint256 id) external view returns (Trade memory) {
        return trades[id];
    }
}
