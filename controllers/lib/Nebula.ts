import dotenv from "dotenv";
import { createThirdwebClient } from "thirdweb";
import { Nebula } from "thirdweb/ai";
import { sepolia, baseSepolia, optimismSepolia } from "thirdweb/chains";
import { privateKeyToAccount } from "thirdweb/wallets";

import { PendingType, User } from "../../db/models/user";
import { decryptPrivateKey } from "../../helpers/bycrypt";
import { ancient8Testnet } from "../../helpers/ancient8";
import { WARNING_HELP_MSG } from "../../constants/message";
import { sendMsgToTeleBot } from "./Telegram";
import { SendTransactionResult } from "thirdweb/dist/types/transaction/types";
import { NebulaExecuteQuery } from "../../types/nebula";

dotenv.config();

type ExecuteConfirmResponse = {
  message: string;
  actions: any[];
  session_id: string;
  request_id: string;
};

const CHAINS_SUPPORTS = [
  sepolia,
  baseSepolia,
  ancient8Testnet,
  optimismSepolia,
];

class NebulaService {
  private client: any;
  constructor() {
    this.client = createThirdwebClient({
      secretKey: process.env.THIRDWEB_SECRET_KEY as string,
    });
  }

  async handleChat(message: string, username: string) {
    return await Nebula.chat({
      client: this.client,
      message,
      contextFilter: { chains: CHAINS_SUPPORTS },
      // sessionId,
    });
  }

  async handleExecute({
    message,
    username,
    chatId,
    sessionId,
  }: NebulaExecuteQuery) {
    const user = await User.findOne({ username });
    if (!user || !user.walletAddress || !user.privateKey) {
      return {
        message: WARNING_HELP_MSG,
      };
    }

    const decryptedPrivateKey = decryptPrivateKey(user.privateKey);
    const account = privateKeyToAccount({
      client: this.client,
      privateKey: decryptedPrivateKey,
    });

    try {
      const result: any = await Nebula.execute({
        client: this.client,
        account,
        message,
        contextFilter: { chains: CHAINS_SUPPORTS },
        sessionId,
      });

      if (result?.actions && result.actions.length > 0) {
        const user = await User.findOne({ username });
        if (user) {
          user.pendingAction = {
            type: PendingType.confirm,
            message: result.message,
            sessionId: result.session_id,
          };
          await user.save();
        }

        return {
          message: `${result.message}\n\n ⚠️ Please confirm by typing "Yes" - "Confirmed" to continue execute transaction or "No" to cancel.`,
        };
      }

      return { message: `✅ Transaction success: ${JSON.stringify(result)}` };
    } catch (error) {
      console.error("Execution error:", error);
      await sendMsgToTeleBot(
        chatId,
        `⚠️ Transaction attempt failed. ${error.message}`
      );
    }
  }
}

export const nebulaService = new NebulaService();
