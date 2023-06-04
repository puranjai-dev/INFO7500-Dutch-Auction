import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("DutchAuction", function () {
  async function setupDutchAuctionFixture() {
    const reservePrice = 50;
    const auctionDurationBlocks = 100;
    const priceDecrementPerBlock = 2;

    const [owner, bidder] = await ethers.getSigners();
    const DutchAuction = await ethers.getContractFactory("DutchAuction");
    const dutchAuction = await DutchAuction.deploy(reservePrice, auctionDurationBlocks, priceDecrementPerBlock);

    return { dutchAuction, reservePrice, auctionDurationBlocks, priceDecrementPerBlock, owner, bidder };
  }

  describe("Deployment", function () {
    it("should set the correct reservePrice", async function () {
      const { dutchAuction, reservePrice } = await loadFixture(setupDutchAuctionFixture);
      expect(await dutchAuction.reservePrice()).to.equal(reservePrice);
    });

    it("should set the correct auctionDurationBlocks", async function () {
      const { dutchAuction, auctionDurationBlocks } = await loadFixture(setupDutchAuctionFixture);
      expect(await dutchAuction.auctionDurationBlocks()).to.equal(auctionDurationBlocks);
    });

    it("should set the correct initialPrice", async function () {
      const { dutchAuction, reservePrice, priceDecrementPerBlock, auctionDurationBlocks } = await loadFixture(setupDutchAuctionFixture);
      expect(await dutchAuction.initialPrice()).to.equal(reservePrice + (auctionDurationBlocks * priceDecrementPerBlock));
    });
  });

  describe("placeBid", function () {
    it('should reject a bid that is lower than the currentPrice', async function () {
      const { dutchAuction, bidder } = await loadFixture(setupDutchAuctionFixture);
      await time.advanceBlock(10);
      await expect(dutchAuction.connect(bidder).placeBid({value: 220})).to.be.revertedWith("Low bid");
    });

    it('should accept a bid that is higher than the currentPrice', async function () {
        const { dutchAuction, bidder } = await loadFixture(setupDutchAuctionFixture);
        await time.advanceBlock(10);
        const returnedAddress = await dutchAuction.connect(bidder).callStatic.placeBid({value: 230});
        expect(returnedAddress).to.equal(bidder.address);
    });

    it("should revert a bid when the auction is over", async function () {
        const { dutchAuction, bidder } = await loadFixture(setupDutchAuctionFixture);
        await time.advanceBlock(101);
        await expect(dutchAuction.connect(bidder).placeBid({value: 1000})).to.be.revertedWith("Auction is over");
    });

    it("should set the bid at the reservePrice when the auction has passed a certain amount of time", async function () {
      const { dutchAuction, bidder } = await loadFixture(setupDutchAuctionFixture);
      await time.advanceBlock(100);
      expect(await dutchAuction.connect(bidder).callStatic.placeBid({value: 50})).to.equal(bidder.address);
    });
  });
});
