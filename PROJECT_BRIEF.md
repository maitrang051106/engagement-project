# Engagement Project Brief

## 1. Tổng quan dự án

Engagement Project là dApp minh họa cách xây dựng một ứng dụng Web3 theo dạng monorepo. Người dùng kết nối ví, tạo một bản ghi “hôn ước” trên blockchain và trả phí bằng BNB. Giao diện có chủ đề lễ đường mèo và hiển thị các cặp đôi qua một cây SVG.

Đây là dự án học tập/demo, chưa phải sản phẩm sẵn sàng cho production. Blockchain công khai: tên, lời hứa và hash được gửi lên contract đều có thể được người khác quan sát. Không sử dụng dữ liệu CCCD thật.

## 2. Công nghệ và thành phần

- **Quản lý monorepo:** pnpm workspace với hai package chính: `@engagement/hardhat` và `@engagement/frontend`.
- **Smart contract:** Solidity `^0.8.28`.
- **Phát triển contract:** Hardhat 3, TypeScript, ethers và Mocha/Chai.
- **Mạng blockchain:** mạng Hardhat local và BSC Testnet (chain ID 97).
- **Frontend:** Next.js App Router, React, TypeScript.
- **Tích hợp ví/blockchain:** Wagmi, Viem và injected wallet connector (ví dụ MetaMask).
- **Giao diện:** Tailwind CSS, Framer Motion, lucide-react và SVG.
- **Client Python tùy chọn:** Python + Web3.py để gửi giao dịch từ script.

Không có backend HTTP/API riêng trong phiên bản hiện tại. Frontend gọi trực tiếp blockchain thông qua RPC; script Web3.py là một client độc lập, không phải server backend.

## 3. Kiến trúc và luồng hoạt động

```text
Người dùng
  └─ Frontend Next.js
       ├─ Wagmi/Viem đọc dữ liệu qua RPC
       └─ Ví injected ký giao dịch
            └─ Hardhat local hoặc BSC Testnet
                 └─ Engagement.sol
                      ├─ Lưu EngagementRecord vào contract storage
                      └─ Phát event vào transaction log

Script Python Web3.py ────────────────┘
```

Luồng tạo hôn ước:

1. Người dùng kết nối ví và nhập tên cùng lời hứa.
2. Frontend đọc ảnh được chọn trong trình duyệt và tính SHA-256; chỉ giá trị hash `bytes32` được gửi, không gửi file ảnh gốc.
3. Frontend đọc `systemFeeWei`, sau đó gửi transaction gọi `createEngagement` cùng số BNB tương ứng.
4. Ví yêu cầu người dùng xác nhận và ký transaction.
5. Contract kiểm tra phí, tên, hash và giới hạn lời hứa; nếu hợp lệ, contract lưu bản ghi và phát `EngagementCreated`.
6. Frontend đọc lại danh sách engagement sau khi gửi giao dịch để cập nhật giao diện.

Event là log phục vụ theo dõi/indexing. Dữ liệu cần contract sử dụng ở các lần gọi sau phải được lưu trong state; không thể dùng event thay cho contract storage.

## 4. Chức năng hiện có

### Smart contract

`hardhat/contracts/Engagement.sol`:

- Lưu danh sách engagement gồm địa chỉ tạo, tên, hash CCCD, lời hứa và timestamp.
- Chỉ nhận tạo engagement khi `msg.value >= systemFeeWei`.
- Giới hạn mỗi lời hứa tối đa 100 từ.
- Có quyền owner để cập nhật phí, chuyển quyền sở hữu và rút BNB.
- Phát các event `EngagementCreated`, `SystemFeeUpdated`, `OwnershipTransferred` và `Withdrawn`.
- Dùng custom errors cho một số điều kiện không hợp lệ.

### Frontend

- Trang chính có giao diện lễ đường mèo và form tạo engagement.
- Kết nối ví injected qua Wagmi.
- Đọc phí hệ thống và danh sách engagement từ contract.
- Tính SHA-256 cho file chọn ở client.
- Gửi giao dịch `createEngagement` qua ví và đọc lại danh sách sau khi gửi.
- Hiển thị các cặp đôi trong component cây SVG `LoveTree`.

