const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contract with address:", deployer.address);

    const Contract = await ethers.getContractFactory("DocumentRegistry");
    const contract = await Contract.deploy();

    console.log("Contract deployed to:", await contract.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
