#!/usr/bin/env node
/**
 * Daily vault + villa curve snapshot → Telegram (cron-friendly).
 *
 * Cron example (09:00 daily; use your repo path + `which node`):
 *   0 9 * * * cd /path/to/repo && /usr/bin/env node scripts/monitor-tvl.cjs >> /var/log/monitor-tvl.log 2>&1
 *
 * Required env (e.g. from `.env`): TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID,
 * MONITOR_VAULT_ADDRESS, MONITOR_CURVE_ADDRESS.
 * Optional: BASE_RPC_URL (default https://mainnet.base.org), MONITOR_SITE_URL (link in message).
 */

require('dotenv').config();

const { createPublicClient, http, formatUnits } = require('viem');
const { base } = require('viem/chains');

const vaultAbi = [
  {
    name: 'totalAssets',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
];

const curveAbi = [
  {
    name: 'totalSupply',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'marginalPriceMicro',
    type: 'function',
    inputs: [{ name: 'S', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
];

function mustEnv(name) {
  const v = process.env[name];
  if (!v || !String(v).trim()) {
    console.error(`Missing required env: ${name}`);
    process.exit(1);
  }
  return String(v).trim();
}

async function main() {
  const token = mustEnv('TELEGRAM_BOT_TOKEN');
  const chatId = mustEnv('TELEGRAM_CHAT_ID');
  const vault = mustEnv('MONITOR_VAULT_ADDRESS');
  const curve = mustEnv('MONITOR_CURVE_ADDRESS');

  const rpcUrl = process.env.BASE_RPC_URL?.trim() || 'https://mainnet.base.org';
  const siteUrl = process.env.MONITOR_SITE_URL?.trim();

  const client = createPublicClient({
    chain: base,
    transport: http(rpcUrl),
  });

  const total = await client.readContract({
    address: vault,
    abi: vaultAbi,
    functionName: 'totalAssets',
  });

  const supply = await client.readContract({
    address: curve,
    abi: curveAbi,
    functionName: 'totalSupply',
  });

  const marginal = await client.readContract({
    address: curve,
    abi: curveAbi,
    functionName: 'marginalPriceMicro',
    args: [supply],
  });

  const tvlUsdc = formatUnits(total, 6);
  const priceUsdc = formatUnits(marginal, 6);

  const lines = [
    'Onchain Savings Club — daily snapshot',
    '',
    `Vault TVL: $${Number(tvlUsdc).toLocaleString('en-US', { maximumFractionDigits: 2 })} USDC`,
    `Curve marginal: ${Number(priceUsdc).toLocaleString('en-US', { maximumFractionDigits: 6 })} USDC / token`,
    '',
    `Vault ${vault}`,
    `Curve ${curve}`,
  ];
  if (siteUrl) lines.push('', `Open: ${siteUrl}`);

  const text = lines.join('\n');

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
    }),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error('Telegram API error:', res.status, body);
    process.exit(1);
  }
  console.log('Sent OK:', new Date().toISOString());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
