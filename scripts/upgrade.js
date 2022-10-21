// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers, upgrades } = require("hardhat");

const PROXY_ADDRESS = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';

async function main() {
    const currentImplAddress = await upgrades.erc1967.getImplementationAddress(PROXY_ADDRESS);
    console.log('currentImplAddress', currentImplAddress)
  
 
    const NFTV2 = await ethers.getContractFactory("AppWorksNFTV2");
    console.log("Preparing upgrade...");
    await upgrades.upgradeProxy(PROXY_ADDRESS, NFTV2);

    const upgradeImplAddress = await upgrades.erc1967.getImplementationAddress(PROXY_ADDRESS);
    console.log('upgradeImplAddress', upgradeImplAddress)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
