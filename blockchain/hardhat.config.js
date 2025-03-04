require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("hardhat-deploy");


module.exports = {
  solidity: "0.8.28",
  networks: {
    // mainnet: {
    //   url: process.env.MAINNET_RPC_URL, // Load from .env
    //   accounts: [process.env.PRIVATE_KEY],
    // }
    goerli: {
      url: process.env.ALCHEMY_API_URL,  // Replace with Alchemy or Infura API URL
      accounts: [process.env.PRIVATE_KEY] // Replace with your MetaMask private key
    }
  },
  paths: {
    sources: "./contracts",   // Folder where Solidity contracts are stored
    // tests: "./test",          // Folder for test scripts
    cache: "./cache",         // Folder for cached build files
    artifacts: "./artifacts"  // Folder for compiled contract artifacts
  }
};
