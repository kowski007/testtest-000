import solc from 'solc';
import { createWalletClient, createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  console.log("🚀 Deploying CoinITActivityTracker to Base Mainnet...\n");

  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("DEPLOYER_PRIVATE_KEY environment variable not set");
  }

  const account = privateKeyToAccount(privateKey);
  console.log("📝 Deploying from account:", account.address);

  const publicClient = createPublicClient({
    chain: base,
    transport: http()
  });

  const balance = await publicClient.getBalance({ address: account.address });
  console.log("💰 Account balance:", (Number(balance) / 1e18).toFixed(6), "ETH\n");

  if (Number(balance) < 3e14) {
    throw new Error("Insufficient balance. Need at least 0.0003 ETH for deployment");
  }

  console.log("📦 Compiling contract...");
  const contractPath = join(__dirname, '../contracts/youbuidlevery1.sol');
  const source = readFileSync(contractPath, 'utf8');

  const input = {
    language: 'Solidity',
    sources: {
      'youbuidlevery1.sol': {
        content: source
      }
    },
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode']
        }
      }
    }
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  if (output.errors) {
    const errors = output.errors.filter(e => e.severity === 'error');
    if (errors.length > 0) {
      console.error("❌ Compilation errors:");
      errors.forEach(err => console.error(err.formattedMessage));
      process.exit(1);
    }
  }

  const contract = output.contracts['youbuidlevery1.sol']['youbuidlevery1'];
  const bytecode = `0x${contract.evm.bytecode.object}`;
  const abi = contract.abi;

  console.log("✅ Contract compiled successfully\n");

  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http()
  });

  // Platform address - this will be the backend server that calls the contract
  const platformAddress = account.address;
  console.log("🏢 Platform address:", platformAddress);

  console.log("🔨 Deploying contract to Base Mainnet...");
  console.log("⏳ This may take 30-60 seconds...\n");

  const hash = await walletClient.deployContract({
    abi,
    bytecode,
    account,
    args: [platformAddress]
  });

  console.log("📤 Transaction sent:", hash);
  console.log("⏳ Waiting for confirmation...\n");

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  if (receipt.status === 'success') {
    console.log("✅ Contract deployed successfully!\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📍 Contract Address:", receipt.contractAddress);
    console.log("🔗 View on Basescan:", `https://basescan.org/address/${receipt.contractAddress}`);
    console.log("🔗 Transaction:", `https://basescan.org/tx/${hash}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    console.log("📝 Next steps:");
    console.log("1. Add to Replit Secrets:");
    console.log(`   ACTIVITY_TRACKER_ADDRESS=${receipt.contractAddress}`);
    console.log("\n2. Verify contract on Basescan (optional):");
    console.log(`   npm run verify:tracker ${receipt.contractAddress}`);
    console.log("\n3. Grant judges can now view platform activities on-chain at:");
    console.log(`   https://basescan.org/address/${receipt.contractAddress}#readContract`);
    console.log("\n📊 For grant judges:");
    console.log("   - Call 'getTotalActivities()' to see total coins created");
    console.log("   - Call 'getAllActivities()' to see all platform activity");
    console.log("   - Call 'getActivity(index)' to see specific coin details");
  } else {
    console.error("❌ Deployment failed");
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment error:", error.message);
    process.exit(1);
  });
