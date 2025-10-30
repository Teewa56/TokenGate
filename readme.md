# TokenGate

**Solana-powered decentralized API gateway. Token-gated access, on-chain billing, permissionless monetization.**

Developers expose APIs securely using Solana for access control. Users purchase NFT keys. Payments settle on-chain. No intermediaries.

---

## Quick Start

### For API Developers

```bash
# 1. Register your API via dashboard
curl -X POST http://localhost:3001/api/register \
  -H "Content-Type: application/json" \
  -d '{"name": "MyAPI", "backendUrl": "https://api.example.com", "pricePerCall": "1000"}'

# 2. Get API ID + share with users
# Users mint NFT access key → make requests with signature

# 3. Withdraw earnings
curl -X POST http://localhost:3001/api/withdraw \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### For API Users

```bash
# 1. Purchase API access (mint NFT key in dashboard)
# 2. Make authenticated request
curl -X GET http://localhost:3001/api/YOUR_API_ID/data \
  -H "X-Wallet: YOUR_SOLANA_ADDRESS" \
  -H "X-Signature: YOUR_MESSAGE_SIGNATURE"

# Response: 200 OK (if you own access NFT)
```

---

## Features

✅ **On-Chain Access Control** - NFT ownership verified before each request  
✅ **Transparent Billing** - Usage logged to Solana, immutable records  
✅ **Zero Intermediaries** - Payments go directly to developer wallets  
✅ **Rate Limiting** - Per-key request quotas enforced  
✅ **Developer Dashboard** - Register APIs, manage keys, view analytics  
✅ **Devnet Ready** - Deployed via Solana Playground, zero setup  

---

## Smart Contract (Deployed on Devnet)

**Program ID:** `HRhuJDBenXrraLRfEQpFxNKkMBDbBXmjfKguyFGsxrAL`

Built with **Anchor Rust** on **Solana Playground**.

### Contract Functions

- `register_api` - Developer registers new API
- `purchase_access` - User buys API access key (transfers SOL)
- `log_usage` - Gateway logs API usage
- `withdraw_earnings` - Developer withdraws accumulated fees
- `revoke_access` - Developer revokes user access
- `pause_api` - Developer pauses API
- `unpause_api` - Developer unpauses API

### IDL Available

IDL generated at deployment. Use with `@coral-xyz/anchor` for TypeScript clients.

---

## Architecture

```
┌─────────────────┐
│  API Developer  │
│   (Dashboard)   │
└────────┬────────┘
         │ Register API
         ▼
┌─────────────────────────────┐
│  Solana Smart Contract      │
│  (Anchor - Devnet)          │
│  Program: N9kP3yt3...       │
└─────────────────────────────┘
         ▲
         │ Verify NFT Ownership
         │ Log Usage
         │
┌────────┴────────┐
│  TokenGate API  │
│   Gateway       │
└────────┬────────┘
         │ Forward Request
         ▼
