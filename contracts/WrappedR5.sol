// SPDX-License-Identifier: MIT
pragma solidity >=0.7.6 <0.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/// @title Wrapped R5
/// @notice ERC20 wrapper for R5 coin with a fixed cap, burn, and EIP‑2612 permit
contract WrappedR5 is
    ERC20,
    ERC20Burnable,
    ERC20Permit,
    Ownable,
    ReentrancyGuard
{
    /// @notice Maximum total supply: 66,337,700 WR5 (18 decimals)
    uint256 public constant CAP = 66_337_700 * 10 ** 18;

    /// @dev Emitted when new tokens are minted
    event TokensMinted(address indexed to, uint256 amount);

    /// @dev Emitted when tokens are burned
    event TokensBurned(address indexed from, uint256 amount);

    /// @dev Emitted when tokens are rescued from the contract
    event TokensRecovered(
        address indexed token,
        address indexed to,
        uint256 amount
    );

    /// @dev Emitted when ownership transfer is initiated
    event OwnershipTransferStarted(
        address indexed previousOwner,
        address indexed newOwner
    );

    /// @dev The address pending ownership transfer
    address private _pendingOwner;

    constructor()
        ERC20("Wrapped R5", "WR5")
        ERC20Permit("Wrapped R5")
        Ownable()
    {
        // owner initialized to deployer
    }

    /// @notice View the address pending to become owner
    function pendingOwner() public view returns (address) {
        return _pendingOwner;
    }

    /// @notice Initiate ownership transfer to a new account (`newOwner` cannot accept until this is called)
    /// @param newOwner The address to transfer ownership to
    function initiateOwnershipTransfer(address newOwner) external onlyOwner {
        require(newOwner != address(0), "WrappedR5: new owner is zero address");
        _pendingOwner = newOwner;
        emit OwnershipTransferStarted(owner(), newOwner);
    }

    /// @notice Accept ownership transfer (must be called by pending owner)
    function acceptOwnership() external {
        address sender = _msgSender();
        require(sender == _pendingOwner, "WrappedR5: caller is not the pending owner");
        _pendingOwner = address(0);
        _transferOwnership(sender);
    }

    /// @notice Mint up to the cap; only the owner can call
    /// @param to   Recipient of the minted tokens
    /// @param amount  Amount to mint (in wei)
    function mint(address to, uint256 amount) external onlyOwner nonReentrant {
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

    /// @notice Rescue any ERC20 tokens sent here by mistake
    /// @param token  The ERC20 contract to pull tokens from
    /// @param to     Recipient of the rescued tokens
    /// @param amount Amount to recover
    function emergencyRecoverERC20(
        IERC20 token,
        address to,
        uint256 amount
    ) external onlyOwner {
        token.transfer(to, amount);
        emit TokensRecovered(address(token), to, amount);
    }
}
