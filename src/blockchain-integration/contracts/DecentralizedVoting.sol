// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DecentralizedVoting {
    // Structure to represent a proposal
    struct Proposal {
        uint256 id;
        string title;
        string description;
        address creator;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 deadline;
        bool executed;
        bool exists;
    }
    
    // Structure to track voting information
    struct Vote {
        bool hasVoted;
        bool support; // true for yes, false for no
        uint256 timestamp;
    }
    
    // State variables
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => Vote)) public votes;
    mapping(address => uint256[]) public userProposals;
    
    uint256 public proposalCount;
    uint256 public constant VOTING_DURATION = 7 days;
    uint256 public constant MIN_VOTING_DURATION = 1 hours; // For testing
    
    // Events
    event ProposalCreated(
        uint256 indexed proposalId,
        string title,
        address indexed creator,
        uint256 deadline
    );
    
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        uint256 timestamp
    );
    
    event ProposalExecuted(
        uint256 indexed proposalId,
        bool passed
    );
    
    // Modifiers
    modifier proposalExists(uint256 _proposalId) {
        require(proposals[_proposalId].exists, "Proposal does not exist");
        _;
    }
    
    modifier votingOpen(uint256 _proposalId) {
        require(block.timestamp < proposals[_proposalId].deadline, "Voting period has ended");
        require(!proposals[_proposalId].executed, "Proposal already executed");
        _;
    }
    
    modifier hasNotVoted(uint256 _proposalId) {
        require(!votes[_proposalId][msg.sender].hasVoted, "You have already voted on this proposal");
        _;
    }
    
    // Functions
    
    /**
     * @dev Create a new proposal
     * @param _title The title of the proposal
     * @param _description The detailed description of the proposal
     */
    function createProposal(
        string memory _title,
        string memory _description
    ) external returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        
        proposalCount++;
        uint256 proposalId = proposalCount;
        
        proposals[proposalId] = Proposal({
            id: proposalId,
            title: _title,
            description: _description,
            creator: msg.sender,
            yesVotes: 0,
            noVotes: 0,
            deadline: block.timestamp + MIN_VOTING_DURATION, // Short duration for testing
            executed: false,
            exists: true
        });
        
        userProposals[msg.sender].push(proposalId);
        
        emit ProposalCreated(proposalId, _title, msg.sender, proposals[proposalId].deadline);
        
        return proposalId;
    }
    
    /**
     * @dev Cast a vote on a proposal
     * @param _proposalId The ID of the proposal to vote on
     * @param _support true for yes, false for no
     */
    function vote(uint256 _proposalId, bool _support) 
        external 
        proposalExists(_proposalId)
        votingOpen(_proposalId)
        hasNotVoted(_proposalId)
    {
        votes[_proposalId][msg.sender] = Vote({
            hasVoted: true,
            support: _support,
            timestamp: block.timestamp
        });
        
        if (_support) {
            proposals[_proposalId].yesVotes++;
        } else {
            proposals[_proposalId].noVotes++;
        }
        
        emit VoteCast(_proposalId, msg.sender, _support, block.timestamp);
    }
    
    /**
     * @dev Execute a proposal after voting period ends
     * @param _proposalId The ID of the proposal to execute
     */
    function executeProposal(uint256 _proposalId) 
        external 
        proposalExists(_proposalId)
    {
        Proposal storage proposal = proposals[_proposalId];
        
        require(block.timestamp >= proposal.deadline, "Voting period has not ended");
        require(!proposal.executed, "Proposal already executed");
        
        proposal.executed = true;
        bool passed = proposal.yesVotes > proposal.noVotes;
        
        emit ProposalExecuted(_proposalId, passed);
    }
    
    /**
     * @dev Get proposal details
     * @param _proposalId The ID of the proposal
     */
    function getProposal(uint256 _proposalId) 
        external 
        view 
        proposalExists(_proposalId)
        returns (
            uint256 id,
            string memory title,
            string memory description,
            address creator,
            uint256 yesVotes,
            uint256 noVotes,
            uint256 deadline,
            bool executed,
            bool isActive
        ) 
    {
        Proposal memory proposal = proposals[_proposalId];
        return (
            proposal.id,
            proposal.title,
            proposal.description,
            proposal.creator,
            proposal.yesVotes,
            proposal.noVotes,
            proposal.deadline,
            proposal.executed,
            block.timestamp < proposal.deadline && !proposal.executed
        );
    }
    
    /**
     * @dev Get all proposal IDs
     */
    function getAllProposals() external view returns (uint256[] memory) {
        uint256[] memory allProposals = new uint256[](proposalCount);
        for (uint256 i = 1; i <= proposalCount; i++) {
            allProposals[i - 1] = i;
        }
        return allProposals;
    }
    
    /**
     * @dev Get proposals created by a user
     * @param _user The address of the user
     */
    function getUserProposals(address _user) external view returns (uint256[] memory) {
        return userProposals[_user];
    }
    
    /**
     * @dev Check if user has voted on a proposal
     * @param _proposalId The ID of the proposal
     * @param _user The address of the user
     */
    function hasUserVoted(uint256 _proposalId, address _user) 
        external 
        view 
        proposalExists(_proposalId)
        returns (bool, bool) 
    {
        Vote memory userVote = votes[_proposalId][_user];
        return (userVote.hasVoted, userVote.support);
    }
    
    /**
     * @dev Get voting statistics
     */
    function getVotingStats() external view returns (
        uint256 totalProposals,
        uint256 activeProposals,
        uint256 executedProposals
    ) {
        uint256 active = 0;
        uint256 executed = 0;
        
        for (uint256 i = 1; i <= proposalCount; i++) {
            if (proposals[i].executed) {
                executed++;
            } else if (block.timestamp < proposals[i].deadline) {
                active++;
            }
        }
        
        return (proposalCount, active, executed);
    }
}
