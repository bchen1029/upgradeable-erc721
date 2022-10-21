// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.

const { ethers } = require("hardhat");

const PROXY_ADDRESS = '0xC3D4b996eE83DCd8c6aB0a9833636938dDE39bE2'

async function main() {
  const NFTV2 = await ethers.getContractFactory("AppWorksNFTV2");
  const nftV2 = NFTV2.attach(PROXY_ADDRESS);

  // upgrade 前會報錯因為 v1 版本還沒有實作這個 function
  const tx = await nftV2.setNotRevealedURI("https://test")
  console.log(tx)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


