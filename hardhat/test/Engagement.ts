import { expect } from "chai";
import { network } from "hardhat";
import { ethers as ethersLib } from "ethers";

const { ethers } = await network.create();

describe("Engagement", function () {
  const fee = ethersLib.parseEther("0.02");

  async function deployEngagement() {
    const [owner, couple, other] = await ethers.getSigners();
    const engagement = await ethers.deployContract("Engagement", [fee]);
    return { engagement, owner, couple, other };
  }

  it("stores engagement promises and hashed KYC data", async function () {
    const { engagement, couple } = await deployEngagement();
    const husbandHash = ethersLib.keccak256(ethersLib.toUtf8Bytes("husband-id-image"));
    const wifeHash = ethersLib.keccak256(ethersLib.toUtf8Bytes("wife-id-image"));

    const tx = await engagement.connect(couple).createEngagement(
      "Minh",
      "Linh",
      husbandHash,
      wifeHash,
      "I promise to debug with patience.",
      "I promise to write tests with kindness.",
      { value: fee }
    );

    await expect(tx).to.emit(engagement, "EngagementCreated");

    const record = await engagement.getEngagement(0);
    expect(record.creator).to.equal(couple.address);
    expect(record.husbandCccdHash).to.equal(husbandHash);
    expect(record.wifeCccdHash).to.equal(wifeHash);
    expect(await engagement.engagementCount()).to.equal(1n);
  });

  it("requires the configured system fee", async function () {
    const { engagement } = await deployEngagement();
    const hash = ethersLib.keccak256(ethersLib.toUtf8Bytes("id-image"));

    await expect(
      engagement.createEngagement("A", "B", hash, hash, "short", "short", { value: fee - 1n })
    ).to.be.revertedWithCustomError(engagement, "InsufficientFee");
  });

  it("rejects promises longer than 100 words", async function () {
    const { engagement } = await deployEngagement();
    const hash = ethersLib.keccak256(ethersLib.toUtf8Bytes("id-image"));
    const longPromise = Array.from({ length: 101 }, (_, i) => `word${i}`).join(" ");

    await expect(
      engagement.createEngagement("A", "B", hash, hash, longPromise, "short", { value: fee })
    ).to.be.revertedWithCustomError(engagement, "PromiseTooLong");
  });

  it("lets only the owner update fees and withdraw", async function () {
    const { engagement, owner, other } = await deployEngagement();

    await expect(engagement.connect(other).setSystemFeeWei(1n)).to.be.revertedWithCustomError(engagement, "OnlyOwner");
    await expect(engagement.setSystemFeeWei(1n)).to.emit(engagement, "SystemFeeUpdated").withArgs(fee, 1n);

    await expect(engagement.connect(other).withdraw()).to.be.revertedWithCustomError(engagement, "OnlyOwner");
    await expect(engagement.withdraw()).to.emit(engagement, "Withdrawn").withArgs(owner.address, 0n);
  });
});
