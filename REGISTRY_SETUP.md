# Registry Setup Guide

## What I Fixed

✅ **Fixed Code Issues:**
- Corrected field name mismatch: `creator` → `creator_wallet`
- Removed references to non-existent `metadata` field
- All TypeScript errors resolved

## What You Need to Do

The Registry contract requires 2 environment variables to function:

### 1. Deploy the Registry Contract (or use existing)

If you haven't deployed the contract yet:
1. Compile: `npx hardhat compile` (in the contracts directory)
2. Deploy to Base or Base Sepolia network
3. Save the deployed contract address

**Or use an existing deployed contract address if you have one**

### 2. Set Environment Variables

You need to add these secrets to your Replit environment:

#### `REGISTRY_CONTRACT_ADDRESS`
- The address of your deployed YoubuidlChannelsRegistry contract
- Example: `0x1234567890abcdef1234567890abcdef12345678`

#### `PLATFORM_PRIVATE_KEY` 
- A wallet private key that will pay for registry transactions
- This wallet must be the **owner** of the registry contract
- Format: `0x...` (starts with 0x)
- **Important**: Fund this wallet with ~0.05 ETH on Base for gas fees

### 3. Test the Registry

Once environment variables are set, test it:

```bash
# Sync unregistered coins to the registry
curl -X POST http://localhost:5000/api/registry/sync

# Check registry stats
curl http://localhost:5000/api/registry/stats
```

## How It Works Now

1. Users create coins → saved to database
2. Coins with status='active' and an address are ready for registry
3. Call `/api/registry/sync` to batch-register them on-chain
4. The registry contract emits events that grant reviewers can verify

## Need Help?

- Check `REGISTRY_DEPLOYMENT_GUIDE.md` for detailed deployment instructions
- The contract is in `contracts/YoubuidlChannelsRegistry.sol`