Frontend hiện chưa subscribe trực tiếp các event của contract. Giao diện cập nhật danh sách bằng cách gọi lại hàm đọc state sau khi gửi transaction.

### Hardhat và script Python

- Hardhat cấu hình compiler Solidity 0.8.28, mạng mô phỏng và BSC Testnet.
- Deploy script nhận phí ban đầu từ `INITIAL_SYSTEM_FEE_WEI` (hoặc dùng giá trị demo mặc định).
- Bộ test kiểm tra lưu bản ghi/hash, phí bắt buộc, giới hạn số từ và quyền owner.
- Script Python đọc ABI artifact do Hardhat tạo, đọc phí và gửi một engagement mẫu.

## 5. Cấu trúc thư mục hiện tại

```text
engagement-project/
├── hardhat/
│   ├── contracts/
│   │   └── Engagement.sol
│   ├── hardhat.config.ts
│   ├── scripts/
│   │   └── deploy.ts
│   └── test/
│       └── Engagement.ts
├── frontend/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── LoveTree.tsx
│   │   └── Web3Providers.tsx
│   └── lib/
│       └── contract.ts
├── scripts-python/
│   ├── requirements.txt
│   └── test_engagement.py
├── .env.example
├── pnpm-workspace.yaml
├── package.json
├── README.md
└── PROJECT_BRIEF.md
```

## 6. Các thay đổi đã thực hiện và lý do

1. **Đưa Solidity source vào `hardhat/contracts/Engagement.sol`.**  
   Trước đó contract nằm ở `contracts/Engagement.sol` ngoài project root của Hardhat. Hardhat 3 báo `HHE900` vì không cho source nằm ngoài project. Cấu hình source hiện trỏ tới `./contracts`, đúng với project root là thư mục `hardhat/`.

2. **Dùng injected connector từ `@wagmi/core`.**  
   Import `injected` từ `wagmi/connectors` kéo theo connector Coinbase/Base trong dependency tree hiện tại và khiến Next.js build không tìm thấy một số module `@x402/*` không được dự án sử dụng. Frontend hiện import trực tiếp `injected` từ `@wagmi/core`; `@wagmi/core` được khai báo trực tiếp trong dependencies để import không phụ thuộc vào dependency bắc cầu.

3. **Sửa kiểu dữ liệu đầu vào của `LoveTree`.**  
   Component trước đó khai báo mỗi record là tuple, trong khi dữ liệu mà ABI `getAllEngagements` trả về có dạng object với các thuộc tính như `husbandName` và `wifeName`. Component hiện dùng kiểu object tương ứng và hiển thị tên qua các thuộc tính đó.

4. **Đồng bộ tài liệu với cấu trúc thực tế.**  
   README và brief được cập nhật để chỉ contract ở vị trí mới trong `hardhat/contracts/`.

## 7. Trạng thái kiểm tra gần nhất

Đã chạy sau các thay đổi trên:

- `pnpm compile` — thành công, biên dịch Solidity 0.8.28.
- `pnpm test` — thành công, 4/4 bài test Mocha.
- `pnpm --filter @engagement/frontend build` — thành công, compile, kiểm tra kiểu và tạo static pages.
- Artifact contract vẫn được tạo tại `hardhat/artifacts/contracts/Engagement.sol/Engagement.json`, là đường dẫn script Python đang sử dụng.

Các kiểm tra này xác nhận compile, unit test và production build; chưa đồng nghĩa với việc đã triển khai lên BSC Testnet hoặc kiểm thử giao dịch trên testnet.

## 8. Cách chạy dự án

### Cài dependencies và compile/test

```bash
pnpm install
pnpm compile
pnpm test
pnpm --filter @engagement/frontend build
```

### Chạy blockchain local và deploy

Mở terminal thứ nhất:

```bash
pnpm --filter @engagement/hardhat hardhat node
```

Mở terminal thứ hai:

```bash
pnpm deploy:local
```

