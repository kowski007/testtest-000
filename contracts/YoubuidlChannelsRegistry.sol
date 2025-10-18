// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract YoubuidlChannelsRegistry {
    struct CoinRecord {
        address coinAddress;
        address creator;
        bytes32 metadataHash;
        uint256 timestamp;
        bool exists;
    }
    
    address public owner;
    uint256 public totalCoinsRegistered;
    
    mapping(address => CoinRecord) public platformCoins;
    mapping(address => address[]) public creatorCoins;
    mapping(address => uint256) public creatorCoinCount;
    
    event CoinRegistered(
        address indexed coinAddress,
        address indexed creator,
        bytes32 metadataHash,
        uint256 timestamp
    );
    
    event BatchRegistered(
        uint256 count,
        uint256 timestamp
    );
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can register coins");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        totalCoinsRegistered = 0;
    }
    
    function registerCoin(
        address coinAddress,
        address creator,
        bytes32 metadataHash
    ) public onlyOwner {
        require(coinAddress != address(0), "Invalid coin address");
        require(creator != address(0), "Invalid creator address");
        require(!platformCoins[coinAddress].exists, "Coin already registered");
        
        platformCoins[coinAddress] = CoinRecord({
            coinAddress: coinAddress,
            creator: creator,
            metadataHash: metadataHash,
            timestamp: block.timestamp,
            exists: true
        });
        
        creatorCoins[creator].push(coinAddress);
        creatorCoinCount[creator]++;
        totalCoinsRegistered++;
        
        emit CoinRegistered(coinAddress, creator, metadataHash, block.timestamp);
    }
    
    function registerBatch(
        address[] memory coinAddresses,
        address[] memory creators,
        bytes32[] memory metadataHashes
    ) public onlyOwner {
        require(
            coinAddresses.length == creators.length && 
            creators.length == metadataHashes.length,
            "Array length mismatch"
        );
        
        for (uint256 i = 0; i < coinAddresses.length; i++) {
            if (!platformCoins[coinAddresses[i]].exists) {
                platformCoins[coinAddresses[i]] = CoinRecord({
                    coinAddress: coinAddresses[i],
                    creator: creators[i],
                    metadataHash: metadataHashes[i],
                    timestamp: block.timestamp,
                    exists: true
                });
                
                creatorCoins[creators[i]].push(coinAddresses[i]);
                creatorCoinCount[creators[i]]++;
                totalCoinsRegistered++;
                
                emit CoinRegistered(
                    coinAddresses[i],
                    creators[i],
                    metadataHashes[i],
                    block.timestamp
                );
            }
        }
        
        emit BatchRegistered(coinAddresses.length, block.timestamp);
    }
    
    function isPlatformCoin(address coinAddress) public view returns (bool) {
        return platformCoins[coinAddress].exists;
    }
    
    function getCoinRecord(address coinAddress) public view returns (
        address creator,
        bytes32 metadataHash,
        uint256 timestamp,
        bool exists
    ) {
        CoinRecord memory record = platformCoins[coinAddress];
        return (
            record.creator,
            record.metadataHash,
            record.timestamp,
            record.exists
        );
    }
    
    function getCreatorCoins(address creator) public view returns (address[] memory) {
        return creatorCoins[creator];
    }
    
    function getCreatorCoinCount(address creator) public view returns (uint256) {
        return creatorCoinCount[creator];
    }
    
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Invalid new owner");
        owner = newOwner;
    }
}
