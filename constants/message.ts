export const WARNING_HELP_MSG =
  "❌ You need to set up your wallet and private key first. Use /help for instructions.";
export const WARNING_REGISTER_ADDRESS_MSG =
  "❌ You have not registered your wallet yet. Please send your wallet first with the command `/address <wallet>`";
export const WRONG_PRIVATE_KEY_FORMAT_MSG =
  "❌ Please enter the correct format: `/private <private_key>`";
export const WRONG_ADDRESS_FORMAT_MSG =
  "❌ Please enter the correct format: `/address <wallet>`";

export const SAVED_ADDRESS_WITHOUT_PRIVATE_KEY_MSG =
  "✅ Your wallet has been saved. Please send your private key with the command `/private <private_key>`";
export const SAVED_PRIVATE_KEY_MSG =
  "🔒 The information has been successfully encrypted and saved. You can now make on-chain transactions!";

export const WELCOME_MSG = `Welcome to **Nebula AI Bot**!

  🚨 **Important Setup**
  - 🔑 /address <wallet> → *Set your wallet address*
  - 🔐 /private <private_key> → *Set your private key*

  **On-chain data lookup**
  - /price <token> → Watch token price (VD: /price ETH)
  - /info <token> → Token info

  ⚡ **Execute on-chain transactions**
  - /swap <quantity> <token first> <token end> → Swap token (VD: /swap 1 ETH USDC)
  - /bridge <quantity> <token> <chain first> to <chain end> → Bridge xx ETH from Sepolia to Ancient8
  - /transfer Transfer <quantity> <token_name> to <address>

  Let's start!`;
