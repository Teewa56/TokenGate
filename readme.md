# TokenGate

**Solana-powered decentralized API gateway. Token-gated access, on-chain billing, permissionless monetization.**

Developers expose APIs securely using Solana for access control. Users purchase NFT keys. Payments settle on-chain. No intermediaries.

---

## Quick Start

### For API Developers

```bash
# 1. Register your API
curl -X POST http://localhost:3001/register \
  -H "Content-Type: application/json" \
  -d '{"name": "MyAPI", "backendUrl": "https://api.example.com", "pricePerCall": "1000"}'

# 2. Get API ID + share with users
# Users mint NFT access key → make requests with signature

# 3. Withdraw earnings
curl -X POST http://localhost:3001/withdraw \
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
✅ **Devnet Ready** - Deploy instantly, zero infrastructure overhead  

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
│  (Seahorse - Devnet)        │
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
├── program/              # Solana Seahorse Smart Contract
│   ├── src/
│   │   ├── api_gateway.py
│   │   ├── state.py
│   │   └── instructions.py
│   └── Cargo.toml
│
├── gateway/              # Express.js API Gateway
│   ├── src/
│   │   ├── index.ts
│   │   ├── middleware/
│   │   ├── services/
│   │   └── routes/
│   └── package.json
│
├── dashboard/            # React Dashboard
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── hooks/
│   └── package.json
│
├── docs/                 # Documentation
│   ├── ARCHITECTURE.md
│   ├── API_REFERENCE.md
│   └── DEPLOYMENT.md
│
└── README.md
```

---

## Installation

### Prerequisites
- Node.js 18+
- Solana CLI (or use Solana Playground for contract)
- Phantom Wallet (devnet funded)

### Smart Contract Deployment

```bash
cd program

# Option 1: Use Solana Playground (recommended for MVP)
# Copy code to playground.solana.com, deploy directly

# Option 2: Local deployment
anchor build
anchor deploy --provider.cluster devnet
```

### Gateway Setup

```bash
cd gateway

npm install
cp .env.example .env

# Update .env with:
# SOLANA_RPC_URL=https://api.devnet.solana.com
# PROGRAM_ID=YOUR_DEPLOYED_PROGRAM_ID

npm run dev
# Gateway running on http://localhost:3001
```

### Dashboard Setup

```bash
cd dashboard

npm install
cp .env.example .env

# Update .env with:
# REACT_APP_GATEWAY_URL=http://localhost:3001
# REACT_APP_PROGRAM_ID=YOUR_DEPLOYED_PROGRAM_ID

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
    pricePerCall: 5000 // 5000 lamports per request
  })
});
```

### 2. User Purchases Access

- User connects Phantom wallet to dashboard
- Clicks "Buy API Access"
- Mints NFT key (payment sent to developer)
- Receives API key

### 3. User Makes Request

```bash
curl -X GET http://localhost:3001/api/weather-api/forecast \
  -H "X-Wallet: 9B5X1WNY8R2qK7ZmP3vJ5tQ6hL8nF4dE2bC9aG1sH" \
  -H "X-Signature: $(solana-keygen sign-message 'request-123' --signer ~/.config/solana/id.json)"

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
# Contract tests
cd program
anchor test

# Gateway tests
cd gateway
npm test

# E2E tests
npm run test:e2e
```

### Local Devnet

```bash
# Option 1: Use Solana Playground (recommended)
# No local setup needed

# Option 2: Run local validator
solana-test-validator
```

---

## Deployment

### Mainnet Deployment
See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for production setup.

**Quick deployment for hackathon:**
- Smart Contract: Already on Devnet via Solana Playground
- Gateway: Deploy to Vercel/Railway (1-click)
- Dashboard: Deploy to Vercel

---

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Smart Contract | Seahorse (Python → Solana) |
| Gateway | Node.js + Express.js + TypeScript |
| Frontend | React + Next.js |
| RPC | Solana Devnet |
| Rate Limiter | express-rate-limit |
| Wallet | @solana/wallet-adapter-react |
| Styling | Tailwind CSS |

---

## Roadmap

**MVP (v0.1)** - ✅ Complete
- Basic API registration
- NFT-gated access
- Simple rate limiting
- Devnet deployment

**v0.2 - Post Hackathon**
- Multi-tier pricing
- Advanced analytics
- Custom rate limit policies
- Mainnet support

**v1.0**
- Revenue sharing
- Governance token
- DAO treasury
- Custom domains for gateways

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

---

## Built for Solana Cypherpunk Hackathon 2025

**Deadline:** October 30, 2025

**Links:**
- [Solana Playground](https://playground.solana.com)
- [Seahorse Docs](https://seahorse.dev)
- [Solana Docs](https://docs.solana.com)

---

**Made with ❤️ for decentralized APIs**