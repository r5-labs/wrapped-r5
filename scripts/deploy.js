require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const WrappedR5 = await ethers.getContractFactory("WrappedR5");
  const wrapped = await WrappedR5.deploy();
  await wrapped.deployed();

  console.log("WrappedR5 deployed to:", wrapped.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});