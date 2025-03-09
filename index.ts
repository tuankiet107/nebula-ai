import express from "express";
import dotenv from "dotenv";
import { handleMessage, sendMsgToTeleBot } from "./controllers/lib/Telegram";
import { connectDB } from "./db/config";
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

dotenv.config();

const app = express();
const port = 3000;

connectDB();

app.use(express.json());

app.post("/chat", async (req: any, res: any) => {
  console.log("req.body: ", req.body);
  const chatId = req.body.message?.chat?.id;
  const text = req.body.message?.text as string;
  const username = req.body.message?.from?.username as string;

  console.log({ chatId, text });
  if (!chatId || !text) {
    console.log("Unhandled event:", req.body);
    return res.status(200).json({ message: "OK" });
  }

  const response = await handleMessage(text, username);

  await sendMsgToTeleBot(chatId, response.message);
  return res.status(200).json({ message: "Message processed", data: response });
});

app.get("*", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`App is listening at http://localhost:${port}`);
});
