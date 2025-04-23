// SPDX-License-Identifier: MIT
pragma solidity >=0.7.6 <0.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/// @title Wrapped R5
/// @notice ERC20 wrapper for R5 coin with a fixed cap, burn, and EIP‑2612 permit
contract WrappedR5 is ERC20, ERC20Burnable, ERC20Permit, Ownable, ReentrancyGuard {
    /// @notice Maximum total supply: 66,337,700 WR5 (18 decimals)
    uint256 public constant CAP = 66_337_700 * 10**18;

    /// @dev Emitted when new tokens are minted
    event TokensMinted(address indexed to, uint256 amount);

    /// @dev Emitted when tokens are burned
    event TokensBurned(address indexed from, uint256 amount);

    constructor()
        ERC20("Wrapped R5", "WR5")
        ERC20Permit("Wrapped R5")
        Ownable(msg.sender)
    {
        // owner initialized to deployer
    }

    /// @notice Mint up to the cap; only the owner can call
    /// @param to   Recipient of the minted tokens
    /// @param amount  Amount to mint (in wei)
    function mint(address to, uint256 amount)
        external
        onlyOwner
        nonReentrant
    {
        require(totalSupply() + amount <= CAP, "WrappedR5: cap exceeded");
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    /// @notice Burn your own tokens; emits a custom event
    function burn(uint256 amount) public override {
        super.burn(amount);
        emit TokensBurned(_msgSender(), amount);
    }

    /// @notice Burn from someone else’s allowance; emits a custom event
    function burnFrom(address account, uint256 amount) public override {
        super.burnFrom(account, amount);
        emit TokensBurned(account, amount);
    }
}
