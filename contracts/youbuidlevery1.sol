// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract youbuidlevery1 {
    event PlatformCoinCreated(
        address indexed coin,
        address indexed creator,
        string contentUrl,
        uint256 timestamp,
        bytes32 indexed activityId,
        string coinName,
        string coinSymbol
    );

    event TradingActivityRecorded(
        address indexed coin,
        address indexed trader,
        string activityType,
        uint256 amount,
        uint256 timestamp
    );

    event FeesRecorded(
        address indexed coin,
        address indexed trader,
        uint256 creatorFee,
        uint256 platformFee,
        uint256 timestamp
    );

    event MarketCapUpdated(
        address indexed coin,
        uint256 marketCap,
        uint256 timestamp
    );

    struct CoinActivity {
        address creator;
        address coinAddress;
        string contentUrl;
        string coinName;
        string coinSymbol;
        uint256 timestamp;
        bytes32 activityId;
    }

    struct CoinMetrics {
        uint256 totalCreatorFees;
        uint256 totalPlatformFees;
        uint256 currentMarketCap;
        uint256 totalVolume;
        uint256 tradeCount;
        uint256 lastUpdated;
    }

    address public owner;
    address public platformAddress;
    address public constant ZORA_FACTORY = 0x777777751622c0d3258f214F9DF38E35BF45baF3;

    uint256 public totalCoinsCreated;
    uint256 public totalPlatformFeesEarned;
    uint256 public totalCreatorFeesEarned;
    uint256 public totalTradingVolume;

    CoinActivity[] public activities;
    mapping(address => CoinActivity[]) public creatorActivities;
    mapping(address => bool) public isRegisteredCoin;
    mapping(address => CoinMetrics) public coinMetrics;
    mapping(address => uint256) public creatorTotalFees;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    modifier onlyAuthorized() {
        require(
            msg.sender == platformAddress ||
            msg.sender == owner ||
            msg.sender == ZORA_FACTORY,
            "Not authorized"
        );
        _;
    }

    constructor(address _platformAddress) {
        owner = msg.sender;
        platformAddress = _platformAddress;
    }

    function postDeploy(
        address coin,
        address creator,
        bytes calldata hookData
    ) external returns (bytes memory) {
        require(msg.sender == ZORA_FACTORY, "Only Zora factory can call");

        (string memory contentUrl, string memory coinName, string memory coinSymbol) =
            abi.decode(hookData, (string, string, string));

        bytes32 activityId = _recordCoinCreation(
            coin,
            creator,
            contentUrl,
            coinName,
            coinSymbol,
            block.timestamp
        );

        return abi.encode(activityId);
    }

    function recordCoinCreation(
        address coin,
        address creator,
        string memory contentUrl,
        string memory coinName,
        string memory coinSymbol,
        uint256 createdAtTimestamp
    ) external onlyAuthorized returns (bytes32) {
        return _recordCoinCreation(coin, creator, contentUrl, coinName, coinSymbol, createdAtTimestamp);
    }

    function _recordCoinCreation(
        address coin,
        address creator,
        string memory contentUrl,
        string memory coinName,
        string memory coinSymbol,
        uint256 createdAtTimestamp
    ) internal returns (bytes32) {
        bytes32 activityId = keccak256(
            abi.encodePacked(
                coin,
                creator,
                createdAtTimestamp,
                totalCoinsCreated
            )
        );

        CoinActivity memory activity = CoinActivity({
            creator: creator,
            coinAddress: coin,
            contentUrl: contentUrl,
            coinName: coinName,
            coinSymbol: coinSymbol,
            timestamp: createdAtTimestamp,
            activityId: activityId
        });

        activities.push(activity);
        creatorActivities[creator].push(activity);
        isRegisteredCoin[coin] = true;
        totalCoinsCreated++;

        emit PlatformCoinCreated(
            coin,
            creator,
            contentUrl,
            createdAtTimestamp,
            activityId,
            coinName,
            coinSymbol
        );

        return activityId;
    }

    function recordTradingActivity(
        address coin,
        address trader,
        string memory activityType,
        uint256 amount
    ) external onlyAuthorized {
        require(isRegisteredCoin[coin], "Coin not registered on platform");

        CoinMetrics storage metrics = coinMetrics[coin];
        metrics.totalVolume += amount;
        metrics.tradeCount++;
        metrics.lastUpdated = block.timestamp;

        totalTradingVolume += amount;

        emit TradingActivityRecorded(
            coin,
            trader,
            activityType,
            amount,
            block.timestamp
        );
    }

    function recordFees(
        address coin,
        address trader,
        uint256 creatorFee,
        uint256 platformFee
    ) external onlyAuthorized {
        require(isRegisteredCoin[coin], "Coin not registered on platform");

        CoinMetrics storage metrics = coinMetrics[coin];
        metrics.totalCreatorFees += creatorFee;
        metrics.totalPlatformFees += platformFee;
        metrics.lastUpdated = block.timestamp;

        totalCreatorFeesEarned += creatorFee;
        totalPlatformFeesEarned += platformFee;

        // Track creator's total fees across all their coins
        address creator = getCoinCreator(coin);
        if (creator != address(0)) {
            creatorTotalFees[creator] += creatorFee;
        }

        emit FeesRecorded(
            coin,
            trader,
            creatorFee,
            platformFee,
            block.timestamp
        );
    }

    function updateMarketCap(
        address coin,
        uint256 marketCap
    ) external onlyAuthorized {
        require(isRegisteredCoin[coin], "Coin not registered on platform");

        CoinMetrics storage metrics = coinMetrics[coin];
        metrics.currentMarketCap = marketCap;
        metrics.lastUpdated = block.timestamp;

        emit MarketCapUpdated(
            coin,
            marketCap,
            block.timestamp
        );
    }

    function getCoinCreator(address coin) public view returns (address) {
        for (uint256 i = 0; i < activities.length; i++) {
            if (activities[i].coinAddress == coin) {
                return activities[i].creator;
            }
        }
        return address(0);
    }

    function getCoinMetrics(address coin) external view returns (
        uint256 totalCreatorFees,
        uint256 totalPlatformFees,
        uint256 currentMarketCap,
        uint256 totalVolume,
        uint256 tradeCount,
        uint256 lastUpdated
    ) {
        CoinMetrics memory metrics = coinMetrics[coin];
        return (
            metrics.totalCreatorFees,
            metrics.totalPlatformFees,
            metrics.currentMarketCap,
            metrics.totalVolume,
            metrics.tradeCount,
            metrics.lastUpdated
        );
    }

    function getPlatformStats() external view returns (
        uint256 totalCoins,
        uint256 totalPlatformFees,
        uint256 totalCreatorFees,
        uint256 totalVolume,
        uint256 totalCreators
    ) {
        return (
            totalCoinsCreated,
            totalPlatformFeesEarned,
            totalCreatorFeesEarned,
            totalTradingVolume,
            getUniqueCreatorsCount()
        );
    }

    function getCreatorStats(address creator) external view returns (
        uint256 coinsCreated,
        uint256 totalFeesEarned
    ) {
        return (
            creatorActivities[creator].length,
            creatorTotalFees[creator]
        );
    }

    function getUniqueCreatorsCount() public view returns (uint256) {
        uint256 count = 0;
        address[] memory seenCreators = new address[](totalCoinsCreated);

        for (uint256 i = 0; i < activities.length; i++) {
            address creator = activities[i].creator;
            bool seen = false;

            for (uint256 j = 0; j < count; j++) {
                if (seenCreators[j] == creator) {
                    seen = true;
                    break;
                }
            }

            if (!seen) {
                seenCreators[count] = creator;
                count++;
            }
        }

        return count;
    }

    function getAllActivities() external view returns (CoinActivity[] memory) {
        return activities;
    }

    function getCreatorActivities(address creator) external view returns (CoinActivity[] memory) {
        return creatorActivities[creator];
    }

    function getTotalActivities() external view returns (uint256) {
        return activities.length;
    }

    function getActivity(uint256 index) external view returns (CoinActivity memory) {
        require(index < activities.length, "Index out of bounds");
        return activities[index];
    }

    function updatePlatformAddress(address newPlatformAddress) external onlyOwner {
        platformAddress = newPlatformAddress;
    }

    function isPlatformCoin(address coin) external view returns (bool) {
        return isRegisteredCoin[coin];
    }
}