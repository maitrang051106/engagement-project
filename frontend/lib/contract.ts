import type { Abi } from "viem";

export const engagementAddress = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ??
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

export const engagementAbi = [
  {
    type: "function",
    name: "systemFeeWei",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }]
  },
  {
    type: "function",
    name: "createEngagement",
    stateMutability: "payable",
    inputs: [
      { name: "husbandName", type: "string" },
      { name: "wifeName", type: "string" },
      { name: "husbandCccdHash", type: "bytes32" },
      { name: "wifeCccdHash", type: "bytes32" },
      { name: "husbandPromise", type: "string" },
      { name: "wifePromise", type: "string" }
    ],
    outputs: [{ type: "uint256" }]
  },
  {
    type: "function",
    name: "getAllEngagements",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        type: "tuple[]",
        components: [
          { name: "creator", type: "address" },
          { name: "husbandName", type: "string" },
          { name: "wifeName", type: "string" },
          { name: "husbandCccdHash", type: "bytes32" },
          { name: "wifeCccdHash", type: "bytes32" },
          { name: "husbandPromise", type: "string" },
          { name: "wifePromise", type: "string" },
          { name: "timestamp", type: "uint256" }
        ]
      }
    ]
  }
] as const satisfies Abi;
