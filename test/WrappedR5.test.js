const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("WrappedR5 functionality", function () {
  let wrapped, owner, addr1, addr2;
  const CAP = ethers.BigNumber.from("66337700").mul(ethers.BigNumber.from(10).pow(18));

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("WrappedR5");
    wrapped = await Factory.deploy();
    await wrapped.deployed();
  });

  it("allows owner to mint up to cap", async function () {
    await wrapped.mint(addr1.address, CAP);
    expect(await wrapped.totalSupply()).to.equal(CAP);
  });

  it("reverts on exceeding cap", async function () {
    await expect(
      wrapped.mint(addr1.address, CAP.add(1))
    ).to.be.revertedWith("WrappedR5: cap exceeded");
  });

  it("allows burning tokens", async function () {
    const amt = ethers.utils.parseEther("100");
    await wrapped.mint(addr1.address, amt);
    await wrapped.connect(addr1).burn(amt);
    expect(await wrapped.totalSupply()).to.equal(0);
  });

  it("supports permit approvals", async function () {
    const amt = ethers.utils.parseEther("10");
    await wrapped.mint(addr1.address, amt);
    const nonce = await wrapped.nonces(addr1.address);
    const deadline = ethers.constants.MaxUint256;
    const domain = {
      name: await wrapped.name(),
      version: "1",
      chainId: (await ethers.provider.getNetwork()).chainId,
      verifyingContract: wrapped.address
    };
    const types = {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" }
      ]
    };
    const value = { owner: addr1.address, spender: addr2.address, value: amt, nonce: nonce.toNumber(), deadline };
    const signature = await addr1._signTypedData(domain, types, value);
    const { v, r, s } = ethers.utils.splitSignature(signature);
    await wrapped.permit(addr1.address, addr2.address, amt, deadline, v, r, s);
    expect(await wrapped.allowance(addr1.address, addr2.address)).to.equal(amt);
  });

  describe("ownership transfer", function () {
    it("starts with correct owner", async function () {
      expect(await wrapped.owner()).to.equal(owner.address);
      expect(await wrapped.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });

    it("only owner can initiate transfer", async function () {
      await expect(
        wrapped.connect(addr1).initiateOwnershipTransfer(addr2.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("sets pending owner correctly and emits event", async function () {
      await expect(wrapped.initiateOwnershipTransfer(addr1.address))
        .to.emit(wrapped, 'OwnershipTransferStarted')
        .withArgs(owner.address, addr1.address);
      expect(await wrapped.pendingOwner()).to.equal(addr1.address);
    });

    it("rejects zero address in initiation", async function () {
      await expect(
        wrapped.initiateOwnershipTransfer(ethers.constants.AddressZero)
      ).to.be.revertedWith("WrappedR5: new owner is zero address");
    });

    it("only pending owner can accept ownership", async function () {
      await wrapped.initiateOwnershipTransfer(addr1.address);
      await expect(
        wrapped.connect(addr2).acceptOwnership()
      ).to.be.revertedWith("WrappedR5: caller is not the pending owner");
    });

    it("allows pending owner to accept and transfer ownership", async function () {
      await wrapped.initiateOwnershipTransfer(addr1.address);
      await expect(wrapped.connect(addr1).acceptOwnership())
        .to.emit(wrapped, 'OwnershipTransferred')
        .withArgs(owner.address, addr1.address);
      expect(await wrapped.owner()).to.equal(addr1.address);
      expect(await wrapped.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });
  });
});
