import { ethers } from "hardhat";
// This line imports the ethers library from Hardhat, which provides tools for interacting with Ethereum

const helpers = require("@nomicfoundation/hardhat-network-helpers");
// This imports additional helper functions for working with Hardhat's network

const main = async () => {
  // This defines the main function that will run our code. It's async, meaning it can wait for operations to complete.

  const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  const DAIAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
  const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
  const USDCHolder = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";
  const USDC_DAI_PAIR = "0xAE461cA67B15dc8dc81CE7615e0320dA1A9aB8D5";

  // These lines define the Ethereum addresses for USDC, DAI, Uniswap Router, and a USDC holder

  await helpers.impersonateAccount(USDCHolder);
  // This line tells Hardhat to pretend to be the USDC holder account

  const impersonatedSigner = await ethers.getSigner(USDCHolder);
  // This gets a signer object for the impersonated account, which can sign transactions

  const IERC20 = await ethers.getContractAt(
    "IERC20",
    USDC_DAI_PAIR,
    impersonatedSigner
  );

  const amountUSDC = ethers.parseUnits("1000", 6);
  const amountDAI = ethers.parseUnits("1000", 18);
  const amountUSDCMin = ethers.parseUnits("950", 6);
  const amountDAIMin = ethers.parseUnits("950", 18);
  // These lines set the amounts of USDC and DAI to add, and minimum amounts to accept
  // Note: USDC has 6 decimal places, DAI has 18

  const deadline = Math.floor(Date.now() / 1000) + 60 * 10;
  // This sets a deadline 10 minutes from now for the transaction to be processed

  const USDC = await ethers.getContractAt(
    "IERC20",
    USDCAddress,
    impersonatedSigner
  );
  const DAI = await ethers.getContractAt(
    "IERC20",
    DAIAddress,
    impersonatedSigner
  );
  const ROUTER = await ethers.getContractAt(
    "IUniswapV2Router",
    UNIRouter,
    impersonatedSigner
  );
  // These lines get contract instances for USDC, DAI, and the Uniswap Router

  await USDC.approve(UNIRouter, amountUSDC);
  await DAI.approve(UNIRouter, amountDAI);
  // These lines approve the Router to spend USDC and DAI on behalf of the impersonated account

  const usdcBalBefore = await USDC.balanceOf(impersonatedSigner.address);
  const daiBalBefore = await DAI.balanceOf(impersonatedSigner.address);
  // These lines check the balance of USDC and DAI before adding liquidity

  console.log("USDC Balance before adding liquidity:", Number(usdcBalBefore));
  console.log("DAIBalance before adding liquidity:", Number(daiBalBefore));
  // This logs the balances to the console

  console.log(
    "================================================================"
  );

  // Check LP token balance before and after the transaction
  const lpBalBefore = await IERC20.balanceOf(impersonatedSigner.address);
  console.log("LP Token Balance before:", Number(lpBalBefore));

  const tx = await ROUTER.addLiquidity(
    USDCAddress,
    DAIAddress,
    amountUSDC,
    amountDAI,
    amountUSDCMin,
    amountDAIMin,
    impersonatedSigner.address,
    deadline
  );
  // This calls the addLiquidity function on the Uniswap Router to add liquidity

  await tx.wait();
  // This waits for the transaction to be confirmed on the blockchain

  const usdcBalAfter = await USDC.balanceOf(impersonatedSigner.address);
  const daiBalAfter = await DAI.balanceOf(impersonatedSigner.address);
  // These lines check the balance of USDC and DAI after adding liquidity

  console.log(
    "================================================================"
  );

  console.log("USDC Balance after adding liquidity:", Number(usdcBalAfter));
  console.log("DAI Balance after adding liquidity:", Number(daiBalAfter));
  // These log the new balances to the console

  console.log(
    "================================================================"
  );
  // Check LP token balance after adding liquidity
  const lpBalAfter = await IERC20.balanceOf(impersonatedSigner.address);
  console.log("LP Token Balance after:", Number(lpBalAfter));

  console.log(
    "================================================================"
  );
  console.log("Liquidity added successfully!");
  // This logs a success message
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
// This runs the main function and catches any errors, logging them and setting a non-zero exit code if there's an error
