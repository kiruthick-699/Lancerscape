const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying LancerScape contracts...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy MilestoneEscrow
  console.log("📦 Deploying MilestoneEscrow...");
  const MilestoneEscrow = await hre.ethers.getContractFactory("MilestoneEscrow");
  const escrow = await MilestoneEscrow.deploy();
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();
  console.log("✅ MilestoneEscrow deployed to:", escrowAddress);

  // Deploy ProjectFactory
  console.log("\n📦 Deploying ProjectFactory...");
  const ProjectFactory = await hre.ethers.getContractFactory("ProjectFactory");
  const factory = await ProjectFactory.deploy();
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("✅ ProjectFactory deployed to:", factoryAddress);

  // Save addresses to file
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployer: deployer.address,
    contracts: {
      MilestoneEscrow: escrowAddress,
      ProjectFactory: factoryAddress,
    },
    timestamp: new Date().toISOString(),
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const outputPath = path.join(deploymentsDir, `${hre.network.name}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n📝 Deployment info saved to:", outputPath);
  console.log("\n🎉 Deployment complete!");
  console.log("\n📋 Contract Addresses:");
  console.log("   MilestoneEscrow:", escrowAddress);
  console.log("   ProjectFactory:", factoryAddress);
  console.log("\n💡 Next steps:");
  console.log("   1. Copy these addresses to your frontend/.env.local");
  console.log("   2. Update NEXT_PUBLIC_FACTORY_ADDRESS");
  console.log("   3. Start your frontend: cd frontend && npm run dev");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
