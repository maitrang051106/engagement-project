import json
import os
from pathlib import Path

from dotenv import load_dotenv
from web3 import Web3

ROOT = Path(__file__).resolve().parents[1]
ARTIFACT = ROOT / "hardhat" / "artifacts" / "contracts" / "Engagement.sol" / "Engagement.json"


def main() -> None:
    load_dotenv(ROOT / ".env")

    rpc_url = os.getenv("RPC_URL", "http://127.0.0.1:8545")
    private_key = os.getenv("PRIVATE_KEY")
    contract_address = os.getenv("CONTRACT_ADDRESS")

    if private_key is None or contract_address is None:
        raise SystemExit("Set PRIVATE_KEY and CONTRACT_ADDRESS in .env before running this script.")

    w3 = Web3(Web3.HTTPProvider(rpc_url))
    account = w3.eth.account.from_key(private_key)

    artifact = json.loads(ARTIFACT.read_text())
    contract = w3.eth.contract(address=Web3.to_checksum_address(contract_address), abi=artifact["abi"])

    system_fee = contract.functions.systemFeeWei().call()
    husband_hash = Web3.keccak(text="sample-husband-cccd-image")
    wife_hash = Web3.keccak(text="sample-wife-cccd-image")

    tx = contract.functions.createEngagement(
        "Python Minh",
        "Python Linh",
        husband_hash,
        wife_hash,
        "Promise created from Web3.py.",
        "Another promise created from Web3.py.",
    ).build_transaction(
        {
            "from": account.address,
            "value": system_fee,
            "nonce": w3.eth.get_transaction_count(account.address),
            "gas": 800_000,
            "gasPrice": w3.eth.gas_price,
        }
    )

    signed = account.sign_transaction(tx)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

    print("status:", receipt.status)
    print("tx:", tx_hash.hex())
    print("engagement count:", contract.functions.engagementCount().call())


if __name__ == "__main__":
    main()
