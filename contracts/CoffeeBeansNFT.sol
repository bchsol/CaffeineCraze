// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ContractAccessControl.sol";

import "./KIP17R.sol";

contract CoffeeBeansNFT is KIP17r{
    using Strings for uint256;
    string public baseURI;
    string public baseExtension = ".json";
    uint256 public maxMintAmount = 3;
    uint256 public mintPrice = 0;  // Klay
    uint256 public nftPerAddressLimit = 1;
    bool public paused = false;

    bool public revealed = false;
    string public notRevealedUri;

    bool public onlyWhitelisted = false;
    mapping(address=>uint256) public addressMintedBalance;
    mapping(address=>uint) public addressTimedlay;

    ContractAccessControl public accessControls;

    event Klaytn17Burn(address _to, uint256 tokenId);

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _initBaseURI,
        string memory _initNotRevealedUri,
        ContractAccessControl _accessControls
    )   
        KIP17r(_name, _symbol,1000) {
            accessControls = _accessControls;
            setBaseURI(_initBaseURI);
            setNotRevealedURI(_initNotRevealedUri);
            _mintAtIndex(msg.sender,0);     // nft number start from 1

            _mintAtIndex(msg.sender,1);     // test Code
            _mintAtIndex(msg.sender,11);
            _mintAtIndex(msg.sender,61);
            _mintAtIndex(msg.sender,201);
    }

    function mint(address _to, uint256 _mintAmount) public payable {
        require(!paused, "the contract is paused");
        
        require(_mintAmount > 0, "need to mint at least 1");
        require(_mintAmount <= maxMintAmount, "max mint amount per session exceeded");

        if(onlyWhitelisted == true) {
            require(accessControls.hasWhitelistRole(_to),"Sender must have permission to whitelist");
            uint256 ownerMintedCount = addressMintedBalance[msg.sender];
            require(ownerMintedCount + _mintAmount <= nftPerAddressLimit, "max NFT per address exceeded");
        }
        
        require(msg.value >= mintPrice * _mintAmount, "insufficient funds");

        if(addressTimedlay[msg.sender] == 0){
            addressTimedlay[msg.sender] = block.timestamp;
        }else{
            require(block.timestamp >= (addressTimedlay[msg.sender] + 5 seconds), "false");
            addressTimedlay[msg.sender] = block.timestamp;
        }
        
        _mintRandom(_to,_mintAmount);
        addressMintedBalance[msg.sender]++;
    }

    function tokenURI(uint256 tokenId) public view override returns(string memory){
        require(_exists(tokenId), "KIP17 metadata: URI query for nonexistent token");

        if(revealed == false) {
            return notRevealedUri;
        }

        string memory currentBaseURI = baseURI;
        string memory idstr;

        uint256 temp = tokenId;
        idstr = Strings.toString(temp);

        return bytes(currentBaseURI).length > 0 ? string(abi.encodePacked(currentBaseURI, idstr, baseExtension)) : "";
    }


    /// Owner Function
    function setPrice(uint256 _newMintPrice) external {
        require(accessControls.hasAdminRole(_msgSender()),"Sender must have permission to admin");
        mintPrice = _newMintPrice;
    }

    function setmaxMintAmount(uint256 _newmaxMintAmount) external {
        require(accessControls.hasAdminRole(_msgSender()),"Sender must have permission to admin");
        maxMintAmount = _newmaxMintAmount;
    }

    function setWhitelistLimit(uint256 _newLimit) external {
        require(accessControls.hasAdminRole(_msgSender()),"Sender must have permission to admin");
        nftPerAddressLimit = _newLimit;
    }

    function setNotRevealedURI(string memory _notRevealedURI) public {
        require(accessControls.hasAdminRole(_msgSender()),"Sender must have permission to admin");
        notRevealedUri = _notRevealedURI;
    }

    function setBaseURI(string memory _newBaseURI) public {
        require(accessControls.hasAdminRole(_msgSender()),"Sender must have permission to admin");
        baseURI = _newBaseURI;
    }

    function setBaseExtension(string memory _newBaseExtension) public {
        require(accessControls.hasAdminRole(_msgSender()),"Sender must have permission to admin");
        baseExtension = _newBaseExtension;
    }

    function setOnlyWhitelisted(bool _state) external {
        require(accessControls.hasAdminRole(_msgSender()),"Sender must have permission to admin");
        onlyWhitelisted = _state;
    }

    function pause(bool _state) external {
        require(accessControls.hasAdminRole(_msgSender()),"Sender must have permission to admin");
        paused = _state;
    }

    function reveal() external {
        require(accessControls.hasAdminRole(_msgSender()),"Sender must have permission to admin");
        revealed = true;
    }
    
    function withdraw(address payable toAdress) external {
        require(accessControls.hasAdminRole(_msgSender()),"Sender must have permission to admin");
        toAdress.transfer(address(this).balance);
    }
}