Sau deploy, đặt địa chỉ contract vào `frontend/.env.local`:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0xDiaChiContract
```

Chạy giao diện:

```bash
pnpm dev:frontend
```

Ví cần kết nối đúng mạng Hardhat local để gọi contract local.

### Cấu hình BSC Testnet

Các biến deploy được đọc bởi Hardhat từ `.env`:

```env
BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.bnbchain.org:8545/
PRIVATE_KEY=0x...
INITIAL_SYSTEM_FEE_WEI=20000000000000000
```

Deploy bằng:

```bash
pnpm deploy:bsc-testnet
```

Sau khi deploy, cấu hình địa chỉ contract vừa tạo ở `frontend/.env.local`. Frontend và ví phải cùng trỏ đến BSC Testnet. Không dùng private key của ví có tài sản thật.

### Chạy script Python tùy chọn

```bash
cd scripts-python
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python test_engagement.py
```

Script đọc `RPC_URL`, `PRIVATE_KEY` và `CONTRACT_ADDRESS` từ `.env` ở thư mục gốc. Với chạy local, RPC mặc định là `http://127.0.0.1:8545`; cần có contract đã deploy và artifact đã compile.

## 9. Cấu hình và giới hạn cần nhớ

- `.env.example` là mẫu cấu hình, không phải file chứa thông tin bí mật thật. Không commit `.env`, private key hoặc seed phrase.
- `NEXT_PUBLIC_CONTRACT_ADDRESS` là biến client-side, nên giá trị này được công khai trong frontend; chỉ đặt địa chỉ contract tại mạng tương ứng.
- Hash không mã hóa hoặc ẩn dữ liệu gốc nếu dữ liệu đầu vào có thể đoán được. Không tải/đưa CCCD thật lên blockchain; dự án chỉ nhằm mô phỏng xử lý hash.
- Hash, tên, lời hứa, event logs và dữ liệu transaction đều công khai trên blockchain.
- Phí mặc định là giá trị demo tính bằng wei/BNB, không tự động tương đương 10 USD. Muốn định giá theo USD cần thiết kế nguồn giá đáng tin cậy và cơ chế cập nhật phù hợp.
- `getAllEngagements` trả toàn bộ danh sách, phù hợp demo quy mô nhỏ; production cần cân nhắc indexing hoặc phân trang.
- `msg.value` lớn hơn phí vẫn được giữ trong contract; hiện chưa có logic hoàn lại phần dư.
- Hardhat unit tests dùng mạng mô phỏng; chúng không thay thế kiểm thử ví, RPC hoặc giao dịch trên BSC Testnet.

## 10. Hướng phát triển tiếp theo

Ưu tiên theo thứ tự:

1. **Kiểm thử luồng local end-to-end:** deploy contract local, kết nối ví Hardhat, tạo engagement và xác nhận cây SVG cập nhật đúng.
2. **Kiểm thử testnet:** deploy bằng ví testnet riêng, cấu hình đúng contract address/network và xác minh receipt/event.
3. **Hoàn thiện đồng bộ dữ liệu frontend:** chờ transaction được mined trước khi báo hoàn tất/refetch; cân nhắc theo dõi `EngagementCreated` để cập nhật đa client.
4. **Tăng độ tin cậy của kiểm thử contract:** kiểm tra event arguments, chuyển ownership, withdraw với số dư thực, địa chỉ owner không hợp lệ, hash/tên rỗng và ranh giới 100/101 từ.
5. **Làm rõ chính sách phí:** quyết định có hoàn lại khoản trả dư hay không; nếu giữ như hiện tại, ghi rõ trong UI/tài liệu.
6. **Tách ABI/type dùng chung:** cân nhắc sinh TypeScript types/ABI từ artifact (ví dụ TypeChain hoặc quy trình codegen) để giảm sai khác giữa contract và frontend.
7. **Chuẩn bị production nếu cần:** rà soát bảo mật độc lập, kiểm soát quyền owner, nguồn giá, indexing/phân trang, giám sát sự kiện và chính sách dữ liệu cá nhân trước khi dùng dữ liệu/người dùng thật.

## 11. Tài liệu liên quan

- `README.md`: hướng dẫn cài đặt, chạy demo, faucet và các lưu ý cơ bản.
- `hardhat/contracts/Engagement.sol`: quy tắc nghiệp vụ on-chain.
- `hardhat/test/Engagement.ts`: unit tests cho contract.
- `frontend/lib/contract.ts`: ABI và địa chỉ contract phía frontend.
- `frontend/components/Web3Providers.tsx`: Wagmi config, chain và RPC.
- `scripts-python/test_engagement.py`: ví dụ gọi contract bằng Web3.py.
