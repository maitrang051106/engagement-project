# Engagement Project Brief

## Muc tieu

Xay dung mot monorepo demo Web3: nguoi dung tao "hon uoc" tren blockchain, upload anh CCCD de frontend bam thanh hash, tra phi he thong bang BNB.

## Tech stack

- Monorepo: `pnpm workspace`
- Smart contract: Solidity, Hardhat 3, TypeScript scripts/tests
- Network muc tieu: localhost Hardhat va BSC Testnet
- Frontend: Next.js App Router, React, TypeScript
- Blockchain UI: Wagmi + Viem
- Styling/animation: Tailwind CSS, Framer Motion, lucide-react
- Visualization: SVG "Cay tinh yeu"
- Script doc lap: Python + Web3.py

## Tinh nang chinh

- Tao hon uoc voi ten chu re, ten co dau, loi hua cua moi nguoi.
- Gioi han moi loi hua toi da 100 tu.
- KYC gia lap: upload anh CCCD tren frontend, bam SHA-256, chi luu `bytes32` hash on-chain.
- Phi he thong: contract yeu cau `msg.value >= systemFeeWei`.
- Owner co the cap nhat phi, transfer ownership va withdraw BNB.
- Frontend co UI "Le duong meo": meo cha xu, meo co dau/chu re, form dang ky, trang thai giao dich.
- "Cay tinh yeu" doc danh sach hon uoc tu contract va ve cac cap bang SVG.

## Cau truc hien tai

```text
engagement-project/
├── contracts/Engagement.sol
├── hardhat/
│   ├── hardhat.config.ts
│   ├── scripts/deploy.ts
│   └── test/Engagement.ts
├── frontend/
│   ├── app/page.tsx
│   ├── app/layout.tsx
│   ├── app/globals.css
│   ├── components/LoveTree.tsx
│   ├── components/Web3Providers.tsx
│   └── lib/contract.ts
├── scripts-python/
│   ├── requirements.txt
│   └── test_engagement.py
├── .env.example
├── README.md
└── PROJECT_BRIEF.md
```

## Trang thai gan nhat

- Da tao monorepo `pnpm-workspace.yaml`.
- Da sua `package.json` root bi loi JSON.
- Da them `Engagement.sol` voi struct, phi he thong, owner withdraw, gioi han 100 tu, hash CCCD.
- Da them Hardhat package, config, deploy script va test.
- Da them Next frontend voi Wagmi/Viem, Tailwind, Framer Motion, SVG le duong va cay tinh yeu.
- Da them script Python Web3.py.
- Da them README giai thich faucet, `.env`, private key, TypeChain, Web3.py va cac kieu tan cong smart contract.
- Da chay `CI=true pnpm install`; lockfile cu bi hong da duoc tao lai.

## Van de can xu ly tiep

- `pnpm compile` dang loi vi Hardhat 3 khong cho source nam ngoai project root `hardhat/`.
  - Huong sua de xuat: chuyen source Solidity vao `hardhat/contracts/Engagement.sol`, hoac dat Hardhat config o root thay vi trong `hardhat/`.
  - Neu muon giu dung layout ban dau `contracts/` o root, can bien root thanh Hardhat project root.
- `pnpm --filter @engagement/frontend build` dang loi vi import `injected` tu `wagmi/connectors` keo them Coinbase/Base connector va thieu optional packages `@x402/*`.
  - Huong sua de xuat: import injected connector tu duong dan nhe hon neu version Wagmi ho tro, hoac them cac dependency `@x402/*`, hoac pin Wagmi/connector version on dinh hon.
- Co can chay lai:
  - `pnpm compile`
  - `pnpm test`
  - `pnpm --filter @engagement/frontend build`

## Lenh hay dung

```bash
pnpm install
pnpm compile
pnpm test
pnpm dev:frontend
pnpm deploy:local
pnpm deploy:bsc-testnet
```

## Bien moi truong

Copy `.env.example` thanh `.env`:

```bash
BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.bnbchain.org:8545/
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_WITH_TESTNET_BNB_ONLY
INITIAL_SYSTEM_FEE_WEI=20000000000000000
NEXT_PUBLIC_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
```

## Ghi chu bao mat

- Khong commit `.env`.
- Khong dua CCCD that len blockchain.
- Chi luu hash anh CCCD, khong luu file anh.
- Dung vi testnet rieng, khong dung private key cua vi co tien that.
- Phi 10 USD trong demo nen quy doi bang BNB tai thoi diem deploy; production nen dung oracle hoac backend cap nhat phi.
