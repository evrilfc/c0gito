import { expect } from "chai"
import hre from "hardhat"
import type { TrustedRelayerIsm, MockMailbox } from "../typechain-types"

const { ethers } = hre

describe("TrustedRelayerIsm", () => {
  async function deployFixture() {
    const [deployer, relayer, other] = await ethers.getSigners()

    const Mailbox = await ethers.getContractFactory("MockMailbox")
    const mailbox = (await Mailbox.deploy()) as MockMailbox

    const Ism = await ethers.getContractFactory("TrustedRelayerIsm")
    const ism = (await Ism.deploy(
      await mailbox.getAddress(),
      await relayer.getAddress(),
    )) as TrustedRelayerIsm

    return { deployer, relayer, other, mailbox, ism }
  }

  it("reverts on zero relayer", async () => {
    const Mailbox = await ethers.getContractFactory("MockMailbox")
    const mailbox = (await Mailbox.deploy()) as MockMailbox
    const Ism = await ethers.getContractFactory("TrustedRelayerIsm")

    await expect(
      Ism.deploy(await mailbox.getAddress(), ethers.ZeroAddress),
    ).to.be.revertedWith("TrustedRelayerIsm: invalid relayer")
  })

  it("verifies only messages processed by trusted relayer", async () => {
    const { ism, mailbox, relayer, other } = await deployFixture()

    // Set mailbox processor address to trusted relayer
    await (mailbox as any).setProcessorAddress(await relayer.getAddress())

    const dummyMessage = ethers.randomBytes(32)
    const ok = await ism.verify("0x", dummyMessage)
    expect(ok).to.equal(true)

    // Now change processor to someone else, verify should be false
    await (mailbox as any).setProcessorAddress(await other.getAddress())
    const notOk = await ism.verify("0x", dummyMessage)
    expect(notOk).to.equal(false)
  })
})

