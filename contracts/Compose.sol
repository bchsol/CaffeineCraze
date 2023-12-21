// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@klaytn/contracts/contracts/KIP/token/KIP17/extensions/KIP17Enumerable.sol";
import "./CoffeeBeansNFT.sol";


contract Compose {
    CoffeeBeansNFT nftContract;
    constructor(address _nftContract) {
        nftContract = CoffeeBeansNFT(_nftContract);
    }

    function composedNft(uint256[] memory tokenIds) external {
        uint256 numTokens = tokenIds.length;
        require(numTokens <= 5, "maximum is 5");

        uint256 successProb = 0;
        for(uint i = 1; i <= numTokens; i++) {
            successProb += i * 20;
        }

        if(uint256(random(100)) <= successProb) {
            // success
            //nftContract.mint(msg.sender,1);   //_msgSender() == tx.origin

        } else {
            revert("Failed");
        }
        batchBurn(tokenIds);
    }

    function random(uint256 maxValue) internal view returns(uint256) {
        return uint256(keccak256(abi.encodePacked(block.timestamp,msg.sender,block.prevrandao))) % maxValue;
    }

    function batchBurn(uint256[] memory tokenIds) internal{
        uint256 len = tokenIds.length;
        for(uint i = 0; i < len; i++) {
            uint256 tokenId = tokenIds[i];
            nftContract.safeTransferFrom(msg.sender,address(0),tokenId);
        }
    }
}
