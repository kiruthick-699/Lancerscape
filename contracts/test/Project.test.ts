import { expect } from "chai";
import { ethers } from "hardhat";

describe("Project contract - Milestones & Disputes", function () {
  async function deployFixture() {
    const [client, freelancer, admin, other] = await ethers.getSigners();

    const ProjectFactory = await ethers.getContractFactory("Project");
    const project = await ProjectFactory.deploy(client.address, admin.address);
    await project.waitForDeployment();

    return { project, client, freelancer, admin, other };
  }

  it("1. Creates a milestone", async () => {
    const { project, client } = await deployFixture();
    const amount = ethers.parseEther("1");

    await expect(project.connect(client).createMilestone(amount))
      .to.emit(project, "MilestoneCreated")
      .withArgs(0, amount);

    const m = await project.getMilestone(0);
    expect(m.amount).to.equal(amount);
    expect(m.status).to.equal(0); // Created
  });

  it("2. Funds escrow for milestone", async () => {
    const { project, client } = await deployFixture();
    const amount = ethers.parseEther("1");

    await project.connect(client).createMilestone(amount);

    await expect(project.connect(client).fundMilestone(0, { value: amount }))
      .to.emit(project, "MilestoneFunded")
      .withArgs(0, amount);

    const m = await project.getMilestone(0);
    expect(m.status).to.equal(1); // Funded
  });

  it("3. Submits work by freelancer", async () => {
    const { project, client, freelancer } = await deployFixture();
    const amount = ethers.parseEther("1");

    await project.connect(client).createMilestone(amount);
    await project.connect(client).fundMilestone(0, { value: amount });

    const evidence = "ipfs://cid123";
    await expect(project.connect(freelancer).submitWork(0, evidence))
      .to.emit(project, "WorkSubmitted")
      .withArgs(0, evidence);

    const m = await project.getMilestone(0);
    expect(m.status).to.equal(2); // Submitted
    expect(m.evidenceHash).to.equal(evidence);
  });

  it("4. Approves milestone by client and releases funds", async () => {
    const { project, client, freelancer } = await deployFixture();
    const amount = ethers.parseEther("1");

    await project.connect(client).createMilestone(amount);
    await project.connect(client).fundMilestone(0, { value: amount });
    await project.connect(freelancer).submitWork(0, "ipfs://cid123");

    await expect(project.connect(client).approveMilestone(0))
      .to.emit(project, "MilestoneApproved")
      .withArgs(0);

    const m = await project.getMilestone(0);
    expect(m.status).to.equal(3); // Approved
  });

  it("5. Opens dispute on a submitted milestone", async () => {
    const { project, client, freelancer } = await deployFixture();
    const amount = ethers.parseEther("1");

    await project.connect(client).createMilestone(amount);
    await project.connect(client).fundMilestone(0, { value: amount });
    await project.connect(freelancer).submitWork(0, "ipfs://cid123");

    const reason = "Work quality issues";
    await expect(project.connect(client).openDispute(0, reason))
      .to.emit(project, "DisputeOpened")
      .withArgs(0, client.address, reason);

    const m = await project.getMilestone(0);
    expect(m.status).to.equal(4); // Disputed
  });

  it("6. Resolves dispute by admin: release or refund", async () => {
    const { project, client, freelancer, admin } = await deployFixture();
    const amount = ethers.parseEther("1");

    await project.connect(client).createMilestone(amount);
    await project.connect(client).fundMilestone(0, { value: amount });
    await project.connect(freelancer).submitWork(0, "ipfs://cid123");
    await project.connect(client).openDispute(0, "Quality issues");

    // Decision: award to freelancer (release)
    await expect(project.connect(admin).resolveDispute(0, "freelancer"))
      .to.emit(project, "DisputeResolved")
      .withArgs(0, "freelancer");

    let m = await project.getMilestone(0);
    expect(m.status).to.equal(5); // Resolved

    // Create second milestone to test refund path
    await project.connect(client).createMilestone(amount);
    await project.connect(client).fundMilestone(1, { value: amount });
    await project.connect(freelancer).submitWork(1, "ipfs://cid456");
    await project.connect(client).openDispute(1, "Deadline missed");

    // Decision: award to client (refund)
    await expect(project.connect(admin).resolveDispute(1, "client"))
      .to.emit(project, "DisputeResolved")
      .withArgs(1, "client");

    m = await project.getMilestone(1);
    expect(m.status).to.equal(5); // Resolved
  });
});
