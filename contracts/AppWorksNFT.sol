// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;


import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";
// import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract AppWorksNFT is ERC721Upgradeable, OwnableUpgradeable {
  using StringsUpgradeable for uint256;

  using CountersUpgradeable for CountersUpgradeable.Counter;
  CountersUpgradeable.Counter private _nextTokenId;

  uint256 public price;
  uint256 public constant MAX_SUPPLY = 100;
 
  bool public mintActive;
  bool public earlyMintActive;
  bool public revealed;
  
  string public baseURI;
  string public notRevealedURI; // 盲盒的 URI
  bytes32 public merkleRoot;

  mapping(uint256 => string) private _tokenURIs;
  mapping(address => uint256) public addressMintedBalance;

  function initialize() public initializer {
        __ERC721_init("AppWorks", "AW");
        __Ownable_init();
        price = 0.01 ether;
    }

  
  // Public mint function - week 8
  function mint(uint256 _mintAmount) public payable {
    //Please make sure you check the following things:
    //Current state is available for Public Mint
    //Check how many NFTs are available to be minted
    //Check user has sufficient funds
    
    require(mintActive, "mint is not avilable");
    require(_checkMintLimit(msg.sender, _mintAmount + addressMintedBalance[msg.sender]), "mint amount is over limit");
    require(msg.value >= price * _mintAmount, "insufficient fund");
    require(_mintAmount + totalSupply() <= MAX_SUPPLY, "over maxSupply");

    uint nextTokenId = _nextTokenId.current(); // 用一個 local variable 存，避免一直讀取 state variable 節省 gas
    for(uint i = 0; i < _mintAmount; i++) { 
        _mint(msg.sender, nextTokenId);
        nextTokenId += 1;
    }
    _nextTokenId._value =  nextTokenId;
    addressMintedBalance[msg.sender] += _mintAmount;

  }
  
  // Implement totalSupply() Function to return current total NFT being minted - week 8
  function totalSupply() public view returns(uint) {
    return _nextTokenId.current();
  }

  // Implement withdrawBalance() Function to withdraw funds from the contract - week 8
  function withdrawBalance() external onlyOwner {
    (bool sent, ) = msg.sender.call{value: address(this).balance}("");
    require(sent, "Failed to send Ether");
  }

  // Implement setPrice(price) Function to set the mint price - week 8
  function setPrice(uint _price) external onlyOwner {
    price = _price;
  }
 
  // Implement toggleMint() Function to toggle the public mint available or not - week 8
  function toggleMint() external onlyOwner {
    mintActive = !mintActive;
  }

  // Set mint per user limit to 10 and owner limit to 20 - Week 8
  function _checkMintLimit(address _address, uint _amount) private view returns(bool) {
    uint limit = _address == owner() ? 20 : 10;
    return _amount <= limit;
  }

  // Implement toggleReveal() Function to toggle the blind box is revealed - week 9
  function toggleReveal() external onlyOwner {
    revealed = !revealed;
  }

  // tokenURI 拿到 token 的 metadata URI
  function tokenURI(uint256 tokenId) public view override returns (string memory){
    require(_exists(tokenId), "token not exist");

    if (revealed == false) {
      return notRevealedURI; // 還沒 reveal 盲盒, 回傳一個特定的 URI
    }

    return bytes(_baseURI()).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toString())) : "";
  }


  // Implement setBaseURI(newBaseURI) Function to set BaseURI - week 9
  function setBaseURI(string memory newBaseURI) external onlyOwner {
    baseURI = newBaseURI;
  }

  // Function to return the base URI
  function _baseURI() internal view virtual override returns (string memory) {
    return baseURI;
  }

  // Early mint function for people on the whitelist - week 9
  function earlyMint(bytes32[] calldata _merkleProof, uint256 _mintAmount) public payable {
    //Please make sure you check the following things:
    //Current state is available for Early Mint
    //Check how many NFTs are available to be minted
    //Check user is in the whitelist - use merkle tree to validate
    //Check user has sufficient funds
    require(earlyMintActive, "early mint not start yet");
    require(_checkMintLimit(msg.sender, _mintAmount + addressMintedBalance[msg.sender]), "mint amount is over limit"); // user 最多 10 顆, owner 最多 20 顆
    require(_mintAmount + totalSupply() <= MAX_SUPPLY, "over maxSupply"); // 檢查有沒有超過 max supply
    require(MerkleProof.verify(_merkleProof, merkleRoot, keccak256(abi.encodePacked(msg.sender))), "you are not in whitelist");
    require(msg.value >= price * _mintAmount, "insufficient fund");

    uint nextTokenId = _nextTokenId.current(); // 用一個 local variable 存，避免一直讀取 state variable 節省 gas
    for(uint i = 0; i < _mintAmount; i++) { 
        _mint(msg.sender, nextTokenId);
        nextTokenId += 1;
    }
    _nextTokenId._value =  nextTokenId;
    addressMintedBalance[msg.sender] += _mintAmount;
  }
  
  // Implement toggleEarlyMint() Function to toggle the early mint available or not - week 9
  function toggleEarlyMint() external onlyOwner {
    earlyMintActive = !earlyMintActive;
  }

  // Implement setMerkleRoot(merkleRoot) Function to set new merkle root - week 9
  function setMerkleRoot(bytes32 _newMerkleRoot) external onlyOwner {
    merkleRoot = _newMerkleRoot;
  }

  // Let this contract can be upgradable, using openzepplin proxy library - week 10
  
}