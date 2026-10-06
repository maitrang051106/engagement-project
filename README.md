# Engagement Project

Monorepo demo: mot dApp ghi hon uoc len blockchain, co KYC gia lap bang hash anh CCCD, phi he thong, giao dien "Le duong meo" va "Cay tinh yeu".

## 1. Cau truc

```text
engagement-project/
├── contracts/Engagement.sol
├── hardhat/
│   ├── hardhat.config.ts
│   ├── scripts/deploy.ts
│   └── test/Engagement.ts
├── frontend/
│   ├── app/
│   ├── components/
│   └── lib/contract.ts
├── scripts-python/test_engagement.py
├── .env.example
└── pnpm-workspace.yaml
```

## 2. Cai dat

```bash
pnpm install
cp .env.example .env
```

Khong dua `.env` len Git. Private key la mat khau vi cua ban: ai co private key thi co the ky giao dich va chuyen tai san trong vi do.

## 3. Hardhat

Compile:

```bash
pnpm compile
```

Test:

```bash
pnpm test
```

Deploy local:

```bash
pnpm --filter @engagement/hardhat hardhat node
pnpm deploy:local
```

Deploy BSC Testnet:

```bash
pnpm deploy:bsc-testnet
```

Can dien trong `.env`:

```bash
BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.bnbchain.org:8545/
PRIVATE_KEY=0x...
INITIAL_SYSTEM_FEE_WEI=20000000000000000
```

`INITIAL_SYSTEM_FEE_WEI` la phi demo tinh bang wei. Muon gan tuong duong 10 USD, can tinh theo gia BNB tai thoi diem deploy roi cap nhat lai bang `setSystemFeeWei`.

## 4. Faucet BNB Testnet

1. Tao vi MetaMask.
2. Them BSC Testnet:
   - Chain ID: `97`
   - Symbol: `tBNB`
   - RPC: `https://data-seed-prebsc-1-s1.bnbchain.org:8545/`
3. Lay tBNB tu faucet chinh thuc cua BNB Chain.
4. Chi dung private key cua vi testnet. Khong dung vi chua tien that.

## 5. Frontend

Cap nhat `frontend/.env.local`:

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0xDiaChiContractSauKhiDeploy
```

Chay app:

```bash
pnpm dev:frontend
```

Frontend dung Wagmi + Viem de doc `systemFeeWei`, `getAllEngagements` va goi `createEngagement`.

## 6. KYC gia lap

Nguoi dung upload anh CCCD tren trinh duyet. Frontend tinh SHA-256 cua file va chi gui chuoi hash `bytes32` len contract. Anh goc khong duoc luu on-chain.

Dieu nay minh hoa nguyen tac quan trong: blockchain cong khai, nen khong dua CCCD, dia chi nha, so dien thoai, hay du lieu nhay cam len storage.

## 7. Gas va loi hua

`Engagement.sol` luu ten, hash va loi hua vao storage. Chuoi dai hon ton gas hon vi EVM phai ghi nhieu byte hon. Contract gioi han moi loi hua toi da 100 tu de tranh giao dich qua dat va tranh spam.

## 8. TypeChain la gi?

TypeChain tao TypeScript type tu ABI cua contract. Khi project lon hon, TypeChain giup frontend va scripts goi contract dung ten ham, dung kieu tham so, va bat loi som trong luc compile.

Ban co the them TypeChain sau:

```bash
pnpm --filter @engagement/hardhat add -D @nomicfoundation/hardhat-typechain typechain
```

## 9. Script Python Web3.py

```bash
cd scripts-python
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python test_engagement.py
```

Can `.env` co:

```bash
RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=0x...
CONTRACT_ADDRESS=0x...
```

## 10. Cac kieu tan cong Smart Contract

- Reentrancy: contract ben ngoai goi nguoc lai truoc khi state duoc cap nhat. Cach phong thu: cap nhat state truoc khi chuyen tien, hoac dung guard.
- Integer overflow/underflow: so bi tran. Solidity 0.8+ tu revert khi tran so.
- Access control bug: ham quan tri thieu `onlyOwner`, dan den ai cung co the rut tien hoac sua phi.
- Front-running: nguoi khac thay giao dich trong mempool va chen giao dich truoc.
- Oracle manipulation: gia USD/BNB sai neu lay tu nguon khong dang tin.
- DoS by unbounded loops: vong lap qua mang qua lon co the vuot gas limit. `getAllEngagements` phu hop demo, nhung production nen phan trang.

## 11. Luu y bao mat

- Khong commit `.env`.
- Khong chia se private key.
- Dung vi rieng cho testnet.
- Contract demo chua phai san pham production. Phi 10 USD nen duoc tinh qua oracle hoac backend cap nhat dinh ky neu dung that.
