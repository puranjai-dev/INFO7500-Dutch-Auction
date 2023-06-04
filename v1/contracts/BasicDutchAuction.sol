// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract DutchAuction {
    uint public auctionDurationBlocks;
    uint public priceDecrementPerBlock;
    uint public reservePrice;
    uint public initialPrice;
    uint public auctionStartBlock;
    address payable public seller;

    constructor(
        uint256 _reservePrice,
        uint256 _auctionDurationBlocks,
        uint256 _priceDecrementPerBlock
    ) {
        reservePrice = _reservePrice;
        auctionDurationBlocks = _auctionDurationBlocks;
        priceDecrementPerBlock = _priceDecrementPerBlock;
        seller = payable(msg.sender);
        auctionStartBlock = block.number;
        initialPrice = _reservePrice + (_auctionDurationBlocks * _priceDecrementPerBlock);
    }

    function placeBid() public payable returns (address) {
        require(block.number <= auctionStartBlock + auctionDurationBlocks, "Auction is over");
        
        uint currentPrice = initialPrice - ((block.number - auctionStartBlock) * priceDecrementPerBlock);
        require(msg.value >= currentPrice, "Low bid");
        
        seller.transfer(msg.value);
        return msg.sender;
    }
}
