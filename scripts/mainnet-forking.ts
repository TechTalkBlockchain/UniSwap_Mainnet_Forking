import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-network-helpers");

// Main function for performing a token swap
const main = async () => {
  // Define the USDC and DAI token contract addresses on the Ethereum mainnet
  const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  const DAIAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

  // Define the Uniswap V2 Router contract address on the Ethereum mainnet
  const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

  // Address of a USDC holder on mainnet (used for impersonation to interact with mainnet funds)
  const USDCHolder = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

  // Impersonate the USDC holder using Hardhat's mainnet forking feature
  await helpers.impersonateAccount(USDCHolder);
  const impersonatedSigner = await ethers.getSigner(USDCHolder);

  // Define the amount of tokens to swap
  const amountOut = ethers.parseUnits("2000", 6); // 2000 USDC (6 decimals)
  const amountIn = ethers.parseUnits("1980", 18); // 1980 DAI (18 decimals)

  // Get the USDC and DAI contract instances
  const USDC = await ethers.getContractAt(
    "IERC20",
    USDCAddress,
    impersonatedSigner
  );
  const DAI = await ethers.getContractAt("IERC20", DAIAddress);

  // Get the Uniswap V2 Router contract instance
  const ROUTER = await ethers.getContractAt(
    "IUniswapV2Router02",
    UNIRouter,
    impersonatedSigner
  );

  // Approve the Uniswap router to spend the user's USDC tokens
  await USDC.approve(UNIRouter, amountOut);

  // Fetch the current USDC and DAI balances of the impersonated signer
  const usdcBal = await USDC.balanceOf(impersonatedSigner.address);
  const daiBal = await DAI.balanceOf(impersonatedSigner.address);

  // Set a deadline for the swap (current time + 10 minutes)
  const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

  // Log balances before the token swap
  console.log("USDC balance before swap", Number(usdcBal));
  console.log("DAI balance before swap", Number(daiBal));

  // Perform the swap using Uniswap's `swapTokensForExactTokens` function
  await ROUTER.swapTokensForExactTokens(
    amountOut, // Amount of USDC to receive (2000)
    amountIn, // Maximum amount of DAI to spend (1980)
    [USDCAddress, DAIAddress], // Path for the swap (USDC -> DAI)
    impersonatedSigner.address, // Send swapped tokens to impersonated signer
    deadline // Transaction must be completed within 10 minutes
  );

  // Fetch the updated USDC and DAI balances after the swap
  const usdcBalAfter = await USDC.balanceOf(impersonatedSigner.address);
  const daiBalAfter = await DAI.balanceOf(impersonatedSigner.address);

  console.log("===========================================");

  // Log the updated balances

  console.log("USDC balance after swap", Number(usdcBalAfter));
  console.log("DAI balance after swap", Number(daiBalAfter));
};

// Entry point to the script, catching any errors and exiting with a failure code
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
