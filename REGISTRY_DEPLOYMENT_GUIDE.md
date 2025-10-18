# Platform Coin Registry - Deployment & Usage Guide

## Overview
This registry system provides **onchain verification** for all coins created through your platform. This is essential for grant applications (Optimism, Giveth, Gitcoin) as it creates verifiable, transparent metrics of your platform's activity.

## Why This Matters for Grants
Grant platforms analyze onchain data to:
- ✅ Verify real platform activity (not self-reported)
- ✅ Track growth and adoption metrics
- ✅ Measure creator engagement
- ✅ Prove transparent operations

## Architecture

### Components
1. **Smart Contract** (`contracts/PlatformCoinRegistry.sol`) - Onchain registry
2. **Backend Service** (`server/registry-service.ts`) - Batch registration logic
3. **API Endpoints** (`server/routes.ts`) - Registry management
4. **Database Schema** (`shared/schema.ts`) - Registry tracking fields

### How It Works
```
User Creates Coin → Zora Deployment → Database Record (pending)
                                    ↓
                            Backend Batch Process
                                    ↓
                            Registry Contract Call
                                    ↓
                            Onchain Verification ✅
```

## Deployment Steps

### 1. Deploy the Smart Contract

#### Option A: Using Remix IDE (Recommended)
1. Go to [Remix IDE](https://remix.ethereum.org/)
2. Create new file `PlatformCoinRegistry.sol`
3. Copy contents from `contracts/PlatformCoinRegistry.sol`
4. Compile with Solidity 0.8.20+
5. Deploy to Base Mainnet (chainId: 8453)
6. Save the deployed contract address

#### Option B: Using Hardhat/Foundry
```bash
# Install Hardhat
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Deploy script
npx hardhat run scripts/deploy.js --network base
```

### 2. Configure Environment Variables

Add to your `.env` file:

```bash
# Required for Registry
REGISTRY_CONTRACT_ADDRESS=0x...  # Your deployed contract address
PLATFORM_PRIVATE_KEY=0x...        # Platform wallet private key (for batch registration)

# Existing variables
VITE_ALCHEMY_API_KEY=...
VITE_ZORA_RPC_URL=...
```

**Security Note:** The `PLATFORM_PRIVATE_KEY` should be a dedicated wallet with only enough ETH for gas fees (~0.01 ETH). This wallet will pay for batch registrations.

### 3. Fund the Platform Wallet

Send ~0.01-0.05 ETH to the platform wallet address to cover gas fees for registry transactions.

## Usage

### Manual Registry Sync

Trigger batch registration of all unregistered coins:

```bash
curl -X POST http://localhost:5000/api/registry/sync
```

Response:
```json
{
  "success": true,
  "transactionHash": "0x...",
  "registered": 10
}
```

### View Registry Statistics

```bash
curl http://localhost:5000/api/registry/stats
```

Response:
```json
{
  "totalOnchain": 15,
  "totalInDb": 20,
  "registeredInDb": 15,
  "pendingRegistration": 5
}
```

### Verify Individual Coin

```bash
curl http://localhost:5000/api/registry/verify/0x...
```

Response:
```json
{
  "address": "0x...",
  "isRegistered": true,
  "registryTxHash": "0x...",
  "registeredAt": "2024-10-03T12:00:00Z"
}
```

### Get Creator Metrics

```bash
curl http://localhost:5000/api/registry/creator/0x.../count
```

Response:
```json
{
  "creator": "0x...",
  "onchainCoinCount": 5
}
```

## Automated Batch Registration (Optional)

### Setup Cron Job

Add to your server (Linux/Mac):

```bash
# Edit crontab
crontab -e

# Add line to run every hour
0 * * * * curl -X POST http://localhost:5000/api/registry/sync
```

Or use a service like [cron-job.org](https://cron-job.org) to trigger the endpoint hourly.

## Grant Application Metrics

### What to Include in Grant Applications

1. **Total Platform Activity**
   ```
   GET /api/registry/stats
   → Shows total coins registered onchain
   ```

2. **Creator Engagement**
   ```
   GET /api/creators/top
   → Shows active creators
   
   GET /api/registry/creator/{address}/count
   → Shows verified coins per creator
   ```

3. **Verifiable Links**
   - Contract Address: `0x...` (on Basescan)
   - Example: `https://basescan.org/address/0x...`
   - Show event logs proving registrations

### Grant Platform Verification

Grant reviewers can independently verify:

1. **Read Contract on Basescan**
   - Call `totalCoinsRegistered()` → Total coins
   - Call `isPlatformCoin(address)` → Verify specific coin
   - Call `getCreatorCoinCount(creator)` → Creator activity

2. **View Events**
   - `CoinRegistered` events show all registrations
   - `BatchRegistered` events show batch operations
   - Transparent timestamp data

## Smart Contract Methods

### Public View Methods (No Gas)

```solidity
// Check if coin is registered
isPlatformCoin(address coinAddress) returns (bool)

// Get total registered coins
totalCoinsRegistered() returns (uint256)

// Get creator's coin count
getCreatorCoinCount(address creator) returns (uint256)

// Get coin details
getCoinRecord(address coinAddress) returns (
    address creator,
    bytes32 metadataHash,
    uint256 timestamp,
    bool exists
)
```

### Owner-Only Methods (Requires Gas)

```solidity
// Register single coin (admin only)
registerCoin(
    address coinAddress,
    address creator,
    bytes32 metadataHash
)

// Batch register (admin only)
registerBatch(
    address[] coinAddresses,
    address[] creators,
    bytes32[] metadataHashes
)
```

## Cost Estimation

### Gas Costs (Base Mainnet)
- Single registration: ~100,000 gas (~$0.20-0.50)
- Batch registration (10 coins): ~500,000 gas (~$1-2)
- Contract deployment: ~2,000,000 gas (~$4-8)

### Monthly Operating Costs
- 100 coins/month: ~$10-20 in gas fees
- 1000 coins/month: ~$100-200 in gas fees

**Cost Savings:** Batch registration saves ~50% vs individual registrations

## Troubleshooting

### Registry Sync Fails

**Error:** `Failed to register coins batch`

**Solutions:**
1. Check platform wallet has sufficient ETH
2. Verify `REGISTRY_CONTRACT_ADDRESS` is correct
3. Ensure `PLATFORM_PRIVATE_KEY` is valid
4. Check RPC URL is working

### No Pending Coins to Register

This means all active coins are already registered. This is good!

### Contract Not Found

Make sure:
1. Contract is deployed on the correct network (Base = 8453)
2. `REGISTRY_CONTRACT_ADDRESS` matches deployed address
3. Using correct RPC URL for the network

## Security Best Practices

1. **Private Key Management**
   - Use dedicated wallet for registry operations
   - Keep minimum ETH balance (~0.05 ETH max)
   - Never commit private keys to git
   - Rotate keys if compromised

2. **Access Control**
   - Only platform wallet can register coins
   - Use `transferOwnership()` to change admin if needed

3. **Monitoring**
   - Monitor platform wallet balance
   - Set up alerts for failed transactions
   - Review registry stats regularly

## Next Steps

1. ✅ Deploy smart contract to Base
2. ✅ Configure environment variables
3. ✅ Fund platform wallet
4. ✅ Test manual sync
5. ✅ Set up automated batch registration
6. ✅ Document metrics for grant application

## Support & Resources

- **Block Explorer:** https://basescan.org
- **Base RPC:** https://mainnet.base.org
- **Alchemy Dashboard:** https://dashboard.alchemy.com

## Grant Platforms

Submit to:
- **Optimism RetroPGF:** https://app.optimism.io/retropgf
- **Gitcoin Grants:** https://grants.gitcoin.co
- **Giveth:** https://giveth.io

### Application Tips
- Highlight transparent onchain metrics
- Show creator growth over time
- Demonstrate platform utility
- Link to verifiable contract data
