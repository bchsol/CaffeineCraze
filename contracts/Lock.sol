// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@klaytn/contracts/contracts/utils/math/SafeMath.sol";
import "@klaytn/contracts/contracts/KIP/token/KIP17/utils/KIP17Holder.sol";
import "@klaytn/contracts/contracts/KIP/token/KIP17/extensions/KIP17Enumerable.sol";
import "@klaytn/contracts/contracts/KIP/token/KIP7/KIP7.sol";
import "./ContractAccessControl.sol";

contract Lock is KIP17Holder{
    using SafeMath for uint256;

    uint256 private TREE = 5;
    uint256 private FRUIT = 10;
    uint256 private HARVEST = 20;
    uint256 private ROASTING = 30;

    struct LockupInfo {
        uint256 tokenId;
        Grow grow;
        address owner;
        uint256 waterfrequency; // watering
        uint256 waterLimit;
        uint256 reward;
        bool coupon;
        bool usePesticide;
    }

    struct UserItem {
        uint256 enhancer;
        uint256 fertilizer;
        uint256 sprink;
        uint256 pesticide;
    }

    enum Grow {
        Seed,
        Tree,
        Fruit,
        Harvest,
        Roasting
    }

    mapping(uint256 => LockupInfo) private lockupInfo;
    mapping(address => UserItem) private userItem;

    IKIP17Enumerable public nftContract;
    IKIP7 public rewardToken;
    ContractAccessControl public accessControls;

    constructor(address _nftContract,address _token,ContractAccessControl _accessControls) {
        nftContract = IKIP17Enumerable(_nftContract);
        rewardToken = IKIP7(_token);
        accessControls = _accessControls;
    }

    function lockupNFT(uint256 _tokenId) external {
        LockupInfo memory info = LockupInfo(_tokenId,Grow.Seed,msg.sender,0,3,0,false,false);
        lockupInfo[_tokenId] = info;

        nftContract.safeTransferFrom(msg.sender,address(this),_tokenId);
    }

    function releaseNFT(uint256 _tokenId) external {
        require(lockupInfo[_tokenId].owner == msg.sender, "Your not owner");

        delete lockupInfo[_tokenId];

        nftContract.safeTransferFrom(address(this),msg.sender,_tokenId);
    }

    function watering(uint256 _tokenId) external {
        require(lockupInfo[_tokenId].owner == msg.sender, "Your not owner");
        require(lockupInfo[_tokenId].waterLimit > 0,"watering is 0");
        require(lockupInfo[_tokenId].grow != Grow.Roasting, "already roasting");
        
        lockupInfo[_tokenId].waterfrequency++;
        lockupInfo[_tokenId].waterLimit--;

        updateTokenStatus(_tokenId);
    }

    function rechargeWartering() external {
        require(accessControls.hasAdminRole(msg.sender),"Sender must have permission to admin");
        require(block.timestamp % 1 days == 0,"can only recharge once per day");

        uint256 tokenId;
        for(uint i = 0; i < nftContract.totalSupply(); i++) {
            tokenId = nftContract.tokenByIndex(i);
            if(lockupInfo[tokenId].owner != address(0) && lockupInfo[tokenId].waterLimit < 3) {
                lockupInfo[tokenId].waterLimit = 3;
            }
        }
    }

    //////////////////////// Active Item ///////////////////////////////

    function activeEnhancer(uint256 _tokenId) external {
        require(userItem[msg.sender].enhancer > 0, "Your not enough Enhancer");
        require(lockupInfo[_tokenId].owner == msg.sender, "Your not owner");

        lockupInfo[_tokenId].waterfrequency += 2;
        userItem[msg.sender].enhancer--;

        updateTokenStatus(_tokenId);
    }

    function activeFertilizer(uint256 _tokenId) external {
        require(userItem[msg.sender].fertilizer > 0,"Your not enough Fertilizer");
        require(lockupInfo[_tokenId].owner == msg.sender, "Your not owner");

        lockupInfo[_tokenId].waterfrequency++;
        userItem[msg.sender].fertilizer--;

        updateTokenStatus(_tokenId);
    }

    function activeSprink(uint256 _tokenId) external {
        require(userItem[msg.sender].sprink > 0, "Your not enough Sprink");
        require(lockupInfo[_tokenId].owner == msg.sender, "Your not owner");

        lockupInfo[_tokenId].waterfrequency++;
        userItem[msg.sender].sprink--;

        updateTokenStatus(_tokenId);
    }

    function activePesticide(uint256 _tokenId) external {
        require(userItem[msg.sender].pesticide > 0, "Your not enough Pesticide");
        require(lockupInfo[_tokenId].owner == msg.sender, "Your not owner");

        lockupInfo[_tokenId].usePesticide = true;
        userItem[msg.sender].pesticide--;
    }

    ///////////////////////////////////////////////////////////////////////////

    function updateTokenStatus(uint256 _tokenId) internal {
        if(lockupInfo[_tokenId].waterfrequency >= TREE) {
            lockupInfo[_tokenId].grow = Grow.Tree;
        } else if(lockupInfo[_tokenId].waterfrequency >= FRUIT) {
            lockupInfo[_tokenId].grow = Grow.Fruit;
        } else if(lockupInfo[_tokenId].waterfrequency >= HARVEST) {
            lockupInfo[_tokenId].grow = Grow.Harvest;
        }else if(lockupInfo[_tokenId].waterfrequency >= ROASTING) {
            lockupInfo[_tokenId].grow = Grow.Roasting;
        }
    }

    function reward(uint256 _tokenId) external {
        require(lockupInfo[_tokenId].owner == msg.sender, "Your not owner");
        require(lockupInfo[_tokenId].grow == Grow.Roasting, "not roasting");

        
        rewardCalc(_tokenId);
        rewardToken.transfer(msg.sender,lockupInfo[_tokenId].reward);

        // mint coupon
        if(lockupInfo[_tokenId].coupon == true) {
            
        }
        nftContract.safeTransferFrom(address(this),msg.sender,_tokenId);

        delete lockupInfo[_tokenId];
    }

    function rewardCalc(uint256 _tokenId) internal {
        uint256 couponProbability;
        uint256 itemProbability;

        if(_tokenId <= 10) {    // Speciality
            lockupInfo[_tokenId].reward = 1000;
            couponProbability = 10;
            itemProbability = 40;
        } else if(11 <= _tokenId && _tokenId <= 60) {   // Premium
            lockupInfo[_tokenId].reward = 500;
            couponProbability = 7;
            itemProbability = 30;
        } else if(61 <= _tokenId && _tokenId <= 200) {  // Commodity
            lockupInfo[_tokenId].reward = 300;
            couponProbability = 5;
            itemProbability = 20;
        }else if(201 <= _tokenId && _tokenId <= 1000) { // Low Grade
            lockupInfo[_tokenId].reward = 100;
            couponProbability = 1;
            itemProbability = 10;
        }

        if(lockupInfo[_tokenId].usePesticide) {    // Use Pesticide
            couponProbability += 5;
        }

        issueCoupon(_tokenId,couponProbability);
        issueItem(msg.sender,itemProbability);
    }

    function issueCoupon(uint256 _tokenId, uint256 _probability) internal {
        uint256 rand = uint256(keccak256(abi.encodePacked(block.timestamp,block.prevrandao))) % 100 + 1;

        if(rand <= _probability) {
            lockupInfo[_tokenId].coupon = true;
        }
    }

    function issueItem(address _user, uint256 _probability) internal {
        uint256 rand = uint256(keccak256(abi.encodePacked(block.timestamp,block.prevrandao))) % 100 + 1;
        UserItem storage item = userItem[_user];

        if(rand <= _probability) {
            uint256 itemRand = uint256(keccak256(abi.encodePacked(block.timestamp,block.prevrandao))) % 4 + 1;

            if(itemRand == 1) {
                item.enhancer++;
            } else if (itemRand == 2) {
                item.fertilizer++;
            } else if (itemRand == 3) {
                item.sprink++;
            } else {
                item.pesticide++;
            }
        }
    }

    function getUserTokens(address _user) external view returns (uint256[] memory) {
        uint256 lockupLength = nftContract.balanceOf(address(this));
        uint256 tokenCount = 0;
        

        for(uint256 i; i < lockupLength; i++) {
            uint256 tokenId = nftContract.tokenOfOwnerByIndex(address(this), i);
            if(lockupInfo[tokenId].owner == _user) {
                tokenCount++;
            }
        }

        uint256[] memory userTokens = new uint256[](tokenCount);
        uint256 index = 0;
        
        for(uint256 i; i < lockupLength; i++) {
            uint256 tokenId = nftContract.tokenOfOwnerByIndex(address(this), i);
            if(lockupInfo[tokenId].owner == _user) {
                userTokens[index++] = tokenId;
            }
        }
        return userTokens;
    }

    function getUserItem(address _user) external view returns (UserItem memory) {
        return userItem[_user];
    }

    function getLockupInfo(uint256 _tokenId) external view returns(LockupInfo memory) {
        return lockupInfo[_tokenId];
    }

    /// Owner Function

    function setTREECount(uint256 _count) external {
        require(accessControls.hasAdminRole(msg.sender),"Sender must have permission to admin");
        TREE = _count;
    }

    function setFRUITCount(uint256 _count) external {
        require(accessControls.hasAdminRole(msg.sender),"Sender must have permission to admin");
        FRUIT = _count;
    }
    function setHARVESTCount(uint256 _count) external {
        require(accessControls.hasAdminRole(msg.sender),"Sender must have permission to admin");
        HARVEST = _count;
    }
    function setROASTINGCount(uint256 _count) external {
        require(accessControls.hasAdminRole(msg.sender),"Sender must have permission to admin");
        ROASTING = _count;
    }
}
