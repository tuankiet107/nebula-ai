import dotenv from "dotenv";
import { createThirdwebClient } from "thirdweb";
import { Nebula } from "thirdweb/ai";
import { sepolia, baseSepolia } from "thirdweb/chains";
import { privateKeyToAccount } from "thirdweb/wallets";

import { User } from "../../db/models/user";
import { decryptPrivateKey } from "../../helpers/bycrypt";
import { ancient8Testnet } from "../../helpers/ancient8";
import { WARNING_HELP_MSG } from "../../constants/message";

dotenv.config();

const CHAINS_SUPPORTS = [sepolia, baseSepolia, ancient8Testnet];

class NebulaService {
  private client: any;
  constructor() {
    this.client = createThirdwebClient({
      secretKey: process.env.THIRDWEB_SECRET_KEY as string,
    });
  }

  async handleChat(message: string) {
    return await Nebula.chat({
      client: this.client,
      message,
      contextFilter: { chains: CHAINS_SUPPORTS },
    });
  }

  // Note: Currently, can not create session and
  // config mode (default is client - need confirm answer) for auto confirm instead of responding for confirming
  // with using SDK, we need to use API
  async handleExecute(message: string, username: string) {
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
      const result = await Nebula.execute({
        client: this.client,
        account,
        message,
        sessionId: username,
        contextFilter: { chains: CHAINS_SUPPORTS },
      });
      console.log("result: ", result);
      return {
        message: `✅ Transaction success: ${JSON.stringify(result)}`,
      };
    } catch (error) {
      console.log("error: ", error);
      return { message: `❌ Transaction fail: ${error.message}` };
    }
  }
}

export const nebulaService = new NebulaService();
