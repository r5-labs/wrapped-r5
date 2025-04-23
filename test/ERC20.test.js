const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ERC20 standard behavior", function () {
  let Token, token;

  beforeEach(async function () {
    Token = await ethers.getContractFactory("WrappedR5");
    token = await Token.deploy();
    await token.deployed();
  });

  it("has correct name, symbol, and decimals", async function () {
    expect(await token.name()).to.equal("Wrapped R5");
    expect(await token.symbol()).to.equal("WR5");
    expect(await token.decimals()).to.equal(18);
  });

  it("starts with zero total supply", async function () {
    expect(await token.totalSupply()).to.equal(0);
  });
});
