import axios from "axios";
import dotenv from "dotenv";
import { User } from "../../db/models/user";
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

export const handleMessage = async (text: string, username: string) => {
  if (text === "/start" || text === "/help") {
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
    text.toLowerCase().includes("/send")
  ) {
    return await nebulaService.handleExecute(text, username);
  }

  return await nebulaService.handleChat(text);
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
