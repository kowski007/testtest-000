
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CONTRACT_ADDRESS = '0xa99d508b3d5f9e9bf4b18396250974e684529668';
const BASESCAN_API_KEY = process.env.BASESCAN_API_KEY;

async function verifyContract() {
  console.log("🔍 Verifying contract on Basescan...\n");
  console.log("📍 Contract:", CONTRACT_ADDRESS);

  if (!BASESCAN_API_KEY) {
    throw new Error("BASESCAN_API_KEY environment variable not set");
  }

  const contractPath = join(__dirname, '../contracts/YoubuidlChannelsRegistry.sol');
  const sourceCode = readFileSync(contractPath, 'utf8');

  const queryParams = new URLSearchParams({
    chainid: '8453',
    module: 'contract',
    action: 'verifysourcecode',
    apikey: BASESCAN_API_KEY
  });

  const formData = new URLSearchParams();
  formData.append('contractaddress', CONTRACT_ADDRESS);
  formData.append('sourceCode', sourceCode);
  formData.append('codeformat', 'solidity-single-file');
  formData.append('contractname', 'YoubuidlChannelsRegistry');
  formData.append('compilerversion', 'v0.8.30+commit.73712a01');
  formData.append('optimizationUsed', '1');
  formData.append('runs', '200');
  formData.append('constructorArguements', '');
  formData.append('evmversion', 'cancun');
  formData.append('licenseType', '3'); // MIT License

  console.log("📤 Submitting verification request...\n");

  const response = await fetch(`https://api.etherscan.io/v2/api?${queryParams}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString()
  });

  const result = await response.json();

  if (result.status === '1') {
    const guid = result.result;
    console.log("✅ Verification submitted successfully!");
    console.log("📝 GUID:", guid);
    console.log("\n⏳ Checking verification status in 10 seconds...\n");

    await new Promise(resolve => setTimeout(resolve, 10000));

    const statusParams = new URLSearchParams({
      chainid: '8453',
      apikey: BASESCAN_API_KEY,
      module: 'contract',
      action: 'checkverifystatus',
      guid: guid
    });

    const statusResponse = await fetch(`https://api.etherscan.io/v2/api?${statusParams}`);
    const statusResult = await statusResponse.json();

    if (statusResult.status === '1') {
      console.log("✅ Contract verified successfully!\n");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("🔗 View verified contract:");
      console.log(`   https://basescan.org/address/${CONTRACT_ADDRESS}#code`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    } else {
      console.log("⏳ Verification pending...");
      console.log("   Status:", statusResult.result);
      console.log("\n💡 Check status manually at:");
      console.log(`   https://basescan.org/address/${CONTRACT_ADDRESS}#code`);
    }
  } else {
    console.error("❌ Verification failed:");
    console.error("   Message:", result.message);
    console.error("   Result:", result.result);
    
    if (result.result && result.result.includes("already verified")) {
      console.log("\n✅ Contract is already verified!");
      console.log("🔗 View at: https://basescan.org/address/" + CONTRACT_ADDRESS + "#code");
    }
  }
}

verifyContract()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Verification error:", error.message);
    process.exit(1);
  });
