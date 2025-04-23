require("dotenv").config();
const { run } = require("hardhat");

async function main() {
  const address = process.argv[2];
  if (!address) throw new Error("Usage: node scripts/verify.js <contractAddress>");

  await run("verify:verify", {
    address,
    constructorArguments: [],
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});