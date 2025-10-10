// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

contract SimpleCounter {
    uint256 public count;
    address public owner;
    
    event CountChanged(uint256 newCount, address changedBy);
    
    constructor() {
        count = 0;
        owner = msg.sender;
    }
    
    function increment() public {
        count = count + 1;
        emit CountChanged(count, msg.sender);
    }
    
    function decrement() public {
        require(count > 0, "Count cannot be negative");
        count = count - 1;
        emit CountChanged(count, msg.sender);
    }
    
    function reset() public {
        require(msg.sender == owner, "Only owner can reset");
        count = 0;
        emit CountChanged(count, msg.sender);
    }
    
    function getCount() public view returns (uint256) {
        return count;
    }
}
