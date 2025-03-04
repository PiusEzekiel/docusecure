const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contract with address:", deployer.address);

    const Contract = await ethers.getContractFactory("DocumentRegistry");

    // Get current gas price and set a reasonable gas limit
    const feeData = await ethers.provider.getFeeData();
    const gasLimit = 205694; // Adjust as needed

    const contract = await Contract.deploy({
        gasLimit: gasLimit,
        gasPrice: feeData.gasPrice // Use the current gas price
    });

    console.log("Contract deployed to:", await contract.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});