import axios from "axios";
import dotenv from "dotenv";
import { PendingType, User } from "../../db/models/user";
import { nebulaService } from "./Nebula";
import { encryptPrivateKey } from "../../helpers/bycrypt";
import {
  SAVED_ADDRESS_WITHOUT_PRIVATE_KEY_MSG,
  SAVED_PRIVATE_KEY_MSG,
  WARNING_REGISTER_ADDRESS_MSG,
  WELCOME_MSG,
  WRONG_ADDRESS_FORMAT_MSG,
  WRONG_PRIVATE_KEY_FORMAT_MSG,
} from "../../constants/message";

dotenv.config();

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;

export const handleMessage = async (
  text: string,
  username: string,
  chatId: number
): Promise<{ message: string; status?: string }> => {
  const user = await User.findOne({ username });
  if (user?.pendingAction?.type === PendingType.confirm) {
    // Check confirm transaction
    // TODO: Enhance validate text better
    if (text.toLowerCase() === "yes" || text.toLowerCase() === "confirmed") {
      const user = await User.findOne({ username });
      if (
        !user ||
        !user.pendingAction ||
        user.pendingAction.type !== PendingType.confirm
      ) {
        return {
          message:
            "⚠️ No pending action to confirm. Please start a new request.",
        };
      }

      const result = await nebulaService.handleExecute({
        message: "Confirm transaction",
        username,
        chatId,
        sessionId: user.pendingAction.sessionId,
      });

      user.pendingAction = null;
      await user.save();

      return { message: `✅ Transaction confirmed: ${JSON.stringify(result)}` };
    }
    if (text.toLowerCase() === "no") {
      const user = await User.findOne({ username });
      if (user && user.pendingAction) {
        user.pendingAction = null;
        await user.save();

        return {
          message: "❌ Transaction canceled.",
        };
      }
    }
  }

  if (text === "/start" || text === "/help") {
    if (user) {
      user.pendingAction = null;
      await user.save();
    }
    return {
      message: WELCOME_MSG,
    };
  }

  if (text.startsWith("/address")) {
    const wallet = text.split(" ")[1];
    if (!wallet)
      return {
        message: WRONG_ADDRESS_FORMAT_MSG,
      };

    await User.create({ username, walletAddress: wallet });
    return {
      message: SAVED_ADDRESS_WITHOUT_PRIVATE_KEY_MSG,
    };
  }

  if (text.startsWith("/private")) {
    const privateKey = text.split(" ")[1];
    if (!privateKey)
      return {
        message: WRONG_PRIVATE_KEY_FORMAT_MSG,
      };

    const user = await User.findOne({ username });
    if (!user)
      return {
        message: WARNING_REGISTER_ADDRESS_MSG,
      };

    const encryptedKey = encryptPrivateKey(privateKey);
    user.privateKey = encryptedKey;
    await user.save();

    return {
      message: SAVED_PRIVATE_KEY_MSG,
    };
  }

  if (
    text.toLowerCase().includes("/swap") ||
    text.toLowerCase().includes("/bridge") ||
    text.toLowerCase().includes("/transfer")
  ) {
    return await nebulaService.handleExecute({
      message: text,
      username,
      chatId,
    });
  }

  return await nebulaService.handleChat(text, username);
};

export const sendMsgToTeleBot = async (chatId: number, text: string) => {
  try {
    const response = await axios.post(TELEGRAM_API, {
      chat_id: chatId,
      text: text,
    });

    console.log("Message sent to Telegram:", response.data);
  } catch (error) {
    console.error(
      "Error sending message to Telegram:",
      error.response?.data || error.message
    );
  }
};
