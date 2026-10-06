import { network } from "hardhat";

const DEFAULT_SYSTEM_FEE_WEI = 20_000_000_000_000_000n; // 0.02 BNB demo value.

const { ethers } = await network.create();
const [deployer] = await ethers.getSigners();

const configuredFee = process.env.INITIAL_SYSTEM_FEE_WEI;
const initialSystemFeeWei = configuredFee ? BigInt(configuredFee) : DEFAULT_SYSTEM_FEE_WEI;

console.log("Deploying Engagement with account:", deployer.address);
console.log("Initial system fee (wei):", initialSystemFeeWei.toString());

const engagement = await ethers.deployContract("Engagement", [initialSystemFeeWei]);
await engagement.waitForDeployment();

console.log("Engagement deployed to:", await engagement.getAddress());
