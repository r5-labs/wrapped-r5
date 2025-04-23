const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("WrappedR5 — mint & burn smoke test", function () {
  let WrappedR5, wrapped, owner;

  before(async function () {
    // get the owner signer
    [owner] = await ethers.getSigners();

    // deploy
    WrappedR5 = await ethers.getContractFactory("WrappedR5");
    wrapped = await WrappedR5.connect(owner).deploy();
    await wrapped.deployed();
  });

  it("mints 100 WR5 to owner and burns 1 WR5", async function () {
    // --- Mint 100 WR5 ---
    const mintAmount = ethers.utils.parseEther("100"); // 100.0 WR5
    await wrapped.connect(owner).mint(owner.address, mintAmount);

    // check & log balance
    let balance = await wrapped.balanceOf(owner.address);
    console.log(
      "After mint:",
      ethers.utils.formatEther(balance),
      "WR5"
    );
    expect(balance).to.equal(mintAmount);

    // --- Burn 1 WR5 ---
    const burnAmount = ethers.utils.parseEther("1"); // 1.0 WR5
    await wrapped.connect(owner).burn(burnAmount);

    // check & log new balance
    const expected = mintAmount.sub(burnAmount);
    balance = await wrapped.balanceOf(owner.address);
    console.log(
      "After burn:",
      ethers.utils.formatEther(balance),
      "WR5"
    );
    expect(balance).to.equal(expected);
  });
});
