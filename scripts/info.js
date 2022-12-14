// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.

const { ethers } = require("hardhat");

const PROXY_ADDRESS = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'


async function main() {
  const NFT = await ethers.getContractFactory("AppWorksNFT");
  const nft = NFT.attach(PROXY_ADDRESS);

  const owner = await nft.owner()
  console.log('owner:', owner)

  // 拿到 price，如果有正常 initialize 會是 0.01 eth
  const price = await nft.price()
  console.log('price:', price)

  // 拿到 notRevealedURI
  const notRevealedURI = await nft.notRevealedURI()
  notRevealedURI.length === 0 ? console.log('notRevealedURI is empty') : console.log('notRevealedURI:', notRevealedURI)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


