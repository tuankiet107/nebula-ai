import express from "express";
import dotenv from "dotenv";
import { handleMessage, sendMsgToTeleBot } from "./controllers/lib/Telegram";
import { connectDB } from "./db/config";
import { User } from "./db/models/user";
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

dotenv.config();

const app = express();
const port = 3000;

connectDB();

app.use(express.json());

app.post("/chat", async (req: any, res: any) => {
  const chatId = req.body.message?.chat?.id;
  const text = req.body.message?.text as string;
  const username = req.body.message?.from?.username as string;

  console.log({ chatId, text });
  if (!chatId || !text) {
    return res.status(200).json({ message: "OK" });
  }

  try {
    const response = await handleMessage(text, username, chatId);

    await sendMsgToTeleBot(chatId, response.message);
    return res
      .status(200)
      .json({ message: "Message processed", data: response });
  } catch (error) {
    await sendMsgToTeleBot(chatId, error);
    return res.status(200).json({ message: "Message processed" });
  }
});

app.get("*", async (req, res) => {
  const user = await User.findOne({ username: "tuankiet107" });
  res.send(user);
});

app.listen(port, () => {
  console.log(`App is listening at http://localhost:${port}`);
});