┌─────────────────┐
│  Backend API    │
│  (User's Service)
└─────────────────┘

┌─────────────────┐
│  API User       │
│  (Phantom)      │
└─────────────────┘
         │ Buy Access + Sign Request
         ▼
      Gateway
```

---

## Repository Structure

```
tokengate/
├── program/                  # Anchor Rust Smart Contract
│   ├── programs/
│   │   └── tokengate/
│   │       ├── src/
│   │       │   ├── lib.rs
│   │       │   ├── instructions/
│   │       │   │   ├── mod.rs
│   │       │   │   ├── register_api.rs
│   │       │   │   ├── purchase_access.rs
│   │       │   │   ├── log_usage.rs
│   │       │   │   ├── withdraw_earnings.rs
│   │       │   │   ├── revoke_access.rs
│   │       │   │   ├── pause_api.rs
│   │       │   │   └── unpause_api.rs
│   │       └── src/state/
│   │           ├── mod.rs
│   │           ├── api_registry.rs
│   │           ├── access_key.rs
│   │           └── usage_log.rs
│   ├── tests/
│   └── Anchor.toml
│
├── gateway/                  # Express.js API Gateway
│   ├── src/
│   │   ├── index.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   └── rateLimiter.ts
│   │   ├── services/
│   │   │   ├── solana.ts
│   │   │   └── logger.ts
│   │   ├── routes/
│   │   │   ├── api.ts
│   │   │   └── health.ts
│   │   └── config.ts
│   └── package.json
│
├── dashboard/                # React Dashboard
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── hooks/
│   └── package.json
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API_REFERENCE.md
│   └── DEPLOYMENT.md
│
└── README.md
```

---

## Setup & Deployment

### Smart Contract (Already Deployed)

Contract deployed on **Solana Devnet** via Solana Playground.

- **Program ID:** `N9kP3yt3rd1oc83rRsgtwXsJqyUHZz7ZK9SWawQtP5y`
- **RPC:** https://api.devnet.solana.com
- **Built with:** Anchor Rust

To redeploy locally:
```bash
cd program
anchor build
anchor deploy --provider.cluster devnet
```

### Gateway Setup

```bash
cd gateway

npm install
cp .env.example .env

# Update .env with:
SOLANA_RPC_URL=https://api.devnet.solana.com
PROGRAM_ID=N9kP3yt3rd1oc83rRsgtwXsJqyUHZz7ZK9SWawQtP5y

npm run dev
# Gateway running on http://localhost:3001
```

### Dashboard Setup

```bash
cd dashboard

npm install
cp .env.example .env

# Update .env with:
REACT_APP_GATEWAY_URL=http://localhost:3001
REACT_APP_PROGRAM_ID=N9kP3yt3rd1oc83rRsgtwXsJqyUHZz7ZK9SWawQtP5y

npm run dev
# Dashboard running on http://localhost:3000
```

---

## API Endpoints

### Developer Endpoints

**Register API**
```
POST /api/register
Authorization: Bearer <wallet_signature>

{
  "name": "MyAPI",
  "backendUrl": "https://api.example.com",
  "rateLimit": 100,
  "pricePerCall": 1000
}

Response: { apiId, apiKey, nftMint }
```

**Get API Stats**
```
GET /api/stats/:apiId
Authorization: Bearer <wallet_signature>

Response: { totalCalls, totalEarnings, activeKeys }
```

**Withdraw Earnings**
```
POST /api/withdraw/:apiId
Authorization: Bearer <wallet_signature>

Response: { txId, amountTransferred }
```

### User Endpoints

**Forward Request**
```
GET/POST /api/:apiId/*
X-Wallet: <solana_address>
X-Signature: <message_signature>

Proxies to backend API if:
- Wallet owns access NFT
- Rate limit not exceeded
```

**Check Access**
```
GET /api/access/:apiId
X-Wallet: <solana_address>

Response: { hasAccess, rateLimitRemaining, expiresAt }
```

Full API reference: [API_REFERENCE.md](docs/API_REFERENCE.md)

---

## Usage Example

### 1. Developer Registers API

```typescript
// Dashboard UI
const response = await fetch('http://localhost:3001/api/register', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${walletSignature}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Weather API',
    backendUrl: 'https://weather-api.example.com',
    rateLimit: 100,
    pricePerCall: 5000
  })
});
```

### 2. User Purchases Access

- User connects Phantom wallet to dashboard
- Clicks "Buy API Access"
- Signs transaction (mints access key, transfers SOL to developer)
- Receives API key

### 3. User Makes Request

```bash
curl -X GET http://localhost:3001/api/weather-api/forecast \
  -H "X-Wallet: 9B5X1WNY8R2qK7ZmP3vJ5tQ6hL8nF4dE2bC9aG1sH" \
  -H "X-Signature: YOUR_MESSAGE_SIGNATURE"

# Gateway:
# 1. Verifies signature
# 2. Checks if wallet owns access NFT (on-chain)
# 3. Applies rate limit
# 4. Forwards to https://weather-api.example.com/forecast
# 5. Logs usage to Solana
# 6. Returns response
```

---

## Development

### Running Tests

```bash
# Smart Contract Tests
cd program
anchor test

# Gateway Tests
cd gateway
npm test

# E2E Tests
npm run test:e2e
```

### Local Testing

1. Use Devnet (no local validator needed)
2. Fund test wallets with Devnet SOL: `solana airdrop 2 YOUR_ADDRESS --url devnet`
3. Use Phantom wallet connected to Devnet

---

## Deployment

### Current Status

- ✅ Smart Contract: Deployed on Devnet
- ⏳ Gateway: Ready for deployment to Vercel/Railway
- ⏳ Dashboard: Ready for deployment to Vercel

---

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Smart Contract | Anchor Rust |
| Contract Deployment | Solana Playground + Devnet |
| Gateway | Node.js + Express.js + TypeScript |
| Frontend | React + Next.js |
| RPC | Solana Devnet |
| Rate Limiter | express-rate-limit |
| Wallet | @solana/wallet-adapter-react |
| Styling | Tailwind CSS |

---

## Contributing

Contributions welcome! Please:

1. Fork the repo
2. Create feature branch (`git checkout -b feature/your-feature`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/your-feature`)
5. Open Pull Request

---

## License

MIT License - See [LICENSE](LICENSE) file for details

---

## Support

**Issues?** Open a GitHub issue with:
- Error message/logs
- Steps to reproduce
- Environment (OS, Node version, etc.)

**Questions?** Check [docs/](docs/) or ask in repo discussions.

---

## Built for Solana Cypherpunk Hackathon 2025

**Deadline:** October 30, 2025

**Links:**
- [Solana Playground](https://playground.solana.com)
- [Anchor Docs](https://book.anchor-lang.com)
- [Solana Docs](https://docs.solana.com)

---

**Made with ❤️ for decentralized APIs**