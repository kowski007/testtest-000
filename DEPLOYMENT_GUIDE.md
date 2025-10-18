# CoinIT Platform - Complete Deployment Guide

## Overview
This guide covers deploying the enhanced CoinIT platform with comprehensive on-chain activity tracking for grant verification.

## Prerequisites

### Required Environment Variables (Replit Secrets)

1. **DEPLOYER_PRIVATE_KEY** (Required for contract deployment)
   - Your wallet private key (with ETH on Base for gas)
   - Format: `0x...`
   - Minimum balance: 0.001 ETH on Base mainnet

2. **BASESCAN_API_KEY** (Optional, for contract verification)
   - Get from: https://basescan.org/myapikey
   - Used for verifying contract source code

3. **VITE_ACTIVITY_TRACKER_ADDRESS** (Required after deployment)
   - The deployed contract address
   - Will be provided after Step 2

4. **Existing Required Secrets**
   - VITE_PINATA_JWT
   - VITE_ALCHEMY_API_KEY
   - VITE_NEXT_PUBLIC_ZORA_API_KEY

## Step-by-Step Deployment

### Step 1: Set Up Deployment Wallet

1. Add your wallet private key to Replit Secrets:
   ```
   DEPLOYER_PRIVATE_KEY=0xyour_private_key_here
   ```

2. Ensure your wallet has ETH on Base:
   - Minimum: 0.001 ETH
   - Recommended: 0.005 ETH (for deployment + verification)

3. (Optional) Add Basescan API key for contract verification:
   ```
   BASESCAN_API_KEY=your_basescan_api_key
   ```

### Step 2: Deploy Activity Tracker Contract

Run the deployment script:
```bash
npm run deploy:tracker
```

The script will:
- Compile the youbuidlevery1 contract
- Deploy it to Base mainnet
- Display the deployed contract address
- Show the transaction hash

**Save the contract address!** You'll need it for the next step.

Example output:
```
✅ Contract deployed successfully!
📝 Contract address: 0x1234567890abcdef...
🔗 Transaction: 0xabcdef1234567890...
```

### Step 3: Configure Contract Address

Add the deployed contract address to Replit Secrets:
```
VITE_ACTIVITY_TRACKER_ADDRESS=0x_your_deployed_contract_address
```

### Step 4: Verify Contract (Optional but Recommended)

Verify the contract on Basescan for transparency:
```bash
npm run verify:tracker <contract_address>
```

This makes the contract source code publicly visible for grant judges.

### Step 5: Deploy to Replit

The application is already configured for deployment:

1. **Build Command**: `npm run build`
2. **Run Command**: `npm run start`
3. **Deployment Type**: Autoscale (pre-configured)

**To Deploy:**
1. Click the **"Deploy"** button in Replit header
2. Select **"Autoscale"** deployment type
3. Click **"Deploy"**
4. Wait for build to complete

Your app will be live at: `https://your-repl-name.replit.app`

### Step 6: Verify On-Chain Tracking

1. Visit your deployed app at `/admin/metrics`
2. Verify the contract status shows "Active"
3. Create a test coin to generate on-chain activity
4. Check Basescan to verify the transaction

**Contract Verification URL:**
```
https://basescan.org/address/<YOUR_CONTRACT_ADDRESS>#readContract
```

## Enhanced Features

### 📊 Comprehensive Metrics Tracked

The youbuidlevery1 contract tracks:

1. **Platform Fees Earned** (20% of all trading fees)
2. **Creator Fees Earned** (distributed to coin creators)
3. **Market Cap** (updated per coin)
4. **Trading Volume** (total platform volume)
5. **Unique Creators** (number of platform creators)
6. **Total Coins Created** (all-time count)

### 🔍 Grant Verification

Grant judges can verify all activity on-chain:

1. **View Contract on Basescan:**
   ```
   https://basescan.org/address/<CONTRACT_ADDRESS>#readContract
   ```

2. **Call Read Functions:**
   - `getPlatformStats()` - Total platform metrics
   - `getCoinMetrics(address)` - Specific coin metrics
   - `getCreatorStats(address)` - Creator-specific stats
   - `getAllActivities()` - All coin creations

3. **View Events:**
   - `PlatformCoinCreated` - Coin deployments
   - `FeesRecorded` - Fee distributions
   - `MarketCapUpdated` - Market cap changes

### 📈 Admin Dashboard

Access comprehensive metrics at: `/admin/metrics`

Displays:
- Total coins created
- Unique creators count
- Platform fees earned (in ETH)
- Creator fees earned (in ETH)
- Total trading volume
- Live blockchain data

## Troubleshooting

### Contract Deployment Issues

**Error: Insufficient balance**
- Ensure wallet has at least 0.001 ETH on Base
- Check balance: https://basescan.org/address/your_wallet

**Error: DEPLOYER_PRIVATE_KEY not set**
- Add private key to Replit Secrets
- Ensure it starts with `0x`

**Error: Compilation failed**
- Ensure solc is installed: `npm list solc`
- Check contract syntax in `contracts/youbuidlevery1.sol`

### Dashboard Issues

**Contract not configured message**
- Ensure `VITE_ACTIVITY_TRACKER_ADDRESS` is set in Secrets
- Restart the application after adding the secret

**Metrics showing zero**
- Contract may not have any activity yet
- Create test coins to generate data
- Verify contract address is correct

**404 errors on metrics endpoints**
- Ensure application is running
- Check server logs for errors
- Verify `/api/blockchain/platform-stats` endpoint exists

### Deployment Issues

**Build fails**
- Run `npm run build` locally first
- Check for TypeScript errors: `npm run check`
- Review build logs in Replit console

**App doesn't start**
- Verify all required secrets are set
- Check start script in package.json
- Review server logs for errors

## For Grant Judges

### Verifying Platform Activity

All platform metrics are permanently on-chain and verifiable:

1. **Access Contract:**
   - Network: Base (8453)
   - Contract: `<VITE_ACTIVITY_TRACKER_ADDRESS>`
   - Explorer: https://basescan.org

2. **Read Platform Stats:**
   ```solidity
   function getPlatformStats() returns (
     uint256 totalCoins,
     uint256 totalPlatformFees,
     uint256 totalCreatorFees,
     uint256 totalVolume,
     uint256 totalCreators
   )
   ```

3. **Verify Individual Coins:**
   ```solidity
   function getCoinMetrics(address coin) returns (
     uint256 totalCreatorFees,
     uint256 totalPlatformFees,
     uint256 currentMarketCap,
     uint256 totalVolume,
     uint256 tradeCount,
     uint256 lastUpdated
   )
   ```

4. **All Data is:**
   - ✅ Permanently on-chain
   - ✅ Publicly verifiable
   - ✅ Timestamped
   - ✅ Immutable

## Support

For issues or questions:
1. Check this guide first
2. Review Replit logs for errors
3. Verify all secrets are configured
4. Check contract on Basescan

## Next Steps

After deployment:
1. ✅ Monitor `/admin/metrics` dashboard
2. ✅ Share contract address with grant judges
3. ✅ Verify on-chain data matches platform activity
4. ✅ Keep wallet funded for on-chain recording

---

**Congratulations!** Your CoinIT platform is now deployed with full on-chain activity tracking for grant verification! 🚀
