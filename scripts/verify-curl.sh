#!/bin/bash

CONTRACT_ADDRESS="0xa99d508b3d5f9e9bf4b18396250974e684529668"
API_KEY="${BASESCAN_API_KEY}"

if [ -z "$API_KEY" ]; then
  echo "❌ BASESCAN_API_KEY not set"
  exit 1
fi

echo "🔍 Verifying contract on Basescan..."
echo "📍 Contract: $CONTRACT_ADDRESS"
echo ""

SOURCE_CODE=$(cat contracts/YoubuidlChannelsRegistry.sol)

RESPONSE=$(curl -s -X POST "https://api.basescan.org/api?module=contract&action=verifysourcecode&apikey=$API_KEY" \
  --data-urlencode "chainId=8453" \
  --data-urlencode "codeformat=solidity-single-file" \
  --data-urlencode "sourceCode=$SOURCE_CODE" \
  --data-urlencode "contractaddress=$CONTRACT_ADDRESS" \
  --data-urlencode "contractname=YoubuidlChannelsRegistry" \
  --data-urlencode "compilerversion=v0.8.20+commit.a1b79de6" \
  --data-urlencode "optimizationUsed=1" \
  --data-urlencode "runs=200" \
  --data-urlencode "constructorArguements=" \
  --data-urlencode "evmversion=paris")

echo "📤 Response: $RESPONSE"
echo ""

STATUS=$(echo "$RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
MESSAGE=$(echo "$RESPONSE" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
RESULT=$(echo "$RESPONSE" | grep -o '"result":"[^"]*"' | cut -d'"' -f4)

if [ "$STATUS" = "1" ]; then
  echo "✅ Verification submitted successfully!"
  echo "📝 GUID: $RESULT"
  echo ""
  echo "⏳ Checking verification status in 5 seconds..."
  sleep 5
  
  CHECK_RESPONSE=$(curl -s "https://api.basescan.org/api?module=contract&action=checkverifystatus&guid=$RESULT&apikey=$API_KEY")
  echo ""
  echo "Status check: $CHECK_RESPONSE"
  echo ""
  echo "🔗 View contract at:"
  echo "   https://basescan.org/address/$CONTRACT_ADDRESS#code"
else
  echo "❌ Verification failed"
  echo "   Message: $MESSAGE"
  echo "   Result: $RESULT"
  
  if echo "$RESULT" | grep -q "already verified"; then
    echo ""
    echo "✅ Contract is already verified!"
    echo "🔗 View at: https://basescan.org/address/$CONTRACT_ADDRESS#code"
  fi
fi
