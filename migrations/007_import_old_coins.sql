
-- Import old coins data with column mapping
-- Transform old column names to new schema

INSERT INTO coins (
  id, 
  name, 
  symbol, 
  address, 
  creator_wallet, 
  status,
  ipfs_uri,
  image,
  description,
  created_at,
  registry_tx_hash
)
SELECT 
  id,
  COALESCE(name, token_name) as name,
  COALESCE(symbol, token_symbol) as symbol,
  coin_address as address,
  creator_wallet,
  'active' as status,
  ipfs_uri,
  COALESCE(
    (metadata::json->>'image'),
    gateway_url
  ) as image,
  COALESCE(
    (metadata::json->>'description'),
    (metadata::json->>'title')
  ) as description,
  created_at,
  transaction_hash as registry_tx_hash
FROM (VALUES
  ('085bbf2d-ea9a-4311-a93c-81efe81c4e03', NULL, '0xd4eC4b5D04EB1cc6344f25611542E540Da3AcBF7', NULL, NULL, NULL, '0xf25af781c4F1Df40Ac1D06e6B80c17815AD311F7', '0xf32a87327eb785d7c62bccc72e04099c36f6d9ac6795671edd44694f155b3be1', '2025-09-25 00:03:55.594818', '2025-09-25 00:03:55.594818', 'https://yellow-patient-cheetah-559.mypinata.cloud/ipfs/bafkreihrnjn4hj6wozky2ss357ma7ewasghxjovzpyykagy5c5qqkt5x3i', 'bafkreihrnjn4hj6wozky2ss357ma7ewasghxjovzpyykagy5c5qqkt5x3i', 'ipfs://bafkreihrnjn4hj6wozky2ss357ma7ewasghxjovzpyykagy5c5qqkt5x3i', '{"tags":[],"type":"image","image":"https://zora.co/api/og-image/coin/base:0xde7c9a53edd5ef151210aa7c1da9dc80068547ab","title":"Test this test that","author":"","content":"","description":"A coin representing the blog post: Why Every Senior Developer I Know Is Planning Their Exit | by Harishsingh | Sep, 2025 | Medium","originalUrl":"https://zora.co/coin/base:0xde7c9a53edd5ef151210aa7c1da9dc80068547ab","publishDate":""}', 'Test this test that', 'TESTTHIS'),
  ('5802d950-d913-4fc2-b4ef-5d4c2f1db213', NULL, '0x509059DBB581927C8641673126eBACD46AC359Ca', NULL, NULL, NULL, '0xf25af781c4F1Df40Ac1D06e6B80c17815AD311F7', '0xa0a1215e52ede64b456c92987c4ce6547ba53e309ae80ec064b1e06865f9f6ca', '2025-09-25 16:07:43.724032', '2025-09-25 16:07:43.724032', NULL, NULL, NULL, '{}', 'Test Coin 2', 'TEST2')
) AS old_data(
  id, blog_post_id, coin_address, coin_id, token_name, token_symbol, 
  creator_wallet, transaction_hash, created_at, updated_at, 
  gateway_url, ipfs_hash, ipfs_uri, metadata, name, symbol
)
ON CONFLICT (id) DO UPDATE SET
  address = EXCLUDED.address,
  registry_tx_hash = EXCLUDED.registry_tx_hash,
  status = 'active';

-- Verify import
SELECT COUNT(*) as imported_coins FROM coins WHERE status = 'active';
