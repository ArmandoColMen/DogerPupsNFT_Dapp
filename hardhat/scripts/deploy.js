const hre = require("hardhat");

async function main() {

  const baseUrl = "ipfs://QmdMVVSzy2zALppnMPcDEH9mTwys2zJpJDHdpYqGe3YKdW/";
  const DGITokenAddress = "0x82CE8Ec3D981E275c1B4c2B05eBC0f768F4B0Edc";
  
  const DogerPupsNFT = await hre.ethers.getContractFactory("DogerPupsNFT");
  const DogerPups = await DogerPupsNFT.deploy(baseUrl, DGITokenAddress);

  await DogerPups.deployed();

  console.log(
    `DogerPups NFTs contract deployed to ${DogerPups.address}` 
  ); // 0xA53aCB68b85eBe0a57C8381CE6f9C22B121E332c or 0xc7D26e6b509245676464b332BA6821e91A3Bdd62 - deployed here
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
