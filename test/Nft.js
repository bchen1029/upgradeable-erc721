const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFT", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner] = await ethers.getSigners();

    const Nft = await ethers.getContractFactory("AppWorksNFT");
    const nftInstance = await Nft.deploy();

    return { nftInstance, owner };
  }

  describe("Check Owner", function () {
    it("Should owner equal to the first account", async function () {
      const { nftInstance, owner } = await loadFixture(deployFixture);

      expect(await nftInstance.owner()).to.equal(owner.address);
    });
  });

  describe("Check Token Price", function () {
    it("Should price equal to 0.01 eth", async function () {
      const { nftInstance } = await loadFixture(deployFixture);

      const price = ethers.utils.parseEther("0.01");

      expect(await nftInstance.price()).to.equal(price);
    });
  });
});
