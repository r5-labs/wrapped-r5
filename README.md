# Wrapped R5 (WR5)

A capped ERC20 wrapper for the native R5 coin, with burn and EIP‑2612 permit support.

## Setup

1. `git clone` this repo
2. `npm install`
3. Copy `config/.env.example` → `.env` and fill in your keys

## Testing

```bash
npx hardhat test
```

## Deployment

```bash
npx hardhat run scripts/deploy.js --network <mainnet|testnet>
```

## Verification

```bash
npx hardhat run scripts/verify.js  --network <mainnet|testnet>
```
