// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CarbonCreditToken is ERC20, Ownable {
    
    constructor(address initialOwner) ERC20("Blue Carbon Credit", "BCC") Ownable(initialOwner) {
        // No initial supply - credits minted only after admin verification
    }
    
    /**
     * @dev Mint function for marketplace contract
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @dev Burn function
     */
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}
