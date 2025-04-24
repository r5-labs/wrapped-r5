require("dotenv").config();
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");

module.exports = {
  solidity: "0.8.26",
  networks: {
    mainnet: { url: process.env.MAINNET_RPC_URL, accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [] },
    testnet: { url: process.env.TESTNET_RPC_URL, accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [] }
  },
  etherscan: { apiKey: process.env.ETHERSCAN_API_KEY }
};
